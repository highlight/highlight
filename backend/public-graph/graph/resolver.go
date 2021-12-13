package graph

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/go-sourcemap/sourcemap"
	"github.com/highlight-run/workerpool"
	"github.com/mssola/user_agent"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

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

//Change to AppendProperties(sessionId,properties,type)
func (r *Resolver) AppendProperties(sessionID int, properties map[string]string, propType Property) error {
	session := &model.Session{}
	res := r.DB.Preload("Fields").Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session)
	if err := res.Error; err != nil {
		return e.Wrapf(err, "error getting session(id=%d) in append properties(type=%s)", sessionID, propType)
	}

	modelFields := []*model.Field{}
	for k, fv := range properties {
		modelFields = append(modelFields, &model.Field{ProjectID: session.ProjectID, Name: k, Value: fv, Type: string(propType)})
	}

	err := r.AppendFields(modelFields, session)
	if err != nil {
		return e.Wrap(err, "error appending fields")
	}

	return nil
}

func (r *Resolver) AppendFields(fields []*model.Field, session *model.Session) error {
	fieldsToAppend := []*model.Field{}
	newFields := []*model.Field{}
	exists := false
	for _, f := range fields {
		field := &model.Field{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || e.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating field")
			}

			fieldsToAppend = append(fieldsToAppend, f)
		} else {
			exists = false
			for _, existing := range session.Fields {
				if field.Name == existing.Name && field.Value == existing.Value {
					exists = true
				}
			}
			fieldsToAppend = append(fieldsToAppend, field)
			if !exists {
				newFields = append(newFields, field)
			}
		}
	}

	openSearchFields := make([]interface{}, len(newFields))
	for i := range newFields {
		openSearchFields[i] = newFields[i]
	}

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

func (r *Resolver) getMappedStackTraceString(stackTrace []*model2.StackFrameInput, projectID int, errorGroup *model.ErrorGroup, errorObj *model.ErrorObject) (*string, error) {
	var newMappedStackTraceString *string
	mappedStackTrace, err := r.EnhanceStackTrace(stackTrace, projectID, errorObj.SessionID)
	if err != nil {
		log.Error(e.Wrapf(err, "error group: %+v error object: %+v", errorGroup, errorObj))
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
		}
		if err := r.DB.Create(newErrorGroup).Error; err != nil {
			return nil, e.Wrap(err, "Error creating new error group")
		}

		errorGroup = newErrorGroup
	}
	errorObj.ErrorGroupID = errorGroup.ID
	if err := r.DB.Create(errorObj).Error; err != nil {
		return nil, e.Wrap(err, "Error performing error insert for error")
	}

	// If stackTrace is non-nil, do the source mapping; else, MappedStackTrace will not be set on the ErrorObject
	newFrameString := stackTraceString
	var newMappedStackTraceString *string
	if stackTrace != nil {
		mappedStackTraceString, err := r.getMappedStackTraceString(stackTrace, projectID, errorGroup, errorObj)
		if err != nil {
			return nil, e.Wrap(err, "Error mapping stack trace string")
		}
		newMappedStackTraceString = mappedStackTraceString
	}

	environmentsString := r.getIncrementedEnvironmentCount(errorGroup, errorObj)

	if err := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{StackTrace: newFrameString, MappedStackTrace: newMappedStackTraceString, Environments: environmentsString}).Error; err != nil {
		return nil, e.Wrap(err, "Error updating error group metadata log or environments")
	}

	err := r.AppendErrorFields(fields, errorGroup)
	if err != nil {
		return nil, e.Wrap(err, "error appending error fields")
	}

	return errorGroup, nil
}

func (r *Resolver) AppendErrorFields(fields []*model.ErrorField, errorGroup *model.ErrorGroup) error {
	fieldsToAppend := []*model.ErrorField{}
	var newFieldGroup []FieldData
	exists := false
	if errorGroup.FieldGroup != nil {
		if err := json.Unmarshal([]byte(*errorGroup.FieldGroup), &newFieldGroup); err != nil {
			return e.Wrap(err, "error decoding error group field group data")
		}
	}
	for _, f := range fields {
		field := &model.ErrorField{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || e.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating error field")
			}
			fieldsToAppend = append(fieldsToAppend, f)
			newFieldGroup = append(newFieldGroup, FieldData{
				Name:  f.Name,
				Value: f.Value,
			})
		} else {
			exists = false
			for _, existing := range newFieldGroup {
				if field.Name == existing.Name && field.Value == existing.Value {
					exists = true
				}
			}
			fieldsToAppend = append(fieldsToAppend, field)
			if !exists {
				newFieldGroup = append(newFieldGroup, FieldData{
					Name:  field.Name,
					Value: field.Value,
				})
			}
		}
	}
	fieldBytes, err := json.Marshal(newFieldGroup)
	if err != nil {
		return e.Wrap(err, "Error marshalling error group field group")
	}
	fieldString := string(fieldBytes)

	if err := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{FieldGroup: &fieldString}).Error; err != nil {
		return e.Wrap(err, "Error updating error group field group")
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
		log.Errorf("An unsupported verboseID was used: %s", projectVerboseID)
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
	}

	if err := r.DB.Create(session).Error; err != nil {
		return nil, e.Wrap(err, "error creating session")
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

	return session, nil
}

