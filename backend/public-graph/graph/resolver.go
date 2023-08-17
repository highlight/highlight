package graph

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"hash/fnv"
	"io"
	"net/http"
	"net/mail"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/embeddings"
	"github.com/highlight-run/highlight/backend/errorgroups"
	"github.com/highlight-run/highlight/backend/phonehome"
	"github.com/highlight-run/highlight/backend/stacktraces"
	"github.com/highlight-run/highlight/backend/store"
	"go.opentelemetry.io/otel/attribute"

	"github.com/PaesslerAG/jsonpath"
	"github.com/highlight-run/go-resthooks"
	"github.com/leonelquinteros/hubspot"
	"github.com/mssola/user_agent"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/highlight-run/highlight/backend/alerts"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	stats "github.com/highlight-run/highlight/backend/hlog"
	highlightHubspot "github.com/highlight-run/highlight/backend/hubspot"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/pricing"
	"github.com/highlight-run/highlight/backend/private-graph/graph"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModel "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/timeseries"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/zapier"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
)

// This file will not be regenerated automatically.
//
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB               *gorm.DB
	TDB              timeseries.DB
	ProducerQueue    kafka_queue.MessageQueue
	BatchedQueue     kafka_queue.MessageQueue
	DataSyncQueue    kafka_queue.MessageQueue
	TracesQueue      kafka_queue.MessageQueue
	MailClient       *sendgrid.Client
	StorageClient    storage.Client
	OpenSearch       *opensearch.Client
	HubspotApi       *highlightHubspot.HubspotApi
	EmbeddingsClient embeddings.Client
	Redis            *redis.Client
	Clickhouse       *clickhouse.Client
	RH               *resthooks.Resthook
	Store            *store.Store
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

var NumberRegex = regexp.MustCompile(`^\d+$`)

var ErrNoisyError = e.New("Filtering out noisy error")
var ErrQuotaExceeded = e.New(string(publicModel.PublicGraphErrorBillingQuotaExceeded))
var ErrUserFilteredError = e.New("User filtered error")

// metrics that should be stored in postgres for session lookup
var MetricCategoriesForDB = map[string]bool{"Device": true, "WebVital": true}

// Change to AppendProperties(sessionId,properties,type)
func (r *Resolver) AppendProperties(ctx context.Context, sessionID int, properties map[string]string, propType Property) error {
	outerSpan, outerCtx := tracer.StartSpanFromContext(ctx, "public-graph.AppendProperties",
		tracer.ResourceName("go.sessions.AppendProperties"), tracer.Tag("sessionID", sessionID))
	defer outerSpan.Finish()

	loadSessionSpan, _ := tracer.StartSpanFromContext(outerCtx, "public-graph.AppendProperties",
		tracer.ResourceName("go.sessions.AppendProperties.loadSessions"), tracer.Tag("sessionID", sessionID))
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).Take(&session)
	if err := res.Error; err != nil {
		return e.Wrapf(err, "error getting session(id=%d) in append properties(type=%s)", sessionID, propType)
	}
	loadSessionSpan.Finish()

	modelFields := []*model.Field{}
	projectID := session.ProjectID
	for k, fv := range properties {
		if len(fv) > SESSION_FIELD_MAX_LENGTH {
			log.WithContext(ctx).Warnf("property %s from session %d exceeds max expected field length, skipping", k, sessionID)
		} else if fv == "" {
			// Skip when the field value is blank
		} else if NumberRegex.MatchString(k) {
			// Skip when the field name is a number
			// (this can be sent by clients if a string is passed as an `addProperties` payload)
		} else {
			modelFields = append(modelFields, &model.Field{ProjectID: projectID, Name: k, Value: fv, Type: string(propType)})
		}
	}

	if len(modelFields) > 1000 {
		modelFields = modelFields[:1000]
		log.WithContext(ctx).WithField("session_id", sessionID).Warnf("attempted to append more than 1000 fields - truncating")
	}

	if len(modelFields) > 0 {
		err := r.AppendFields(outerCtx, modelFields, session)
		if err != nil {
			return e.Wrap(err, "error appending fields")
		}
	}

	project := &model.Project{}
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: session.ProjectID}}).Take(&project).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error querying project"))
		return err
	}
	workspace, err := r.getWorkspace(project.WorkspaceID)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error querying workspace"))
		return err
	}

	if propType == PropertyType.USER {
		return r.SendSessionUserPropertiesAlert(ctx, workspace, session)
	} else if propType == PropertyType.TRACK {
		return r.SendSessionTrackPropertiesAlert(ctx, workspace, session, properties)
	}
	return nil
}

func (r *Resolver) AppendFields(ctx context.Context, fields []*model.Field, session *model.Session) error {
	outerSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.AppendFields",
		tracer.ResourceName("go.sessions.AppendProperties"), tracer.Tag("sessionID", session.ID))
	defer outerSpan.Finish()

	result := r.DB.
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "project_id"}, {Name: "type"}, {Name: "name"}, {Name: "value"}},
			DoNothing: true}).
		Create(&fields)

	if err := result.Error; err != nil {
		return e.Wrap(err, "error inserting new fields")
	}

	updateCount := result.RowsAffected

	var allFields []*model.Field
	inClause := [][]interface{}{}
	for _, f := range fields {
		inClause = append(inClause, []interface{}{f.ProjectID, f.Type, f.Name, f.Value})
	}
	if err := r.DB.Where("(project_id, type, name, value) IN ?", inClause).Order("id DESC").
		Find(&allFields).Error; err != nil {
		return e.Wrap(err, "error retrieving all fields")
	}

	// the first N fields ordered by id DESC were added in the prior insert
	newFields := allFields[:updateCount]

	for _, field := range newFields {
		if err := r.OpenSearch.IndexSynchronous(ctx,
			opensearch.IndexParams{
				Index:  opensearch.IndexFields,
				ID:     field.ID,
				Object: field,
			}); err != nil {
			return e.Wrap(err, "error indexing new field")
		}
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
		FieldID   int64
	}
	for _, f := range allFields {
		entries = append(entries, struct {
			SessionID int
			FieldID   int64
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

	if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(session.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: session.ID}}); err != nil {
		return err
	}

	return nil
}

func getIncrementedEnvironmentCount(ctx context.Context, errorGroup *model.ErrorGroup, errorObj *model.ErrorObject) string {
	environmentsMap := make(map[string]int)
	if errorGroup.Environments != "" {
		err := json.Unmarshal([]byte(errorGroup.Environments), &environmentsMap)
		if err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error unmarshalling environments from error group into map"))
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
		log.WithContext(ctx).Error(e.Wrap(err, "error marshalling environment map into json"))
	}
	environmentsString := string(environmentsBytes)

	return environmentsString
}

func (r *Resolver) GetErrorAppVersion(errorObj *model.ErrorObject) *string {
	// get version from session
	var session *model.Session
	if err := r.DB.Model(&session).
		Where("id = ?", errorObj.SessionID).
		Pluck("app_version", &session).Error; err != nil {
		if !e.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
	}
	return session.AppVersion
}

func (r *Resolver) getMappedStackTraceString(ctx context.Context, stackTrace []*publicModel.StackFrameInput, projectID int, errorObj *model.ErrorObject) (*string, []*privateModel.ErrorTrace, error) {
	version := r.GetErrorAppVersion(errorObj)
	var newMappedStackTraceString *string
	mappedStackTrace, err := stacktraces.EnhanceStackTrace(ctx, stackTrace, projectID, version, r.StorageClient)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "error object: %+v", errorObj))
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

func (r *Resolver) GetOrCreateErrorGroup(ctx context.Context, errorObj *model.ErrorObject, matchFn func() (*int, error)) (*model.ErrorGroup, error) {
	match, err := matchFn()
	if err != nil {
		return nil, err
	}
	// no match means we are planning to create an error group
	// we should lock the write path to make sure we do not write duplicate error groups
	if match == nil {
		key := fmt.Sprintf("GetOrCreateErrorGroup-project-%d", errorObj.ProjectID)
		mutex, err := r.Redis.AcquireLock(ctx, key, time.Minute)
		if err != nil {
			return nil, err
		}
		defer func() {
			if _, err := mutex.Unlock(); err != nil {
				log.WithContext(ctx).WithError(err).WithField("key", key).Error("failed to release lock")
			}
		}()
		// recheck the match with the lock held, then perform the write
		match, err = matchFn()
		if err != nil {
			return nil, err
		}
	}
	errorGroup := &model.ErrorGroup{}

	if match == nil {
		environmentsString := getIncrementedEnvironmentCount(ctx, errorGroup, errorObj)

		newErrorGroup := &model.ErrorGroup{
			ProjectID:        errorObj.ProjectID,
			Event:            errorObj.Event,
			StackTrace:       *errorObj.StackTrace,
			MappedStackTrace: errorObj.MappedStackTrace,
			Type:             errorObj.Type,
			State:            privateModel.ErrorStateOpen,
			Fields:           []*model.ErrorField{},
			Environments:     environmentsString,
			ServiceName:      errorObj.ServiceName,
		}
		if err := r.DB.Create(newErrorGroup).Error; err != nil {
			return nil, e.Wrap(err, "Error creating new error group")
		}

		errorGroup = newErrorGroup
	} else {
		if err := r.DB.Where(&model.ErrorGroup{
			Model: model.Model{ID: *match},
		}).Take(&errorGroup).Error; err != nil {
			return nil, e.Wrap(err, "error retrieving top matched error group")
		}

		environmentsString := getIncrementedEnvironmentCount(ctx, errorGroup, errorObj)

		updatedState := errorGroup.State

		// Reopen resolved errors
		// Note that ignored errors do change state
		if updatedState == privateModel.ErrorStateResolved {
			updatedState = privateModel.ErrorStateOpen
		}

		if err := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{
			StackTrace:       *errorObj.StackTrace,
			MappedStackTrace: errorObj.MappedStackTrace,
			Environments:     environmentsString,
			Event:            errorObj.Event,
			State:            updatedState,
			ServiceName:      errorObj.ServiceName,
		}).Error; err != nil {
			return nil, e.Wrap(err, "Error updating error group")
		}
	}

	if err := r.OpenSearch.IndexSynchronous(ctx,
		opensearch.IndexParams{
			Index:    opensearch.IndexErrorsCombined,
			ID:       int64(errorGroup.ID),
			ParentID: pointy.Int(0),
			Object:   errorGroup}); err != nil {
		return nil, e.Wrap(err, "error indexing error group (combined index) in opensearch")
	}

	return errorGroup, nil
}

