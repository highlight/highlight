package graph

import (
	"context"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"io/ioutil"
	"net/http"
	"net/mail"
	"net/url"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/timeseries"

	"github.com/PaesslerAG/jsonpath"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/samber/lo"

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
)

// This file will not be regenerated automatically.
//
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	AlertWorkerPool *workerpool.WorkerPool
	DB              *gorm.DB
	TDB             timeseries.DB
	ProducerQueue   *kafka_queue.Queue
	MailClient      *sendgrid.Client
	StorageClient   *storage.StorageClient
	OpenSearch      *opensearch.Client
	Redis           *redis.Client
}

type Location struct {
	City      string      `json:"city"`
	Postal    string      `json:"postal"`
	Latitude  interface{} `json:"latitude"`
	Longitude interface{} `json:"longitude"`
	State     string      `json:"state"`
	Country   string      `json:"country_name"`
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

type Request struct {
	ID      string            `json:"id"`
	URL     string            `json:"url"`
	Method  string            `json:"verb"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
}

type Response struct {
	Status  float64           `json:"status"`
	Size    float64           `json:"size"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
}

type RequestResponsePairs struct {
	Request    Request  `json:"request"`
	Response   Response `json:"response"`
	URLBlocked bool     `json:"urlBlocked"`
}

type NetworkResource struct {
	StartTime            float64              `json:"startTime"`
	ResponseEnd          float64              `json:"responseEnd"`
	InitiatorType        string               `json:"initiatorType"`
	TransferSize         float64              `json:"transferSize"`
	EncodedBodySize      float64              `json:"encodedBodySize"`
	Name                 string               `json:"name"`
	RequestResponsePairs RequestResponsePairs `json:"requestResponsePairs"`
}

const ERROR_EVENT_MAX_LENGTH = 10000

const SESSION_FIELD_MAX_LENGTH = 2000

// Change to AppendProperties(sessionId,properties,type)
func (r *Resolver) AppendProperties(ctx context.Context, sessionID int, properties map[string]string, propType Property) error {
	outerSpan, outerCtx := tracer.StartSpanFromContext(ctx, "public-graph.AppendProperties",
		tracer.ResourceName("go.sessions.AppendProperties"), tracer.Tag("sessionID", sessionID))
	defer outerSpan.Finish()

	loadSessionSpan, _ := tracer.StartSpanFromContext(outerCtx, "public-graph.AppendProperties",
		tracer.ResourceName("go.sessions.AppendProperties.loadSessions"), tracer.Tag("sessionID", sessionID))
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session)
	if err := res.Error; err != nil {
		return e.Wrapf(err, "error getting session(id=%d) in append properties(type=%s)", sessionID, propType)
	}
	loadSessionSpan.Finish()

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

	if len(modelFields) > 0 {
		err := r.AppendFields(outerCtx, modelFields, session)
		if err != nil {
			return e.Wrap(err, "error appending fields")
		}
	}

	r.AlertWorkerPool.SubmitRecover(func() {
		alertWorkerSpan, _ := tracer.StartSpanFromContext(outerCtx, "public-graph.AppendProperties",
			tracer.ResourceName("go.sessions.AppendProperties.alertWorker"), tracer.Tag("sessionID", sessionID))
		defer alertWorkerSpan.Finish()
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

func (r *Resolver) AppendFields(ctx context.Context, fields []*model.Field, session *model.Session) error {
	outerSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.AppendFields",
		tracer.ResourceName("go.sessions.AppendProperties"), tracer.Tag("sessionID", session.ID))
	defer outerSpan.Finish()

	if err := r.DB.
		Clauses(clause.Returning{}, clause.OnConflict{
			Columns:   []clause.Column{{Name: "project_id"}, {Name: "type"}, {Name: "name"}, {Name: "value"}},
			DoNothing: true}).
		Create(&fields).Error; err != nil {
		return e.Wrap(err, "error inserting new fields")
	}

	// New fields have an ID after the insert above
	newFields := lo.Filter(fields, func(field *model.Field, _ int) bool {
		return field.ID != 0
	})

	for _, field := range newFields {
		if err := r.OpenSearch.Index(opensearch.IndexFields, field.ID, nil, field); err != nil {
			return e.Wrap(err, "error indexing new field")
		}
	}

	var allFields []*model.Field
	inClause := [][]interface{}{}
	for _, f := range fields {
		inClause = append(inClause, []interface{}{f.ProjectID, f.Type, f.Name, f.Value})
	}
	if err := r.DB.Where("(project_id, type, name, value) IN ?", inClause).
		Find(&allFields).Error; err != nil {
		return e.Wrap(err, "error retrieving all fields")
	}

	openSearchFields := make([]interface{}, len(allFields))
	for i, field := range allFields {
		openSearchFields[i] = opensearch.OpenSearchField{
			Field:    field,
			Key:      field.Type + "_" + field.Name,
			KeyValue: field.Type + "_" + field.Name + "_" + field.Value,
		}
	}
	if err := r.OpenSearch.AppendToField(opensearch.IndexSessions, session.ID, "fields", openSearchFields); err != nil {
		return e.Wrap(err, "error appending session fields")
	}

	sort.Slice(allFields, func(i, j int) bool {
		return allFields[i].ID < allFields[j].ID
	})

	var entries []struct {
		SessionID int
		FieldID   int
	}
	for _, f := range allFields {
		entries = append(entries, struct {
			SessionID int
			FieldID   int
		}{
			SessionID: session.ID,
			FieldID:   f.ID,
		})
	}
	// Associate the fields with this session.
	// Do this manually to avoid updating the session `updated_at` column since this operation
	// is typically done as part of other steps that update the session `updated_at`.
	// Constantly writing to `updated_at` is a source of DB contention for session updates.
	if err := r.DB.Table("session_fields").Clauses(clause.OnConflict{
		DoNothing: true,
	}).Create(entries).Error; err != nil {
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
	if err := r.DB.Model(&model.Session{}).
		Where("id = ?", errorObj.SessionID).
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
	jsonResults := []string{}
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
		} else if fingerprint.Type == model.Fingerprint.JsonResult {
			jsonResults = append(jsonResults, fingerprint.Value)
		}
	}

	// Reversing the json results so that ordinality can be used as score
	jsonResultsReversed := lo.Reverse(jsonResults)
	jsonBytes, err := json.Marshal(jsonResultsReversed)
	if err != nil {
		return nil, e.Wrap(err, "error marshalling json results")
	}
	jsonString := string(jsonBytes)

	result := struct {
		Id  int
		Sum int
	}{}

	// temporarily disable error group matching
	// for Gorillamind
	// because their huge traceback
	// slows this process down too much
	if projectID == 356 {
		return nil, nil
	}
	if err := r.DB.Raw(`
		WITH json_results AS (
			SELECT CAST(value as VARCHAR), (2 ^ ordinality) * 1000 as score
			FROM json_array_elements_text(@jsonString) with ordinality
		)
	    SELECT id, sum(score) FROM (
			SELECT id, 100 AS score, 0
			FROM error_groups
			WHERE event = @event
			AND id IS NOT NULL
			AND project_id = @projectID
			UNION ALL
			(SELECT DISTINCT ef.error_group_id, jr.score, 0
			FROM error_fingerprints ef
			INNER JOIN json_results jr
			on ef.value = jr.value
			WHERE
				(ef.type = 'JSON'
				AND ef.project_id = @projectID
				AND ef.error_group_id IS NOT NULL))
			UNION ALL
			(SELECT DISTINCT error_group_id, 10 AS score, 0
			FROM error_fingerprints
			WHERE
				((type = 'META'
				AND value = @firstMeta
				AND index = 0)
				OR (type = 'CODE'
				AND value = @firstCode
				AND index = 0))
				AND project_id = @projectID
				AND error_group_id IS NOT NULL)
			UNION ALL
			(SELECT DISTINCT error_group_id, 1 AS score, index
			FROM error_fingerprints
			WHERE
				((type = 'META'
				AND value in @restMeta
				AND index > 0 and index <= 4)
				OR (type = 'CODE'
				AND value in @restCode
				AND index > 0 and index <= 4))
				AND project_id = @projectID
				AND error_group_id IS NOT NULL)
		) a
		GROUP BY id
		ORDER BY sum DESC, id DESC
		LIMIT 1`,
		map[string]interface{}{
			"jsonString": jsonString,
			"event":      event,
			"projectID":  projectID,
			"firstMeta":  firstMeta,
			"firstCode":  firstCode,
			"restMeta":   restMeta,
			"restCode":   restCode}).
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

	if projectID == 356 {
		if errorObj.Event == `["\"ReferenceError: Can't find variable: widgetContainerAttribute\""]` ||
			errorObj.Event == `"ReferenceError: Can't find variable: widgetContainerAttribute"` ||
			errorObj.Event == `"InvalidStateError: XMLHttpRequest.responseText getter: responseText is only available if responseType is '' or 'text'."` ||
			errorObj.Event == `["\"InvalidStateError: XMLHttpRequest.responseText getter: responseText is only available if responseType is '' or 'text'.\""]` {
			return nil, e.New("Filtering out noisy Gorilla Mind error")
		}
	}
	if projectID == 765 {
		if errorObj.Event == `"Uncaught Error: PollingBlockTracker - encountered an error while attempting to update latest block:\nundefined"` ||
			errorObj.Event == `["\"Uncaught Error: PollingBlockTracker - encountered an error while attempting to update latest block:\\nundefined\""]` {
			return nil, e.New("Filtering out noisy MintParty error")
		}
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

	// Try unmarshalling the Event to JSON.
	// If this works, create an error fingerprint for each of the project's JSON paths.
	jsonStrings := []string{}
	if err := json.Unmarshal([]byte(errorObj.Event), &jsonStrings); err == nil && len(jsonStrings) == 1 {
		errorAsJson := interface{}(nil)
		if err := json.Unmarshal([]byte(jsonStrings[0]), &errorAsJson); err == nil {
			var project model.Project
			if err := r.DB.Where("id = ?", projectID).First(&project).Error; err != nil {
				return nil, e.Wrap(err, "error querying project")
			}

			for _, path := range project.ErrorJsonPaths {
				value, err := jsonpath.Get(path, errorAsJson)
				if err == nil {
					marshalled, err := json.Marshal(value)
					if err == nil {
						jsonResult := model.ErrorFingerprint{
							ProjectID: projectID,
							Type:      model.Fingerprint.JsonResult,
							Value:     path + "=" + string(marshalled),
						}
						fingerprints = append(fingerprints, &jsonResult)
					}
				}
			}
		}
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
		Url:         errorObj.URL,
		Os:          errorObj.OS,
		Browser:     errorObj.Browser,
		Timestamp:   errorObj.Timestamp,
		Environment: errorObj.Environment,
	}
	if err := r.OpenSearch.Index(opensearch.IndexErrorsCombined, errorObj.ID, pointy.Int(errorGroup.ID), opensearchErrorObject); err != nil {
		return nil, e.Wrap(err, "error indexing error group (combined index) in opensearch")
	}

	environmentsString := r.getIncrementedEnvironmentCount(errorGroup, errorObj)

	if err := r.AppendErrorFields(fields, errorGroup); err != nil {
		return nil, e.Wrap(err, "error appending error fields")
	}

	if err := r.DB.Transaction(func(tx *gorm.DB) error {
		for _, f := range fingerprints {
			f.ErrorGroupId = errorGroup.ID
		}
		if len(fingerprints) > 0 {
			if err := r.DB.Model(&model.ErrorFingerprint{}).Create(fingerprints).Error; err != nil {
				return e.Wrap(err, "error appending new fingerprints")
			}
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

	var entries []struct {
		ErrorGroupID int
		ErrorFieldID int
	}
	for _, f := range fieldsToAppend {
		entries = append(entries, struct {
			ErrorGroupID int
			ErrorFieldID int
		}{
			ErrorGroupID: errorGroup.ID,
			ErrorFieldID: f.ID,
		})
	}

	if len(entries) > 0 {
		if err := r.DB.Table("error_group_fields").Clauses(clause.OnConflict{
			DoNothing: true,
		}).Create(entries).Error; err != nil {
			return e.Wrap(err, "error updating fields")
		}
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

func (r *Resolver) InitializeSessionImpl(ctx context.Context, input *kafka_queue.InitializeSessionArgs) (*model.Session, error) {
	outerSpan, outerCtx := tracer.StartSpanFromContext(ctx, "public-graph.InitializeSessionImpl",
		tracer.ResourceName("go.sessions.InitializeSessionImpl"))
	defer outerSpan.Finish()

	projectID, err := model.FromVerboseID(input.ProjectVerboseID)
	if err != nil {
		log.Errorf("An unsupported verboseID was used: %s, %s", input.ProjectVerboseID, input.ClientConfig)
	}
	project := &model.Project{}
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "project doesn't exist")
	}
	workspace, err := r.getWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving workspace")
	}

	fpHash := fnv.New32a()
	defer fpHash.Reset()
	if _, err := fpHash.Write([]byte(input.Fingerprint)); err != nil {
		log.Errorf("failed to hash fingerprint to int: %s", err)
	}

	deviceDetails := GetDeviceDetails(input.UserAgent)
	n := time.Now()
	session := &model.Session{
		SecureID: input.SessionSecureID,
		Model: model.Model{
			CreatedAt: input.CreatedAt,
		},
		ProjectID:                      projectID,
		Fingerprint:                    int(fpHash.Sum32()),
		OSName:                         deviceDetails.OSName,
		OSVersion:                      deviceDetails.OSVersion,
		BrowserName:                    deviceDetails.BrowserName,
		BrowserVersion:                 deviceDetails.BrowserVersion,
		Language:                       input.AcceptLanguage,
		WithinBillingQuota:             &model.T,
		Processed:                      &model.F,
		Viewed:                         &model.F,
		PayloadUpdatedAt:               &n,
		EnableStrictPrivacy:            &input.EnableStrictPrivacy,
		EnableRecordingNetworkContents: &input.EnableRecordingNetworkContents,
		FirstloadVersion:               input.FirstloadVersion,
		ClientVersion:                  input.ClientVersion,
		ClientConfig:                   &input.ClientConfig,
		Environment:                    input.Environment,
		AppVersion:                     input.AppVersion,
		VerboseID:                      input.ProjectVerboseID,
		Fields:                         []*model.Field{},
		LastUserInteractionTime:        time.Now(),
		ViewedByAdmins:                 []model.Admin{},
		ClientID:                       input.ClientID,
		Excluded:                       &model.T, // A session is excluded by default until it receives events
	}

	// Get the user's ip, get geolocation data
	location := &Location{
		City:      "",
		Postal:    "",
		Latitude:  0.0,
		Longitude: 0.0,
		State:     "",
		Country:   "",
	}
	fetchedLocation, err := GetLocationFromIP(input.IP)
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
	session.Country = location.Country
	session.Latitude = location.Latitude.(float64)
	session.Longitude = location.Longitude.(float64)
	session.WithinBillingQuota = &withinBillingQuota

	if err := r.DB.Create(session).Error; err != nil {
		if input.SessionSecureID == "" || !strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			log.Errorf("error creating session: %s", err)
			return nil, e.Wrap(err, "error creating session")
		}
		sessionObj := &model.Session{}
		if fetchSessionErr := r.DB.Where(&model.Session{SecureID: input.SessionSecureID}).First(&sessionObj).Error; fetchSessionErr != nil {
			log.Errorf("error creating session, couldn't fetch session duplicate: %s", err)
			return nil, e.Wrap(fetchSessionErr, "error creating session, couldn't fetch session duplicate")
		}
		if projectID != sessionObj.ProjectID {
			// ensure the fetched session is for this same project
			log.Errorf("error creating session for secure id %s, fetched a session for another project: %d", input.SessionSecureID, sessionObj.ProjectID)
			return nil, e.Wrap(err, "error creating session, fetched session for another project.")
		}
		// otherwise, it's a retry for a session that already exists. return the existing session.
		outerSpan.SetTag("duplicate", true)
		return sessionObj, nil
	}
	outerSpan.SetTag("duplicate", false)

	log.WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("initialized session %d: %s", session.ID, session.Identifier)

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
		"country":         session.Country,
	}
	if err := r.AppendProperties(outerCtx, session.ID, sessionProperties, PropertyType.SESSION); err != nil {
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

func (r *Resolver) MarkBackendSetupImpl(sessionSecureID string, projectID int) error {
	if projectID == 0 {
		session := &model.Session{}
		if err := r.DB.Model(&session).Where(&model.Session{SecureID: sessionSecureID}).First(&session).Error; err != nil {
			log.Error(e.Wrapf(err, "no session found for mark backend setup: %s", sessionSecureID))
			return err
		}
		projectID = session.ProjectID
	}
	var backendSetupCount int64
	if err := r.DB.Model(&model.Project{}).Where("id = ? AND backend_setup=true", projectID).Count(&backendSetupCount).Error; err != nil {
		return e.Wrap(err, "error querying backend_setup flag")
	}
	if backendSetupCount < 1 {
		if err := r.DB.Model(&model.Project{}).Where("id = ?", projectID).Updates(&model.Project{BackendSetup: &model.T}).Error; err != nil {
			return e.Wrap(err, "error updating backend_setup flag")
		}
	}
	return nil
}

func (r *Resolver) AddSessionFeedbackImpl(ctx context.Context, input *kafka_queue.AddSessionFeedbackArgs) error {
	metadata := make(map[string]interface{})

	if input.UserName != nil {
		metadata["name"] = *input.UserName
	}
	if input.UserEmail != nil {
		metadata["email"] = *input.UserEmail
	}
	metadata["timestamp"] = input.Timestamp

	session := &model.Session{}
	if err := r.DB.Select("project_id", "environment", "id", "secure_id").Where(&model.Session{SecureID: input.SecureID}).First(&session).Error; err != nil {
		return e.Wrap(err, "error querying session by sessionSecureID for adding session feedback")
	}

	feedbackComment := &model.SessionComment{SessionId: session.ID, Text: input.Verbatim, Metadata: metadata, Type: model.SessionCommentTypes.FEEDBACK, ProjectID: session.ProjectID, SessionSecureId: session.SecureID}
	if err := r.DB.Create(feedbackComment).Error; err != nil {
		return e.Wrap(err, "error creating session feedback")
	}

	var sessionFeedbackAlert model.SessionAlert
	if err := r.DB.Raw(`
			SELECT *
			FROM session_alerts
			WHERE project_id = ?
				AND type = ?
				AND disabled = false
		`, session.ProjectID, model.AlertType.SESSION_FEEDBACK).Scan(&sessionFeedbackAlert).Error; err != nil {
		log.WithError(err).
			WithFields(log.Fields{"project_id": session.ProjectID, "secure_session_id": input.SecureID, "comment_id": feedbackComment.ID}).
			Error(e.Wrapf(err, "error fetching %s alert", model.AlertType.SESSION_FEEDBACK))
		return err
	}

	excludedEnvironments, err := sessionFeedbackAlert.GetExcludedEnvironments()
	if err != nil {
		log.Error(e.Wrapf(err, "error getting excluded environments from %s alert", model.AlertType.SESSION_FEEDBACK))
		return err
	}
	for _, env := range excludedEnvironments {
		if env != nil && *env == session.Environment {
			return nil
		}
	}

	commentsCount := int64(-1)
	if sessionFeedbackAlert.ThresholdWindow == nil {
		t := 30
		sessionFeedbackAlert.ThresholdWindow = &t
	}
	if err := r.DB.Raw(`
			SELECT COUNT(*)
			FROM session_comments
			WHERE project_id = ?
				AND type = ?
				AND created_at > ?
		`, session.ProjectID, model.SessionCommentTypes.FEEDBACK,
		time.Now().Add(-time.Duration(*sessionFeedbackAlert.ThresholdWindow)*time.Minute)).
		Scan(&commentsCount).Error; err != nil {
		log.WithError(err).
			WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "session_secure_id": session.SecureID, "comment_id": feedbackComment.ID}).
			Error(e.Wrapf(err, "error fetching %s alert count", model.AlertType.SESSION_FEEDBACK))
		return err
	}
	if commentsCount+1 < int64(sessionFeedbackAlert.CountThreshold) {
		return nil
	}

	var project model.Project
	if err := r.DB.Raw(`
			SELECT *
			FROM projects
			WHERE id = ?
		`, session.ProjectID).Scan(&project).Error; err != nil {
		log.WithError(err).
			WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "session_secure_id": session.SecureID, "comment_id": feedbackComment.ID}).
			Error(e.Wrapf(err, "error fetching %s alert", model.AlertType.SESSION_FEEDBACK))
		return err
	}

	identifier := "Someone"
	if input.UserName != nil {
		identifier = *input.UserName
	} else if input.UserEmail != nil {
		identifier = *input.UserEmail
	}

	workspace, err := r.getWorkspace(project.WorkspaceID)
	if err != nil {
		log.WithError(err).
			WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "comment_id": feedbackComment.ID}).
			Error(e.Wrap(err, "error fetching workspace"))
	}

	sessionFeedbackAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{
		Workspace:       workspace,
		SessionSecureID: session.SecureID,
		UserIdentifier:  identifier,
		CommentID:       &feedbackComment.ID,
		CommentText:     feedbackComment.Text,
	})
	return nil
}
func (r *Resolver) IdentifySessionImpl(ctx context.Context, sessionID int, userIdentifier string, userObject interface{}, backfill bool) error {
	outerSpan, outerCtx := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		tracer.ResourceName("go.sessions.IdentifySessionImpl"), tracer.Tag("sessionID", sessionID))
	defer outerSpan.Finish()

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

	getSessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		tracer.ResourceName("go.sessions.IdentifySessionImpl.getSession"), tracer.Tag("sessionID", sessionID))
	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return e.Wrap(err, "[IdentifySession] error querying session by sessionID")
	}
	getSessionSpan.Finish()

	setUserPropsSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		tracer.ResourceName("go.sessions.IdentifySessionImpl.SetUserProperties"), tracer.Tag("sessionID", sessionID))
	userObj := make(map[string]string)
	// get existing session user properties in case of multiple identify calls
	if existingUserProps, err := session.GetUserProperties(); err == nil {
		for k, v := range existingUserProps {
			userObj[k] = v
		}
	}
	// update overlapping new properties
	for k, v := range obj {
		if v != "" {
			userProperties[k] = fmt.Sprintf("%v", v)
			userObj[k] = fmt.Sprintf("%v", v)
		}
	}
	// set user properties to session in db
	if err := session.SetUserProperties(userObj); err != nil {
		return e.Wrapf(err, "[IdentifySession] [project_id: %d] error appending user properties to session object {id: %d}", session.ProjectID, sessionID)
	}
	if err := r.AppendProperties(outerCtx, sessionID, userProperties, PropertyType.USER); err != nil {
		log.Error(e.Wrapf(err, "[IdentifySession] error adding set of identify properties to db: session: %d", sessionID))
	}
	setUserPropsSpan.Finish()

	previousSessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		tracer.ResourceName("go.sessions.IdentifySessionImpl.PreviousSession"), tracer.Tag("sessionID", sessionID))
	// Check if there is a session created by this user.
	firstTime := &model.F
	if err := r.DB.Where(&model.Session{Identifier: userIdentifier, ProjectID: session.ProjectID}).Take(&model.Session{}).Error; err != nil {
		if e.Is(err, gorm.ErrRecordNotFound) {
			firstTime = &model.T
		} else {
			return e.Wrap(err, "[IdentifySession] error querying session with past identifier")
		}
	}
	previousSessionSpan.Finish()

	session.FirstTime = firstTime
	if userIdentifier != "" {
		session.Identifier = userIdentifier
	}

	if !backfill {
		session.Identified = true
	}

	openSearchUpdateSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		tracer.ResourceName("go.sessions.IdentifySessionImpl.OpenSearchUpdate"), tracer.Tag("sessionID", sessionID))
	openSearchProperties := map[string]interface{}{
		"user_properties": session.UserProperties,
		"first_time":      session.FirstTime,
		"identified":      session.Identified,
	}
	if session.Identifier != "" {
		openSearchProperties["identifier"] = session.Identifier
	}
	if err := r.OpenSearch.Update(opensearch.IndexSessions, sessionID, openSearchProperties); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
	}
	openSearchUpdateSpan.Finish()

	if err := r.DB.Save(&session).Error; err != nil {
		return e.Wrap(err, "[IdentifySession] failed to update session")
	}

	if !backfill && len(session.ClientID) > 0 {
		// Find past unidentified sessions and identify them.
		backfillSessions := []*model.Session{}
		getToBackfillSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
			tracer.ResourceName("go.sessions.IdentifySessionImpl.GetToBackfill"), tracer.Tag("sessionID", sessionID))
		if err := r.DB.Where(&model.Session{ClientID: session.ClientID, ProjectID: session.ProjectID}).
			Where("(identifier IS null OR identifier = '') AND (identified IS null OR identified = false)").
			Not(&model.Session{Model: model.Model{ID: sessionID}}).Find(&backfillSessions).Error; err != nil {
			return e.Wrap(err, "[IdentifySession] error querying backfillSessions by clientID")
		}
		getToBackfillSpan.Finish()

		doBackfillSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
			tracer.ResourceName("go.sessions.IdentifySessionImpl.DoBackfill"), tracer.Tag("sessionID", sessionID))
		for _, session := range backfillSessions {
			if err := r.IdentifySessionImpl(ctx, session.ID, userIdentifier, userObject, true); err != nil {
				return e.Wrapf(err, "[IdentifySession] [client_id: %v] error identifying session {id: %d}", session.ClientID, session.ID)
			}
		}
		doBackfillSpan.Finish()
	}

	log.WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("identified session: %s", session.Identifier)

	go func() {
		defer util.Recover()
		// if is not new user, return
		if !*firstTime {
			return
		}
		// Sleep for 25 seconds, then query from the DB. If this session is identified, we
		// want to wait for the H.identify call to be able to create a better Slack message.
		// If an ECS task is being replaced, there's a 30 second window to do cleanup work.
		// A 25 second delay here gives this 5 seconds to complete in case this session
		// is created right before the task is replaced.
		time.Sleep(25 * time.Second)
		// Sending New User Alert
		var sessionAlerts []*model.SessionAlert
		if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type=?", model.AlertType.NEW_USER).Find(&sessionAlerts).Error; err != nil {
			log.Error(e.Wrapf(err, "[project_id: %d] error fetching new user alert", session.ProjectID))
			return
		}

		refetchedSession := &model.Session{}
		if err := r.DB.Where(&model.Session{Model: model.Model{ID: session.ID}}).First(&refetchedSession).Error; err != nil {
			retErr := e.Wrapf(err, "error reading from session %v", session.ID)
			log.Error(retErr)
			return
		}
		// get produced user properties from session
		// these are refetched after the 25 sec sleep to allow multiple identify calls to be
		// merged into one alert.
		userProperties, err := refetchedSession.GetUserProperties()
		if err != nil {
			log.Error(e.Wrapf(err, "[project_id: %d] error getting user properties from new user alert", refetchedSession.ProjectID))
			return
		}

		for _, sessionAlert := range sessionAlerts {
			// check if session was produced from an excluded environment
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from new user alert", refetchedSession.ProjectID))
				return
			}
			isExcludedEnvironment := false
			for _, env := range excludedEnvironments {
				if env != nil && *env == refetchedSession.Environment {
					isExcludedEnvironment = true
					break
				}
			}
			if isExcludedEnvironment {
				return
			}

			project := &model.Project{}
			if err := r.DB.Where(&model.Project{Model: model.Model{ID: refetchedSession.ProjectID}}).First(&project).Error; err != nil {
				log.Error(e.Wrap(err, "error querying project"))
				return
			}

			workspace, err := r.getWorkspace(project.WorkspaceID)
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error querying workspace", refetchedSession.ProjectID))
				return
			}

			sessionAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: refetchedSession.SecureID, UserIdentifier: refetchedSession.Identifier, UserProperties: userProperties, UserObject: refetchedSession.UserObject})
		}
	}()
	return nil
}

