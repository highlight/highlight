package graph

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/mail"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"

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
	ProducerQueue         *kafka_queue.Queue
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

const SESSION_FIELD_MAX_LENGTH = 2000

// SessionReinitializeExpiry is the interval between two InitializeSession calls with
// the same secureSessionID that should be treated as different sessions
const SessionReinitializeExpiry = time.Minute * 15

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
		if len(fv) > SESSION_FIELD_MAX_LENGTH {
			log.Warnf("property %s from session %d exceeds max expected field length, skipping", k, sessionID)
		} else if fv == "" {
			// Skip when the field value is blank
		} else {
			modelFields = append(modelFields, &model.Field{ProjectID: projectID, Name: k, Value: fv, Type: string(propType)})
		}
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

			// If the lengths are the same then there were not matched properties, so we don't need to send an alert.
			if len(relatedFields) == len(properties) {
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

func (r *Resolver) getMappedStackTraceString(stackTrace []*model2.StackFrameInput, projectID int, errorObj *model.ErrorObject) (*string, []modelInputs.ErrorTrace, error) {
	// get version from session
	var version *string
	if err := r.DB.Model(&model.Session{}).Where(&model.Session{Model: model.Model{ID: errorObj.SessionID}}).
		Select("app_version").Scan(&version).Error; err != nil {
		if !e.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, e.Wrap(err, "error getting app version from session")
		}
	}

	var newMappedStackTraceString *string
	mappedStackTrace, err := errors.EnhanceStackTrace(stackTrace, projectID, version, r.StorageClient)
	if err != nil {
		log.Error(e.Wrapf(err, "error object: %+v", errorObj))
	} else {
		mappedStackTraceBytes, err := json.Marshal(mappedStackTrace)
		if err != nil {
			return nil, nil, e.Wrap(err, "error marshalling mapped stack trace")
		}
		mappedStackTraceString := string(mappedStackTraceBytes)
		newMappedStackTraceString = &mappedStackTraceString
	}
	return newMappedStackTraceString, mappedStackTrace, nil
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

func joinStringPtrs(ptrs ...*string) string {
	var sb strings.Builder
	for _, ptr := range ptrs {
		if ptr != nil {
			sb.WriteString(*ptr)
			sb.WriteString(";")
		}
	}
	return sb.String()
}

func joinIntPtrs(ptrs ...*int) string {
	var sb strings.Builder
	for _, ptr := range ptrs {
		if ptr != nil {
			sb.WriteString(strconv.Itoa(*ptr))
			sb.WriteString(";")
		}
	}
	return sb.String()
}

func (r *Resolver) GetOrCreateErrorGroupOld(errorObj *model.ErrorObject, stackTraceString string) (*model.ErrorGroup, error) {
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

	return errorGroup, nil
}

func (r *Resolver) GetOrCreateErrorGroup(errorObj *model.ErrorObject, fingerprints []*model.ErrorFingerprint, stackTraceString string) (*model.ErrorGroup, error) {
	match, err := r.GetTopErrorGroupMatch(errorObj.Event, errorObj.ProjectID, fingerprints)
	if err != nil {
		return nil, e.Wrap(err, "Error getting top error group match")
	}

	errorGroup := &model.ErrorGroup{}
	if match == nil {
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
	} else {
		if err := r.DB.Where(&model.ErrorGroup{
			Model: model.Model{ID: *match},
		}).First(&errorGroup).Error; err != nil {
			return nil, e.Wrap(err, "error retrieving top matched error group")
		}
	}

	return errorGroup, nil
}

func (r *Resolver) GetTopErrorGroupMatch(event string, projectID int, fingerprints []*model.ErrorFingerprint) (*int, error) {
	firstCode := ""
	firstMeta := ""
	restCode := []string{}
	restMeta := []string{}
	for _, fingerprint := range fingerprints {
		if fingerprint.Type == model.Fingerprint.StackFrameCode {
			if fingerprint.Index == 0 {
				firstCode = fingerprint.Value
			} else if fingerprint.Index <= 4 {
				restCode = append(restCode, fingerprint.Value)
			}
		} else if fingerprint.Type == model.Fingerprint.StackFrameMetadata {
			if fingerprint.Index == 0 {
				firstMeta = fingerprint.Value
			} else if fingerprint.Index <= 4 {
				restMeta = append(restMeta, fingerprint.Value)
			}
		}
	}

	result := struct {
		Id  int
		Sum int
	}{}

	if err := r.DB.Raw(`
	    SELECT id, sum(score) FROM (
			SELECT id, 100 AS score, 0
			FROM error_groups
			WHERE event = ?
			AND id IS NOT NULL
			AND project_id = ?
			UNION ALL
			(SELECT DISTINCT error_group_id, 10 AS score, 0
			FROM error_fingerprints
			WHERE
				((type = 'META'
				AND value = ?
				AND index = 0)
				OR (type = 'CODE'
				AND value = ?
				AND index = 0))
				AND project_id = ?
				AND error_group_id IS NOT NULL)
			UNION ALL
			(SELECT DISTINCT error_group_id, 1 AS score, index
			FROM error_fingerprints
			WHERE
				((type = 'META'
				AND value in (?)
				AND index > 0 and index <= 4)
				OR (type = 'CODE'
				AND value in (?)
				AND index > 0 and index <= 4))
				AND project_id = ?
				AND error_group_id IS NOT NULL)
		) a
		GROUP BY id
		ORDER BY sum DESC, id DESC
		LIMIT 1`, event, projectID, firstMeta, firstCode, projectID, restMeta, restCode, projectID).
		Scan(&result).Error; err != nil {
		return nil, e.Wrap(err, "error querying top error group match")
	}

	minScore := 10 + len(restMeta) - 1
	if len(restCode) > len(restMeta) {
		minScore = 10 + len(restCode) - 1
	}

	if result.Sum > minScore {
		return &result.Id, nil
	} else {
		return nil, nil
	}
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
			// Forward these errors to another project that Highlight owns to help debug: https://app.highlight.run/715/errors
			errorObj.ProjectID = 715
		}
		if len(stackTrace) > errors.ERROR_STACK_MAX_FRAME_COUNT {
			stackTrace = stackTrace[:errors.ERROR_STACK_MAX_FRAME_COUNT]
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
	fingerprints := []*model.ErrorFingerprint{}
	if stackTrace != nil {
		var err error
		var mappedStackTrace []modelInputs.ErrorTrace
		newMappedStackTraceString, mappedStackTrace, err = r.getMappedStackTraceString(stackTrace, projectID, errorObj)
		if err != nil {
			return nil, e.Wrap(err, "Error mapping stack trace string")
		}
		for idx, frame := range mappedStackTrace {
			codeVal := joinStringPtrs(frame.LinesBefore, frame.LineContent, frame.LinesAfter)
			if codeVal != "" {
				code := model.ErrorFingerprint{
					ProjectID: projectID,
					Type:      model.Fingerprint.StackFrameCode,
					Value:     codeVal,
					Index:     idx,
				}
				fingerprints = append(fingerprints, &code)
			}

			metaVal := joinStringPtrs(frame.FileName, frame.FunctionName) +
				joinIntPtrs(frame.LineNumber, frame.ColumnNumber)
			if metaVal != "" {
				meta := model.ErrorFingerprint{
					ProjectID: projectID,
					Type:      model.Fingerprint.StackFrameMetadata,
					Value:     metaVal,
					Index:     idx,
				}
				fingerprints = append(fingerprints, &meta)
			}
		}
		errorObj.MappedStackTrace = newMappedStackTraceString
	}

	var errorGroup *model.ErrorGroup
	var err error
	// New error grouping logic is gated by project_id 1 for now
	errorGroup, err = r.GetOrCreateErrorGroup(errorObj, fingerprints, stackTraceString)
	if err != nil {
		return nil, e.Wrap(err, "Error getting top error group match")
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

	if err := r.AppendErrorFields(fields, errorGroup); err != nil {
		return nil, e.Wrap(err, "error appending error fields")
	}

	if err := r.DB.Transaction(func(tx *gorm.DB) error {
		if err := r.DB.Model(errorGroup).Association("Fingerprints").Append(fingerprints); err != nil {
			return e.Wrap(err, "error appending new fingerprints")
		}

		var newIds []int
		for _, fingerprint := range fingerprints {
			newIds = append(newIds, fingerprint.ID)
		}

		if err := r.DB.Exec(`
			UPDATE error_fingerprints
			SET error_group_id = NULL
			WHERE id IN (
				SELECT id
				FROM error_fingerprints
				WHERE id NOT IN (?)
				AND error_group_id = ?
				ORDER BY id
				FOR UPDATE
			)
		`, newIds, errorGroup.ID).Error; err != nil {
			return e.Wrap(err, "error removing old fingerprints from the error group")
		}

		return nil
	}); err != nil {
		return nil, e.Wrap(err, "error replacing error group fingerprints")
	}

	// Don't save errors that come from rrweb at record time.
	if newMappedStackTraceString != nil && strings.Contains(*newMappedStackTraceString, "rrweb") {
		var now = time.Now()
		if err := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{Model: model.Model{DeletedAt: &now}}).Error; err != nil {
			return nil, e.Wrap(err, "Error soft deleting rrweb error group.")
		}

	} else {
		if err := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{StackTrace: newFrameString, MappedStackTrace: newMappedStackTraceString, Environments: environmentsString, Event: errorObj.Event}).Error; err != nil {
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
		"Event":      errorObj.Event,
	}); err != nil {
		return nil, e.Wrap(err, "error updating error group in opensearch")
	}

	return errorGroup, nil
}