func (r *Resolver) GetTopErrorGroupMatchByEmbedding(ctx context.Context, combinedEmbedding, eventEmbedding, stackTraceEmbedding, payloadEmbedding model.Vector, threshold float64) (*int, error) {
	span, _ := tracer.StartSpanFromContext(ctx, "public-resolver", tracer.ResourceName("GetTopErrorGroupMatchByEmbedding"))
	defer span.Finish()

	result := struct {
		Score         float64 `json:"score"`
		CombinedScore float64 `json:"combined_score"`
		ErrorGroupID  int     `json:"error_group_id"`
	}{}
	// an alternative query to consider: for M error objects of every error group,
	// find the average score. then pick the error group
	// with the lowest average score.
	if err := r.DB.Raw(`
select eoe.combined_embedding <=> @combined_embedding as score,
       @event_weight * (eoe.event_embedding <=> @event_embedding)
		   + @trace_weight * (eoe.stack_trace_embedding <=> @stack_trace_embedding)
		   + @meta_weight * (eoe.payload_embedding <=> @payload_embedding) as combined_score,
       eo.error_group_id                              as error_group_id
from error_object_embeddings eoe
         inner join error_objects eo on eo.id = eoe.error_object_id
order by 1
limit 1;`, map[string]interface{}{
		"combined_embedding":    combinedEmbedding,
		"event_embedding":       eventEmbedding,
		"stack_trace_embedding": stackTraceEmbedding,
		"payload_embedding":     payloadEmbedding,
		"event_weight":          1,
		"trace_weight":          0.4,
		"meta_weight":           0.2,
	}).
		Scan(&result).Error; err != nil {
		return nil, e.Wrap(err, "error querying top error group match")
	}
	if result.ErrorGroupID > 0 {
		lg := log.WithContext(ctx).WithField("combined_score", result.CombinedScore).WithField("score", result.Score).WithField("matched_error_group_id", result.ErrorGroupID).WithField("threshold", threshold)
		if result.Score < threshold {
			lg.Info("matched error group by embeddings")
			return &result.ErrorGroupID, nil
		}
		lg.Info("found error group by embeddings but score too high")
	}
	return nil, nil
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
	start := time.Now()
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
	stats.Histogram("GetTopErrorGroupMatch.groupSQL.durationMs", float64(time.Since(start).Milliseconds()), nil, 1)

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
func (r *Resolver) HandleErrorAndGroup(ctx context.Context, errorObj *model.ErrorObject, structuredStackTrace []*privateModel.ErrorTrace, fields []*model.ErrorField, projectID int, workspace *model.Workspace) (*model.ErrorGroup, error) {
	if errorObj == nil {
		return nil, e.New("error object was nil")
	}
	if errorObj.Event == "" {
		return nil, e.New("error object event was empty")
	}

	if errorObj.StackTrace == nil {
		return nil, errors.New("error object stacktrace was empty")
	}

	project, err := r.Store.GetProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}

	if project.ID == 1 {
		if errorObj.Event == `input: initializeSession BillingQuotaExceeded` ||
			errorObj.Event == `BillingQuotaExceeded` ||
			errorObj.Event == `panic {error: missing operation context}` ||
			errorObj.Event == `input: could not get json request body: unable to get Request Body unexpected EOF` ||
			errorObj.Event == `no metrics provided` ||
			errorObj.Event == `input: pushMetrics no metrics provided` ||
			errorObj.Event == `Error updating error group: Filtering out noisy error` ||
			errorObj.Event == `Error updating error group: Filtering out noisy Highlight error` ||
			errorObj.Event == `error processing main session: error scanning session payload: error fetching events from Redis: error processing event chunk: The payload has an IncrementalSnapshot before the first FullSnapshot` ||
			errorObj.Event == `session has reached the max retry count and will be excluded: error scanning session payload: error fetching events from Redis: error processing event chunk: The payload has an IncrementalSnapshot before the first FullSnapshot` ||
			errorObj.Event == `invalid metrics payload []` ||
			errorObj.Event == `public-graph graphql request failed` {
			return nil, ErrNoisyError
		}
	}
	if project.ID == 356 {
		if errorObj.Event == `["\"ReferenceError: Can't find variable: widgetContainerAttribute\""]` ||
			errorObj.Event == `"ReferenceError: Can't find variable: widgetContainerAttribute"` ||
			errorObj.Event == `"InvalidStateError: XMLHttpRequest.responseText getter: responseText is only available if responseType is '' or 'text'."` ||
			errorObj.Event == `["\"InvalidStateError: XMLHttpRequest.responseText getter: responseText is only available if responseType is '' or 'text'.\""]` {
			return nil, ErrNoisyError
		}
	}
	if project.ID == 765 {
		if errorObj.Event == `"Uncaught Error: PollingBlockTracker - encountered an error while attempting to update latest block:\nundefined"` ||
			errorObj.Event == `["\"Uncaught Error: PollingBlockTracker - encountered an error while attempting to update latest block:\\nundefined\""]` {
			return nil, ErrNoisyError
		}
	}
	if project.ID == 898 {
		if errorObj.Event == `["\"LaunchDarklyFlagFetchError: Error fetching flag settings: 414\""]` ||
			errorObj.Event == `["\"[LaunchDarkly] Error fetching flag settings: 414\""]` {
			return nil, ErrNoisyError
		}
	}
	if project.ID == 1703 {
		if errorObj.Event == `["\"Uncaught TypeError: Cannot read properties of null (reading 'play')\""]` ||
			errorObj.Event == `"Uncaught TypeError: Cannot read properties of null (reading 'play')"` {
			return nil, ErrNoisyError
		}
	}
	if project.ID == 3322 {
		if errorObj.Event == `["\"Failed to fetch feature flags from PostHog.\""]` ||
			errorObj.Event == `["\"Bad HTTP status: 0 \""]` {
			return nil, ErrNoisyError
		}
	}

	if errorgroups.IsErrorTraceFiltered(*project, structuredStackTrace) {
		return nil, ErrUserFilteredError
	}

	withinBillingQuota, quotaPercent := r.IsWithinQuota(ctx, pricing.ProductTypeErrors, workspace, time.Now())
	go func() {
		defer util.Recover()
		if quotaPercent >= 1 {
			if err := model.SendBillingNotifications(ctx, r.DB, r.MailClient, email.BillingErrorsUsage100Percent, workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		} else if quotaPercent >= .8 {
			if err := model.SendBillingNotifications(ctx, r.DB, r.MailClient, email.BillingErrorsUsage80Percent, workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		}
	}()
	if !withinBillingQuota {
		return nil, ErrQuotaExceeded
	}

	if len(errorObj.Event) > ERROR_EVENT_MAX_LENGTH {
		errorObj.Event = strings.Repeat(errorObj.Event[:ERROR_EVENT_MAX_LENGTH], 1)
	}

	if len(structuredStackTrace) > 0 {
		if len(structuredStackTrace) > stacktraces.ERROR_STACK_MAX_FRAME_COUNT {
			structuredStackTrace = structuredStackTrace[:stacktraces.ERROR_STACK_MAX_FRAME_COUNT]
			firstFrameBytes, err := json.Marshal(structuredStackTrace)
			if err != nil {
				return nil, e.Wrap(err, "Error marshalling first frame")
			}

			errorObj.StackTrace = ptr.String(string(firstFrameBytes))
		}
	}

	fingerprints := []*model.ErrorFingerprint{}
	fingerprints = append(fingerprints, errorgroups.GetFingerprints(projectID, structuredStackTrace)...)

	// Try unmarshalling the Event to JSON.
	// If this works, create an error fingerprint for each of the project's JSON paths.
	jsonStrings := []string{}
	if err := json.Unmarshal([]byte(errorObj.Event), &jsonStrings); err == nil && len(jsonStrings) == 1 {
		errorAsJson := interface{}(nil)
		if err := json.Unmarshal([]byte(jsonStrings[0]), &errorAsJson); err == nil {
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

	var errorGroup, errorGroupAlt *model.ErrorGroup
	errorGroup, err = r.GetOrCreateErrorGroup(ctx, errorObj, func() (*int, error) {
		match, err := r.GetTopErrorGroupMatch(errorObj.Event, errorObj.ProjectID, fingerprints)
		if err != nil {
			return nil, e.Wrap(err, "Error getting top error group match")
		}
		return match, err
	})
	if err != nil {
		return nil, e.Wrap(err, "Error getting or creating error group")
	}

	var settings *model.AllWorkspaceSettings
	if workspace != nil {
		settings, _ = r.Store.GetAllWorkspaceSettings(ctx, workspace.ID)
	}
	var embedding *model.ErrorObjectEmbeddings
	if settings != nil && settings.ErrorEmbeddingsGroup {
		// keep the classic match as the alternative error group
		errorGroup, errorGroupAlt = nil, errorGroup
		emb, err := r.EmbeddingsClient.GetEmbeddings(ctx, []*model.ErrorObject{errorObj})
		if err != nil {
			log.WithContext(ctx).WithError(err).WithField("error_object_id", errorObj.ID).Error("failed to get embeddings")
		}
		embedding = emb[0]
		errorGroup, err = r.GetOrCreateErrorGroup(ctx, errorObj, func() (*int, error) {
			match, err := r.GetTopErrorGroupMatchByEmbedding(ctx, embedding.CombinedEmbedding, embedding.EventEmbedding, embedding.StackTraceEmbedding, embedding.PayloadEmbedding, settings.ErrorEmbeddingsThreshold)
			if err != nil {
				log.WithContext(ctx).WithError(err).WithField("error_object_id", errorObj.ID).Error("failed to group error using embeddings")
			}
			return match, err
		})
		if err != nil {
			return nil, e.Wrap(err, "Error getting or creating error group")
		}
		errorObj.ErrorGroupID = errorGroup.ID
		errorObj.ErrorGroupIDAlternative = errorGroupAlt.ID
		errorObj.ErrorGroupingMethod = model.ErrorGroupingMethodAdaEmbeddingV2
	} else {
		errorObj.ErrorGroupID = errorGroup.ID
		errorObj.ErrorGroupingMethod = model.ErrorGroupingMethodClassic
	}

	if err := r.DB.Create(errorObj).Error; err != nil {
		return nil, e.Wrap(err, "Error performing error insert for error")
	}

	if embedding != nil {
		embedding.ErrorObjectID = errorObj.ID
		if err := r.Store.PutEmbeddings([]*model.ErrorObjectEmbeddings{embedding}); err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to write embeddings")
		}
	}

	opensearchErrorObject := &opensearch.OpenSearchErrorObject{
		Url:         errorObj.URL,
		Os:          errorObj.OS,
		Browser:     errorObj.Browser,
		Timestamp:   errorObj.Timestamp,
		Environment: errorObj.Environment,
		ServiceName: errorObj.ServiceName,
	}
	if err := r.OpenSearch.IndexSynchronous(ctx, opensearch.IndexParams{
		Index:    opensearch.IndexErrorsCombined,
		ID:       int64(errorObj.ID),
		ParentID: pointy.Int(errorGroup.ID),
		Object:   opensearchErrorObject,
	}); err != nil {
		return nil, e.Wrap(err, "error indexing error group (combined index) in opensearch")
	}

	if err := r.AppendErrorFields(ctx, fields, errorGroup); err != nil {
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

	return errorGroup, nil
}

func (r *Resolver) BatchGenerateEmbeddings(ctx context.Context, errorObjects []*model.ErrorObject) error {
	if len(errorObjects) == 0 {
		return nil
	}

	emb, err := r.EmbeddingsClient.GetEmbeddings(ctx, errorObjects)
	if err != nil {
		return err
	}
	return r.Store.PutEmbeddings(emb)
}

func (r *Resolver) AppendErrorFields(ctx context.Context, fields []*model.ErrorField, errorGroup *model.ErrorGroup) error {
	fieldsToAppend := []*model.ErrorField{}
	for _, f := range fields {
		field := &model.ErrorField{}
		res := r.DB.Raw(`
			SELECT * FROM error_fields
			WHERE project_id = ?
			AND name = ?
			AND value = ?
			AND md5(value)::uuid = md5(?)::uuid
			`, f.ProjectID, f.Name, f.Value, f.Value).Take(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || e.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating error field")
			}
			if err := r.OpenSearch.IndexSynchronous(ctx, opensearch.IndexParams{
				Index:  opensearch.IndexErrorFields,
				ID:     int64(f.ID),
				Object: f,
			}); err != nil {
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

func GetLocationFromIP(ctx context.Context, ip string) (location *Location, err error) {
	s, _ := tracer.StartSpanFromContext(ctx, "public-graph.GetLocationFromIP",
		tracer.ResourceName("getLocationFromIP"))
	defer s.Finish()
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

	body, err := io.ReadAll(res.Body)
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

func (r *Resolver) getExistingSession(ctx context.Context, projectID int, secureID string) (*model.Session, error) {
	existingSessionObj := &model.Session{}
	if err := r.DB.Model(&existingSessionObj).Where(&model.Session{SecureID: secureID}).Take(&existingSessionObj).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		log.WithContext(ctx).Errorf("init session error, couldn't fetch session duplicate: %s", secureID)
		return nil, e.Wrap(err, "init session error, couldn't fetch session duplicate")
	}
	if existingSessionObj.ID != 0 {
		if projectID != existingSessionObj.ProjectID {
			// ensure the fetched session is for this same project
			log.WithContext(ctx).Errorf("error creating session for secure id %s, fetched a session for another project: %d", secureID, existingSessionObj.ProjectID)
			return nil, e.New("error creating session, fetched session for another project.")
		}
		// otherwise, it's a retry for a session that already exists. return the existing session.
		return existingSessionObj, nil
	}
	return nil, nil
}

func (r *Resolver) IndexSessionOpensearch(ctx context.Context, session *model.Session) error {
	osSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.InitializeSessionImpl", tracer.ResourceName("go.sessions.OSIndex"))
	defer osSpan.Finish()
	if err := r.OpenSearch.IndexSynchronous(ctx,
		opensearch.IndexParams{
			Index:    opensearch.IndexSessions,
			ID:       int64(session.ID),
			ParentID: nil,
			Object:   session,
		}); err != nil {
		return e.Wrap(err, "error indexing new session in opensearch")
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
		"ip":              session.IP,
	}
	if err := r.AppendProperties(ctx, session.ID, sessionProperties, PropertyType.SESSION); err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error adding set of properties to db"))
	}
	return r.DataSyncQueue.Submit(ctx, strconv.Itoa(session.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: session.ID}})
}

func (r *Resolver) InitializeSessionImpl(ctx context.Context, input *kafka_queue.InitializeSessionArgs) (*model.Session, error) {
	initSpan, initCtx := tracer.StartSpanFromContext(ctx, "public-graph.InitializeSessionImpl",
		tracer.ResourceName("go.sessions.InitializeSessionImpl"),
		tracer.Tag("duplicate", true))
	defer initSpan.Finish()

	defer func() {
		redisSpan, redisCtx := tracer.StartSpanFromContext(initCtx, "public-graph.InitializeSessionImpl", tracer.ResourceName("go.sessions.setRedis"))
		defer redisSpan.Finish()
		err := r.Redis.SetIsPendingSession(redisCtx, input.SessionSecureID, false)
		if err != nil {
			log.WithContext(ctx).Error(
				e.Wrapf(err, "failed to clear `pending` flag for session %s", input.SessionSecureID),
			)
		}
	}()

	projectID, err := model.FromVerboseID(input.ProjectVerboseID)
	if err != nil {
		return nil, e.Wrapf(err, "An unsupported verboseID was used: %s, %s", input.ProjectVerboseID, input.ClientConfig)
	}

	existingSession, err := r.getExistingSession(ctx, projectID, input.SessionSecureID)
	if err != nil {
		return nil, err
	}
	if existingSession != nil {
		if err := r.IndexSessionOpensearch(initCtx, existingSession); err != nil {
			return nil, err
		}
		return existingSession, nil
	}
	initSpan.SetTag("duplicate", false)

	setupSpan, _ := tracer.StartSpanFromContext(initCtx, "public-graph.InitializeSessionImpl", tracer.ResourceName("go.sessions.setup"))
	project := &model.Project{}
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).Take(&project).Error; err != nil {
		return nil, e.Wrapf(err, "project doesn't exist project_id:%d", projectID)
	}
	workspace, err := r.getWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving workspace")
	}

	fpHash := fnv.New32a()
	defer fpHash.Reset()
	if _, err := fpHash.Write([]byte(input.Fingerprint)); err != nil {
		log.WithContext(ctx).Errorf("failed to hash fingerprint to int: %s", err)
	}

	deviceDetails := GetDeviceDetails(input.UserAgent)
	excludedReason := privateModel.SessionExcludedReasonInitializing
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
		EnableStrictPrivacy:            &input.EnableStrictPrivacy,
		EnableRecordingNetworkContents: &input.EnableRecordingNetworkContents,
		FirstloadVersion:               input.FirstloadVersion,
		ClientVersion:                  input.ClientVersion,
		ClientConfig:                   &input.ClientConfig,
		Environment:                    input.Environment,
		AppVersion:                     input.AppVersion,
		VerboseID:                      input.ProjectVerboseID,
		Fields:                         []*model.Field{},
		ViewedByAdmins:                 []model.Admin{},
		ClientID:                       input.ClientID,
		Excluded:                       true, // A session is excluded by default until it receives events
		ExcludedReason:                 &excludedReason,
		ProcessWithRedis:               true,
		AvoidPostgresStorage:           true,
	}

	// mark recording-less sessions as processed so they are considered excluded
	if input.DisableSessionRecording != nil && *input.DisableSessionRecording {
		session.Processed = &model.T
	}

	// determine if session is within billing quota
	withinBillingQuota, quotaPercent := r.IsWithinQuota(ctx, pricing.ProductTypeSessions, workspace, time.Now())
	setupSpan.Finish()

	if err := r.Redis.SetBillingQuotaExceeded(ctx, projectID, pricing.ProductTypeSessions, !withinBillingQuota); err != nil {
		return nil, e.Wrap(err, "error setting billing quota exceeded")
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
	fetchedLocation, err := GetLocationFromIP(initCtx, input.IP)
	if err != nil || fetchedLocation == nil {
		log.WithContext(ctx).Errorf("error getting user's location: %v", err)
	} else {
		location = fetchedLocation
	}

	session.IP = input.IP
	session.City = location.City
	session.State = location.State
	session.Postal = location.Postal
	session.Country = location.Country
	session.Latitude = location.Latitude.(float64)
	session.Longitude = location.Longitude.(float64)
	session.WithinBillingQuota = &withinBillingQuota

	if err := r.DB.Create(session).Error; err != nil {
		if input.SessionSecureID == "" || !strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			log.WithContext(ctx).Errorf("error creating session: %s", err)
			return nil, e.Wrap(err, "error creating session")
		}
		existingSession, err := r.getExistingSession(ctx, projectID, input.SessionSecureID)
		if err != nil {
			return nil, err
		}
		if existingSession != nil {
			initSpan.SetTag("duplicate", true)
			initSpan.SetTag("duplicateRace", true)
			return existingSession, nil
		}
		return nil, e.New("failed to find duplicate session: " + input.SessionSecureID)
	}

	var setupEventsCount int64
	if err := r.DB.Model(&model.SetupEvent{}).Where("project_id = ? AND type = ?", projectID, model.MarkBackendSetupTypeSession).Count(&setupEventsCount).Error; err != nil {
		return nil, e.Wrap(err, "error querying setup events")
	}
	if setupEventsCount < 1 {
		setupEvent := &model.SetupEvent{
			ProjectID: projectID,
			Type:      model.MarkBackendSetupTypeSession,
		}
		if err := r.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&setupEvent).Error; err != nil {
			return nil, e.Wrap(err, "error creating setup event")
		}
	}

	log.WithContext(ctx).WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("initialized session %d: %s", session.ID, session.Identifier)

	if err := r.PushMetricsImpl(initCtx, session.SecureID, []*publicModel.MetricInput{
		{
			SessionSecureID: session.SecureID,
			Timestamp:       time.Now(),
			Name:            "sessions",
			Value:           1,
			Category:        pointy.String(model.InternalMetricCategory),
			Tags: []*publicModel.MetricTag{
				{Name: "Bot", Value: fmt.Sprintf("%v", deviceDetails.IsBot)},
				{Name: "Browser", Value: deviceDetails.BrowserName},
				{Name: "BrowserVersion", Value: deviceDetails.BrowserVersion},
				{Name: "IP", Value: session.IP},
				{Name: "City", Value: session.City},
				{Name: "ClientID", Value: session.ClientID},
				{Name: "Country", Value: session.Country},
				{Name: "Identifier", Value: session.Identifier},
				{Name: "Language", Value: session.Language},
				{Name: "OS", Value: deviceDetails.OSName},
				{Name: "OSVersion", Value: deviceDetails.OSVersion},
				{Name: "Postal", Value: session.Postal},
				{Name: "State", Value: session.State},
			},
		},
	}); err != nil {
		log.WithContext(ctx).Errorf("failed to count sessions metric for %s: %s", session.SecureID, err)
	}

	if err := r.IndexSessionOpensearch(initCtx, session); err != nil {
		return nil, err
	}

	if len(input.NetworkRecordingDomains) > 0 {
		project.BackendDomains = input.NetworkRecordingDomains
		if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).Updates(&model.Project{BackendDomains: project.BackendDomains}).Error; err != nil {
			return nil, e.Wrap(err, "failed to update project backend domains")
		}
	}

	go func() {
		defer util.Recover()
		if quotaPercent >= 1 {
			if err := model.SendBillingNotifications(ctx, r.DB, r.MailClient, email.BillingSessionUsage100Percent, workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		} else if quotaPercent >= .8 {
			if err := model.SendBillingNotifications(ctx, r.DB, r.MailClient, email.BillingSessionUsage80Percent, workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		}
	}()

	return session, nil
}

func (r *Resolver) MarkBackendSetupImpl(ctx context.Context, projectID int, setupType model.MarkBackendSetupType) error {
	_, err := redis.CachedEval(ctx, r.Redis, fmt.Sprintf("mark-backend-setup-%d-%s", projectID, setupType), 150*time.Millisecond, time.Hour, func() (*bool, error) {
		if setupType == model.MarkBackendSetupTypeLogs || setupType == model.MarkBackendSetupTypeError {
			// Update Hubspot company and projects.backend_setup
			var backendSetupCount int64
			if err := r.DB.Model(&model.Project{}).Where("id = ? AND backend_setup=true", projectID).Count(&backendSetupCount).Error; err != nil {
				return nil, e.Wrap(err, "error querying backend_setup flag")
			}
			if backendSetupCount < 1 {
				project, err := r.getProject(projectID)
				if err != nil {
					log.WithContext(ctx).Errorf("failed to query project %d: %s", projectID, err)
				} else {
					if util.IsHubspotEnabled() {
						if err := r.HubspotApi.UpdateCompanyProperty(ctx, project.WorkspaceID, []hubspot.Property{{
							Name:     "backend_setup",
							Property: "backend_setup",
							Value:    true,
						}}); err != nil {
							log.WithContext(ctx).Errorf("failed to update hubspot")
						}
					}
					phonehome.ReportUsageMetrics(ctx, phonehome.WorkspaceUsage, project.WorkspaceID, []attribute.KeyValue{
						attribute.Bool(phonehome.BackendSetup, true),
					})
				}
				if err := r.DB.Model(&model.Project{}).Where("id = ?", projectID).Updates(&model.Project{BackendSetup: &model.T}).Error; err != nil {
					return nil, e.Wrap(err, "error updating backend_setup flag")
				}
			}
		}

		// Create setup_events record
		var setupEventsCount int64
		if err := r.DB.Model(&model.SetupEvent{}).Where("project_id = ? AND type = ?", projectID, setupType).Count(&setupEventsCount).Error; err != nil {
			return nil, e.Wrap(err, "error querying setup events")
		}
		if setupEventsCount < 1 {
			setupEvent := &model.SetupEvent{
				ProjectID: projectID,
				Type:      setupType,
			}
			if err := r.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&setupEvent).Error; err != nil {
				return nil, e.Wrap(err, "error creating setup event")
			}
		}

		return pointy.Bool(true), nil
	})

	return err
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
	if err := r.DB.Select("project_id", "environment", "id", "secure_id", "created_at").Where(&model.Session{SecureID: input.SessionSecureID}).Take(&session).Error; err != nil {
		return e.Wrap(err, "error querying session by sessionSecureID for adding session feedback")
	}

	sessionTimestamp := input.Timestamp.UnixMilli() - session.CreatedAt.UnixMilli()

	feedbackComment := &model.SessionComment{SessionId: session.ID, Text: input.Verbatim, Metadata: metadata, Timestamp: int(sessionTimestamp), Type: model.SessionCommentTypes.FEEDBACK, ProjectID: session.ProjectID, SessionSecureId: session.SecureID}
	if err := r.DB.Create(feedbackComment).Error; err != nil {
		return e.Wrap(err, "error creating session feedback")
	}

	var errorAlerts []*model.ErrorAlert
	if err := r.DB.Model(&model.ErrorAlert{}).Where(&model.ErrorAlert{Alert: model.Alert{ProjectID: session.ProjectID, Disabled: &model.F}}).Find(&errorAlerts).Error; err != nil {
		return e.Wrapf(err, "[project_id: %d] error fetching session feedback alerts", session.ProjectID)
	}

	for _, errorAlert := range errorAlerts {
		excludedEnvironments, err := errorAlert.GetExcludedEnvironments()
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error getting excluded environments from %s alert", model.AlertType.ERROR_FEEDBACK))
			continue
		}
		excluded := false
		for _, env := range excludedEnvironments {
			if env != nil && *env == session.Environment {
				excluded = true
				break
			}
		}
		if excluded {
			continue
		}

		var project model.Project
		if err := r.DB.Raw(`
	  		SELECT *
	  		FROM projects
	  		WHERE id = ?
	  	`, session.ProjectID).Scan(&project).Error; err != nil {
			log.WithContext(ctx).WithError(err).
				WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "session_secure_id": session.SecureID, "comment_id": feedbackComment.ID}).
				Error(e.Wrapf(err, "error fetching %s alert", model.AlertType.ERROR_FEEDBACK))
			continue
		}

		identifier := "Someone"
		if input.UserName != nil {
			identifier = *input.UserName
		} else if input.UserEmail != nil {
			identifier = *input.UserEmail
		}

		workspace, err := r.getWorkspace(project.WorkspaceID)
		if err != nil {
			log.WithContext(ctx).WithError(err).
				WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "comment_id": feedbackComment.ID}).
				Error(e.Wrap(err, "error fetching workspace"))
		}

		errorAlert.SendAlertFeedback(ctx, r.DB, r.MailClient, &model.SendSlackAlertInput{
			Workspace:       workspace,
			SessionSecureID: session.SecureID,
			UserIdentifier:  identifier,
			CommentID:       &feedbackComment.ID,
			CommentText:     feedbackComment.Text,
		})

		if err = alerts.SendErrorFeedbackAlert(alerts.ErrorFeedbackAlertEvent{
			Session:        session,
			ErrorAlert:     errorAlert,
			SessionComment: feedbackComment,
			Workspace:      workspace,
			UserName:       input.UserName,
			UserEmail:      input.UserEmail,
		}); err != nil {
			log.WithContext(ctx).Error(err)
		}
	}

	return nil
}
func (r *Resolver) IdentifySessionImpl(ctx context.Context, sessionSecureID string, userIdentifier string, userObject interface{}, backfill bool) error {
	outerSpan, outerCtx := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		tracer.ResourceName("go.sessions.IdentifySessionImpl"), tracer.Tag("sessionSecureID", sessionSecureID))
	defer outerSpan.Finish()

	obj, ok := userObject.(map[string]interface{})
	if !ok {
		return e.New("[IdentifySession] error converting userObject interface type")
	}

	newUserProperties := map[string]string{}
	if userIdentifier != "" {
		newUserProperties["identifier"] = userIdentifier
	}

	// If userIdentifier is a valid email, save as an email field
	// (this will be overridden if `email` is passed to `H.identify`)
	_, err := mail.ParseAddress(userIdentifier)
	if err == nil {
		newUserProperties["email"] = userIdentifier
	}

	getSessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		tracer.ResourceName("go.sessions.IdentifySessionImpl.getSession"), tracer.Tag("sessionSecureID", sessionSecureID))
	if sessionSecureID == "" {
		return e.New("IdentifySessionImpl called without secureID")
	}
	session := &model.Session{}
	if err := r.DB.Where(&model.Session{SecureID: sessionSecureID}).Take(&session).Error; err != nil {
		return e.New("[IdentifySession] error querying session by sessionID")
	}
	getSessionSpan.Finish()
	sessionID := session.ID

	setUserPropsSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		tracer.ResourceName("go.sessions.IdentifySessionImpl.SetUserProperties"), tracer.Tag("sessionID", sessionID))
	allUserProperties := make(map[string]string)
	// get existing session user properties in case of multiple identify calls
	if existingUserProps, err := session.GetUserProperties(); err == nil {
		for k, v := range existingUserProps {
			allUserProperties[k] = v
		}
	}
	// update overlapping new properties
	for k, v := range obj {
		if v != "" {
			newUserProperties[k] = fmt.Sprintf("%v", v)
			allUserProperties[k] = fmt.Sprintf("%v", v)
		}
	}
	newUserProperties["identified_email"] = "false"
	allUserProperties["identified_email"] = "false"
	// auto-set domain if email is provided
	if em, ok := allUserProperties["email"]; ok {
		newUserProperties["identified_email"] = "true"
		allUserProperties["identified_email"] = "true"
		if parts := strings.Split(em, "@"); len(parts) == 2 {
			newUserProperties["domain"] = parts[1]
			allUserProperties["domain"] = parts[1]
		}
	}
	// set user properties to session in db
	if err := session.SetUserProperties(allUserProperties); err != nil {
		return e.Wrapf(err, "[IdentifySession] [project_id: %d] error appending user properties to session object {id: %d}", session.ProjectID, sessionID)
	}
	if err := r.AppendProperties(outerCtx, sessionID, newUserProperties, PropertyType.USER); err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[IdentifySession] error adding set of identify properties to db: session: %d", sessionID))
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

	if newUserProperties["email"] != "" {
		session.Email = ptr.String(newUserProperties["email"])
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
	if err := r.OpenSearch.UpdateSynchronous(opensearch.IndexSessions, sessionID, openSearchProperties); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
	}
	openSearchUpdateSpan.Finish()

	if err := r.DB.Save(&session).Error; err != nil {
		return e.Wrap(err, "[IdentifySession] failed to update session")
	}

	if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(sessionID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: sessionID}}); err != nil {
		return err
	}

	tags := []*publicModel.MetricTag{
		{Name: "Identifier", Value: session.Identifier},
		{Name: "Identified", Value: strconv.FormatBool(session.Identified)},
		{Name: "FirstTime", Value: strconv.FormatBool(*session.FirstTime)},
	}
	for k, v := range allUserProperties {
		tags = append(tags, &publicModel.MetricTag{Name: k, Value: v})
	}
	if err := r.PushMetricsImpl(ctx, session.SecureID, []*publicModel.MetricInput{
		{
			SessionSecureID: session.SecureID,
			Timestamp:       time.Now(),
			Name:            "users",
			Value:           1,
			Category:        pointy.String(model.InternalMetricCategory),
			Tags:            tags,
		},
	}); err != nil {
		log.WithContext(ctx).Errorf("failed to produce identify metric for %s: %s", session.SecureID, err)
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
			if err := r.IdentifySessionImpl(ctx, session.SecureID, userIdentifier, userObject, true); err != nil {
				return e.Wrapf(err, "[IdentifySession] [client_id: %v] error identifying session {id: %d}", session.ClientID, session.ID)
			}
		}
		doBackfillSpan.Finish()
	}

	log.WithContext(ctx).WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("identified session: %s", session.Identifier)
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
	if err := r.DB.Where(&model.Workspace{Model: model.Model{ID: workspaceID}}).Take(&workspace).Error; err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}
	return &workspace, nil
}

