package graph

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/workerpool"
	"github.com/mssola/user_agent"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/highlight-run/highlight/backend/errors"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/pricing"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	model2 "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

// This file will not be regenerated automatically.
//
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	PushPayloadWorkerPool *workerpool.WorkerPool
	AlertWorkerPool       *workerpool.WorkerPool
	DB                    *gorm.DB
	MailClient            *sendgrid.Client
	StorageClient         *storage.StorageClient
	OpenSearch            *opensearch.Client
}

type Location struct {
	City      string      `json:"city"`
	Postal    string      `json:"postal"`
	Latitude  interface{} `json:"latitude"`
	Longitude interface{} `json:"longitude"`
	State     string      `json:"state"`
}

type DeviceDetails struct {
	IsBot          bool   `json:"is_bot"`
	OSName         string `json:"os_name"`
	OSVersion      string `json:"os_version"`
	BrowserName    string `json:"browser_name"`
	BrowserVersion string `json:"browser_version"`
}

type Property string

var PropertyType = struct {
	USER    Property
	SESSION Property
	TRACK   Property
}{
	USER:    "user",
	SESSION: "session",
	TRACK:   "track",
}

type ErrorMetaData struct {
	Timestamp   time.Time `json:"timestamp"`
	ErrorID     int       `json:"error_id"`
	SessionID   int       `json:"session_id"`
	Browser     string    `json:"browser"`
	OS          string    `json:"os"`
	VisitedURL  string    `json:"visited_url"`
	Identifier  string    `json:"identifier"`
	Fingerprint int       `json:"fingerprint"`
}

type FieldData struct {
	Name  string
	Value string
}

const ERROR_EVENT_MAX_LENGTH = 10000

//Change to AppendProperties(sessionId,properties,type)
func (r *Resolver) AppendProperties(sessionID int, properties map[string]string, propType Property) error {
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session)
	if err := res.Error; err != nil {
		return e.Wrapf(err, "error getting session(id=%d) in append properties(type=%s)", sessionID, propType)
	}

	modelFields := []*model.Field{}
	projectID := session.ProjectID
	for k, fv := range properties {
		modelFields = append(modelFields, &model.Field{ProjectID: projectID, Name: k, Value: fv, Type: string(propType)})
	}

	err := r.AppendFields(modelFields, session)
	if err != nil {
		return e.Wrap(err, "error appending fields")
	}

	r.AlertWorkerPool.SubmitRecover(func() {
		// Sending Track Properties Alert
		if propType != PropertyType.TRACK {
			return
		}
		var sessionAlerts []*model.SessionAlert
		if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID, Disabled: &model.F}}).Where("type=?", model.AlertType.TRACK_PROPERTIES).Find(&sessionAlerts).Error; err != nil {
			log.Error(e.Wrapf(err, "[project_id: %d] error fetching track properties alert", projectID))
			return
		}

		for _, sessionAlert := range sessionAlerts {
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from track properties alert", projectID))
				return
			}
			isExcludedEnvironment := false
			for _, env := range excludedEnvironments {
				if env != nil && *env == session.Environment {
					isExcludedEnvironment = true
					break
				}
			}
			if isExcludedEnvironment {
				return
			}

			// get matched track properties between the alert and session
			trackProperties, err := sessionAlert.GetTrackProperties()
			if err != nil {
				log.Error(e.Wrap(err, "error getting track properties from session"))
				return
			}
			var trackPropertyIds []int
			for _, trackProperty := range trackProperties {
				trackPropertyIds = append(trackPropertyIds, trackProperty.ID)
			}
			stmt := r.DB.Model(&model.Field{}).
				Where(&model.Field{ProjectID: projectID, Type: "track"}).
				Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", session.ID).
				Where("id IN ?", trackPropertyIds)
			var matchedFields []*model.Field
			if err := stmt.Find(&matchedFields).Error; err != nil {
				log.Error(e.Wrap(err, "error querying matched fields by session_id"))
				return
			}
			if len(matchedFields) < 1 {
				return
			}

			// relatedFields is the list of fields not inside of matchedFields.
			var relatedFields []*model.Field
			for k, fv := range properties {
				isAMatchedField := false

				for _, matchedField := range matchedFields {
					if matchedField.Name == k && matchedField.Value == fv {
						isAMatchedField = true
					}
				}

				if !isAMatchedField {
					relatedFields = append(relatedFields, &model.Field{ProjectID: projectID, Name: k, Value: fv, Type: string(propType)})
				}
			}

			project := &model.Project{}
			if err := r.DB.Where(&model.Project{Model: model.Model{ID: session.ProjectID}}).First(&project).Error; err != nil {
				log.Error(e.Wrap(err, "error querying project"))
				return
			}
			workspace, err := r.getWorkspace(project.WorkspaceID)
			if err != nil {
				log.Error(e.Wrap(err, "error querying workspace"))
				return
			}

			sessionAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: session.SecureID, UserIdentifier: session.Identifier, MatchedFields: matchedFields, RelatedFields: relatedFields, UserObject: session.UserObject})
		}
	})

	r.AlertWorkerPool.SubmitRecover(func() {
		// Sending User Properties Alert
		if propType != PropertyType.USER {
			return
		}
		var sessionAlerts []*model.SessionAlert
		if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID, Disabled: &model.F}}).Where("type=?", model.AlertType.USER_PROPERTIES).Find(&sessionAlerts).Error; err != nil {
			log.Error(e.Wrapf(err, "[project_id: %d] error fetching user properties alert", projectID))
			return
		}

		for _, sessionAlert := range sessionAlerts {
			// check if session was produced from an excluded environment
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from user properties alert", projectID))
				return
			}
			isExcludedEnvironment := false
			for _, env := range excludedEnvironments {
				if env != nil && *env == session.Environment {
					isExcludedEnvironment = true
					break
				}
			}
			if isExcludedEnvironment {
				return
			}

			// get matched user properties between the alert and session
			userProperties, err := sessionAlert.GetUserProperties()
			if err != nil {
				log.Error(e.Wrap(err, "error getting user properties from session"))
				return
			}
			var userPropertyIds []int
			for _, userProperty := range userProperties {
				userPropertyIds = append(userPropertyIds, userProperty.ID)
			}
			stmt := r.DB.Model(&model.Field{}).
				Where(&model.Field{ProjectID: projectID, Type: "user"}).
				Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", session.ID).
				Where("id IN ?", userPropertyIds)
			var matchedFields []*model.Field
			if err := stmt.Find(&matchedFields).Error; err != nil {
				log.Error(e.Wrap(err, "error querying matched fields by session_id"))
				return
			}
			if len(matchedFields) < 1 {
				return
			}

			project := &model.Project{}
			if err := r.DB.Where(&model.Project{Model: model.Model{ID: session.ProjectID}}).First(&project).Error; err != nil {
				log.Error(e.Wrap(err, "error querying project"))
				return
			}
			workspace, err := r.getWorkspace(project.WorkspaceID)
			if err != nil {
				log.Error(e.Wrap(err, "error querying workspace"))
				return
			}

			sessionAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: session.SecureID, UserIdentifier: session.Identifier, MatchedFields: matchedFields, UserObject: session.UserObject})
		}
	})

	return nil
}