type fetcher interface {
	fetchFile(string) ([]byte, error)
}

func init() {
	if util.IsDevEnv() {
		fetch = DiskFetcher{}
	} else {
		fetch = NetworkFetcher{}
	}
}

var fetch fetcher

type DiskFetcher struct{}

func (n DiskFetcher) fetchFile(href string) ([]byte, error) {
	inputBytes, err := ioutil.ReadFile(href)
	if err != nil {
		return nil, e.Wrap(err, "error fetching file from disk")
	}
	return inputBytes, nil
}

type NetworkFetcher struct{}

func (n NetworkFetcher) fetchFile(href string) ([]byte, error) {
	// check if source is a URL
	_, err := url.ParseRequestURI(href)
	if err != nil {
		return nil, err
	}
	// get minified file
	res, err := http.Get(href)
	if err != nil {
		return nil, e.Wrap(err, "error getting source file")
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, e.New("status code not OK")
	}

	// unpack file into slice
	bodyBytes, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, e.Wrap(err, "error reading response body")
	}

	return bodyBytes, nil
}

/*
* EnhanceStackTrace makes no DB changes
* It loops through the stack trace, for each :
* fetches the sourcemap from remote
* maps the error info into slice
 */
func (r *Resolver) EnhanceStackTrace(input []*model2.StackFrameInput, projectId, sessionId int) ([]modelInputs.ErrorTrace, error) {
	if input == nil {
		return nil, e.New("stack trace input cannot be nil")
	}
	var mappedStackTrace []modelInputs.ErrorTrace
	for _, stackFrame := range input {
		if stackFrame == nil || (stackFrame.FileName == nil || len(*stackFrame.FileName) < 1 || stackFrame.LineNumber == nil || stackFrame.ColumnNumber == nil) {
			continue
		}
		mappedStackFrame, err := r.processStackFrame(projectId, sessionId, *stackFrame)
		if err != nil {
			if !util.IsDevOrTestEnv() {
				log.Error(err)
			}
			mappedStackFrame = &modelInputs.ErrorTrace{
				FileName:     stackFrame.FileName,
				LineNumber:   stackFrame.LineNumber,
				FunctionName: stackFrame.FunctionName,
				ColumnNumber: stackFrame.ColumnNumber,
				Error:        util.MakeStringPointer(err.Error()),
			}
		}
		if mappedStackFrame != nil {
			mappedStackTrace = append(mappedStackTrace, *mappedStackFrame)
		}
	}
	if len(mappedStackTrace) > 1 && (mappedStackTrace[0].FunctionName == nil || *mappedStackTrace[0].FunctionName == "") {
		mappedStackTrace[0].FunctionName = mappedStackTrace[1].FunctionName
	}
	return mappedStackTrace, nil
}