func (r *Resolver) getProject(projectID int) (*model.Project, error) {
	var project model.Project
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).Take(&project).Error; err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	return &project, nil
}

var productTypeToQuotaConfig = map[pricing.ProductType]struct {
	maxCostCents    func(*model.Workspace) *int
	meter           func(context.Context, *gorm.DB, *clickhouse.Client, *model.Workspace) (int64, error)
	retentionPeriod func(*model.Workspace) privateModel.RetentionPeriod
	included        func(*model.Workspace) int64
}{
	pricing.ProductTypeSessions: {
		func(w *model.Workspace) *int { return w.SessionsMaxCents },
		pricing.GetWorkspaceSessionsMeter,
		func(w *model.Workspace) privateModel.RetentionPeriod {
			if w.RetentionPeriod == nil {
				return privateModel.RetentionPeriodThreeMonths
			}
			return *w.RetentionPeriod
		},
		func(w *model.Workspace) int64 {
			limit := pricing.TypeToSessionsLimit(privateModel.PlanType(w.PlanTier))
			if w.MonthlySessionLimit != nil {
				limit = *w.MonthlySessionLimit
			}
			return int64(limit)
		},
	},
	pricing.ProductTypeErrors: {
		func(w *model.Workspace) *int { return w.ErrorsMaxCents },
		pricing.GetWorkspaceErrorsMeter,
		func(w *model.Workspace) privateModel.RetentionPeriod {
			if w.ErrorsRetentionPeriod == nil {
				return privateModel.RetentionPeriodThreeMonths
			}
			return *w.ErrorsRetentionPeriod
		},
		func(w *model.Workspace) int64 {
			limit := pricing.TypeToErrorsLimit(privateModel.PlanType(w.PlanTier))
			if w.MonthlyErrorsLimit != nil {
				limit = *w.MonthlyErrorsLimit
			}
			return int64(limit)
		},
	},
	pricing.ProductTypeLogs: {
		func(w *model.Workspace) *int { return w.LogsMaxCents },
		pricing.GetWorkspaceLogsMeter,
		func(w *model.Workspace) privateModel.RetentionPeriod {
			return privateModel.RetentionPeriodThirtyDays
		},
		func(w *model.Workspace) int64 {
			limit := pricing.TypeToLogsLimit(privateModel.PlanType(w.PlanTier))
			if w.MonthlyLogsLimit != nil {
				limit = *w.MonthlyLogsLimit
			}
			return int64(limit)
		},
	},
}