func (r *Resolver) AddSessionPropertiesImpl(ctx context.Context, sessionID int, propertiesObject interface{}) error {
	outerSpan, outerCtx := tracer.StartSpanFromContext(ctx, "public-graph.AddSessionPropertiesImpl",
		tracer.ResourceName("go.sessions.AddSessionPropertiesImpl"))
	defer outerSpan.Finish()

	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return e.New("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err := r.AppendProperties(outerCtx, sessionID, fields, PropertyType.SESSION)
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
		err := r.ProducerQueue.Submit(&kafka_queue.Message{
			Type: kafka_queue.PushMetrics,
			PushMetrics: &kafka_queue.PushMetricsArgs{
				SecureID: secureID,
				Metrics:  metrics,
			}}, secureID)
		if err != nil {
			log.Error(err)
		}
	}

	return len(metrics), nil
}

func (r *Resolver) AddLegacyMetric(ctx context.Context, sessionID int, name string, value float64) (int, error) {
	session := &model.Session{}
	if err := r.DB.Model(&model.Session{}).Where("id = ?", sessionID).First(&session).Error; err != nil {
		return -1, e.Wrapf(err, "error querying device metric session")
	}
	return r.SubmitMetricsMessage(ctx, []*customModels.MetricInput{{
		SessionSecureID: session.SecureID,
		Name:            name,
		Value:           value,
		Timestamp:       time.Now(),
	}})
}