func (r *Resolver) AppendFields(fields []*model.Field, session *model.Session) error {
	fieldsToAppend := []*model.Field{}
	for _, f := range fields {
		field := &model.Field{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || e.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating field")
			}
			if err := r.OpenSearch.Index(opensearch.IndexFields, f.ID, nil, f); err != nil {
				return e.Wrap(err, "error indexing new field")
			}

			fieldsToAppend = append(fieldsToAppend, f)
		} else {
			fieldsToAppend = append(fieldsToAppend, field)
		}
	}

	log.Infof("about to append %v fields [%v] to session %v \n", len(fieldsToAppend), fieldsToAppend, session.ID)

	openSearchFields := make([]interface{}, len(fieldsToAppend))
	for i, field := range fieldsToAppend {
		openSearchFields[i] = opensearch.OpenSearchField{
			Field:    field,
			Key:      field.Type + "_" + field.Name,
			KeyValue: field.Type + "_" + field.Name + "_" + field.Value,
		}
	}
	if err := r.OpenSearch.AppendToField(opensearch.IndexSessions, session.ID, "fields", openSearchFields); err != nil {
		return e.Wrap(err, "error appending session fields")
	}

	sort.Slice(fieldsToAppend, func(i, j int) bool {
		return fieldsToAppend[i].ID < fieldsToAppend[j].ID
	})

	// We append to this session in the join table regardless.
	if err := r.DB.Model(session).Association("Fields").Append(fieldsToAppend); err != nil {
		return e.Wrap(err, "error updating fields")
	}
	return nil
}

func (r *Resolver) getIncrementedEnvironmentCount(errorGroup *model.ErrorGroup, errorObj *model.ErrorObject) string {
	environmentsMap := make(map[string]int)
	if errorGroup.Environments != "" {
		err := json.Unmarshal([]byte(errorGroup.Environments), &environmentsMap)
		if err != nil {
			log.Error(e.Wrap(err, "error unmarshalling environments from error group into map"))
		}
	}
	if len(errorObj.Environment) > 0 {
		if _, ok := environmentsMap[strings.ToLower(errorObj.Environment)]; ok {
			environmentsMap[strings.ToLower(errorObj.Environment)]++
		} else {
			environmentsMap[strings.ToLower(errorObj.Environment)] = 1
		}
	}
	environmentsBytes, err := json.Marshal(environmentsMap)
	if err != nil {
		log.Error(e.Wrap(err, "error marshalling environment map into json"))
	}
	environmentsString := string(environmentsBytes)

	return environmentsString
}

func (r *Resolver) getMappedStackTraceString(stackTrace []*model2.StackFrameInput, projectID int, errorObj *model.ErrorObject) (*string, error) {
	// get version from session
	var version *string
	if err := r.DB.Model(&model.Session{}).Where(&model.Session{Model: model.Model{ID: errorObj.SessionID}}).
		Select("app_version").Scan(&version).Error; err != nil {
		if !e.Is(err, gorm.ErrRecordNotFound) {
			return nil, e.Wrap(err, "error getting app version from session")
		}
	}

	var newMappedStackTraceString *string
	mappedStackTrace, err := errors.EnhanceStackTrace(stackTrace, projectID, version, r.StorageClient)
	if err != nil {
		log.Error(e.Wrapf(err, "error object: %+v", errorObj))
	} else {
		mappedStackTraceBytes, err := json.Marshal(mappedStackTrace)
		if err != nil {
			return nil, e.Wrap(err, "error marshalling mapped stack trace")
		}
		mappedStackTraceString := string(mappedStackTraceBytes)
		newMappedStackTraceString = &mappedStackTraceString
	}
	return newMappedStackTraceString, nil
}

func (r *Resolver) normalizeStackTraceString(stackTraceString string) string {
	var stackTraceSlice []string
	if err := json.Unmarshal([]byte(stackTraceString), &stackTraceSlice); err != nil {
		return ""
	}

	// TODO: maintain a list of potential error types so we can handle different stack trace formats
	var normalizedStackFrameInput []*model2.StackFrameInput
	for _, frame := range stackTraceSlice {
		frameExtracted := regexp.MustCompile(`(?m)(.*) (.*):(.*)`).FindAllStringSubmatch(frame, -1)
		if len(frameExtracted) != 1 {
			return ""
		}
		if len(frameExtracted[0]) != 4 {
			return ""
		}

		lineNumber, err := strconv.Atoi(frameExtracted[0][3])
		if err != nil {
			return ""
		}
		normalizedStackFrameInput = append(normalizedStackFrameInput, &model2.StackFrameInput{
			FunctionName: &frameExtracted[0][1],
			FileName:     &frameExtracted[0][2],
			LineNumber:   &lineNumber,
		})
	}

	stackTraceBytes, err := json.Marshal(&normalizedStackFrameInput)
	if err != nil {
		return ""
	}
	return string(stackTraceBytes)
}