func (r *Resolver) IsWithinQuota(ctx context.Context, productType pricing.ProductType, workspace *model.Workspace, now time.Time) (bool, float64) {
	if workspace == nil {
		return true, 0
	}
	if workspace.TrialEndDate != nil && workspace.TrialEndDate.After(now) {
		return true, 0
	}
	if util.IsOnPrem() {
		return true, 0
	}

	stripePlan := privateModel.PlanType(workspace.PlanTier)

	cfg := productTypeToQuotaConfig[productType]

	maxCostCents := cfg.maxCostCents(workspace)
	if stripePlan == privateModel.PlanTypeFree {
		maxCostCents = pointy.Int(0)
	}

	if maxCostCents == nil {
		return true, 0
	}

	meter, err := cfg.meter(ctx, r.DB, r.Clickhouse, workspace)
	if err != nil {
		log.WithContext(ctx).Warn(fmt.Sprintf("error getting %s meter for workspace %d", productType, workspace.ID))
	}

	includedQuantity := cfg.included(workspace)
	if includedQuantity >= meter {
		return true, 0
	}

	if *maxCostCents == 0 {
		return false, 1
	}

	basePrice := pricing.ProductToBasePriceCents(productType, stripePlan)
	retentionPeriod := cfg.retentionPeriod(workspace)
	overage := meter - includedQuantity
	cost := float64(overage) *
		basePrice *
		pricing.RetentionMultiplier(retentionPeriod)

	return cost <= float64(*maxCostCents), cost / float64(*maxCostCents)
}

func (r *Resolver) sendErrorAlert(ctx context.Context, projectID int, sessionObj *model.Session, group *model.ErrorGroup, errorObject *model.ErrorObject, visitedUrl string) {
	func() {
		var errorAlerts []*model.ErrorAlert
		if err := r.DB.Model(&model.ErrorAlert{}).Where(&model.ErrorAlert{Alert: model.Alert{ProjectID: projectID, Disabled: &model.F}}).Find(&errorAlerts).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error fetching ErrorAlerts object"))
			return
		}

		for _, errorAlert := range errorAlerts {
			if errorAlert.CountThreshold < 1 {
				continue
			}
			excludedEnvironments, err := errorAlert.GetExcludedEnvironments()
			if err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error getting excluded environments from ErrorAlert"))
				continue
			}
			excluded := false
			for _, env := range excludedEnvironments {
				if env != nil && *env == sessionObj.Environment {
					excluded = true
					break
				}
			}
			if excluded {
				continue
			}
			if errorAlert.ThresholdWindow == nil {
				t := 30
				errorAlert.ThresholdWindow = &t
			}

			if errorAlert.RegexGroups != nil {
				groups, err := errorAlert.GetRegexGroups()
				if err != nil {
					log.WithContext(ctx).Error(e.Wrap(err, "error getting regex groups from ErrorAlert"))
					continue
				}
				matched := false
				for _, g := range groups {
					if g == nil {
						continue
					}
					matched, err = regexp.MatchString(*g, group.Event)
					if err != nil {
						log.WithContext(ctx).Warn(err)
					}
					if matched {
						break
					}
					if group.MappedStackTrace != nil {
						matched, err = regexp.MatchString(*g, *group.MappedStackTrace)
						if err != nil {
							log.WithContext(ctx).Warn(err)
						}
					} else {
						matched, err = regexp.MatchString(*g, group.StackTrace)
						if err != nil {
							log.WithContext(ctx).Warn(err)
						}
					}
					if matched {
						break
					}
				}
				if matched {
					log.WithContext(ctx).Warn("error event matches regex group, skipping alert...")
					continue
				}
			}

			// Suppress alerts if ignored or snoozed.
			snoozed := group.SnoozedUntil != nil && group.SnoozedUntil.After(time.Now())
			if group == nil || group.State == privateModel.ErrorStateIgnored || snoozed {
				continue
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
				log.WithContext(ctx).Error(e.Wrapf(err, "error counting errors from past %d minutes", *errorAlert.ThresholdWindow))
				continue
			}
			if numErrors+1 < int64(errorAlert.CountThreshold) {
				continue
			}

			numAlerts := int64(-1)
			if err := r.DB.Raw(`
				SELECT COUNT(*)
				FROM error_alert_events ev
				INNER JOIN error_objects obj
				ON obj.id = ev.error_object_id
				WHERE
					(obj.error_group_id IS NOT NULL
						AND obj.error_group_id=?)
					AND ev.error_alert_id=?
					AND ev.sent_at > NOW() - ? * (INTERVAL '1 SECOND')
			`, group.ID, errorAlert.ID, errorAlert.Frequency).Scan(&numAlerts).Error; err != nil {
				log.WithContext(ctx).Error(e.Wrapf(err, "error counting alert events from past %d seconds", errorAlert.Frequency))
				continue
			}
			if numAlerts > 0 {
				log.WithContext(ctx).Warnf("num alerts > 0 for project_id=%d, error_group_id=%d", projectID, group.ID)
				continue
			}

			var project model.Project
			if err := r.DB.Model(&model.Project{}).Where(&model.Project{Model: model.Model{ID: projectID}}).Take(&project).Error; err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error querying project"))
				continue
			}

			workspace, err := r.getWorkspace(project.WorkspaceID)
			if err != nil {
				log.WithContext(ctx).Error(err)
			}

			hookPayload := zapier.HookPayload{
				UserIdentifier: sessionObj.Identifier, Group: group, URL: &visitedUrl, ErrorsCount: &numErrors, UserObject: sessionObj.UserObject,
			}

			log.WithContext(ctx).Infof("sending error alert to zapier. id=ErrorAlert_%d", errorAlert.ID)
			if err := r.RH.Notify(sessionObj.ProjectID, fmt.Sprintf("ErrorAlert_%d", errorAlert.ID), hookPayload); err != nil {
				log.WithContext(ctx).Error(e.Wrapf(err, "error sending error alert to Zapier (error alert id: %d)", errorAlert.ID))
			}

			if err := alerts.SendErrorAlert(ctx, alerts.SendErrorAlertEvent{
				Session:     sessionObj,
				ErrorAlert:  errorAlert,
				ErrorGroup:  group,
				ErrorObject: errorObject,
				Workspace:   workspace,
				ErrorCount:  numErrors,
				VisitedURL:  visitedUrl,
			}); err != nil {
				log.WithContext(ctx).Error(err)
			}

			errorAlert.SendAlerts(ctx, r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: sessionObj.SecureID, UserIdentifier: sessionObj.Identifier, Group: group, ErrorObject: errorObject, URL: &visitedUrl, ErrorsCount: &numErrors, UserObject: sessionObj.UserObject})
		}
	}()
}
func (r *Resolver) SubmitMetricsMessage(ctx context.Context, metrics []*publicModel.MetricInput) (int, error) {
	if len(metrics) == 0 {
		log.WithContext(ctx).Errorf("got no metrics for pushmetrics: %+v", metrics)
		return -1, e.New("no metrics provided")
	}
	sessionMetrics := make(map[string][]*publicModel.MetricInput)
	for _, m := range metrics {
		if _, ok := sessionMetrics[m.SessionSecureID]; !ok {
			sessionMetrics[m.SessionSecureID] = []*publicModel.MetricInput{}
		}
		sessionMetrics[m.SessionSecureID] = append(sessionMetrics[m.SessionSecureID], m)
	}

	for secureID, metrics := range sessionMetrics {
		err := r.ProducerQueue.Submit(ctx, secureID, &kafka_queue.Message{
			Type: kafka_queue.PushMetrics,
			PushMetrics: &kafka_queue.PushMetricsArgs{
				SessionSecureID: secureID,
				Metrics:         metrics,
			}})
		if err != nil {
			log.WithContext(ctx).Error(err)
		}
	}

	return len(metrics), nil
}