func (r *Resolver) PushMetricsImpl(_ context.Context, sessionSecureID string, sessionID int, projectID int, metrics []*customModels.MetricInput) error {
	if sessionID == 0 || projectID == 0 {
		session := &model.Session{}
		if err := r.DB.Model(&session).Where(&model.Session{SecureID: sessionSecureID}).First(&session).Error; err != nil {
			log.Error(e.Wrapf(err, "no session found for push metrics: %s", sessionSecureID))
			return err
		}
		sessionID = session.ID
		projectID = session.ProjectID
	}
	metricsByGroup := make(map[string][]*customModels.MetricInput)
	for _, m := range metrics {
		group := ""
		if m.Group != nil {
			group = *m.Group
		}
		if _, ok := metricsByGroup[group]; !ok {
			metricsByGroup[group] = []*customModels.MetricInput{}
		}
		metricsByGroup[group] = append(metricsByGroup[group], m)
	}
	var points []timeseries.Point
	for groupName, metricInputs := range metricsByGroup {
		mg := &model.MetricGroup{
			GroupName: groupName,
			SessionID: sessionID,
			ProjectID: projectID,
		}
		tx := r.DB.Where(&model.MetricGroup{
			GroupName: groupName,
			SessionID: sessionID,
		}).Clauses(clause.Returning{}, clause.OnConflict{
			OnConstraint: model.METRIC_GROUPS_NAME_SESSION_UNIQ,
			DoNothing:    true,
		}).Create(&mg)
		if err := tx.Error; err != nil {
			return err
		}
		if tx.RowsAffected == 0 {
			if err := r.DB.Where(&model.MetricGroup{
				GroupName: groupName,
				SessionID: sessionID,
			}).First(&mg).Error; err != nil {
				return err
			}
		}
		var newMetrics []*model.Metric
		firstTime := time.Time{}
		tags := map[string]string{
			"project_id": strconv.Itoa(projectID),
			"session_id": strconv.Itoa(sessionID),
			"group_name": groupName,
		}
		fields := map[string]interface{}{}
		for _, m := range metricInputs {
			category := ""
			if m.Category != nil {
				category = *m.Category
			}
			newMetrics = append(newMetrics, &model.Metric{
				MetricGroupID: mg.ID,
				Name:          m.Name,
				Value:         m.Value,
				Category:      category,
				CreatedAt:     m.Timestamp,
			})
			if m.Timestamp.After(firstTime) {
				firstTime = m.Timestamp
			}
			tags[m.Name] = category
			fields[m.Name] = m.Value
		}
		if err := r.DB.Create(&newMetrics).Error; err != nil {
			return err
		}
		points = append(points, timeseries.Point{
			Measurement: timeseries.Metrics,
			Time:        firstTime,
			Tags:        tags,
			Fields:      fields,
		})
	}
	r.TDB.Write(strconv.Itoa(projectID), points)
	return nil
}