// Matches the ErrorObject with an existing ErrorGroup, or creates a new one if the group does not exist
// The input can include the stack trace as a string or []*StackFrameInput
// If stackTrace is non-nil, it will be marshalled into a string and saved with the ErrorObject
func (r *Resolver) HandleErrorAndGroup(errorObj *model.ErrorObject, stackTraceString string, stackTrace []*model2.StackFrameInput, fields []*model.ErrorField, projectID int) (*model.ErrorGroup, error) {
	if errorObj == nil {
		return nil, e.New("error object was nil")
	}
	if errorObj.Event == "" || errorObj.Event == "<nil>" {
		return nil, e.New("error object event was nil or empty")
	}

	if len(errorObj.Event) > ERROR_EVENT_MAX_LENGTH {
		errorObj.Event = strings.Repeat(errorObj.Event[:ERROR_EVENT_MAX_LENGTH], 1)
	}

	// If there was no stackTraceString passed in, marshal it as a JSON string from stackTrace
	if len(stackTrace) > 0 {
		if stackTrace[0] != nil && stackTrace[0].Source != nil && strings.Contains(*stackTrace[0].Source, "https://static.highlight.run/index.js") {
			errorObj.ProjectID = 1
		}
		firstFrameBytes, err := json.Marshal(stackTrace)
		if err != nil {
			return nil, e.Wrap(err, "Error marshalling first frame")
		}

		stackTraceString = string(firstFrameBytes)
	} else if stackTraceString != "<nil>" {
		// If stackTraceString was passed in, try to normalize it
		if t := r.normalizeStackTraceString(stackTraceString); t != "" {
			stackTraceString = t
		}
	} else if stackTraceString == "<nil>" {
		return nil, e.New(`stackTrace slice was empty and stack trace string was equal to "<nil>"`)
	}

	// If stackTrace is non-nil, do the source mapping; else, MappedStackTrace will not be set on the ErrorObject
	newFrameString := stackTraceString
	var newMappedStackTraceString *string
	if stackTrace != nil {
		var err error
		newMappedStackTraceString, err = r.getMappedStackTraceString(stackTrace, projectID, errorObj)
		if err != nil {
			return nil, e.Wrap(err, "Error mapping stack trace string")
		}
		errorObj.MappedStackTrace = newMappedStackTraceString
	}

	errorGroup := &model.ErrorGroup{}

	// Query the DB for errors w/ 1) the same events string and 2) the same trace string.
	// If it doesn't exist, we create a new error group.
	if err := r.DB.Where(&model.ErrorGroup{
		ProjectID: errorObj.ProjectID,
		Event:     errorObj.Event,
		Type:      errorObj.Type,
	}).First(&errorGroup).Error; err != nil {
		newErrorGroup := &model.ErrorGroup{
			ProjectID:  errorObj.ProjectID,
			Event:      errorObj.Event,
			StackTrace: stackTraceString,
			Type:       errorObj.Type,
			State:      modelInputs.ErrorStateOpen.String(),
			Fields:     []*model.ErrorField{},
		}
		if err := r.DB.Create(newErrorGroup).Error; err != nil {
			return nil, e.Wrap(err, "Error creating new error group")
		}

		opensearchErrorGroup := &model.ErrorGroup{
			Model:     newErrorGroup.Model,
			SecureID:  newErrorGroup.SecureID,
			ProjectID: errorObj.ProjectID,
			Event:     errorObj.Event,
			Type:      errorObj.Type,
			State:     modelInputs.ErrorStateOpen.String(),
			Fields:    []*model.ErrorField{},
		}
		if err := r.OpenSearch.Index(opensearch.IndexErrorsCombined, newErrorGroup.ID, pointy.Int(0), opensearchErrorGroup); err != nil {
			return nil, e.Wrap(err, "error indexing error group (combined index) in opensearch")
		}

		errorGroup = newErrorGroup
	}
	errorObj.ErrorGroupID = errorGroup.ID
	if err := r.DB.Create(errorObj).Error; err != nil {
		return nil, e.Wrap(err, "Error performing error insert for error")
	}

	opensearchErrorObject := &opensearch.OpenSearchErrorObject{
		Url:       errorObj.URL,
		Os:        errorObj.OS,
		Browser:   errorObj.Browser,
		Timestamp: errorObj.Timestamp,
	}
	if err := r.OpenSearch.Index(opensearch.IndexErrorsCombined, errorObj.ID, pointy.Int(errorGroup.ID), opensearchErrorObject); err != nil {
		return nil, e.Wrap(err, "error indexing error group (combined index) in opensearch")
	}

	environmentsString := r.getIncrementedEnvironmentCount(errorGroup, errorObj)

	err := r.AppendErrorFields(fields, errorGroup)
	if err != nil {
		return nil, e.Wrap(err, "error appending error fields")
	}

	// Don't save errors that come from rrweb at record time.
	if newMappedStackTraceString != nil && strings.Contains(*newMappedStackTraceString, "rrweb") {
		var now = time.Now()
		if err := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{Model: model.Model{DeletedAt: &now}}).Error; err != nil {
			return nil, e.Wrap(err, "Error soft deleting rrweb error group.")
		}

	} else {
		if err := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{StackTrace: newFrameString, MappedStackTrace: newMappedStackTraceString, Environments: environmentsString}).Error; err != nil {
			return nil, e.Wrap(err, "Error updating error group metadata log or environments")
		}
	}

	var filename *string
	if newMappedStackTraceString != nil {
		filename = model.GetFirstFilename(*newMappedStackTraceString)
	} else {
		filename = model.GetFirstFilename(newFrameString)
	}

	if err := r.OpenSearch.Update(opensearch.IndexErrorsCombined, errorGroup.ID, map[string]interface{}{
		"filename":   filename,
		"updated_at": time.Now(),
	}); err != nil {
		return nil, e.Wrap(err, "error updating error group in opensearch")
	}

	return errorGroup, nil
}