func (r *Resolver) AddLegacyMetric(ctx context.Context, sessionID int, name string, value float64) (int, error) {
	session, err := r.Store.GetSession(ctx, sessionID)
	if err != nil {
		return -1, e.Wrapf(err, "error querying device metric session")
	}
	return r.SubmitMetricsMessage(ctx, []*publicModel.MetricInput{{
		SessionSecureID: session.SecureID,
		Name:            name,
		Value:           value,
		Timestamp:       time.Now(),
	}})
}

func (r *Resolver) PushMetricsImpl(ctx context.Context, sessionSecureID string, metrics []*publicModel.MetricInput) error {
	span, _ := tracer.StartSpanFromContext(ctx, "public-graph.PushMetricsImpl", tracer.ResourceName("go.push-metrics"))
	span.SetTag("SessionSecureID", sessionSecureID)
	span.SetTag("NumMetrics", len(metrics))
	defer span.Finish()

	if sessionSecureID == "" {
		return nil
	}
	session := &model.Session{}
	if err := r.DB.Model(&session).Where(&model.Session{SecureID: sessionSecureID}).Take(&session).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "no session found for push metrics: %s", sessionSecureID))
		return e.New("no session found for push metrics: " + sessionSecureID)
	}
	sessionID := session.ID
	projectID := session.ProjectID

	metricsByGroup := make(map[string][]*publicModel.MetricInput)
	for _, m := range metrics {
		group := ""
		if m.Group != nil {
			group = *m.Group
		}
		if _, ok := metricsByGroup[group]; !ok {
			metricsByGroup[group] = []*publicModel.MetricInput{}
		}
		metricsByGroup[group] = append(metricsByGroup[group], m)
	}
	var points []timeseries.Point
	var aggregatePoints []timeseries.Point
	for groupName, metricInputs := range metricsByGroup {
		var mg *model.MetricGroup
		var newMetrics []*model.Metric
		downsampledMetric := false
		firstTime := time.Time{}
		fields := map[string]interface{}{}
		tags := map[string]string{
			"session_id": strconv.Itoa(sessionID),
			"group_name": groupName,
		}
		if _, ok := lo.Find(metricInputs, func(m *publicModel.MetricInput) bool {
			category := ""
			if m.Category != nil {
				category = *m.Category
			}
			return MetricCategoriesForDB[category]
		}); ok {
			mg = &model.MetricGroup{
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
				}).Take(&mg).Error; err != nil {
					return err
				}
			}
		}
		for _, m := range metricInputs {
			category := ""
			if m.Category != nil {
				category = *m.Category
			}
			if mg != nil {
				newMetrics = append(newMetrics, &model.Metric{
					MetricGroupID: mg.ID,
					Name:          m.Name,
					Value:         m.Value,
					Category:      category,
					CreatedAt:     m.Timestamp,
				})
			}
			if m.Timestamp.After(firstTime) {
				firstTime = m.Timestamp
			}
			tags[m.Name] = category
			fields[m.Name] = m.Value
			for _, t := range m.Tags {
				tags[t.Name] = t.Value
			}
			// the SessionActiveMetricName metric has a ts of the session creation but is
			// written when the session is processed which may be a long time after
			// the session is created. this would mean that the downsample task does not
			// see the metric, causing it to be lost. instead, write it directly to the
			// downsampled bucket.
			downsampledMetric = downsampledMetric || m.Name == graph.SessionActiveMetricName
		}
		if len(newMetrics) > 0 {
			if err := r.DB.Create(&newMetrics).Error; err != nil {
				return err
			}
		}
		if downsampledMetric {
			aggregatePoints = append(aggregatePoints, timeseries.Point{
				Time:   firstTime,
				Tags:   tags,
				Fields: fields,
			})
		} else {
			points = append(points, timeseries.Point{
				Time:   firstTime,
				Tags:   tags,
				Fields: fields,
			})
		}
	}
	if len(points) > 0 {
		r.TDB.Write(ctx, strconv.Itoa(projectID), timeseries.Metrics, points)
	}
	if len(aggregatePoints) > 0 {
		r.TDB.Write(ctx, strconv.Itoa(projectID), timeseries.Metric.AggName, aggregatePoints)
	}
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

func (r *Resolver) updateErrorsCount(ctx context.Context, errorsBySession map[string]int64, errors int, errorType string) {
	dailyErrorCountSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.processBackendPayload", tracer.ResourceName("db.updateDailyErrorCounts"))
	dailyErrorCountSpan.SetTag("numberOfErrors", errors)
	dailyErrorCountSpan.SetTag("numberOfSessions", len(errorsBySession))
	defer dailyErrorCountSpan.Finish()

	for sessionSecureId, count := range errorsBySession {
		if err := r.PushMetricsImpl(context.Background(), sessionSecureId, []*publicModel.MetricInput{
			{
				SessionSecureID: sessionSecureId,
				Timestamp:       time.Now(),
				Name:            "errors",
				Value:           float64(count),
				Category:        pointy.String(model.InternalMetricCategory),
			},
		}); err != nil {
			log.WithContext(ctx).Errorf("failed to count errors metric for %s: %s", sessionSecureId, err)
		}
	}
}

func (r *Resolver) ProcessBackendPayloadImpl(ctx context.Context, sessionSecureID *string, projectVerboseID *string, errorObjects []*publicModel.BackendErrorObjectInput) {
	querySessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.processBackendPayload", tracer.ResourceName("db.querySessions"))
	querySessionSpan.SetTag("numberOfErrors", len(errorObjects))
	querySessionSpan.SetTag("numberOfSessions", 1)

	var sessionID *int
	session := &model.Session{}
	if sessionSecureID != nil {
		if r.DB.Model(&session).Where(&model.Session{SecureID: *sessionSecureID}).Take(&session); session.ID == 0 {
			retErr := e.New("ProcessBackendPayloadImpl failed to find session " + *sessionSecureID)
			querySessionSpan.Finish(tracer.WithError(retErr))
			log.WithContext(ctx).Error(retErr)
			return
		}
		sessionID = &session.ID
	}

	projectID := session.ProjectID
	if projectVerboseID != nil {
		var err error
		projectID, err = model.FromVerboseID(*projectVerboseID)
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "An unsupported verboseID was used: %s", *projectVerboseID))
			return
		}
	}

	querySessionSpan.Finish()

	var project model.Project
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).Take(&project).Error; err != nil {
		log.WithContext(ctx).WithError(err).WithField("project", project).WithField("projectVerboseID", projectVerboseID).Error("failed to find project")
	}

	workspace, err := r.getWorkspace(project.WorkspaceID)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error querying workspace"))
	}

	// Filter out empty errors
	var filteredErrors []*publicModel.BackendErrorObjectInput
	for _, errorObject := range errorObjects {
		if r.isExcludedError(ctx, project.ErrorFilters, errorObject.Event, project.ID) {
			continue
		}
		filteredErrors = append(filteredErrors, errorObject)
	}
	errorObjects = filteredErrors

	if len(errorObjects) == 0 {
		return
	}

	// Count the number of errors for each project
	errorsBySession := make(map[string]int64)
	for _, err := range errorObjects {
		if err.SessionSecureID != nil {
			errorsBySession[*err.SessionSecureID] += 1
		}
	}

	r.updateErrorsCount(ctx, errorsBySession, len(errorObjects), model.ErrorType.BACKEND)

	err = r.MarkBackendSetupImpl(ctx, projectID, model.MarkBackendSetupTypeError)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "Error marking backend error setup"))
	}

	// put errors in db
	putErrorsToDBSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.processBackendPayload",
		tracer.ResourceName("db.errors"))
	groupedErrors := make(map[int][]*model.ErrorObject)
	groups := make(map[int]struct {
		Group      *model.ErrorGroup
		VisitedURL string
		SessionObj *model.Session
	})
	for _, v := range errorObjects {
		_, err := json.Marshal(v.StackTrace)
		if err != nil {
			log.WithContext(ctx).Errorf("Error marshaling trace: %v", v.StackTrace)
			continue
		}

		if v.Source == "" {
			v.Source = privateModel.LogSourceBackend.String()
		}

		errorToInsert := &model.ErrorObject{
			ProjectID:      projectID,
			SessionID:      sessionID,
			TraceID:        v.TraceID,
			SpanID:         v.SpanID,
			LogCursor:      v.LogCursor,
			Environment:    session.Environment,
			Event:          v.Event,
			Type:           model.ErrorType.BACKEND,
			URL:            v.URL,
			Source:         v.Source,
			OS:             session.OSName,
			Browser:        session.BrowserName,
			StackTrace:     &v.StackTrace,
			Timestamp:      v.Timestamp,
			Payload:        v.Payload,
			RequestID:      v.RequestID,
			ServiceName:    v.Service.Name,
			ServiceVersion: v.Service.Version,
		}

		var structuredStackTrace []*privateModel.ErrorTrace

		err = json.Unmarshal([]byte(v.StackTrace), &structuredStackTrace)
		if err != nil {
			structuredStackTrace, err = stacktraces.StructureOTELStackTrace(v.StackTrace)
			if err != nil {
				log.WithContext(ctx).Errorf("Failed to generate structured stacktrace %v", v.StackTrace)
			}
		}

		group, err := r.HandleErrorAndGroup(ctx, errorToInsert, structuredStackTrace, extractErrorFields(session, errorToInsert), projectID, workspace)
		if err != nil {
			if e.Is(err, ErrNoisyError) {
				log.WithContext(ctx).Warn(e.Wrap(err, "Error updating error group"))
			} else if e.Is(err, ErrQuotaExceeded) {
				log.WithContext(ctx).Warn(e.Wrap(err, "Error updating error group"))
			} else if e.Is(err, ErrUserFilteredError) {
				log.WithContext(ctx).Info(e.Wrap(err, "Error updating error group"))
			} else {
				log.WithContext(ctx).Error(e.Wrap(err, "Error updating error group"))
			}
			continue
		}

		groups[group.ID] = struct {
			Group      *model.ErrorGroup
			VisitedURL string
			SessionObj *model.Session
		}{Group: group, VisitedURL: errorToInsert.URL, SessionObj: session}
		groupedErrors[group.ID] = append(groupedErrors[group.ID], errorToInsert)
	}

	var newInstances []*model.ErrorObject
	for _, errorInstances := range groupedErrors {
		newInstances = append(newInstances, errorInstances...)
		instance := errorInstances[len(errorInstances)-1]
		data := groups[instance.ErrorGroupID]
		r.sendErrorAlert(ctx, data.Group.ProjectID, data.SessionObj, data.Group, instance, data.VisitedURL)
	}

	influxSpan := tracer.StartSpan("public-graph.recordErrorGroupMetrics", tracer.ChildOf(putErrorsToDBSpan.Context()),
		tracer.ResourceName("influx.errors"))
	for groupID, errorObjects := range groupedErrors {
		errorGroup := groups[groupID].Group
		if err := r.RecordErrorGroupMetrics(ctx, errorGroup, errorObjects); err != nil {
			log.WithContext(ctx).WithFields(log.Fields{
				"project_id":     projectID,
				"error_group_id": groupID,
			}).Error(err)
		}
	}
	influxSpan.Finish()

	if settings, err := r.Store.GetAllWorkspaceSettings(ctx, workspace.ID); err == nil && settings.ErrorEmbeddingsWrite {
		eSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.processBackendPayload",
			tracer.ResourceName("BatchGenerateEmbeddings"))
		if err = r.BatchGenerateEmbeddings(ctx, newInstances); err != nil {
			log.WithContext(ctx).WithError(err).WithField("project_id", projectID).Error("failed to generate embeddings")
		}
		eSpan.Finish(tracer.WithError(err))
	}
	putErrorsToDBSpan.Finish()
}