func (r *Resolver) AppendErrorFields(fields []*model.ErrorField, errorGroup *model.ErrorGroup) error {
	fieldsToAppend := []*model.ErrorField{}
	for _, f := range fields {
		field := &model.ErrorField{}
		res := r.DB.Raw(`
			SELECT * FROM error_fields
			WHERE project_id = ?
			AND name = ?
			AND value = ?
			AND md5(value)::uuid = md5(?)::uuid
			`, f.ProjectID, f.Name, f.Value, f.Value).First(&field)
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

func InitializeSessionMinimal(r *mutationResolver, projectVerboseID string, enableStrictPrivacy bool, enableRecordingNetworkContents bool, clientVersion string, firstloadVersion string, clientConfig string, environment string, appVersion *string, fingerprint string, userAgent string, acceptLanguage string, ip string, sessionSecureID *string) (*model.Session, error) {
	projectID, err := model.FromVerboseID(projectVerboseID)
	if err != nil {
		log.Errorf("An unsupported verboseID was used: %s, %s", projectVerboseID, clientConfig)
	}
	project := &model.Project{}
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "project doesn't exist")
	}
	workspace, err := r.getWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving workspace")
	}

	var fingerprintInt int = 0
	if val, err := strconv.Atoi(fingerprint); err == nil {
		fingerprintInt = val
	}

	deviceDetails := GetDeviceDetails(userAgent)
	n := time.Now()
	session := &model.Session{
		ProjectID:                      projectID,
		Fingerprint:                    fingerprintInt,
		OSName:                         deviceDetails.OSName,
		OSVersion:                      deviceDetails.OSVersion,
		BrowserName:                    deviceDetails.BrowserName,
		BrowserVersion:                 deviceDetails.BrowserVersion,
		Language:                       acceptLanguage,
		WithinBillingQuota:             &model.T,
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
		ViewedByAdmins:                 []model.Admin{},
	}

	// Firstload secureID generation was added in firstload 3.0.1, Feb 2022
	if sessionSecureID != nil {
		session.SecureID = *sessionSecureID
	}

	// Get the user's ip, get geolocation data
	location := &Location{
		City:      "",
		Postal:    "",
		Latitude:  0.0,
		Longitude: 0.0,
		State:     "",
	}
	fetchedLocation, err := GetLocationFromIP(ip)
	if err != nil || fetchedLocation == nil {
		log.Errorf("error getting user's location: %v", err)
	} else {
		location = fetchedLocation
	}

	// determine if session is within billing quota
	withinBillingQuota := r.isWithinBillingQuota(project, workspace, *session.PayloadUpdatedAt)

	session.City = location.City
	session.State = location.State
	session.Postal = location.Postal
	session.Latitude = location.Latitude.(float64)
	session.Longitude = location.Longitude.(float64)
	session.WithinBillingQuota = &withinBillingQuota

	if err := r.DB.Create(session).Error; err != nil {
		if sessionSecureID == nil || !strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			return nil, e.Wrap(err, "error creating session")
		}
		sessionObj := &model.Session{}
		if fetchSessionErr := r.DB.Where(&model.Session{SecureID: *sessionSecureID}).First(&sessionObj).Error; fetchSessionErr != nil {
			return nil, e.Wrap(fetchSessionErr, "error creating session, couldn't fetch session duplicate")
		}
		if time.Now().After(sessionObj.CreatedAt.Add(SessionReinitializeExpiry)) || projectID != sessionObj.ProjectID {
			return nil, e.Wrap(err, fmt.Sprintf("error creating session, user agent: %s", userAgent))
		}
		// Otherwise, it's likely a retry from the same machine after the first initializeSession() response timed out
	}

	log.WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("initialized session: %s", session.Identifier)

	if err := r.OpenSearch.IndexSynchronous(opensearch.IndexSessions, session.ID, session); err != nil {
		return nil, e.Wrap(err, "error indexing new session in opensearch")
	}

	sessionProperties := map[string]string{
		"os_name":         session.OSName,
		"os_version":      session.OSVersion,
		"browser_name":    session.BrowserName,
		"browser_version": session.BrowserVersion,
		"environment":     session.Environment,
		"device_id":       strconv.Itoa(session.Fingerprint),
		"city":            session.City,
	}
	if err := r.AppendProperties(session.ID, sessionProperties, PropertyType.SESSION); err != nil {
		log.Error(e.Wrap(err, "error adding set of properties to db"))
	}

	return session, nil
}