func (r *Resolver) AppendErrorFields(fields []*model.ErrorField, errorGroup *model.ErrorGroup) error {
	fieldsToAppend := []*model.ErrorField{}
	for _, f := range fields {
		field := &model.ErrorField{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || e.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating error field")
			}
			if err := r.OpenSearch.Index(opensearch.IndexErrorFields, f.ID, nil, f); err != nil {
				return e.Wrap(err, "error indexing new error field")
			}
			fieldsToAppend = append(fieldsToAppend, f)
		} else {
			fieldsToAppend = append(fieldsToAppend, field)
		}
	}

	openSearchFields := make([]interface{}, len(fieldsToAppend))
	for i, field := range fieldsToAppend {
		openSearchFields[i] = opensearch.OpenSearchErrorField{
			ErrorField: field,
			Key:        field.Name,
			KeyValue:   field.Name + "_" + field.Value,
		}
	}

	// We append to this session in the join table regardless.
	if err := r.DB.Model(errorGroup).Association("Fields").Append(fieldsToAppend); err != nil {
		return e.Wrap(err, "error updating error fields")
	}

	return nil
}

func GetLocationFromIP(ip string) (location *Location, err error) {
	url := fmt.Sprintf("http://geolocation-db.com/json/%s", ip)
	method := "GET"

	client := &http.Client{}
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, err
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(body, &location)
	if err != nil {
		return nil, err
	}

	// long and lat should be float
	switch location.Longitude.(type) {
	case float64:
	default:
		location.Longitude = float64(0)
	}
	switch location.Latitude.(type) {
	case float64:
	default:
		location.Latitude = float64(0)
	}

	return location, nil
}

func GetDeviceDetails(userAgentString string) (deviceDetails DeviceDetails) {
	userAgent := user_agent.New(userAgentString)
	deviceDetails.IsBot = userAgent.Bot()
	deviceDetails.OSName = userAgent.OSInfo().Name
	deviceDetails.OSVersion = userAgent.OSInfo().Version
	deviceDetails.BrowserName, deviceDetails.BrowserVersion = userAgent.Browser()
	return deviceDetails
}

func InitializeSessionImplementation(r *mutationResolver, ctx context.Context, projectVerboseID string, enableStrictPrivacy bool, enableRecordingNetworkContents bool, clientVersion string, firstloadVersion string, clientConfig string, environment string, appVersion *string, fingerprint string) (*model.Session, error) {
	projectID, err := model.FromVerboseID(projectVerboseID)
	if err != nil {
		log.Errorf("An unsupported verboseID was used: %s, %s", projectVerboseID, clientConfig)
	}
	project := &model.Project{}
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "project doesn't exist")
	}

	// Get the user's ip, get geolocation data
	location := &Location{
		City:      "",
		Postal:    "",
		Latitude:  0.0,
		Longitude: 0.0,
		State:     "",
	}
	ip, ok := ctx.Value(model.ContextKeys.IP).(string)
	if ok {
		fetchedLocation, err := GetLocationFromIP(ip)
		if err != nil || fetchedLocation == nil {
			log.Errorf("error getting user's location: %v", err)
		} else {
			location = fetchedLocation
		}
	}

	// Parse the user-agent string
	var deviceDetails DeviceDetails
	if userAgentString, ok := ctx.Value(model.ContextKeys.UserAgent).(string); ok {
		deviceDetails = GetDeviceDetails(userAgentString)
	}

	// Get the language from the request header
	acceptLanguageString := ctx.Value(model.ContextKeys.AcceptLanguage).(string)
	n := time.Now()
	var fingerprintInt int = 0
	if val, err := strconv.Atoi(fingerprint); err == nil {
		fingerprintInt = val
	}

	workspace, err := r.getWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving workspace")
	}
	// determine if session is within billing quota
	withinBillingQuota := r.isWithinBillingQuota(project, workspace, n)

	session := &model.Session{
		Fingerprint:                    fingerprintInt,
		ProjectID:                      projectID,
		City:                           location.City,
		State:                          location.State,
		Postal:                         location.Postal,
		Latitude:                       location.Latitude.(float64),
		Longitude:                      location.Longitude.(float64),
		OSName:                         deviceDetails.OSName,
		OSVersion:                      deviceDetails.OSVersion,
		BrowserName:                    deviceDetails.BrowserName,
		BrowserVersion:                 deviceDetails.BrowserVersion,
		Language:                       acceptLanguageString,
		WithinBillingQuota:             &withinBillingQuota,
		Processed:                      &model.F,
		Viewed:                         &model.F,
		PayloadUpdatedAt:               &n,
		EnableStrictPrivacy:            &enableStrictPrivacy,
		EnableRecordingNetworkContents: &enableRecordingNetworkContents,
		FirstloadVersion:               firstloadVersion,
		ClientVersion:                  clientVersion,
		ClientConfig:                   &clientConfig,
		Environment:                    environment,
		AppVersion:                     appVersion,
		VerboseID:                      projectVerboseID,
		Fields:                         []*model.Field{},
		LastUserInteractionTime:        time.Now(),
	}

	if err := r.DB.Create(session).Error; err != nil {
		return nil, e.Wrap(err, "error creating session")
	}

	if err := r.OpenSearch.IndexSynchronous(opensearch.IndexSessions, session.ID, session); err != nil {
		return nil, e.Wrap(err, "error indexing session in opensearch")
	}

	log.WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("initialized session: %s", session.Identifier)

	sessionProperties := map[string]string{
		"os_name":         deviceDetails.OSName,
		"os_version":      deviceDetails.OSVersion,
		"browser_name":    deviceDetails.BrowserName,
		"browser_version": deviceDetails.BrowserVersion,
		"environment":     environment,
		"device_id":       strconv.Itoa(session.Fingerprint),
	}
	if err := r.AppendProperties(session.ID, sessionProperties, PropertyType.SESSION); err != nil {
		log.Error(e.Wrap(err, "error adding set of properties to db"))
	}

	go func() {
		defer util.Recover()
		// Sleep for 25 seconds, then query from the DB. If this session is identified, we
		// want to wait for the H.identify call to be able to create a better Slack message.
		// If an ECS task is being replaced, there's a 30 second window to do cleanup work.
		// A 25 second delay here gives this 5 seconds to complete in case this session
		// is created right before the task is replaced.
		time.Sleep(25 * time.Second)
		r.AlertWorkerPool.SubmitRecover(func() {
			// Sending session init alert
			var sessionAlerts []*model.SessionAlert
			if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID, Disabled: &model.F}}).
				Where("type=?", model.AlertType.NEW_SESSION).Find(&sessionAlerts).Error; err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error fetching new session alert", projectID))
				return
			}

			sessionObj := &model.Session{}
			if err := r.DB.Preload("Fields").Where(&model.Session{Model: model.Model{ID: session.ID}}).First(&sessionObj).Error; err != nil {
				retErr := e.Wrapf(err, "error reading from session %v", session.ID)
				log.Error(retErr)
				return
			}

			for _, sessionAlert := range sessionAlerts {
				// check if session was produced from an excluded environment
				excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
				if err != nil {
					log.Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from new session alert", projectID))
					return
				}

				isExcludedEnvironment := false
				for _, env := range excludedEnvironments {
					if env != nil && *env == sessionObj.Environment {
						isExcludedEnvironment = true
						break
					}
				}
				if isExcludedEnvironment {
					return
				}

				// check if session was created by a should-ignore identifier
				excludedIdentifiers, err := sessionAlert.GetExcludeRules()
				if err != nil {
					log.Error(e.Wrapf(err, "[project_id: %d] error getting exclude rules from new session alert", projectID))
					return
				}
				isSessionByExcludedIdentifier := false
				for _, identifier := range excludedIdentifiers {
					if identifier != nil && *identifier == sessionObj.Identifier {
						isSessionByExcludedIdentifier = true
						break
					}
				}
				if isSessionByExcludedIdentifier {
					return
				}

				workspace, err := r.getWorkspace(project.WorkspaceID)
				if err != nil {
					log.Error(e.Wrap(err, "error querying workspace"))
					return
				}

				var userProperties map[string]string
				if sessionObj.UserProperties != "" {
					userProperties, err = sessionObj.GetUserProperties()
					if err != nil {
						log.Error(e.Wrapf(err, "[project_id: %d] error getting user properties from new user alert", sessionObj.ProjectID))
						return
					}
				}

				var visitedUrl *string
				for _, field := range sessionObj.Fields {
					if field.Type == "session" && field.Name == "visited-url" {
						visitedUrl = &field.Value
						break
					}
				}

				sessionAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: sessionObj.SecureID, UserIdentifier: sessionObj.Identifier, UserObject: sessionObj.UserObject, UserProperties: userProperties, URL: visitedUrl})
			}
		})
	}()

	return session, nil
}