func (r *Resolver) RecordErrorGroupMetrics(ctx context.Context, errorGroup *model.ErrorGroup, errors []*model.ErrorObject) error {
	var points []timeseries.Point
	sessions := make(map[int]*model.Session)
	for _, e := range errors {
		if e.SessionID == nil {
			continue
		}
		if _, ok := sessions[*e.SessionID]; !ok {
			sess, err := r.Store.GetSession(ctx, *e.SessionID)
			if err != nil {
				return err
			}
			sessions[*e.SessionID] = sess
		}
		tags := map[string]string{
			"ErrorGroupID": strconv.Itoa(errorGroup.ID),
			"SessionID":    strconv.Itoa(*e.SessionID),
		}
		identifier := sessions[*e.SessionID].Identifier
		if identifier == "" {
			identifier = sessions[*e.SessionID].ClientID
		}
		fields := map[string]interface{}{
			"Environment": e.Environment,
			"Identifier":  identifier,
		}
		points = append(points, timeseries.Point{
			Time:   e.Timestamp,
			Tags:   tags,
			Fields: fields,
		})
	}
	r.TDB.Write(ctx, strconv.Itoa(errorGroup.ProjectID), timeseries.Errors, points)
	return nil
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

func (r *Resolver) SaveSessionData(ctx context.Context, projectId, sessionId, payloadId int, saveToS3, isBeacon bool, payloadType model.RawPayloadType, data []byte) error {
	redisSpan, redisCtx := tracer.StartSpanFromContext(ctx, "public-graph.SaveSessionData",
		tracer.ResourceName("go.parseEvents.processWithRedis"), tracer.Tag("project_id", projectId), tracer.Tag("payload_type", payloadType))
	score := float64(payloadId)
	// A little bit of a hack to encode
	if isBeacon {
		score += .5
	}

	if saveToS3 {
		zRangeSpan, _ := tracer.StartSpanFromContext(redisCtx, "public-graph.SaveSessionData",
			tracer.ResourceName("go.parseEvents.processWithRedis.getRawZRange"), tracer.Tag("project_id", projectId))
		zRange, err := r.Redis.GetRawZRange(ctx, sessionId, payloadId)
		if err != nil {
			return e.Wrap(err, "error retrieving previous event objects")
		}
		zRangeSpan.Finish()

		// If there are prior events, push them to S3 and remove them from Redis
		if len(zRange) != 0 {
			pushToS3Span, _ := tracer.StartSpanFromContext(redisCtx, "public-graph.SaveSessionData",
				tracer.ResourceName("go.parseEvents.processWithRedis.pushToS3"), tracer.Tag("project_id", projectId))
			if err := r.StorageClient.PushRawEvents(ctx, sessionId, projectId, payloadType, zRange); err != nil {
				return e.Wrap(err, "error pushing events to S3")
			}
			pushToS3Span.Finish()

			values := []interface{}{}
			for _, z := range zRange {
				values = append(values, z.Member)
			}

			removeValuesSpan, _ := tracer.StartSpanFromContext(redisCtx, "public-graph.SaveSessionData",
				tracer.ResourceName("go.parseEvents.processWithRedis.removeValues"), tracer.Tag("project_id", projectId))
			if err := r.Redis.RemoveValues(ctx, sessionId, values); err != nil {
				return e.Wrap(err, "error removing previous values")
			}
			removeValuesSpan.Finish()
		}
	}

	if err := r.Redis.AddPayload(ctx, sessionId, score, payloadType, data); err != nil {
		return e.Wrap(err, "error adding event payload")
	}
	redisSpan.Finish()

	return nil
}

func (r *Resolver) ProcessPayload(ctx context.Context, sessionSecureID string, events publicModel.ReplayEventsInput, messages string, resources string, webSocketEvents *string, errors []*publicModel.ErrorObjectInput, isBeacon bool, hasSessionUnloaded bool, highlightLogs *string, payloadId *int) error {
	// old clients do not send web socket events, so the value can be nil.
	// use this str as a simpler way to reference
	webSocketEventsStr := ""
	if webSocketEvents != nil {
		webSocketEventsStr = *webSocketEvents
	}
	querySessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload", tracer.ResourceName("db.querySession"))
	querySessionSpan.SetTag("sessionSecureID", sessionSecureID)
	querySessionSpan.SetTag("messagesLength", len(messages))
	querySessionSpan.SetTag("resourcesLength", len(resources))
	querySessionSpan.SetTag("webSocketEventsLength", len(webSocketEventsStr))
	querySessionSpan.SetTag("numberOfErrors", len(errors))
	querySessionSpan.SetTag("numberOfEvents", len(events.Events))
	if highlightLogs != nil {
		logsArray := strings.Split(*highlightLogs, "\n")
		for _, clientLog := range logsArray {
			if clientLog != "" {
				log.WithContext(ctx).Warnf("[Client]%s", clientLog)
			}
		}
	}
	if sessionSecureID == "" {
		return e.New("ProcessPayload called without secureID")
	}
	sessionObj := &model.Session{}
	if err := r.DB.Where(&model.Session{SecureID: sessionSecureID}).Limit(1).Take(&sessionObj).Error; err != nil {
		retErr := e.Wrapf(err, "error reading from session %v", sessionSecureID)
		log.WithContext(ctx).Error(retErr)
		querySessionSpan.Finish(tracer.WithError(retErr))
		return retErr
	}
	querySessionSpan.SetTag("secure_id", sessionObj.SecureID)
	querySessionSpan.SetTag("project_id", sessionObj.ProjectID)
	querySessionSpan.Finish()
	sessionID := sessionObj.ID

	// If the session is processing or processed, set ResumedAfterProcessedTime and continue
	if (sessionObj.Lock.Valid && !sessionObj.Lock.Time.IsZero()) || (sessionObj.Processed != nil && *sessionObj.Processed) {
		if sessionObj.ResumedAfterProcessedTime == nil {
			now := time.Now()
			if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).Update("ResumedAfterProcessedTime", &now).Error; err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error updating session ResumedAfterProcessedTime"))
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
	settings, err := r.Store.GetAllWorkspaceSettingsByProject(ctx, projectID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get workspace settings from project to check asset replacement")
	}

	g.Go(func() error {
		defer util.Recover()
		parseEventsSpan, parseEventsCtx := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.parseEvents"), tracer.Tag("project_id", projectID))
		defer parseEventsSpan.Finish()
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
				log.WithContext(ctx).Error(e.Wrap(err, "failed to add track properties"))
			}

			var lastUserInteractionTimestamp time.Time
			hasFullSnapshot := false
			for _, event := range parsedEvents.Events {
				if event.Type == parse.FullSnapshot || event.Type == parse.IncrementalSnapshot {
					snapshot, err := parse.NewSnapshot(event.Data)
					if err != nil {
						log.WithContext(ctx).Error(e.Wrap(err, "Error unmarshalling snapshot"))
						continue
					}

					jsSpan, _ := tracer.StartSpanFromContext(parseEventsCtx, "public-graph.pushPayload",
						tracer.ResourceName("go.parseEvents.EscapeJavascript"), tracer.Tag("project_id", projectID))
					// escape script tags in any javascript
					err = snapshot.EscapeJavascript(ctx)
					jsSpan.Finish(tracer.WithError(err))
					if err != nil {
						log.WithContext(ctx).Error(e.Wrap(err, "Error escaping snapshot javascript"))
					}

					// Replace any static resources with our own, hosted in S3
					if settings != nil && settings.ReplaceAssets {
						assetsSpan, _ := tracer.StartSpanFromContext(parseEventsCtx, "public-graph.pushPayload",
							tracer.ResourceName("go.parseEvents.replaceAssets"), tracer.Tag("project_id", projectID), tracer.Tag("session_secure_id", sessionSecureID))
						err = snapshot.ReplaceAssets(ctx, projectID, r.StorageClient, r.DB, r.Redis)
						assetsSpan.Finish()
						if err != nil {
							log.WithContext(ctx).Error(e.Wrap(err, "error replacing assets"))
						}
					}

					if event.Type == parse.FullSnapshot {
						hasFullSnapshot = true
						stylesheetsSpan, _ := tracer.StartSpanFromContext(parseEventsCtx, "public-graph.pushPayload",
							tracer.ResourceName("go.parseEvents.InjectStylesheets"), tracer.Tag("project_id", projectID))
						// If we see a snapshot event, attempt to inject CORS stylesheets.
						err := snapshot.InjectStylesheets()
						stylesheetsSpan.Finish(tracer.WithError(err))
						if err != nil {
							log.WithContext(ctx).Error(e.Wrap(err, "Error injecting snapshot stylesheets"))
						}
					}
					if event.Type == parse.IncrementalSnapshot {
						incrementalEventSpan, _ := tracer.StartSpanFromContext(parseEventsCtx, "public-graph.pushPayload",
							tracer.ResourceName("go.parseEvents.incrementalEvent"), tracer.Tag("project_id", projectID))
						mouseInteractionEventData, err := parse.UnmarshallMouseInteractionEvent(event.Data)
						incrementalEventSpan.Finish(tracer.WithError(err))
						if err != nil {
							log.WithContext(ctx).Error(e.Wrap(err, "Error unmarshalling incremental event"))
						}
						if userEvent := map[parse.EventSource]bool{
							parse.MouseMove: true, parse.MouseInteraction: true, parse.Scroll: true,
							parse.Input: true, parse.TouchMove: true, parse.Drag: true,
						}[*mouseInteractionEventData.Source]; userEvent {
							lastUserInteractionTimestamp = event.Timestamp.Round(time.Millisecond)
						}
					}

					if event.Data, err = snapshot.Encode(); err != nil {
						log.WithContext(ctx).Error(e.Wrap(err, "Error encoding snapshot"))
						continue
					}
				}
			}

			remarshalSpan, _ := tracer.StartSpanFromContext(parseEventsCtx, "public-graph.pushPayload",
				tracer.ResourceName("go.parseEvents.remarshalEvents"), tracer.Tag("project_id", projectID))
			// Re-format as a string to write to the db.
			b, err := json.Marshal(parsedEvents)
			if err != nil {
				return e.Wrap(err, "error marshaling events from schema interfaces")
			}
			remarshalSpan.Finish()

			if err := r.SaveSessionData(parseEventsCtx, projectID, sessionID, payloadIdDeref, hasFullSnapshot, isBeacon, model.PayloadTypeEvents, b); err != nil {
				return e.Wrap(err, "error saving events data")
			}

			if !lastUserInteractionTimestamp.IsZero() {
				if err := r.DB.Model(&sessionObj).Updates(&model.Session{
					LastUserInteractionTime: lastUserInteractionTimestamp,
				}).Error; err != nil {
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

		if err := hlog.SubmitFrontendConsoleMessages(ctx, projectID, sessionSecureID, messages); err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to parse console messages")
		}

		return nil
	})

	// unmarshal resources
	g.Go(func() error {
		defer util.Recover()
		unmarshalResourcesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.unmarshal.resources"), tracer.Tag("project_id", projectID))
		defer unmarshalResourcesSpan.Finish()

		if err := r.SaveSessionData(ctx, projectID, sessionID, payloadIdDeref, false, isBeacon, model.PayloadTypeResources, []byte(resources)); err != nil {
			return e.Wrap(err, "error saving resources data")
		}

		return nil
	})

	// unmarshal WebSocket events
	g.Go(func() error {
		defer util.Recover()
		if webSocketEventsStr != "" {
			unmarshalWebSocketEventsSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
				tracer.ResourceName("go.unmarshal.web_socket_events"), tracer.Tag("project_id", projectID))
			defer unmarshalWebSocketEventsSpan.Finish()

			if err := r.SaveSessionData(ctx, projectID, sessionID, payloadIdDeref, false, isBeacon, model.PayloadTypeWebSocketEvents, []byte(webSocketEventsStr)); err != nil {
				return e.Wrap(err, "error saving web socket events data")
			}
		}

		return nil
	})

	// process errors
	g.Go(func() error {
		defer util.Recover()
		if hasBeacon {
			r.DB.Where(&model.ErrorObject{SessionID: &sessionID, IsBeacon: true}).Delete(&model.ErrorObject{})
		}

		var project model.Project
		if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).Take(&project).Error; err != nil {
			return e.Wrap(err, "error querying project")
		}
		workspace, err := r.getWorkspace(project.WorkspaceID)
		if err != nil {
			return e.Wrap(err, "error querying workspace")
		}

		// filter out empty errors
		seenEvents := map[string]*publicModel.ErrorObjectInput{}
		for _, errorObject := range errors {
			if r.isExcludedError(ctx, project.ErrorFilters, errorObject.Event, project.ID) {
				continue
			}
			seenEvents[errorObject.Event] = errorObject
		}
		errors = lo.Values(seenEvents)

		// increment daily error table
		numErrors := int64(len(errors))
		if numErrors > 0 {
			r.updateErrorsCount(ctx, map[string]int64{sessionSecureID: numErrors}, len(errors), model.ErrorType.FRONTEND)
		}

		// put errors in db
		putErrorsToDBSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("db.errors"), tracer.Tag("project_id", projectID))
		groupedErrors := make(map[int][]*model.ErrorObject)
		groups := make(map[int]struct {
			Group      *model.ErrorGroup
			VisitedURL string
			SessionObj *model.Session
		})

		for _, v := range errors {
			traceBytes, err := json.Marshal(v.StackTrace)
			if err != nil {
				log.WithContext(ctx).Errorf("Error marshaling trace: %v", v.StackTrace)
				continue
			}

			traceString := string(traceBytes)

			errorToInsert := &model.ErrorObject{
				ProjectID:    projectID,
				SessionID:    &sessionID,
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

			mappedStackTrace, structuredStackTrace, err := r.getMappedStackTraceString(ctx, v.StackTrace, projectID, errorToInsert)

			if err != nil {
				log.WithContext(ctx).Errorf("Error generating mapped stack trace: %v", v.StackTrace)
				continue
			}

			errorToInsert.MappedStackTrace = mappedStackTrace

			group, err := r.HandleErrorAndGroup(ctx, errorToInsert, structuredStackTrace, extractErrorFields(sessionObj, errorToInsert), projectID, workspace)

			if err != nil {
				if e.Is(err, ErrNoisyError) {
					log.WithContext(ctx).Warn(e.Wrap(err, "Error updating error group"))
				} else if e.Is(err, ErrQuotaExceeded) {
					log.WithContext(ctx).Warn(e.Wrap(err, "Error updating error group"))
				} else {
					log.WithContext(ctx).Error(e.Wrap(err, "Error updating error group"))
				}
				continue
			}

			groups[group.ID] = struct {
				Group      *model.ErrorGroup
				VisitedURL string
				SessionObj *model.Session
			}{Group: group, VisitedURL: errorToInsert.URL, SessionObj: sessionObj}
			groupedErrors[group.ID] = append(groupedErrors[group.ID], errorToInsert)
		}

		influxSpan := tracer.StartSpan("public-graph.pushPayload", tracer.ChildOf(putErrorsToDBSpan.Context()),
			tracer.ResourceName("influx.errors"))
		for groupID, errorObjects := range groupedErrors {
			errorGroup := groups[groupID].Group
			if err := r.RecordErrorGroupMetrics(ctx, errorGroup, errorObjects); err != nil {
				log.WithContext(ctx).WithFields(log.Fields{
					"project_id":     projectID,
					"error_group_id": groupID,
				}).Error(err)
			}
		}
		influxSpan.Finish()

		var newInstances []*model.ErrorObject
		for _, errorInstances := range groupedErrors {
			newInstances = append(newInstances, errorInstances...)
			instance := errorInstances[len(errorInstances)-1]
			data := groups[instance.ErrorGroupID]
			r.sendErrorAlert(ctx, data.Group.ProjectID, data.SessionObj, data.Group, instance, data.VisitedURL)
		}

		if settings, err := r.Store.GetAllWorkspaceSettings(ctx, workspace.ID); err == nil && settings.ErrorEmbeddingsWrite {
			eSpan := tracer.StartSpan("public-graph.pushPayload", tracer.ChildOf(putErrorsToDBSpan.Context()),
				tracer.ResourceName("BatchGenerateEmbeddings"))
			if err = r.BatchGenerateEmbeddings(ctx, newInstances); err != nil {
				log.WithContext(ctx).WithError(err).WithField("session_secure_id", sessionObj.SecureID).Error("failed to generate embeddings")
			}
			eSpan.Finish(tracer.WithError(err))
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

	updateSpan, updateSpanCtx := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload", tracer.ResourceName("doSessionFieldsUpdate"))
	defer updateSpan.Finish()

	excluded, reason := r.isSessionExcluded(ctx, sessionObj, sessionHasErrors)

	// Update only if any of these fields are changing
	// Update the PayloadUpdatedAt field only if it's been >15s since the last one
	doUpdate := sessionObj.PayloadUpdatedAt == nil ||
		now.Sub(*sessionObj.PayloadUpdatedAt) > 15*time.Second ||
		beaconTime != nil ||
		hasSessionUnloaded != sessionObj.HasUnloaded ||
		(sessionObj.Processed != nil && *sessionObj.Processed) ||
		(sessionObj.ObjectStorageEnabled != nil && *sessionObj.ObjectStorageEnabled) ||
		(sessionObj.Chunked != nil && *sessionObj.Chunked) ||
		(sessionHasErrors && (sessionObj.HasErrors == nil || !*sessionObj.HasErrors))

	if doUpdate && !excluded {
		// By default, GORM will not update non-zero fields. This is undesirable for boolean columns.
		// By explicitly specifying the columns to update, we can override the behavior.
		// See https://gorm.io/docs/update.html#Updates-multiple-columns
		if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).
			Select("PayloadUpdatedAt", "BeaconTime", "HasUnloaded", "Processed", "ObjectStorageEnabled", "Chunked", "DirectDownloadEnabled", "Excluded", "ExcludedReason", "HasErrors").
			Updates(&model.Session{
				PayloadUpdatedAt:      &now,
				BeaconTime:            beaconTime,
				HasUnloaded:           hasSessionUnloaded,
				Processed:             &model.F,
				ObjectStorageEnabled:  &model.F,
				DirectDownloadEnabled: false,
				Chunked:               &model.F,
				Excluded:              false,
				ExcludedReason:        nil,
				HasErrors:             &sessionHasErrors,
			}).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error updating session"))
			return err
		}
	} else if excluded {
		// Only update the excluded flag and reason if either have changed
		var reasonDeref, newReasonDeref privateModel.SessionExcludedReason
		if sessionObj.ExcludedReason != nil {
			reasonDeref = *sessionObj.ExcludedReason
		}
		if reason != nil {
			newReasonDeref = *reason
		}
		if sessionObj.Excluded != excluded || reasonDeref != newReasonDeref {
			if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).
				Select("Excluded", "ExcludedReason").Updates(&model.Session{
				Excluded:       excluded,
				ExcludedReason: reason,
			}).Error; err != nil {
				return err
			}
			if err := r.OpenSearch.UpdateAsync(ctx, opensearch.IndexSessions, sessionObj.ID, map[string]interface{}{
				"Excluded":       excluded,
				"ExcludedReason": reason,
			}); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error updating session in opensearch"))
				return err
			}
			if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(sessionObj.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: sessionObj.ID}}); err != nil {
				return err
			}
		}
	}

	opensearchSpan, osCtx := tracer.StartSpanFromContext(updateSpanCtx, "public-graph.pushPayload", tracer.ResourceName("opensearch.update"))
	defer opensearchSpan.Finish()
	// If the session was previously marked as processed, clear this
	// in OpenSearch so that it's treated as a live session again.
	// If the session was previously excluded (as we do with new sessions by default),
	// clear it so it is shown as live in OpenSearch since we now have data for it.
	if (sessionObj.Processed != nil && *sessionObj.Processed) || (!excluded) {
		if err := r.OpenSearch.UpdateAsync(osCtx, opensearch.IndexSessions, sessionObj.ID, map[string]interface{}{
			"processed":  false,
			"Excluded":   false,
			"has_errors": sessionHasErrors,
		}); err != nil {
			log.WithContext(osCtx).Error(e.Wrap(err, "error updating session in opensearch"))
			return err
		}
		if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(sessionObj.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: sessionObj.ID}}); err != nil {
			return err
		}
	}

	if sessionHasErrors && (sessionObj.HasErrors == nil || !*sessionObj.HasErrors) {
		if err := r.OpenSearch.UpdateAsync(osCtx, opensearch.IndexSessions, sessionObj.ID, map[string]interface{}{
			"has_errors": true,
		}); err != nil {
			log.WithContext(osCtx).Error(e.Wrap(err, "error setting has_errors on session in opensearch"))
			return err
		}
		if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(sessionObj.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: sessionObj.ID}}); err != nil {
			return err
		}
	}

	// if the session changed from excluded to not excluded, it is viewable, so send any relevant alerts
	if sessionObj.Excluded && !excluded {
		return r.HandleSessionViewable(osCtx, projectID, sessionObj)
	}

	return nil
}