func extractErrorFields(sessionObj *model.Session, errorToProcess *model.ErrorObject) []*model.ErrorField {
	projectID := sessionObj.ProjectID

	errorFields := []*model.ErrorField{}
	errorFields = append(errorFields, &model.ErrorField{ProjectID: projectID, Name: "browser", Value: sessionObj.BrowserName})
	errorFields = append(errorFields, &model.ErrorField{ProjectID: projectID, Name: "os_name", Value: sessionObj.OSName})
	errorFields = append(errorFields, &model.ErrorField{ProjectID: projectID, Name: "visited_url", Value: errorToProcess.URL})
	errorFields = append(errorFields, &model.ErrorField{ProjectID: projectID, Name: "event", Value: errorToProcess.Event})
	errorFields = append(errorFields, &model.ErrorField{ProjectID: projectID, Name: "environment", Value: errorToProcess.Environment})

	return errorFields
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

		group, err := r.HandleErrorAndGroup(errorToInsert, v.StackTrace, nil, extractErrorFields(sessionObj, errorToInsert), projectID)
		if err != nil {
			log.Error(e.Wrap(err, "Error updating error group"))
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

// Deprecated, left for backward compatibility with older client versions. Use AddTrackProperties instead
func (r *Resolver) AddTrackPropertiesImpl(ctx context.Context, sessionID int, propertiesObject interface{}) error {
	outerSpan, outerCtx := tracer.StartSpanFromContext(ctx, "public-graph.AddTrackPropertiesImpl",
		tracer.ResourceName("go.sessions.AddTrackPropertiesImpl"))
	defer outerSpan.Finish()

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
	err := r.AppendProperties(outerCtx, sessionID, fields, PropertyType.TRACK)
	if err != nil {
		return e.Wrap(err, "error adding set of properties to db")
	}
	return nil
}

func (r *Resolver) AddTrackProperties(ctx context.Context, sessionID int, events *parse.ReplayEvents) error {
	outerSpan, outerCtx := tracer.StartSpanFromContext(ctx, "public-graph.AddTrackProperties",
		tracer.ResourceName("go.sessions.AddTrackProperties"))
	defer outerSpan.Finish()

	fields := map[string]string{}

	for _, event := range events.Events {
		if event.Type == parse.Custom {
			dataObject := struct {
				Tag     string          `json:"tag"`
				Payload json.RawMessage `json:"payload"`
			}{}

			if err := json.Unmarshal([]byte(event.Data), &dataObject); err != nil {
				return e.New("error deserializing custom event properties")
			}

			if !strings.Contains(dataObject.Tag, "Track") {
				continue
			}

			if dataObject.Payload == nil {
				return e.New("error reading raw payload from track event")
			}

			var payloadStr string
			if err := json.Unmarshal(dataObject.Payload, &payloadStr); err != nil {
				return e.New("error deserializing track event payload into a string")
			}

			propertiesObject := make(map[string]interface{})
			if err := json.Unmarshal([]byte(payloadStr), &propertiesObject); err != nil {
				return e.New("error deserializing track event properties")
			}

			for k, v := range propertiesObject {
				formattedVal := fmt.Sprintf("%.*v", SESSION_FIELD_MAX_LENGTH, v)
				if len(formattedVal) > 0 {
					fields[k] = formattedVal
				}
				// the value below is used for testing using https://localhost:3000/buttons
				testTrackingMessage := "therewasonceahumblebumblebeeflyingthroughtheforestwhensuddenlyadropofwaterfullyencasedhimittookhimasecondtofigureoutthathesinaraindropsuddenlytheraindrophitthegroundasifhewasdivingintoapoolandheflewawaywithnofurtherissues"
				if fields[k] == testTrackingMessage {
					return e.New(testTrackingMessage)
				}
			}
		}
	}

	if len(fields) > 0 {
		if err := r.AppendProperties(outerCtx, sessionID, fields, PropertyType.TRACK); err != nil {
			return e.Wrap(err, "error adding set of properties to db")
		}

	}

	return nil
}

func (r *Resolver) ProcessPayload(ctx context.Context, sessionID int, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon bool, hasSessionUnloaded bool, highlightLogs *string, payloadId *int) error {
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
		return retErr
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

	payloadIdDeref := 0
	if payloadId != nil {
		payloadIdDeref = *payloadId
	}

	projectID := sessionObj.ProjectID
	hasBeacon := sessionObj.BeaconTime != nil
	g.Go(func() error {
		defer util.Recover()
		parseEventsSpan, parseEventsCtx := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.parseEvents"), tracer.Tag("project_id", projectID))
		defer parseEventsSpan.Finish()
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

			if err := r.AddTrackProperties(parseEventsCtx, sessionID, parsedEvents); err != nil {
				log.Error(e.Wrap(err, "failed to add track properties"))
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
				}

				// Gated for projectID == 1, replace any static resources with our own, hosted in S3
				// This gate will be removed in the future
				if projectID == 1 {
					var s interface{}
					err := json.Unmarshal(event.Data, &s)
					if err != nil {
						log.Error(e.Wrap(err, "error unmarshalling event"))
						continue
					}
					err = parse.ReplaceAssets(projectID, s.(map[string]interface{}), r.StorageClient, r.DB)
					if err != nil {
						log.Error(e.Wrap(err, "error replacing assets"))
						continue
					}
					event.Data, err = json.Marshal(s)
					if err != nil {
						log.Error(e.Wrap(err, "error remarshalling event"))
						continue
					}
				}

				if event.Type == parse.IncrementalSnapshot {
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

			if redis.UseRedis(projectID) {
				score := float64(payloadIdDeref)
				// A little bit of a hack to encode
				if isBeacon {
					score += .5
				}

				if err := r.Redis.AddEventPayload(sessionID, score, string(b)); err != nil {
					return e.Wrap(err, "error adding event payload")
				}

			} else {
				obj := &model.EventsObject{SessionID: sessionID, Events: string(b), IsBeacon: isBeacon}
				if err := r.DB.Table("events_objects_partitioned").Create(obj).Error; err != nil {
					return e.Wrap(err, "error creating events object")
				}
			}

			if !lastUserInteractionTimestamp.IsZero() {
				if err := r.DB.Model(&sessionObj).Update("LastUserInteractionTime", lastUserInteractionTimestamp).Error; err != nil {
					return e.Wrap(err, "error updating LastUserInteractionTime")
				}
			}
		}
		return nil
	})

	// unmarshal messages
	g.Go(func() error {
		defer util.Recover()
		unmarshalMessagesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.unmarshal.messages"), tracer.Tag("project_id", projectID))
		defer unmarshalMessagesSpan.Finish()
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
		return nil
	})

	// unmarshal resources
	g.Go(func() error {
		defer util.Recover()
		unmarshalResourcesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.unmarshal.resources"), tracer.Tag("project_id", projectID))
		defer unmarshalResourcesSpan.Finish()
		if hasBeacon {
			r.DB.Where(&model.ResourcesObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.ResourcesObject{})
		}
		resourcesParsed := make(map[string][]NetworkResource)
		if err := json.Unmarshal([]byte(resources), &resourcesParsed); err != nil {
			return nil
		}
		if len(resourcesParsed["resources"]) > 0 {
			if err := r.submitFrontendNetworkMetric(ctx, sessionObj, resourcesParsed["resources"]); err != nil {
				return err
			}
			obj := &model.ResourcesObject{SessionID: sessionID, Resources: resources, IsBeacon: isBeacon}
			if err := r.DB.Create(obj).Error; err != nil {
				return e.Wrap(err, "error creating resources object")
			}
		}
		return nil
	})

	// process errors
	g.Go(func() error {
		defer util.Recover()
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

			group, err := r.HandleErrorAndGroup(errorToInsert, "", v.StackTrace, extractErrorFields(sessionObj, errorToInsert), projectID)
			if err != nil {
				log.Error(e.Wrap(err, "Error updating error group"))
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
		return err
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

	updateSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload", tracer.ResourceName("doSessionFieldsUpdate"))
	defer updateSpan.Finish()
	// Update only if any of these fields are changing
	// Update the PayloadUpdatedAt field only if it's been >15s since the last one
	doUpdate := sessionObj.PayloadUpdatedAt == nil ||
		now.Sub(*sessionObj.PayloadUpdatedAt) > 15*time.Second ||
		beaconTime != nil ||
		hasSessionUnloaded != sessionObj.HasUnloaded ||
		(sessionObj.Processed != nil && *sessionObj.Processed) ||
		(sessionObj.ObjectStorageEnabled != nil && *sessionObj.ObjectStorageEnabled) ||
		(sessionObj.Chunked != nil && *sessionObj.Chunked) ||
		(sessionObj.Excluded != nil && *sessionObj.Excluded) ||
		(sessionHasErrors && (sessionObj.HasErrors == nil || !*sessionObj.HasErrors))

	if doUpdate {
		fieldsToUpdate := model.Session{
			PayloadUpdatedAt: &now, BeaconTime: beaconTime, HasUnloaded: hasSessionUnloaded, Processed: &model.F, ObjectStorageEnabled: &model.F, DirectDownloadEnabled: false, Chunked: &model.F, Excluded: &model.F,
		}

		// We only want to update the `HasErrors` field if the session has errors.
		if sessionHasErrors {
			fieldsToUpdate.HasErrors = &model.T

			if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).
				Select("PayloadUpdatedAt", "BeaconTime", "HasUnloaded", "Processed", "ObjectStorageEnabled", "Chunked", "DirectDownloadEnabled", "Excluded", "HasErrors").
				Updates(&fieldsToUpdate).Error; err != nil {
				log.Error(e.Wrap(err, "error updating session payload time and beacon time with errors"))
				return err
			}
		} else {
			if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).
				Select("PayloadUpdatedAt", "BeaconTime", "HasUnloaded", "Processed", "ObjectStorageEnabled", "Chunked", "DirectDownloadEnabled", "Excluded").
				Updates(&fieldsToUpdate).Error; err != nil {
				log.Error(e.Wrap(err, "error updating session payload time and beacon time"))
				return err
			}
		}
	}

	// If the session was previously marked as processed, clear this
	// in OpenSearch so that it's treated as a live session again.
	// If the session was previously excluded (as we do with new sessions by default),
	// clear it so it is shown as live in OpenSearch since we now have data for it.
	if (sessionObj.Processed != nil && *sessionObj.Processed) ||
		(sessionObj.Excluded != nil && *sessionObj.Excluded) {
		if err := r.OpenSearch.Update(opensearch.IndexSessions, sessionObj.ID, map[string]interface{}{
			"processed":  false,
			"Excluded":   false,
			"has_errors": sessionHasErrors,
		}); err != nil {
			log.Error(e.Wrap(err, "error updating session in opensearch"))
			return err
		}
	}

	if sessionHasErrors {
		if err := r.OpenSearch.Update(opensearch.IndexSessions, sessionObj.ID, map[string]interface{}{
			"has_errors": true,
		}); err != nil {
			log.Error(e.Wrap(err, "error setting has_errors on session in opensearch"))
			return err
		}
	}
	return nil
}

func (r *Resolver) submitFrontendNetworkMetric(ctx context.Context, sessionObj *model.Session, resources []NetworkResource) error {
	project := &model.Project{}
	if err := r.DB.Model(&model.Project{}).Select("backend_domains").Where("id = ?", sessionObj.ProjectID).First(&project).Error; err != nil {
		return e.Wrap(err, "error querying project")
	}

	var points []timeseries.Point
	for _, re := range resources {
		tags := map[string]string{
			"project_id": strconv.Itoa(sessionObj.ProjectID),
			"session_id": strconv.Itoa(sessionObj.ID),
			"group_name": re.RequestResponsePairs.Request.ID,
		}
		fields := map[string]interface{}{}
		for key, value := range map[modelInputs.NetworkRequestAttribute]float64{
			modelInputs.NetworkRequestAttributeBodySize:     float64(len(re.RequestResponsePairs.Request.Body)),
			modelInputs.NetworkRequestAttributeResponseSize: re.RequestResponsePairs.Response.Size,
			modelInputs.NetworkRequestAttributeStatus:       re.RequestResponsePairs.Response.Status,
			modelInputs.NetworkRequestAttributeLatency:      float64((time.Millisecond * time.Duration(re.ResponseEnd-re.StartTime)).Nanoseconds()),
		} {
			fields[key.String()] = value
		}
		categories := map[modelInputs.NetworkRequestAttribute]string{
			modelInputs.NetworkRequestAttributeMethod:        re.RequestResponsePairs.Request.Method,
			modelInputs.NetworkRequestAttributeInitiatorType: re.InitiatorType,
			modelInputs.NetworkRequestAttributeRequestID:     re.RequestResponsePairs.Request.ID,
		}
		requestBody := make(map[string]interface{})
		// if the request body is json and contains the graphql key operationName, treat it as an operation
		if err := json.Unmarshal([]byte(re.RequestResponsePairs.Request.Body), &requestBody); err == nil {
			if _, ok := requestBody["operationName"]; ok {
				categories[modelInputs.NetworkRequestAttributeGraphqlOperation] = requestBody["operationName"].(string)
			}
		}

		// only record urls for network requests that match config to limit metric cardinality
		u, err := url.Parse(re.Name)
		if err == nil {
			for _, d := range project.BackendDomains {
				if u.Host == d {
					u.RawQuery = ""
					u.Fragment = ""
					categories[modelInputs.NetworkRequestAttributeURL] = u.String()
				}
			}
		}

		for key, value := range categories {
			tags[key.String()] = value
		}
		// request time is relative to session start
		d, _ := time.ParseDuration(fmt.Sprintf("%fms", re.StartTime))
		points = append(points, timeseries.Point{
			Measurement: timeseries.Metrics,
			Time:        sessionObj.CreatedAt.Add(d),
			Tags:        tags,
			Fields:      fields,
		})
	}
	r.TDB.Write(strconv.Itoa(sessionObj.ProjectID), points)
	return nil
}