func (r *Resolver) InitializeSessionImplementation(sessionID int, ip string) (*model.Session, error) {
	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return nil, e.Wrap(err, "session doesn't exist")
	}
	project := &model.Project{}
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: session.ProjectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "project doesn't exist")
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
			if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: project.ID, Disabled: &model.F}}).
				Where("type=?", model.AlertType.NEW_SESSION).Find(&sessionAlerts).Error; err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error fetching new session alert", project.ID))
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
					log.Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from new session alert", project.ID))
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
					log.Error(e.Wrapf(err, "[project_id: %d] error getting exclude rules from new session alert", project.ID))
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

func (r *Resolver) IdentifySessionImpl(_ context.Context, sessionID int, userIdentifier string, userObject interface{}) error {
	obj, ok := userObject.(map[string]interface{})
	if !ok {
		return e.New("[IdentifySession] error converting userObject interface type")
	}

	userProperties := map[string]string{}
	if userIdentifier != "" {
		userProperties["identifier"] = userIdentifier
	}

	// If userIdentifier is a valid email, save as an email field
	// (this will be overridden if `email` is passed to `H.identify`)
	_, err := mail.ParseAddress(userIdentifier)
	if err == nil {
		userProperties["email"] = userIdentifier
	}

	userObj := make(map[string]string)
	for k, v := range obj {
		if v != "" {
			userProperties[k] = fmt.Sprintf("%v", v)
			userObj[k] = fmt.Sprintf("%v", v)
		}
	}

	if err := r.AppendProperties(sessionID, userProperties, PropertyType.USER); err != nil {
		log.Error(e.Wrapf(err, "[IdentifySession] error adding set of identify properties to db: session: %d", sessionID))
	}

	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return e.Wrap(err, "[IdentifySession] error querying session by sessionID")
	}
	// set user properties to session in db
	if err := session.SetUserProperties(userObj); err != nil {
		return e.Wrapf(err, "[IdentifySession] [project_id: %d] error appending user properties to session object {id: %d}", session.ProjectID, sessionID)
	}

	// Check if there is a session created by this user.
	firstTime := &model.F
	if err := r.DB.Where(&model.Session{Identifier: userIdentifier, ProjectID: session.ProjectID}).Take(&model.Session{}).Error; err != nil {
		if e.Is(err, gorm.ErrRecordNotFound) {
			firstTime = &model.T
		} else {
			return e.Wrap(err, "[IdentifySession] error querying session with past identifier")
		}
	}

	session.FirstTime = firstTime
	if userIdentifier != "" {
		session.Identifier = userIdentifier
	}

	openSearchProperties := map[string]interface{}{
		"user_properties": session.UserProperties,
		"first_time":      session.FirstTime,
	}
	if session.Identifier != "" {
		openSearchProperties["identifier"] = session.Identifier
	}
	if err := r.OpenSearch.Update(opensearch.IndexSessions, sessionID, openSearchProperties); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
	}

	if err := r.DB.Save(&session).Error; err != nil {
		return e.Wrap(err, "[IdentifySession] failed to update session")
	}

	log.WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("identified session: %s", session.Identifier)

	r.AlertWorkerPool.SubmitRecover(func() {
		// Sending New User Alert
		// if is not new user, return
		if session.FirstTime == nil || !*session.FirstTime {
			return
		}
		var sessionAlerts []*model.SessionAlert
		if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type IS NULL OR type=?", model.AlertType.NEW_USER).Find(&sessionAlerts).Error; err != nil {
			log.Error(e.Wrapf(err, "[project_id: %d] error fetching new user alert", session.ProjectID))
			return
		}

		for _, sessionAlert := range sessionAlerts {
			// check if session was produced from an excluded environment
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from new user alert", session.ProjectID))
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

			// get produced user properties from session
			userProperties, err := session.GetUserProperties()
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error getting user properties from new user alert", session.ProjectID))
				return
			}

			project := &model.Project{}
			if err := r.DB.Where(&model.Project{Model: model.Model{ID: session.ProjectID}}).First(&project).Error; err != nil {
				log.Error(e.Wrap(err, "error querying project"))
				return
			}

			workspace, err := r.getWorkspace(project.WorkspaceID)
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error querying workspace", session.ProjectID))
				return
			}

			sessionAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: session.SecureID, UserIdentifier: session.Identifier, UserProperties: userProperties, UserObject: session.UserObject})
		}
	})
	return nil
}