// HandleSessionViewable is called after the first events to a session are written.
// It handles any alerts that must be sent for this session after it is able to be played.
func (r *Resolver) HandleSessionViewable(ctx context.Context, projectID int, session *model.Session) error {
	project, err := r.getProject(projectID)
	if err != nil {
		return err
	}

	workspace, err := r.getWorkspace(project.WorkspaceID)
	if err != nil {
		return err
	}

	g := errgroup.Group{}
	g.Go(func() error {
		return r.SendSessionInitAlert(ctx, workspace, projectID, session.ID)
	})
	if session.FirstTime != nil && *session.FirstTime {
		g.Go(func() error {
			return r.SendSessionIdentifiedAlert(ctx, workspace, session)
		})
	}
	return g.Wait()
}

func (r *Resolver) SendSessionInitAlert(ctx context.Context, workspace *model.Workspace, projectID, sessionID int) error {
	// Sending session init alert
	var sessionAlerts []*model.SessionAlert
	if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID, Disabled: &model.F}}).
		Where("type=?", model.AlertType.NEW_SESSION).Find(&sessionAlerts).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error fetching new session alert", projectID))
		return err
	}

	sessionObj := &model.Session{}
	if err := r.DB.Preload("Fields").Where(&model.Session{Model: model.Model{ID: sessionID}}).Take(&sessionObj).Error; err != nil {
		retErr := e.Wrapf(err, "error reading from session %v", sessionID)
		log.WithContext(ctx).Error(retErr)
		return nil
	}

	for _, sessionAlert := range sessionAlerts {
		// skip alerts that have already been sent for this session
		var count int64
		if err := r.DB.Model(&model.SessionAlertEvent{}).Where(&model.SessionAlertEvent{
			SessionAlertID:  sessionAlert.ID,
			SessionSecureID: sessionObj.SecureID,
		}).Count(&count).Error; err != nil {
			continue
		}
		if count > 0 {
			continue
		}
		// check if session was produced from an excluded environment
		excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from new session alert", sessionObj.ProjectID))
			continue
		}

		isExcludedEnvironment := false
		for _, env := range excludedEnvironments {
			if env != nil && *env == sessionObj.Environment {
				isExcludedEnvironment = true
				break
			}
		}
		if isExcludedEnvironment {
			continue
		}

		// check if session was created by a should-ignore identifier
		excludedIdentifiers, err := sessionAlert.GetExcludeRules()
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error getting exclude rules from new session alert", sessionObj.ProjectID))
			continue
		}
		isSessionByExcludedIdentifier := false
		for _, identifier := range excludedIdentifiers {
			if identifier != nil && *identifier == sessionObj.Identifier {
				isSessionByExcludedIdentifier = true
				break
			}
		}
		if isSessionByExcludedIdentifier {
			continue
		}

		var userProperties map[string]string
		if sessionObj.UserProperties != "" {
			userProperties, err = sessionObj.GetUserProperties()
			if err != nil {
				log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error getting user properties from new user alert", sessionObj.ProjectID))
				continue
			}
		}

		var visitedUrl *string
		for _, field := range sessionObj.Fields {
			if field.Type == "session" && field.Name == "visited-url" {
				visitedUrl = &field.Value
				break
			}
		}

		hookPayload := zapier.HookPayload{
			UserIdentifier: sessionObj.Identifier, UserObject: sessionObj.UserObject, UserProperties: userProperties, URL: visitedUrl,
		}
		if err := r.RH.Notify(sessionObj.ProjectID, fmt.Sprintf("SessionAlert_%d", sessionAlert.ID), hookPayload); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error sending new session alert to zapier", sessionObj.ProjectID))
		}

		sessionAlert.SendAlerts(ctx, r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: sessionObj.SecureID, UserIdentifier: sessionObj.Identifier, UserObject: sessionObj.UserObject, UserProperties: userProperties, URL: visitedUrl})
		if err = alerts.SendNewSessionAlert(alerts.SendNewSessionAlertEvent{
			Session:      sessionObj,
			SessionAlert: sessionAlert,
			Workspace:    workspace,
			VisitedURL:   visitedUrl,
		}); err != nil {
			log.WithContext(ctx).Error(err)
		}
	}
	return nil
}