func (r *Resolver) getWorkspace(workspaceID int) (*model.Workspace, error) {
	var workspace model.Workspace
	if err := r.DB.Where(&model.Workspace{Model: model.Model{ID: workspaceID}}).First(&workspace).Error; err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}
	return &workspace, nil
}

func (r *Resolver) isWithinBillingQuota(project *model.Project, workspace *model.Workspace, now time.Time) bool {
	if workspace.TrialEndDate != nil && workspace.TrialEndDate.After(now) {
		return true
	}
	if util.IsOnPrem() {
		return true
	}

	if project.FreeTier {
		sessionCount, err := pricing.GetProjectMeter(r.DB, project)
		if err != nil {
			log.Warn(fmt.Sprintf("error getting sessions meter for project %d", project.ID))
		}
		withinBillingQuota := int64(pricing.TypeToQuota(modelInputs.PlanTypeFree)) > sessionCount
		return withinBillingQuota
	}

	if workspace.AllowMeterOverage {
		return true
	}

	var (
		withinBillingQuota bool
		quota              int
	)
	if workspace.MonthlySessionLimit != nil && *workspace.MonthlySessionLimit > 0 {
		quota = *workspace.MonthlySessionLimit
	} else {
		stripePlan := modelInputs.PlanType(workspace.PlanTier)
		quota = pricing.TypeToQuota(stripePlan)
	}

	monthToDateSessionCount, err := pricing.GetWorkspaceMeter(r.DB, workspace.ID)
	if err != nil {
		log.Warn(fmt.Sprintf("error getting sessions meter for workspace %d", workspace.ID))
	}
	withinBillingQuota = int64(quota) > monthToDateSessionCount
	return withinBillingQuota
}

func (r *Resolver) sendErrorAlert(projectID int, sessionObj *model.Session, group *model.ErrorGroup, visitedUrl string) {
	r.AlertWorkerPool.SubmitRecover(func() {
		var errorAlerts []*model.ErrorAlert
		if err := r.DB.Model(&model.ErrorAlert{}).Where(&model.ErrorAlert{Alert: model.Alert{ProjectID: projectID, Disabled: &model.F}}).Find(&errorAlerts).Error; err != nil {
			log.Error(e.Wrap(err, "error fetching ErrorAlerts object"))
			return
		}

		for _, errorAlert := range errorAlerts {
			if errorAlert.CountThreshold < 1 {
				return
			}
			excludedEnvironments, err := errorAlert.GetExcludedEnvironments()
			if err != nil {
				log.Error(e.Wrap(err, "error getting excluded environments from ErrorAlert"))
				return
			}
			for _, env := range excludedEnvironments {
				if env != nil && *env == sessionObj.Environment {
					return
				}
			}
			if errorAlert.ThresholdWindow == nil {
				t := 30
				errorAlert.ThresholdWindow = &t
			}

			if errorAlert.RegexGroups != nil {
				groups, err := errorAlert.GetRegexGroups()
				if err != nil {
					log.Error(e.Wrap(err, "error getting regex groups from ErrorAlert"))
					continue
				}
				matched := false
				for _, g := range groups {
					if g == nil {
						continue
					}
					matched, err = regexp.MatchString(*g, group.Event)
					if err != nil {
						log.Warn(err)
					}
					if matched {
						break
					}
					if group.MappedStackTrace != nil {
						matched, err = regexp.MatchString(*g, *group.MappedStackTrace)
						if err != nil {
							log.Warn(err)
						}
					} else {
						matched, err = regexp.MatchString(*g, group.StackTrace)
						if err != nil {
							log.Warn(err)
						}
					}
					if matched {
						break
					}
				}
				if matched {
					log.Warn("error event matches regex group, skipping alert...")
					continue
				}
			}

			numErrors := int64(-1)
			if err := r.DB.Raw(`
				SELECT COUNT(*)
				FROM error_objects
				WHERE
					project_id=?
					AND error_group_id=?
					AND created_at > ?
			`, projectID, group.ID, time.Now().Add(time.Duration(-(*errorAlert.ThresholdWindow))*time.Minute)).Scan(&numErrors).Error; err != nil {
				log.Error(e.Wrapf(err, "error counting errors from past %d minutes", *errorAlert.ThresholdWindow))
				return
			}
			if numErrors+1 < int64(errorAlert.CountThreshold) {
				return
			}

			numAlerts := int64(-1)
			if err := r.DB.Raw(`
				SELECT COUNT(*)
				FROM alert_events
				WHERE
					project_id=?
					AND type=?
					AND (error_group_id IS NOT NULL
						AND error_group_id=?)
					AND alert_id=?
					AND created_at > NOW() - ? * (INTERVAL '1 SECOND')
			`, projectID, model.AlertType.ERROR, group.ID, errorAlert.ID, errorAlert.Frequency).Scan(&numAlerts).Error; err != nil {
				log.Error(e.Wrapf(err, "error counting alert events from past %d seconds", errorAlert.Frequency))
				return
			}
			if numAlerts > 0 {
				log.Warnf("num alerts > 0 for project_id=%d, error_group_id=%d", projectID, group.ID)
				return
			}

			var project model.Project
			if err := r.DB.Model(&model.Project{}).Where(&model.Project{Model: model.Model{ID: projectID}}).First(&project).Error; err != nil {
				log.Error(e.Wrap(err, "error querying project"))
				return
			}

			workspace, err := r.getWorkspace(project.WorkspaceID)
			if err != nil {
				log.Error(err)
			}

			errorAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: sessionObj.SecureID, UserIdentifier: sessionObj.Identifier, Group: group, URL: &visitedUrl, ErrorsCount: &numErrors, UserObject: sessionObj.UserObject})
		}
	})
}