func (r *Resolver) processStackFrame(projectId, sessionId int, stackTrace model2.StackFrameInput) (*modelInputs.ErrorTrace, error) {
	stackTraceFileURL := *stackTrace.FileName
	stackTraceLineNumber := *stackTrace.LineNumber
	stackTraceColumnNumber := *stackTrace.ColumnNumber

	// get file name index from URL
	stackFileNameIndex := strings.Index(stackTraceFileURL, path.Base(stackTraceFileURL))
	if stackFileNameIndex == -1 {
		err := e.Errorf("source path doesn't contain file name: %v", stackTraceFileURL)
		return nil, err
	}

	// get path from url
	u, err := url.Parse(stackTraceFileURL)
	if err != nil {
		err := e.Wrapf(err, "error parsing stack trace file url: %v", stackTraceFileURL)
		return nil, err
	}
	stackTraceFilePath := u.Path
	if len(stackTraceFilePath) > 0 && stackTraceFilePath[0:1] == "/" {
		stackTraceFilePath = stackTraceFilePath[1:]
	}

	// get version from session
	var version *string
	if err := r.DB.Model(&model.Session{}).Where(&model.Session{Model: model.Model{ID: sessionId}}).Select("app_version").Scan(&version).Error; err != nil {
		if !e.Is(err, gorm.ErrRecordNotFound) {
			return nil, e.Wrap(err, "error getting app version from session")
		}
	}

	// try to get file from s3
	minifiedFileBytes, err := r.StorageClient.ReadSourceMapFileFromS3(projectId, version, stackTraceFilePath)
	if err != nil {
		// if not in s3, get from url and put in s3
		minifiedFileBytes, err = fetch.fetchFile(stackTraceFileURL)
		if err != nil {
			// fallback if we can't get the source file at all
			err := e.Wrapf(err, "error fetching file: %v", stackTraceFileURL)
			return nil, err
		}
		_, err = r.StorageClient.PushSourceMapFileToS3(projectId, version, stackTraceFilePath, minifiedFileBytes)
		if err != nil {
			log.Error(e.Wrapf(err, "error pushing file to s3: %v", stackTraceFilePath))
		}
	}
	if len(minifiedFileBytes) > 5000000 {
		err := e.Errorf("minified source file over 5mb: %v, size: %v", stackTraceFileURL, len(minifiedFileBytes))
		return nil, err
	}

	sourceMapFileName := string(regexp.MustCompile(`//# sourceMappingURL=(.*)`).Find(minifiedFileBytes))
	if len(sourceMapFileName) < 1 {
		err := e.Errorf("file does not contain source map url: %v", stackTraceFileURL)
		return nil, err
	}
	sourceMapFileName = strings.Replace(sourceMapFileName, "//# sourceMappingURL=", "", 1)

	// construct sourcemap url from searched file
	sourceMapURL := (stackTraceFileURL)[:stackFileNameIndex] + sourceMapFileName
	// get path from url
	u2, err := url.Parse(sourceMapURL)
	if err != nil {
		err := e.Wrap(err, "error parsing source map url")
		return nil, err
	}
	sourceMapFilePath := u2.Path
	if sourceMapFilePath[0:1] == "/" {
		sourceMapFilePath = sourceMapFilePath[1:]
	}

	// fetch source map file
	// try to get file from s3
	sourceMapFileBytes, err := r.StorageClient.ReadSourceMapFileFromS3(projectId, version, sourceMapFilePath)
	if err != nil {
		// if not in s3, get from url and put in s3
		sourceMapFileBytes, err = fetch.fetchFile(sourceMapURL)
		if err != nil {
			// fallback if we can't get the source file at all
			err := e.Wrapf(err, "error fetching source map file: %v", sourceMapURL)
			return nil, err
		}
		_, err = r.StorageClient.PushSourceMapFileToS3(projectId, version, sourceMapFilePath, sourceMapFileBytes)
		if err != nil {
			log.Error(e.Wrapf(err, "error pushing file to s3: %v", sourceMapFileName))
		}
	}
	smap, err := sourcemap.Parse(sourceMapURL, sourceMapFileBytes)
	if err != nil {
		err := e.Wrapf(err, "error parsing source map file -> %v", sourceMapURL)
		return nil, err
	}

	sourceFileName, fn, line, col, ok := smap.Source(stackTraceLineNumber, stackTraceColumnNumber)
	if !ok {
		err := e.Errorf("error extracting true error info from source map: %v", sourceMapURL)
		return nil, err
	}
	mappedStackFrame := &modelInputs.ErrorTrace{
		FileName:     &sourceFileName,
		LineNumber:   &line,
		FunctionName: &fn,
		ColumnNumber: &col,
	}
	return mappedStackFrame, nil
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
		if err := r.DB.Model(&model.ErrorAlert{}).Where(&model.ErrorAlert{Alert: model.Alert{ProjectID: projectID}}).Find(&errorAlerts).Error; err != nil {
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

			alertEventsLookbackPeriod := 15 // only count alert_events from the past 15 seconds
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
			`, projectID, model.AlertType.ERROR, group.ID, errorAlert.ID, alertEventsLookbackPeriod).Scan(&numAlerts).Error; err != nil {
				log.Error(e.Wrapf(err, "error counting alert events from past %d seconds", alertEventsLookbackPeriod))
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

			err = errorAlert.SendSlackAlert(r.DB, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: sessionObj.SecureID, UserIdentifier: sessionObj.Identifier, Group: group, URL: &visitedUrl, ErrorsCount: &numErrors, UserObject: sessionObj.UserObject})
			if err != nil {
				log.Error(e.Wrap(err, "error sending slack error message"))
				return
			}
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

func (r *Resolver) processPayload(ctx context.Context, sessionID int, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput) {
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

	if sessionObj.PayloadUpdatedAt != nil && time.Since(*sessionObj.PayloadUpdatedAt) > 10*time.Minute {
		return
	}

	var g errgroup.Group

	projectID := sessionObj.ProjectID
	g.Go(func() error {
		parseEventsSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.parseEvents"), tracer.Tag("project_id", projectID))
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
			obj := &model.EventsObject{SessionID: sessionID, Events: string(b)}
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
		messagesParsed := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
			return e.Wrap(err, "error decoding message data")
		}
		if len(messagesParsed["messages"]) > 0 {
			obj := &model.MessagesObject{SessionID: sessionID, Messages: messages}
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
		resourcesParsed := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(resources), &resourcesParsed); err != nil {
			return e.Wrap(err, "error decoding resource data")
		}
		if len(resourcesParsed["resources"]) > 0 {
			obj := &model.ResourcesObject{SessionID: sessionID, Resources: resources}
			if err := r.DB.Create(obj).Error; err != nil {
				return e.Wrap(err, "error creating resources object")
			}
		}
		unmarshalResourcesSpan.Finish()
		return nil
	})

	// process errors
	g.Go(func() error {
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
	if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).Updates(&model.Session{PayloadUpdatedAt: &now}).Error; err != nil {
		log.Error(e.Wrap(err, "error updating session payload time"))
		return
	}
}