func (r *Resolver) AddTrackPropertiesImpl(_ context.Context, sessionID int, propertiesObject interface{}) error {
	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return e.New("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
		if fields[k] == "therewasonceahumblebumblebeeflyingthroughtheforestwhensuddenlyadropofwaterfullyencasedhimittookhimasecondtofigureoutthathesinaraindropsuddenlytheraindrophitthegroundasifhewasdivingintoapoolandheflewawaywithnofurtherissues" {
			return e.New("therewasonceahumblebumblebeeflyingthroughtheforestwhensuddenlyadropofwaterfullyencasedhimittookhimasecondtofigureoutthathesinaraindropsuddenlytheraindrophitthegroundasifhewasdivingintoapoolandheflewawaywithnofurtherissues")
		}
	}
	err := r.AppendProperties(sessionID, fields, PropertyType.TRACK)
	if err != nil {
		return e.Wrap(err, "error adding set of properties to db")
	}
	return nil
}

func (r *Resolver) AddSessionPropertiesImpl(_ context.Context, sessionID int, propertiesObject interface{}) error {
	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return e.New("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err := r.AppendProperties(sessionID, fields, PropertyType.SESSION)
	if err != nil {
		return e.Wrap(err, "error adding set of properties to db")
	}
	return nil
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
func (r *Resolver) SubmitMetricsMessage(ctx context.Context, metrics []*customModels.MetricInput) (int, error) {
	if len(metrics) == 0 {
		log.Errorf("got no metrics for pushmetrics: %+v", metrics)
		return -1, e.New("no metrics provided")
	}
	sessionMetrics := make(map[string][]*customModels.MetricInput)
	for _, m := range metrics {
		if _, ok := sessionMetrics[m.SessionSecureID]; !ok {
			sessionMetrics[m.SessionSecureID] = []*customModels.MetricInput{}
		}
		sessionMetrics[m.SessionSecureID] = append(sessionMetrics[m.SessionSecureID], m)
	}

	for secureID, metrics := range sessionMetrics {
		session := &model.Session{}
		if err := r.DB.Model(&session).Where(&model.Session{SecureID: secureID}).First(&session).Error; err != nil {
			log.Error(err)
			return -1, e.Wrapf(err, "no session found for push metrics: %s", secureID)
		}

		err := r.ProducerQueue.Submit(&kafka_queue.Message{
			Type: kafka_queue.PushMetrics,
			PushMetrics: &kafka_queue.PushMetricsArgs{
				SessionID: session.ID,
				ProjectID: session.ProjectID,
				Metrics:   metrics,
			}}, strconv.Itoa(session.ID))
		if err != nil {
			return -1, err
		}
	}

	return 0, nil
}

func (r *Resolver) AddLegacyMetric(ctx context.Context, sessionID int, metricType customModels.MetricType, name string, value float64) (int, error) {
	session := &model.Session{}
	if err := r.DB.Model(&model.Session{}).Where("id = ?", sessionID).First(&session).Error; err != nil {
		return -1, e.Wrapf(err, "error querying device metric session")
	}
	return r.SubmitMetricsMessage(ctx, []*customModels.MetricInput{{
		SessionSecureID: session.SecureID,
		Name:            name,
		Value:           value,
		Type:            metricType,
		Timestamp:       time.Now(),
	}})
}

func (r *Resolver) addNewMetric(sessionID int, projectID int, m *customModels.MetricInput) {
	newMetric := &model.Metric{
		Name:      m.Name,
		Value:     m.Value,
		ProjectID: projectID,
		SessionID: sessionID,
		Type:      modelInputs.MetricType(m.Type),
		RequestID: m.RequestID,
	}

	if err := r.DB.Create(&newMetric).Error; err != nil {
		log.Error(err)
	}
}

func (r *Resolver) PushMetricsImpl(ctx context.Context, sessionID int, projectID int, metrics []*customModels.MetricInput) {
	for _, m := range metrics {
		if m.Type == customModels.MetricTypeBackend {
			r.addNewMetric(sessionID, projectID, m)
			continue
		}

		existingMetric := &model.Metric{
			Name:      m.Name,
			ProjectID: projectID,
			SessionID: sessionID,
			Type:      modelInputs.MetricType(m.Type),
			RequestID: m.RequestID,
		}
		tx := r.DB.Where(existingMetric).FirstOrCreate(&existingMetric)
		if err := tx.Error; err != nil {
			log.Error(err)
			return
		}
		// Update the existing record if it already exists
		existingMetric.Value = m.Value
		if err := r.DB.Save(&existingMetric).Error; err != nil {
			log.Error(err)
		}
	}
}

func (r *Resolver) ProcessBackendPayloadImpl(ctx context.Context, sessionSecureIds []string, errors []*customModels.BackendErrorObjectInput) {
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

func (r *Resolver) ProcessPayload(ctx context.Context, sessionID int, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon bool, hasSessionUnloaded bool, highlightLogs *string) {
	querySessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload", tracer.ResourceName("db.querySession"))
	querySessionSpan.SetTag("sessionID", sessionID)
	querySessionSpan.SetTag("messagesLength", len(messages))
	querySessionSpan.SetTag("resourcesLength", len(resources))
	querySessionSpan.SetTag("numberOfErrors", len(errors))
	querySessionSpan.SetTag("numberOfEvents", len(events.Events))
	if highlightLogs != nil {
		logsArray := strings.Split(*highlightLogs, "\n")
		for _, clientLog := range logsArray {
			if clientLog != "" {
				log.Warnf("[Client]%s", clientLog)
			}
		}
	}
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
			r.DB.Table("events_objects_partitioned").Where(&model.EventsObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.EventsObject{})
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
						log.Error(e.Wrap(err, "Error unmarshalling full snapshot"))
						continue
					}
					event.Data = d
				} else if event.Type == parse.IncrementalSnapshot {
					mouseInteractionEventData, err := parse.UnmarshallMouseInteractionEvent(event.Data)
					if err != nil {
						log.Error(e.Wrap(err, "Error unmarshalling incremental event"))
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
			if err := r.DB.Table("events_objects_partitioned").Create(obj).Error; err != nil {
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

	sessionHasErrors := len(errors) > 0
	// We care about if the session in it's entirety has errors or not.
	// `ProcessPayload` is run on chunks of a session so we need to check if we've seen any errors
	// in previous chunks.
	if sessionObj != nil && sessionObj.HasErrors != nil {
		if *sessionObj.HasErrors {
			sessionHasErrors = true
		}
	}

	fieldsToUpdate := model.Session{
		PayloadUpdatedAt: &now, BeaconTime: beaconTime, HasUnloaded: hasSessionUnloaded, Processed: &model.F, ObjectStorageEnabled: &model.F, Chunked: &model.F, Excluded: &model.F,
	}

	// We only want to update the `HasErrors` field if the session has errors.
	if sessionHasErrors {
		fieldsToUpdate.HasErrors = &model.T

		if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).
			Select("PayloadUpdatedAt", "BeaconTime", "HasUnloaded", "Processed", "ObjectStorageEnabled", "Excluded", "HasErrors").
			Updates(&fieldsToUpdate).Error; err != nil {
			log.Error(e.Wrap(err, "error updating session payload time and beacon time with errors"))
			return
		}
	} else {
		if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).
			Select("PayloadUpdatedAt", "BeaconTime", "HasUnloaded", "Processed", "ObjectStorageEnabled", "Excluded").
			Updates(&fieldsToUpdate).Error; err != nil {
			log.Error(e.Wrap(err, "error updating session payload time and beacon time"))
			return
		}
	}

	// If the session was previously marked as processed, clear this
	// in OpenSearch so that it's treated as a live session again.
	if sessionObj.Processed != nil && *sessionObj.Processed {
		if err := r.OpenSearch.Update(opensearch.IndexSessions, sessionObj.ID, map[string]interface{}{
			"processed":  false,
			"Excluded":   false,
			"has_errors": sessionHasErrors,
		}); err != nil {
			log.Error(e.Wrap(err, "error updating session in opensearch"))
			return
		}
	}

	if sessionHasErrors {
		if err := r.OpenSearch.Update(opensearch.IndexSessions, sessionObj.ID, map[string]interface{}{
			"has_errors": true,
		}); err != nil {
			log.Error(e.Wrap(err, "error setting has_errors on session in opensearch"))
			return
		}
	}
}