func (r *Resolver) processBackendPayload(ctx context.Context, errors []*customModels.BackendErrorObjectInput) {
	// Get a list of unique session ids to query
	sessionSecureIdSet := make(map[string]bool)
	for _, errInput := range errors {
		sessionSecureIdSet[errInput.SessionSecureID] = true
	}
	sessionSecureIds := make([]string, 0, len(sessionSecureIdSet))
	for sId := range sessionSecureIdSet {
		sessionSecureIds = append(sessionSecureIds, sId)
	}

	querySessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.processBackendPayload", tracer.ResourceName("db.querySessions"))
	querySessionSpan.SetTag("numberOfErrors", len(errors))
	querySessionSpan.SetTag("numberOfSessions", len(sessionSecureIds))

	// Query all sessions related to the current batch of error objects
	sessions := []*model.Session{}
	if err := r.DB.Model(&model.Session{}).Where("secure_id IN ?", sessionSecureIds).Scan(&sessions).Error; err != nil {
		retErr := e.Wrapf(err, "error reading from sessionSecureIds")
		querySessionSpan.Finish(tracer.WithError(retErr))
		log.Error(retErr)
		return
	}

	querySessionSpan.Finish()

	// Index sessions by secure_id
	sessionLookup := make(map[string]*model.Session)
	for _, session := range sessions {
		sessionLookup[session.SecureID] = session
	}

	// Filter out empty errors
	var filteredErrors []*customModels.BackendErrorObjectInput
	for _, errorObject := range errors {
		if errorObject.Event == "[{}]" {
			var objString string
			objBytes, err := json.Marshal(errorObject)
			if err != nil {
				log.Error(e.Wrap(err, "error marshalling error object when filtering"))
				objString = ""
			} else {
				objString = string(objBytes)
			}
			log.WithFields(log.Fields{
				"project_id":        sessionLookup[errorObject.SessionSecureID],
				"session_secure_id": errorObject.SessionSecureID,
				"error_object":      objString,
			}).Warn("caught empty error, continuing...")
		} else {
			filteredErrors = append(filteredErrors, errorObject)
		}
	}
	errors = filteredErrors

	if len(errors) == 0 {
		return
	}

	// Count the number of errors for each project
	errorsByProject := make(map[int]int64)
	for _, err := range errors {
		session := sessionLookup[err.SessionSecureID]
		if session == nil {
			continue
		}
		projectID := session.ProjectID
		errorsByProject[projectID] += 1
	}

	dailyErrorCountSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.processBackendPayload", tracer.ResourceName("db.updateDailyErrorCounts"))
	dailyErrorCountSpan.SetTag("numberOfErrors", len(errors))
	dailyErrorCountSpan.SetTag("numberOfProjects", len(errorsByProject))

	// For each project, increment daily error count by the current error count
	n := time.Now()
	currentDate := time.Date(n.UTC().Year(), n.UTC().Month(), n.UTC().Day(), 0, 0, 0, 0, time.UTC)

	dailyErrorCounts := make([]*model.DailyErrorCount, 0)
	for projectId, count := range errorsByProject {
		errorCount := model.DailyErrorCount{
			ProjectID: projectId,
			Date:      &currentDate,
			Count:     count,
			ErrorType: model.ErrorType.BACKEND,
		}
		dailyErrorCounts = append(dailyErrorCounts, &errorCount)
	}

	// Upsert error counts into daily_error_counts
	if err := r.DB.Table(model.DAILY_ERROR_COUNTS_TBL).Clauses(clause.OnConflict{
		OnConstraint: model.DAILY_ERROR_COUNTS_UNIQ,
		DoUpdates:    clause.Assignments(map[string]interface{}{"count": gorm.Expr("daily_error_counts.count + excluded.count")}),
	}).Create(&dailyErrorCounts).Error; err != nil {
		wrapped := e.Wrap(err, "error updating daily error count")
		dailyErrorCountSpan.Finish(tracer.WithError(wrapped))
		log.Error(wrapped)
		return
	}

	dailyErrorCountSpan.Finish()

	// put errors in db
	putErrorsToDBSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.processBackendPayload",
		tracer.ResourceName("db.errors"))
	groups := make(map[int]struct {
		Group      *model.ErrorGroup
		VisitedURL string
		SessionObj *model.Session
	})
	for _, v := range errors {
		traceBytes, err := json.Marshal(v.StackTrace)
		if err != nil {
			log.Errorf("Error marshaling trace: %v", v.StackTrace)
			continue
		}
		traceString := string(traceBytes)

		sessionObj := sessionLookup[v.SessionSecureID]
		if sessionObj == nil {
			continue
		}
		projectID := sessionObj.ProjectID

		errorToInsert := &model.ErrorObject{
			ProjectID:   projectID,
			SessionID:   sessionObj.ID,
			Environment: sessionObj.Environment,
			Event:       v.Event,
			Type:        model.ErrorType.BACKEND,
			URL:         v.URL,
			Source:      v.Source,
			OS:          sessionObj.OSName,
			Browser:     sessionObj.BrowserName,
			StackTrace:  &traceString,
			Timestamp:   v.Timestamp,
			Payload:     v.Payload,
			RequestID:   &v.RequestID,
		}

		//create error fields array
		metaFields := []*model.ErrorField{}
		metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "browser", Value: sessionObj.BrowserName})
		metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "os_name", Value: sessionObj.OSName})
		metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "visited_url", Value: errorToInsert.URL})
		metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "event", Value: errorToInsert.Event})
		group, err := r.HandleErrorAndGroup(errorToInsert, v.StackTrace, nil, metaFields, projectID)
		if err != nil {
			log.Errorf("Error updating error group: %v", errorToInsert)
			continue
		}

		groups[group.ID] = struct {
			Group      *model.ErrorGroup
			VisitedURL string
			SessionObj *model.Session
		}{Group: group, VisitedURL: errorToInsert.URL, SessionObj: sessionObj}
	}

	for _, data := range groups {
		r.sendErrorAlert(data.Group.ProjectID, data.SessionObj, data.Group, data.VisitedURL)
	}

	putErrorsToDBSpan.Finish()

	now := time.Now()
	if err := r.DB.Model(&model.Session{}).Where("secure_id IN ?", sessionSecureIds).Updates(&model.Session{PayloadUpdatedAt: &now}).Error; err != nil {
		log.Error(e.Wrap(err, "error updating session payload time"))
		return
	}
}