func (r *Resolver) SendSessionTrackPropertiesAlert(ctx context.Context, workspace *model.Workspace, session *model.Session, properties map[string]string) error {
	alertWorkerSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.AppendProperties",
		tracer.ResourceName("go.sessions.AppendProperties.alertWorker"), tracer.Tag("sessionID", session.ID))
	defer alertWorkerSpan.Finish()
	// Sending Track Properties Alert
	var sessionAlerts []*model.SessionAlert
	if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type=?", model.AlertType.TRACK_PROPERTIES).Find(&sessionAlerts).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error fetching track properties alert", session.ProjectID))
		return err
	}

	for _, sessionAlert := range sessionAlerts {
		// skip alerts that have already been sent for this session
		var count int64
		if err := r.DB.Model(&model.SessionAlertEvent{}).Where(&model.SessionAlertEvent{
			SessionAlertID:  sessionAlert.ID,
			SessionSecureID: session.SecureID,
		}).Count(&count).Error; err != nil {
			continue
		}
		if count > 0 {
			continue
		}
		excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from track properties alert", session.ProjectID))
			continue
		}
		isExcludedEnvironment := false
		for _, env := range excludedEnvironments {
			if env != nil && *env == session.Environment {
				isExcludedEnvironment = true
				break
			}
		}
		if isExcludedEnvironment {
			continue
		}

		// get matched track properties between the alert and session
		trackProperties, err := sessionAlert.GetTrackProperties()
		if err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error getting track properties from session"))
			continue
		}
		var trackPropertyIds []int
		for _, trackProperty := range trackProperties {
			trackPropertyIds = append(trackPropertyIds, trackProperty.ID)
		}
		stmt := r.DB.Model(&model.Field{}).
			Where(&model.Field{ProjectID: session.ProjectID, Type: "track"}).
			Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", session.ID).
			Where("id IN ?", trackPropertyIds)
		var matchedFields []*model.Field
		if err := stmt.Find(&matchedFields).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error querying matched fields by session_id"))
			continue
		}
		if len(matchedFields) < 1 {
			continue
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
				relatedFields = append(relatedFields, &model.Field{ProjectID: session.ProjectID, Name: k, Value: fv, Type: string(PropertyType.TRACK)})
			}
		}

		// If the lengths are the same then there were not matched properties, so we don't need to send an alert.
		if len(relatedFields) == len(properties) {
			continue
		}

		hookPayload := zapier.HookPayload{
			UserIdentifier: session.Identifier, MatchedFields: matchedFields, RelatedFields: relatedFields, UserObject: session.UserObject,
		}
		if err := r.RH.Notify(session.ProjectID, fmt.Sprintf("SessionAlert_%d", sessionAlert.ID), hookPayload); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error notifying zapier (session alert id: %d)", sessionAlert.ID))
		}

		sessionAlert.SendAlerts(ctx, r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: session.SecureID, UserIdentifier: session.Identifier, MatchedFields: matchedFields, RelatedFields: relatedFields, UserObject: session.UserObject})
		if err = alerts.SendTrackPropertiesAlert(alerts.TrackPropertiesAlertEvent{
			Session:       session,
			SessionAlert:  sessionAlert,
			Workspace:     workspace,
			MatchedFields: matchedFields,
			RelatedFields: relatedFields,
		}); err != nil {
			log.WithContext(ctx).Error(err)
		}
	}
	return nil
}

func (r *Resolver) SendSessionIdentifiedAlert(ctx context.Context, workspace *model.Workspace, session *model.Session) error {
	// Sending New User Alert
	var sessionAlerts []*model.SessionAlert
	if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type=?", model.AlertType.NEW_USER).Find(&sessionAlerts).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error fetching new user alert", session.ProjectID))
		return err
	}

	refetchedSession := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: session.ID}}).Take(&refetchedSession).Error; err != nil {
		retErr := e.Wrapf(err, "error reading from session %v", session.ID)
		log.WithContext(ctx).Error(retErr)
		return err
	}
	// get produced user properties from session
	userProperties, err := refetchedSession.GetUserProperties()
	if err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error getting user properties from new user alert", refetchedSession.ProjectID))
		return err
	}

	for _, sessionAlert := range sessionAlerts {
		// skip alerts that have already been sent for this session
		var count int64
		if err := r.DB.Model(&model.SessionAlertEvent{}).Where(&model.SessionAlertEvent{
			SessionAlertID:  sessionAlert.ID,
			SessionSecureID: session.SecureID,
		}).Count(&count).Error; err != nil {
			continue
		}
		if count > 0 {
			continue
		}
		// check if session was produced from an excluded environment
		excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from new user alert", refetchedSession.ProjectID))
			continue
		}
		isExcludedEnvironment := false
		for _, env := range excludedEnvironments {
			if env != nil && *env == refetchedSession.Environment {
				isExcludedEnvironment = true
				break
			}
		}
		if isExcludedEnvironment {
			continue
		}

		hookPayload := zapier.HookPayload{
			UserIdentifier: session.Identifier, UserProperties: userProperties, UserObject: session.UserObject,
		}
		if err := r.RH.Notify(session.ProjectID, fmt.Sprintf("SessionAlert_%d", sessionAlert.ID), hookPayload); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error sending alert to zapier", session.ProjectID))
		}

		sessionAlert.SendAlerts(ctx, r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: refetchedSession.SecureID, UserIdentifier: refetchedSession.Identifier, UserProperties: userProperties, UserObject: refetchedSession.UserObject})
		if err = alerts.SendNewUserAlert(alerts.SendNewUserAlertEvent{
			Session:      session,
			SessionAlert: sessionAlert,
			Workspace:    workspace,
		}); err != nil {
			log.WithContext(ctx).Error(err)
			continue
		}
	}
	return nil
}

func (r *Resolver) SendSessionUserPropertiesAlert(ctx context.Context, workspace *model.Workspace, session *model.Session) error {
	// Sending User Properties Alert
	var sessionAlerts []*model.SessionAlert
	if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type=?", model.AlertType.USER_PROPERTIES).Find(&sessionAlerts).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error fetching user properties alert", session.ProjectID))
		return err
	}

	for _, sessionAlert := range sessionAlerts {
		// skip alerts that have already been sent for this session
		var count int64
		if err := r.DB.Model(&model.SessionAlertEvent{}).Where(&model.SessionAlertEvent{
			SessionAlertID:  sessionAlert.ID,
			SessionSecureID: session.SecureID,
		}).Count(&count).Error; err != nil {
			continue
		}
		if count > 0 {
			continue
		}
		// check if session was produced from an excluded environment
		excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from user properties alert", session.ProjectID))
			continue
		}
		isExcludedEnvironment := false
		for _, env := range excludedEnvironments {
			if env != nil && *env == session.Environment {
				isExcludedEnvironment = true
				break
			}
		}
		if isExcludedEnvironment {
			continue
		}

		// get matched user properties between the alert and session
		userProperties, err := sessionAlert.GetUserProperties()
		if err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error getting user properties from session"))
			continue
		}
		var userPropertyIds []int
		for _, userProperty := range userProperties {
			userPropertyIds = append(userPropertyIds, userProperty.ID)
		}
		stmt := r.DB.Model(&model.Field{}).
			Where(&model.Field{ProjectID: session.ProjectID, Type: "user"}).
			Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", session.ID).
			Where("id IN ?", userPropertyIds)
		var matchedFields []*model.Field
		if err := stmt.Find(&matchedFields).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error querying matched fields by session_id"))
			continue
		}
		if len(matchedFields) < 1 {
			continue
		}

		hookPayload := zapier.HookPayload{
			UserIdentifier: session.Identifier, MatchedFields: matchedFields, UserObject: session.UserObject,
		}
		if err := r.RH.Notify(session.ProjectID, fmt.Sprintf("SessionAlert_%d", sessionAlert.ID), hookPayload); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error notifying zapier (session alert id: %d)", sessionAlert.ID))
		}

		sessionAlert.SendAlerts(ctx, r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: session.SecureID, UserIdentifier: session.Identifier, MatchedFields: matchedFields, UserObject: session.UserObject})
		if err = alerts.SendUserPropertiesAlert(alerts.UserPropertiesAlertEvent{
			SessionAlert:  sessionAlert,
			Session:       session,
			Workspace:     workspace,
			MatchedFields: matchedFields,
		}); err != nil {
			log.WithContext(ctx).Error(err)
		}
	}
	return nil
}

func (r *Resolver) isSessionExcluded(ctx context.Context, s *model.Session, sessionHasErrors bool) (bool, *privateModel.SessionExcludedReason) {
	var excluded bool
	var reason privateModel.SessionExcludedReason

	var project model.Project
	if err := r.DB.Raw("SELECT * FROM projects WHERE id = ?;", s.ProjectID).Scan(&project).Error; err != nil {
		log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier}).Errorf("error fetching project for session: %v", err)
		return false, nil
	}

	if r.isSessionUserExcluded(ctx, s, project) {
		excluded = true
		reason = privateModel.SessionExcludedReasonIgnoredUser
	}

	if r.isSessionExcludedForNoError(ctx, s, project, sessionHasErrors) {
		excluded = true
		reason = privateModel.SessionExcludedReasonNoError
	}

	if r.isSessionExcludedForNoUserEvents(ctx, s) {
		excluded = true
		reason = privateModel.SessionExcludedReasonNoUserEvents
	}

	return excluded, &reason
}

func (r *Resolver) isSessionExcludedForNoUserEvents(ctx context.Context, s *model.Session) bool {
	return s.LastUserInteractionTime.Unix() == 0
}

func (r *Resolver) isSessionExcludedForNoError(ctx context.Context, s *model.Session, project model.Project, sessionHasErrors bool) bool {
	projectFilterSettings, _ := r.Store.GetProjectFilterSettings(project)

	if projectFilterSettings.FilterSessionsWithoutError {
		return !sessionHasErrors
	}

	return false
}

func (r *Resolver) isSessionUserExcluded(ctx context.Context, s *model.Session, project model.Project) bool {
	if project.ExcludedUsers == nil {
		return false
	}
	var email string
	if s.UserProperties != "" {
		encodedProperties := []byte(s.UserProperties)
		decodedProperties := map[string]string{}
		err := json.Unmarshal(encodedProperties, &decodedProperties)
		if err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Errorf("Could not unmarshal user properties: %s, error: %v", s.UserProperties, err)
			return false
		}
		email = decodedProperties["email"]
	}
	for _, value := range []string{s.Identifier, email} {
		if value == "" {
			continue
		}
		for _, excludedExpr := range project.ExcludedUsers {
			matched, err := regexp.MatchString(excludedExpr, value)
			if err != nil {
				log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Errorf("error running regexp for excluded users: %s with value: %s, error: %v", excludedExpr, value, err.Error())
				return false
			} else if matched {
				return true
			}
		}
	}
	return false
}

func (r *Resolver) isExcludedError(ctx context.Context, errorFilters []string, errorEvent string, projectID int) bool {
	if errorEvent == "[{}]" {
		log.WithContext(ctx).
			WithField("project_id", projectID).
			Warn("ignoring empty error")
		return true
	}

	if cfg, err := r.Store.GetSystemConfiguration(ctx); err == nil {
		errorFilters = append(errorFilters, cfg.ErrorFilters...)
	}

	// Filter out by project.ErrorFilters, aka regexp filters
	var err error
	matchedRegexp := false
	for _, errorFilter := range errorFilters {
		matchedRegexp, err = regexp.MatchString(errorFilter, errorEvent)
		if err != nil {
			log.WithContext(ctx).
				WithField("project_id", projectID).
				WithField("regex", errorFilter).
				WithError(err).
				Error("invalid regex: failed to parse backend error filter")
			continue
		}

		if matchedRegexp {
			return true
		}
	}
	return false
}
