package graph

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/go-sourcemap/sourcemap"
	"github.com/mssola/user_agent"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/pricing"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	model2 "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

// This file will not be regenerated automatically.
//
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB            *gorm.DB
	StorageClient *storage.StorageClient
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
	Timestamp  time.Time `json:"timestamp"`
	ErrorID    int       `json:"error_id"`
	SessionID  int       `json:"session_id"`
	Browser    string    `json:"browser"`
	OS         string    `json:"os"`
	VisitedURL string    `json:"visited_url"`
}

type FieldData struct {
	Name  string
	Value string
}

//Change to AppendProperties(sessionId,properties,type)
func (r *Resolver) AppendProperties(sessionID int, properties map[string]string, propType Property) error {
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session)
	if err := res.Error; err != nil {
		return e.Wrap(err, "error getting session in append properties")
	}

	modelFields := []*model.Field{}
	for k, fv := range properties {
		modelFields = append(modelFields, &model.Field{OrganizationID: session.OrganizationID, Name: k, Value: fv, Type: string(propType)})
	}

	err := r.AppendFields(modelFields, session)
	if err != nil {
		return e.Wrap(err, "error appending fields")
	}

	return nil
}

func (r *Resolver) AppendFields(fields []*model.Field, session *model.Session) error {
	fieldsToAppend := []*model.Field{}
	var newFieldGroup []FieldData
	exists := false
	if session.FieldGroup != nil {
		if err := json.Unmarshal([]byte(*session.FieldGroup), &newFieldGroup); err != nil {
			return e.Wrap(err, "error decoding session field group")
		}
	}
	for _, f := range fields {
		field := &model.Field{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || errors.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating field")
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
		return e.Wrap(err, "Error marshalling session field group")
	}
	fieldString := string(fieldBytes)

	if err := r.DB.Model(session).Updates(&model.Session{FieldGroup: &fieldString}).Error; errors.Is(err, gorm.ErrRecordNotFound) || err != nil {
		return e.Wrap(err, "Error updating session field group")
	}
	// We append to this session in the join table regardless.
	if err := r.DB.Model(session).Association("Fields").Append(fieldsToAppend); err != nil {
		return e.Wrap(err, "error updating fields")
	}
	return nil
}

func (r *Resolver) HandleErrorAndGroup(errorObj *model.ErrorObject, errorInput *model2.ErrorObjectInput, fields []*model.ErrorField, organizationID int) (*model.ErrorGroup, error) {
	frames := errorInput.StackTrace
	if frames != nil && frames[0] != nil && frames[0].Source != nil && strings.Contains(*frames[0].Source, "https://static.highlight.run/index.js") {
		errorObj.OrganizationID = 1
	}
	firstFrameBytes, err := json.Marshal(frames)
	if err != nil {
		return nil, e.Wrap(err, "Error marshalling first frame")
	}
	frameString := string(firstFrameBytes)

	errorGroup := &model.ErrorGroup{}

	// Query the DB for errors w/ 1) the same events string and 2) the same trace string.
	// If it doesn't exist, we create a new error group.
	if err := r.DB.Where(&model.ErrorGroup{
		OrganizationID: errorObj.OrganizationID,
		Event:          errorObj.Event,
		Type:           errorObj.Type,
	}).First(&errorGroup).Error; err != nil {
		newErrorGroup := &model.ErrorGroup{
			OrganizationID: errorObj.OrganizationID,
			Event:          errorObj.Event,
			StackTrace:     frameString,
			Type:           errorObj.Type,
			State:          modelInputs.ErrorStateOpen.String(),
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

	var newMetadataLog []ErrorMetaData
	if errorGroup.MetadataLog != nil {
		if err := json.Unmarshal([]byte(*errorGroup.MetadataLog), &newMetadataLog); err != nil {
			return nil, e.Wrap(err, "error decoding time log data")
		}
	}
	newMetadataLog = append(newMetadataLog, ErrorMetaData{
		Timestamp:  errorObj.CreatedAt,
		ErrorID:    errorObj.ID,
		SessionID:  errorObj.SessionID,
		OS:         errorObj.OS,
		Browser:    errorObj.Browser,
		VisitedURL: errorObj.URL,
	})

	logBytes, err := json.Marshal(newMetadataLog)
	if err != nil {
		return nil, e.Wrap(err, "Error marshalling metadata log")
	}
	logString := string(logBytes)

	var newMappedStackTraceString *string
	newFrameString := frameString
	mappedStackTrace, err := r.EnhanceStackTrace(errorInput.StackTrace, organizationID, errorObj.SessionID)
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

	if err := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{MetadataLog: &logString, StackTrace: newFrameString, MappedStackTrace: newMappedStackTraceString, Environments: environmentsString}).Error; err != nil {
		return nil, e.Wrap(err, "Error updating error group metadata log or environments")
	}

	err = r.AppendErrorFields(fields, errorGroup)
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
		if err := res.Error; err != nil || errors.Is(err, gorm.ErrRecordNotFound) {
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

func InitializeSessionImplementation(r *mutationResolver, ctx context.Context, organizationVerboseID string, enableStrictPrivacy bool, enableRecordingNetworkContents bool, clientVersion string, firstloadVersion string, clientConfig string, environment string, appVersion *string, fingerprint string) (*model.Session, error) {
	organizationID := model.FromVerboseID(organizationVerboseID)
	organization := &model.Organization{}
	if err := r.DB.Where(&model.Organization{Model: model.Model{ID: organizationID}}).First(&organization).Error; err != nil {
		return nil, e.Wrap(err, "org doesn't exist")
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
	userId := 5000 + rand.Intn(5000)
	var fingerprintInt int = 0
	if val, err := strconv.Atoi(fingerprint); err == nil {
		fingerprintInt = val
	}

	// determine if session is within billing quota
	withinBillingQuota := r.isOrgWithinBillingQuota(organization, n)

	session := &model.Session{
		UserID:                         userId,
		Fingerprint:                    fingerprintInt,
		OrganizationID:                 organizationID,
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
	}

	if err := r.DB.Create(session).Error; err != nil {
		return nil, e.Wrap(err, "error creating session")
	}

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
func (r *Resolver) EnhanceStackTrace(input []*model2.StackFrameInput, organizationId, sessionId int) ([]modelInputs.ErrorTrace, error) {
	if input == nil {
		return nil, e.New("stack trace input cannot be nil")
	}
	var mappedStackTrace []modelInputs.ErrorTrace
	for _, stackFrame := range input {
		if stackFrame == nil || (stackFrame.FileName == nil || stackFrame.LineNumber == nil || stackFrame.ColumnNumber == nil) {
			continue
		}
		mappedStackFrame, err := r.processStackFrame(organizationId, sessionId, *stackFrame)
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

func (r *Resolver) processStackFrame(organizationId, sessionId int, stackTrace model2.StackFrameInput) (*modelInputs.ErrorTrace, error) {
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
		err := e.Wrapf(err, "error parsing url: %v", stackTraceFileURL)
		return nil, err
	}
	stackTraceFilePath := u.Path
	if stackTraceFilePath[0:1] == "/" {
		stackTraceFilePath = stackTraceFilePath[1:]
	}

	// get version from session
	var version *string
	if err := r.DB.Model(&model.Session{}).Where(&model.Session{Model: model.Model{ID: sessionId}}).Select("app_version").Scan(&version).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, e.Wrap(err, "error getting app version from session")
		}
	}

	// try to get file from s3
	minifiedFileBytes, err := r.StorageClient.ReadSourceMapFileFromS3(organizationId, version, stackTraceFilePath)
	if err != nil {
		// if not in s3, get from url and put in s3
		minifiedFileBytes, err = fetch.fetchFile(stackTraceFileURL)
		if err != nil {
			// fallback if we can't get the source file at all
			err := e.Wrapf(err, "error fetching file: %v", stackTraceFileURL)
			return nil, err
		}
		_, err = r.StorageClient.PushSourceMapFileToS3(organizationId, version, stackTraceFilePath, minifiedFileBytes)
		if err != nil {
			log.Error(e.Wrapf(err, "error pushing file to s3: %v", stackTraceFilePath))
		}
	}
	if len(minifiedFileBytes) > 5000000 {
		err := e.Errorf("minified source file over 5mb: %v, size: %v", stackTraceFileURL, len(minifiedFileBytes))
		return nil, err
	}
	bodyString := string(minifiedFileBytes)
	bodyLines := strings.Split(strings.ReplaceAll(bodyString, "\rn", "\n"), "\n")
	if len(bodyLines) < 1 {
		err := e.Errorf("body lines empty: %v", stackTraceFilePath)
		return nil, err
	}
	lastLine := bodyLines[len(bodyLines)-1]

	// extract sourceMappingURL file name from slice
	var sourceMapFileName string
	sourceMapIndex := strings.LastIndex(lastLine, "sourceMappingURL=")
	if sourceMapIndex == -1 {
		err := e.Errorf("file does not contain source map url: %v", stackTraceFileURL)
		return nil, err
	}
	sourceMapFileName = lastLine[sourceMapIndex+len("sourceMappingURL="):]

	// construct sourcemap url from searched file
	sourceMapURL := (stackTraceFileURL)[:stackFileNameIndex] + sourceMapFileName
	// get path from url
	u2, err := url.Parse(sourceMapURL)
	if err != nil {
		err := e.Wrapf(err, "error parsing url: %v", sourceMapURL)
		return nil, err
	}
	sourceMapFilePath := u2.Path
	if sourceMapFilePath[0:1] == "/" {
		sourceMapFilePath = sourceMapFilePath[1:]
	}

	// fetch source map file
	// try to get file from s3
	sourceMapFileBytes, err := r.StorageClient.ReadSourceMapFileFromS3(organizationId, version, sourceMapFilePath)
	if err != nil {
		// if not in s3, get from url and put in s3
		sourceMapFileBytes, err = fetch.fetchFile(sourceMapURL)
		if err != nil {
			// fallback if we can't get the source file at all
			err := e.Wrapf(err, "error fetching source map file: %v", sourceMapURL)
			return nil, err
		}
		_, err = r.StorageClient.PushSourceMapFileToS3(organizationId, version, sourceMapFilePath, sourceMapFileBytes)
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

func (r *Resolver) isOrgWithinBillingQuota(organization *model.Organization, now time.Time) bool {
	if organization.TrialEndDate != nil && organization.TrialEndDate.After(now) {
		return true
	}
	var (
		withinBillingQuota bool
		quota              int
	)
	if organization.MonthlySessionLimit != nil && *organization.MonthlySessionLimit > 0 {
		quota = *organization.MonthlySessionLimit
	} else {
		stripePriceID := ""
		if organization.StripePriceID != nil {
			stripePriceID = *organization.StripePriceID
		}
		stripePlan := pricing.FromPriceID(stripePriceID)
		quota = pricing.TypeToQuota(stripePlan)
	}

	var monthToDateSessionCount int64
	if err := r.DB.
		Model(&model.DailySessionCount{}).
		Where(&model.DailySessionCount{OrganizationID: organization.ID}).
		Where("date > ?", time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)).
		Select("SUM(count) as monthToDateSessionCount").
		Scan(&monthToDateSessionCount).Error; err != nil {
		// The record doesn't exist for new organizations since the record gets created in the worker.
		monthToDateSessionCount = 0
		log.Warn(fmt.Sprintf("Couldn't find DailySessionCount for %d", organization.ID))
	}
	withinBillingQuota = int64(quota) > monthToDateSessionCount
	return withinBillingQuota
}