func (r *Resolver) processPayload(ctx context.Context, sessionID int, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon bool, hasSessionUnloaded bool) {
	querySessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload", tracer.ResourceName("db.querySession"))
	querySessionSpan.SetTag("sessionID", sessionID)
	querySessionSpan.SetTag("messagesLength", len(messages))
	querySessionSpan.SetTag("resourcesLength", len(resources))
	querySessionSpan.SetTag("numberOfErrors", len(errors))
	querySessionSpan.SetTag("numberOfEvents", len(events.Events))
	sessionObj := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&sessionObj).Error; err != nil {
		retErr := e.Wrapf(err, "error reading from session %v", sessionID)
		querySessionSpan.Finish(tracer.WithError(retErr))
		log.Error(retErr)
		return
	}
	querySessionSpan.SetTag("project_id", sessionObj.ProjectID)
	querySessionSpan.Finish()

	// If the session is processing or processed, set ResumedAfterProcessedTime and continue
	if (sessionObj.Lock.Valid && !sessionObj.Lock.Time.IsZero()) || (sessionObj.Processed != nil && *sessionObj.Processed) {
		if sessionObj.ResumedAfterProcessedTime == nil {
			now := time.Now()
			if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).Update("ResumedAfterProcessedTime", &now).Error; err != nil {
				log.Error(e.Wrap(err, "error updating session ResumedAfterProcessedTime"))
			}
		}
	}

	var g errgroup.Group

	projectID := sessionObj.ProjectID
	hasBeacon := sessionObj.BeaconTime != nil
	g.Go(func() error {
		parseEventsSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.parseEvents"), tracer.Tag("project_id", projectID))
		if hasBeacon {
			r.DB.Where(&model.EventsObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.EventsObject{})
		}
		if evs := events.Events; len(evs) > 0 {
			// TODO: this isn't very performant, as marshaling the whole event obj to a string is expensive;
			// should fix at some point.
			eventBytes, err := json.Marshal(events)
			if err != nil {
				return e.Wrap(err, "error marshaling events from schema interfaces")
			}
			parsedEvents, err := parse.EventsFromString(string(eventBytes))
			if err != nil {
				return e.Wrap(err, "error parsing events from schema interfaces")
			}

			var lastUserInteractionTimestamp time.Time
			for _, event := range parsedEvents.Events {
				if event.Type == parse.FullSnapshot {
					// If we see a snapshot event, attempt to inject CORS stylesheets.
					d, err := parse.InjectStylesheets(event.Data)
					if err != nil {
						continue
					}
					event.Data = d
				} else if event.Type == parse.IncrementalSnapshot {
					var mouseInteractionEventData parse.MouseInteractionEventData
					err = json.Unmarshal(event.Data, &mouseInteractionEventData)
					if err != nil {
						log.Error(e.Wrap(err, "Error unmarshalling incremental event"))
						continue
					}
					if mouseInteractionEventData.Source == nil {
						// all user interaction events must have a source
						continue
					}
					if _, ok := map[parse.EventSource]bool{
						parse.MouseMove: true, parse.MouseInteraction: true, parse.Scroll: true,
						parse.Input: true, parse.TouchMove: true, parse.Drag: true,
					}[*mouseInteractionEventData.Source]; !ok {
						continue
					}
					lastUserInteractionTimestamp = event.Timestamp.Round(time.Millisecond)
				}
			}
			// Re-format as a string to write to the db.
			b, err := json.Marshal(parsedEvents)
			if err != nil {
				return e.Wrap(err, "error marshaling events from schema interfaces")
			}
			obj := &model.EventsObject{SessionID: sessionID, Events: string(b), IsBeacon: isBeacon}
			if err := r.DB.Create(obj).Error; err != nil {
				return e.Wrap(err, "error creating events object")
			}
			if !lastUserInteractionTimestamp.IsZero() {
				if err := r.DB.Model(&sessionObj).Update("LastUserInteractionTime", lastUserInteractionTimestamp).Error; err != nil {
					return e.Wrap(err, "error updating LastUserInteractionTime")
				}
			}
		}
		parseEventsSpan.Finish()
		return nil
	})

	// unmarshal messages
	g.Go(func() error {
		unmarshalMessagesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.unmarshal.messages"), tracer.Tag("project_id", projectID))
		if hasBeacon {
			r.DB.Where(&model.MessagesObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.MessagesObject{})
		}
		messagesParsed := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
			return e.Wrap(err, "error decoding message data")
		}
		if len(messagesParsed["messages"]) > 0 {
			obj := &model.MessagesObject{SessionID: sessionID, Messages: messages, IsBeacon: isBeacon}
			if err := r.DB.Create(obj).Error; err != nil {
				return e.Wrap(err, "error creating messages object")
			}
		}
		unmarshalMessagesSpan.Finish()
		return nil
	})

	// unmarshal resources
	g.Go(func() error {
		unmarshalResourcesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.unmarshal.resources"), tracer.Tag("project_id", projectID))
		if hasBeacon {
			r.DB.Where(&model.ResourcesObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.ResourcesObject{})
		}
		resourcesParsed := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(resources), &resourcesParsed); err != nil {
			return e.Wrap(err, "error decoding resource data")
		}
		if len(resourcesParsed["resources"]) > 0 {
			obj := &model.ResourcesObject{SessionID: sessionID, Resources: resources, IsBeacon: isBeacon}
			if err := r.DB.Create(obj).Error; err != nil {
				return e.Wrap(err, "error creating resources object")
			}
		}
		unmarshalResourcesSpan.Finish()
		return nil
	})

	// process errors
	g.Go(func() error {
		if hasBeacon {
			r.DB.Where(&model.ErrorObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.ErrorObject{})
		}
		// filter out empty errors
		var filteredErrors []*customModels.ErrorObjectInput
		for _, errorObject := range errors {
			if errorObject.Event == "[{}]" {
				var objString string
				objBytes, err := json.Marshal(errorObject)
				if err != nil {
					log.Error(e.Wrap(err, "error marshalling error object when filtering"))
					objString = ""
				} else {
					objString = string(objBytes)
				}
				log.WithFields(log.Fields{
					"project_id":   projectID,
					"session_id":   sessionID,
					"error_object": objString,
				}).Warn("caught empty error, continuing...")
			} else {
				filteredErrors = append(filteredErrors, errorObject)
			}
		}
		errors = filteredErrors

		// increment daily error table
		if len(errors) > 0 {
			n := time.Now()
			currentDate := time.Date(n.UTC().Year(), n.UTC().Month(), n.UTC().Day(), 0, 0, 0, 0, time.UTC)
			dailyErrorCount := model.DailyErrorCount{
				ProjectID: projectID,
				Date:      &currentDate,
				Count:     int64(len(errors)),
				ErrorType: model.ErrorType.FRONTEND,
			}

			// Upsert error counts into daily_error_counts
			if err := r.DB.Table(model.DAILY_ERROR_COUNTS_TBL).Clauses(clause.OnConflict{
				OnConstraint: model.DAILY_ERROR_COUNTS_UNIQ,
				DoUpdates:    clause.Assignments(map[string]interface{}{"count": gorm.Expr("daily_error_counts.count + excluded.count")}),
			}).Create(&dailyErrorCount).Error; err != nil {
				return e.Wrap(err, "error getting or creating daily error count")
			}
		}

		// put errors in db
		putErrorsToDBSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("db.errors"), tracer.Tag("project_id", projectID))
		groups := make(map[int]struct {
			Group      *model.ErrorGroup
			VisitedURL string
			SessionObj *model.Session
		})
		for _, v := range errors {
			traceBytes, err := json.Marshal(v.StackTrace)
			if err != nil {
				log.Errorf("Error marshaling trace: %v", v.StackTrace)
				continue
			}
			traceString := string(traceBytes)

			errorToInsert := &model.ErrorObject{
				ProjectID:    projectID,
				SessionID:    sessionID,
				Environment:  sessionObj.Environment,
				Event:        v.Event,
				Type:         v.Type,
				URL:          v.URL,
				Source:       v.Source,
				LineNumber:   v.LineNumber,
				ColumnNumber: v.ColumnNumber,
				OS:           sessionObj.OSName,
				Browser:      sessionObj.BrowserName,
				StackTrace:   &traceString,
				Timestamp:    v.Timestamp,
				Payload:      v.Payload,
				RequestID:    nil,
				IsBeacon:     isBeacon,
			}

			//create error fields array
			metaFields := []*model.ErrorField{}
			metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "browser", Value: sessionObj.BrowserName})
			metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "os_name", Value: sessionObj.OSName})
			metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "visited_url", Value: errorToInsert.URL})
			metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "event", Value: errorToInsert.Event})
			group, err := r.HandleErrorAndGroup(errorToInsert, "", v.StackTrace, metaFields, projectID)
			if err != nil {
				log.Errorf("Error updating error group: %v", errorToInsert)
				continue
			}

			groups[group.ID] = struct {
				Group      *model.ErrorGroup
				VisitedURL string
				SessionObj *model.Session
			}{Group: group, VisitedURL: errorToInsert.URL, SessionObj: sessionObj}
		}

		for _, data := range groups {
			r.sendErrorAlert(data.Group.ProjectID, data.SessionObj, data.Group, data.VisitedURL)
		}

		putErrorsToDBSpan.Finish()
		return nil
	})

	if err := g.Wait(); err != nil {
		log.Error(err)
		return
	}

	now := time.Now()
	var beaconTime *time.Time = nil
	if isBeacon {
		beaconTime = &now
	}
	if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).
		Select("PayloadUpdatedAt", "BeaconTime", "HasUnloaded", "Processed", "ObjectStorageEnabled").
		Updates(&model.Session{PayloadUpdatedAt: &now, BeaconTime: beaconTime, HasUnloaded: hasSessionUnloaded, Processed: &model.F, ObjectStorageEnabled: &model.F}).Error; err != nil {
		log.Error(e.Wrap(err, "error updating session payload time and beacon time"))
		return
	}

	// If the session was previously marked as processed, clear this
	// in OpenSearch so that it's treated as a live session again.
	if sessionObj.Processed != nil && *sessionObj.Processed {
		if err := r.OpenSearch.Update(opensearch.IndexSessions, sessionObj.ID, map[string]interface{}{
			"processed": false,
		}); err != nil {
			log.Error(e.Wrap(err, "error updating session in opensearch"))
			return
		}
	}
}
