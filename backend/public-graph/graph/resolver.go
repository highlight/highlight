package graph

import (
	"compress/gzip"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"hash/fnv"
	"io"
	"net"
	"net/http"
	"net/mail"
	url2 "net/url"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/geolocation"
	"github.com/oschwald/geoip2-golang"

	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
	"go.opentelemetry.io/otel/trace"

	"go.opentelemetry.io/otel/attribute"
	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/PaesslerAG/jsonpath"
	"github.com/aws/smithy-go/ptr"
	"github.com/google/uuid"
	lru "github.com/hashicorp/golang-lru/v2"
	"github.com/highlight-run/go-resthooks"
	"github.com/mssola/user_agent"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/alerts"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/embeddings"
	"github.com/highlight-run/highlight/backend/errorgroups"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/parser"
	"github.com/highlight-run/highlight/backend/phonehome"
	"github.com/highlight-run/highlight/backend/pricing"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	modelInputs "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	publicModel "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/stacktraces"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/store"
	tempalerts "github.com/highlight-run/highlight/backend/temp-alerts"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/zapier"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	hmetric "github.com/highlight/highlight/sdk/highlight-go/metric"
)

// This file will not be regenerated automatically.
//
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB                *gorm.DB
	Tracer            trace.Tracer
	TracerNoResources trace.Tracer
	ProducerQueue     kafka_queue.MessageQueue
	BatchedQueue      kafka_queue.MessageQueue
	DataSyncQueue     kafka_queue.MessageQueue
	TracesQueue       kafka_queue.MessageQueue
	MailClient        *sendgrid.Client
	StorageClient     storage.Client
	EmbeddingsClient  embeddings.Client
	Redis             *redis.Client
	Clickhouse        *clickhouse.Client
	RH                *resthooks.Resthook
	Store             *store.Store
	LambdaClient      *lambda.Client
	SessionCache      *lru.Cache[string, *model.Session]
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
	ID         string `json:"id"`
	URL        string `json:"url"`
	Method     string `json:"verb"`
	HeadersRaw any    `json:"headers"`
	Body       any    `json:"body"`
}

type Response struct {
	Status     float64 `json:"status"`
	Size       float64 `json:"size"`
	HeadersRaw any     `json:"headers"`
	Body       any     `json:"body"`
}

type RequestResponsePairs struct {
	Request    Request  `json:"request"`
	Response   Response `json:"response"`
	URLBlocked bool     `json:"urlBlocked"`
}

type NetworkResource struct {
	// Deprecated, use the absolute version `StartTimeAbs` instead
	StartTime float64 `json:"startTime"`
	// Deprecated, use the absolute version `ResponseEndAbs` instead
	ResponseEnd float64 `json:"responseEnd"`

	StartTimeAbs             float64              `json:"startTimeAbs"`
	ResponseEndAbs           float64              `json:"responseEndAbs"`
	ConnectStartAbs          float64              `json:"connectStartAbs"`
	ConnectEndAbs            float64              `json:"connectEndAbs"`
	DomainLookupStartAbs     float64              `json:"domainLookupStartAbs"`
	DomainLookupEndAbs       float64              `json:"domainLookupEndAbs"`
	FetchStartAbs            float64              `json:"fetchStartAbs"`
	RedirectStartAbs         float64              `json:"redirectStartAbs"`
	RedirectEndAbs           float64              `json:"redirectEndAbs"`
	RequestStartAbs          float64              `json:"requestStartAbs"`
	ResponseStartAbs         float64              `json:"responseStartAbs"`
	SecureConnectionStartAbs float64              `json:"secureConnectionStartAbs"`
	WorkerStartAbs           float64              `json:"workerStartAbs"`
	DecodedBodySize          float64              `json:"decodedBodySize"`
	TransferSize             float64              `json:"transferSize"`
	EncodedBodySize          float64              `json:"encodedBodySize"`
	NextHopProtocol          string               `json:"nextHopProtocol"`
	InitiatorType            string               `json:"initiatorType"`
	Name                     string               `json:"name"`
	RequestResponsePairs     RequestResponsePairs `json:"requestResponsePairs"`
}

func (re *NetworkResource) Start(sessionStart time.Time) time.Time {
	start := time.UnixMicro(int64(1000. * re.StartTimeAbs))
	if start.Before(time.Date(2023, time.January, 1, 0, 0, 0, 0, time.UTC)) {
		start = sessionStart.Add(time.Microsecond * time.Duration(1000.*re.StartTime))
	}
	return start
}

func (re *NetworkResource) End(sessionStart time.Time) time.Time {
	end := time.UnixMicro(int64(1000. * re.ResponseEndAbs))
	if end.Before(time.Date(2023, time.January, 1, 0, 0, 0, 0, time.UTC)) {
		end = sessionStart.Add(time.Microsecond * time.Duration(1000.*re.ResponseEnd))
	}
	return end
}

const ERROR_EVENT_MAX_LENGTH = 10000

const SESSION_FIELD_MAX_LENGTH = 2000

const PAYLOAD_STAGING_COUNT_MAX = 100

var NumberRegex = regexp.MustCompile(`^\d+$`)

var ErrQuotaExceeded = e.New(string(publicModel.PublicGraphErrorBillingQuotaExceeded))
var ErrUserFilteredError = e.New("User filtered error")

var SessionProcessDelaySeconds = 120 // a session will be processed after not receiving events for this time
var SessionProcessLockMinutes = 30   // a session marked as processing can be reprocessed after this time
func init() {
	if env.IsDevEnv() {
		SessionProcessDelaySeconds = 8
		SessionProcessLockMinutes = 1
	}
}

// Change to AppendProperties(sessionId,properties,type)
func (r *Resolver) AppendProperties(ctx context.Context, sessionID int, properties map[string]string, propType Property) error {
	outerSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.AppendProperties",
		util.ResourceName("go.sessions.AppendProperties"), util.Tag("sessionID", sessionID))
	defer outerSpan.Finish()

	loadSessionSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.AppendProperties",
		util.ResourceName("go.sessions.AppendProperties.loadSessions"), util.Tag("sessionID", sessionID))
	session := &model.Session{}
	res := r.DB.WithContext(ctx).Where(&model.Session{Model: model.Model{ID: sessionID}}).Take(&session)
	if err := res.Error; err != nil {
		return e.Wrapf(err, "error getting session(id=%d) in append properties(type=%s)", sessionID, propType)
	}
	loadSessionSpan.Finish()

	propsSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.AppendProperties",
		util.ResourceName("processProperties"), util.Tag("num_properties", len(properties)))
	var modelFields []*model.Field
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
	propsSpan.Finish()

	if len(modelFields) > 0 {
		err := r.AppendFields(ctx, modelFields, session)
		if err != nil {
			return e.Wrap(err, "error appending fields")
		}
	}

	project, err := r.Store.GetProject(ctx, session.ProjectID)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error querying project"))
		return err
	}

	workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error querying workspace"))
		return err
	}

	if propType == PropertyType.USER {
		return r.SendSessionUserPropertiesAlert(ctx, workspace, project, session)
	} else if propType == PropertyType.TRACK {
		return r.SendSessionTrackPropertiesAlert(ctx, workspace, project, session, properties)
	}
	return nil
}

func (r *Resolver) CreateSessionEvents(ctx context.Context, sessionID int, events []*clickhouse.SessionEventRow) error {
	outerSpan, ctxT := util.StartSpanFromContext(ctx, "public-graph.CreateSessionEvents", util.Tag("sessionID", sessionID))
	defer outerSpan.Finish()

	loadSessionSpan, ctxS := util.StartSpanFromContext(ctxT, "public-graph.CreateSessionEvents.loadSessions", util.Tag("sessionID", sessionID))
	session := &model.Session{}
	res := r.DB.WithContext(ctxS).Where(&model.Session{Model: model.Model{ID: sessionID}}).Take(&session)
	if err := res.Error; err != nil {
		return e.Wrapf(err, "error getting session(id=%d) in create session events", sessionID)
	}
	loadSessionSpan.Finish()

	clickhouseSpan, ctxW := util.StartSpanFromContext(ctxT, "public-graph.CreateSessionEvents.flush.sessionEvents")
	clickhouseSpan.SetAttribute("NumSessionEventRows", len(events))
	defer clickhouseSpan.Finish()

	sessionEvents := []*clickhouse.SessionEventRow{}
	for _, event := range events {
		sessionEvents = append(sessionEvents, &clickhouse.SessionEventRow{
			ProjectID:        uint32(session.ProjectID),
			SessionID:        uint64(session.ID),
			SessionCreatedAt: session.CreatedAt,
			Timestamp:        event.Timestamp,
			Event:            event.Event,
			Attributes:       event.Attributes,
		})
	}

	err := r.Clickhouse.BatchWriteSessionEventRows(ctxW, sessionEvents)
	if err != nil {
		return e.Wrap(err, "error writing session events to clickhouse")
	}

	return nil
}

func (r *Resolver) AppendFields(ctx context.Context, fields []*model.Field, session *model.Session) error {
	outerSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.AppendFields",
		util.ResourceName("go.sessions.AppendFields"), util.Tag("sessionID", session.ID))
	defer outerSpan.Finish()

	result := r.DB.
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "project_id"}, {Name: "type"}, {Name: "name"}, {Name: "value"}},
			DoNothing: true}).
		Create(&fields)

	if err := result.Error; err != nil {
		return e.Wrap(err, "error inserting new fields")
	}

	var allFields []*model.Field
	inClause := [][]interface{}{}
	for _, f := range fields {
		inClause = append(inClause, []interface{}{f.ProjectID, f.Type, f.Name, f.Value})
	}
	if err := r.DB.WithContext(ctx).Where("(project_id, type, name, value) IN ?", inClause).Order("id DESC").
		Find(&allFields).Error; err != nil {
		return e.Wrap(err, "error retrieving all fields")
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
	if err := r.DB.WithContext(ctx).Table("session_fields").Clauses(clause.OnConflict{
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

func (r *Resolver) GetErrorAppVersion(ctx context.Context, errorObj *model.ErrorObject) *string {
	// get version from session
	var session *model.Session
	if err := r.DB.WithContext(ctx).Model(&session).
		Where("id = ?", errorObj.SessionID).
		Pluck("app_version", &session).Error; err == nil && session.AppVersion != nil {
		return session.AppVersion
	}

	// guess version from error service
	if errorObj.ServiceVersion != "" {
		return pointy.String(errorObj.ServiceVersion)
	}

	return nil
}

func (r *Resolver) getMappedStackTraceString(ctx context.Context, stackTrace []*publicModel.StackFrameInput, projectID int, errorObj *model.ErrorObject) (*string, []*privateModel.ErrorTrace, error) {
	span, ctx := util.StartSpanFromContext(ctx, "getMappedStackTraceString")
	defer span.Finish()

	var newMappedStackTraceString *string
	mappedStackTrace, err := stacktraces.EnhanceStackTrace(ctx, stackTrace, projectID, r.GetErrorAppVersion(ctx, errorObj), r.StorageClient)
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

func (r *Resolver) tagErrorGroup(ctx context.Context, errorObj *model.ErrorObject) *int {
	eMatchCtx, cancel := context.WithTimeout(ctx, embeddings.InferenceTimeout)
	defer cancel()

	query := embeddings.GetErrorObjectQuery(errorObj)
	tags, err := embeddings.MatchErrorTag(eMatchCtx, r.DB, r.EmbeddingsClient, query)
	if err == nil && len(tags) > 0 {
		return &tags[0].ID
	} else {
		log.WithContext(ctx).WithError(err).WithField("error_object_id", errorObj.ID).Error("failed to get embeddings for error group tag")
	}
	return nil
}

func (r *Resolver) GetOrCreateErrorGroup(ctx context.Context, errorObj *model.ErrorObject, matchFn func() (*int, error), onCreateGroup func(int) error, tagGroup bool) (*model.ErrorGroup, error) {
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

		if tagGroup {
			newErrorGroup.ErrorTagID = r.tagErrorGroup(ctx, errorObj)
		}

		if err := r.DB.WithContext(ctx).Create(newErrorGroup).Error; err != nil {
			return nil, e.Wrap(err, "Error creating new error group")
		}

		if onCreateGroup != nil {
			if err := onCreateGroup(newErrorGroup.ID); err != nil {
				return nil, err
			}
		}

		errorGroup = newErrorGroup
	} else {
		if err := r.DB.WithContext(ctx).Where(&model.ErrorGroup{
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

		if errorGroup.ErrorTagID == nil && tagGroup {
			errorGroup.ErrorTagID = r.tagErrorGroup(ctx, errorObj)
		}

		if err := r.DB.WithContext(ctx).Model(errorGroup).Updates(&model.ErrorGroup{
			StackTrace:       *errorObj.StackTrace,
			MappedStackTrace: errorObj.MappedStackTrace,
			Environments:     environmentsString,
			Event:            errorObj.Event,
			State:            updatedState,
			ServiceName:      errorObj.ServiceName,
			ErrorTagID:       errorGroup.ErrorTagID,
		}).Error; err != nil {
			return nil, e.Wrap(err, "Error updating error group")
		}
	}

	if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(errorGroup.ID), &kafka_queue.Message{Type: kafka_queue.ErrorGroupDataSync, ErrorGroupDataSync: &kafka_queue.ErrorGroupDataSyncArgs{ErrorGroupID: errorGroup.ID}}); err != nil {
		return nil, err
	}

	return errorGroup, nil
}

func (r *Resolver) GetTopErrorGroupMatchByEmbedding(ctx context.Context, projectID int, method model.ErrorGroupingMethod, embedding model.Vector, threshold float64) (*int, error) {
	span, ctx := util.StartSpanFromContext(ctx, "public-resolver", util.ResourceName("GetTopErrorGroupMatchByEmbedding"), util.Tag("projectID", projectID))
	defer span.Finish()

	result := struct {
		Score         float64 `json:"score"`
		CombinedScore float64 `json:"combined_score"`
		ErrorGroupID  int     `json:"error_group_id"`
	}{}

	if method == model.ErrorGroupingMethodGteLargeEmbeddingV3 {
		if err := r.DB.WithContext(ctx).Raw(`
			select (gte_large_embedding <=> @embedding) * 10 as score,
				error_group_id
			from error_group_embeddings
			where project_id = @projectID
				and gte_large_embedding is not null
			order by 1
			limit 1;`,
			map[string]interface{}{
				"embedding": embedding,
				"projectID": projectID,
			}).Scan(&result).Error; err != nil {
			return nil, e.Wrap(err, "error querying top error group match")
		}
	}

	if result.ErrorGroupID > 0 {
		lg := log.WithContext(ctx).WithField("combined_score", result.CombinedScore).WithField("score", result.Score).WithField("matched_error_group_id", result.ErrorGroupID).WithField("threshold", threshold)
		if result.Score < threshold {
			lg.Info("matched error group by embeddings")

			// Update the error group's embedding as a weighted average of the previous embedding plus this new one
			if method == model.ErrorGroupingMethodGteLargeEmbeddingV3 {
				if err := r.DB.WithContext(ctx).Exec(`
					update error_group_embeddings
					set gte_large_embedding = gte_large_embedding * array_fill(count::numeric / (count + 1), '{1024}')::vector
						+ @embedding * array_fill(1::numeric / (count + 1), '{1024}')::vector,
						count = count + 1
					where project_id = @projectID
					and error_group_id = @errorGroupID`,
					map[string]interface{}{
						"embedding":    embedding,
						"projectID":    projectID,
						"errorGroupID": result.ErrorGroupID,
					}).Error; err != nil {
					return nil, e.Wrap(err, "error updating embedding")
				}
			}

			return &result.ErrorGroupID, nil
		}
		lg.Info("found error group by embeddings but score too high")
	}
	return nil, nil
}

func (r *Resolver) GetTopErrorGroupMatch(ctx context.Context, event string, projectID int, fingerprints []*model.ErrorFingerprint) (*int, error) {
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
	if err := r.DB.WithContext(context.TODO()).Raw(`
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
	hmetric.Histogram(ctx, "GetTopErrorGroupMatch.groupSQL.durationMs", float64(time.Since(start).Milliseconds()), nil, 1)

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

func (r *Resolver) isWithinErrorQuota(ctx context.Context, workspace *model.Workspace) bool {
	withinBillingQuota, quotaPercent := r.IsWithinQuota(ctx, model.PricingProductTypeErrors, workspace, time.Now())
	go func() {
		defer util.Recover()
		if !withinBillingQuota || quotaPercent >= 1 {
			if err := model.SendBillingNotifications(ctx, r.DB, r.MailClient, email.BillingErrorsUsage100Percent, workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		} else if quotaPercent >= .8 {
			if err := model.SendBillingNotifications(ctx, r.DB, r.MailClient, email.BillingErrorsUsage80Percent, workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		}
	}()
	return withinBillingQuota
}

// Matches the ErrorObject with an existing ErrorGroup, or creates a new one if the group does not exist
func (r *Resolver) HandleErrorAndGroup(ctx context.Context, errorObj *model.ErrorObject, structuredStackTrace []*privateModel.ErrorTrace, fields []*model.ErrorField, projectID int, workspace *model.Workspace) (*model.ErrorGroup, error) {
	span, ctx := util.StartSpanFromContext(ctx, "HandleErrorAndGroup", util.Tag("projectID", projectID))
	defer span.Finish()

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

	if errorgroups.IsErrorTraceFiltered(*project, structuredStackTrace) {
		return nil, ErrUserFilteredError
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

	var errorGroup *model.ErrorGroup

	var settings *model.AllWorkspaceSettings
	if workspace != nil {
		if settings, err = r.Store.GetAllWorkspaceSettings(ctx, workspace.ID); err != nil {
			return nil, err
		}
	}

	var embedding *model.ErrorObjectEmbeddings
	if settings != nil && settings.ErrorEmbeddingsGroup {
		eCtx, cancel := context.WithTimeout(ctx, embeddings.InferenceTimeout)
		defer cancel()
		var emb []*model.ErrorObjectEmbeddings
		emb, err = r.EmbeddingsClient.GetEmbeddings(eCtx, []*model.ErrorObject{errorObj})
		if err != nil || len(emb) == 0 {
			log.WithContext(ctx).WithError(err).WithField("error_object_id", errorObj.ID).Error("failed to get embeddings")
			errorObj.ErrorGroupingMethod = model.ErrorGroupingMethodClassic
		} else {
			embedding = emb[0]
			embeddingType := model.ErrorGroupingMethodGteLargeEmbeddingV3
			errorGroup, err = r.GetOrCreateErrorGroup(ctx, errorObj, func() (*int, error) {
				match, err := r.GetTopErrorGroupMatchByEmbedding(ctx, errorObj.ProjectID, embeddingType, embedding.GteLargeEmbedding, settings.ErrorEmbeddingsThreshold)
				if err != nil {
					log.WithContext(ctx).WithError(err).WithField("error_object_id", errorObj.ID).Error("failed to group error using embeddings")
				}
				return match, err
			}, func(errorGroupId int) error {
				newEmbedding := model.ErrorGroupEmbeddings{
					ProjectID:         errorObj.ProjectID,
					ErrorGroupID:      errorGroupId,
					Count:             1,
					GteLargeEmbedding: embedding.GteLargeEmbedding,
				}

				return r.DB.WithContext(ctx).Create(&newEmbedding).Error
			}, settings.ErrorEmbeddingsTagGroup)
			if err != nil {
				return nil, e.Wrap(err, "Error getting or creating error group")
			}
			errorObj.ErrorGroupingMethod = embeddingType
		}
	} else {
		errorObj.ErrorGroupingMethod = model.ErrorGroupingMethodClassic
	}
	if errorGroup == nil {
		log.WithContext(ctx).WithError(err).WithField("error_object_id", errorObj.ID).Error("failed to create error group by embedding; using classic match")
		errorGroup, err = r.GetOrCreateErrorGroup(ctx, errorObj, func() (*int, error) {
			match, err := r.GetTopErrorGroupMatch(ctx, errorObj.Event, errorObj.ProjectID, fingerprints)
			if err != nil {
				return nil, e.Wrap(err, "Error getting top error group match")
			}
			return match, err
		}, nil, settings != nil && settings.ErrorEmbeddingsTagGroup)
		if err != nil {
			return nil, e.Wrap(err, "Error getting or creating error group")
		}
	}
	errorObj.ErrorGroupID = errorGroup.ID

	if err := r.DB.WithContext(ctx).Create(errorObj).Error; err != nil {
		return nil, e.Wrap(err, "Error performing error insert for error")
	}

	if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(errorObj.ID), &kafka_queue.Message{Type: kafka_queue.ErrorObjectDataSync, ErrorObjectDataSync: &kafka_queue.ErrorObjectDataSyncArgs{ErrorObjectID: errorObj.ID}}); err != nil {
		return nil, err
	}

	if err := r.AppendErrorFields(ctx, fields, errorGroup); err != nil {
		return nil, e.Wrap(err, "error appending error fields")
	}

	if err := r.DB.Transaction(func(tx *gorm.DB) error {
		for _, f := range fingerprints {
			f.ErrorGroupId = errorGroup.ID
		}
		if len(fingerprints) > 0 {
			if err := r.DB.WithContext(ctx).Model(&model.ErrorFingerprint{}).Create(fingerprints).Error; err != nil {
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

func (r *Resolver) AppendErrorFields(ctx context.Context, fields []*model.ErrorField, errorGroup *model.ErrorGroup) error {
	fieldsToAppend := []*model.ErrorField{}
	for _, f := range fields {
		field := &model.ErrorField{}
		res := r.DB.WithContext(ctx).Raw(`
			SELECT * FROM error_fields
			WHERE project_id = ?
			AND name = ?
			AND value = ?
			AND md5(value)::uuid = md5(?)::uuid
			`, f.ProjectID, f.Name, f.Value, f.Value).Take(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || e.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.WithContext(ctx).Create(f).Error; err != nil {
				return e.Wrap(err, "error creating error field")
			}
			fieldsToAppend = append(fieldsToAppend, f)
		} else {
			fieldsToAppend = append(fieldsToAppend, field)
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
	s, _ := util.StartSpanFromContext(ctx, "public-graph.GetLocationFromIP",
		util.ResourceName("getLocationFromIP"))
	defer s.Finish()

	db, err := geoip2.FromBytes(geolocation.GeoLiteCityMMDB)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	hostIP, _, err := net.SplitHostPort(ip)
	if err != nil {
		hostIP = ip
	}

	parsedIP := net.ParseIP(hostIP)
	if parsedIP == nil {
		return nil, fmt.Errorf("invalid IP address: %s", ip)
	}

	record, err := db.City(parsedIP)
	if err != nil {
		return nil, err
	}

	location = &Location{
		City:      record.City.Names["en"],
		Postal:    record.Postal.Code,
		Latitude:  record.Location.Latitude,
		Longitude: record.Location.Longitude,
		Country:   record.Country.IsoCode,
	}

	if len(record.Subdivisions) > 0 {
		location.State = record.Subdivisions[0].Names["en"]
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

func (r *Resolver) IndexSessionClickhouse(ctx context.Context, session *model.Session) error {
	sessionProperties := map[string]string{
		"os_name":         session.OSName,
		"os_version":      session.OSVersion,
		"browser_name":    session.BrowserName,
		"browser_version": session.BrowserVersion,
		"environment":     session.Environment,
		"device_id":       strconv.Itoa(session.Fingerprint),
		"city":            session.City,
		"state":           session.State,
		"country":         session.Country,
		"ip":              session.IP,
		"service_name":    session.ServiceName,
	}
	if session.AppVersion != nil {
		sessionProperties["service_version"] = *session.AppVersion
	}
	if err := r.AppendProperties(ctx, session.ID, sessionProperties, PropertyType.SESSION); err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error adding set of properties to db"))
	}
	return r.DataSyncQueue.Submit(ctx, strconv.Itoa(session.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: session.ID}})
}

func (r *Resolver) getSession(ctx context.Context, sessionSecureID string) (*model.Session, error) {
	sessionObj, found := r.SessionCache.Get(sessionSecureID)
	if !found {
		if err := r.DB.WithContext(ctx).Where(&model.Session{SecureID: sessionSecureID}).Limit(1).Take(&sessionObj).Error; err != nil {
			retErr := e.Wrapf(err, "error reading from session %v", sessionSecureID)
			log.WithContext(ctx).WithField("sessionSecureID", sessionSecureID).WithError(retErr).Error("failed to get session")
			return nil, err
		}
	}
	return sessionObj, nil
}

func (r *Resolver) getExistingSession(ctx context.Context, projectID int, secureID string) (*model.Session, error) {
	existingSessionObj := &model.Session{}
	if err := r.DB.WithContext(ctx).Model(&existingSessionObj).Where(&model.Session{SecureID: secureID}).Take(&existingSessionObj).Error; err != nil {
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

func (r *Resolver) InitializeSessionImpl(ctx context.Context, input *kafka_queue.InitializeSessionArgs) (*model.Session, error) {
	initSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.InitializeSessionImpl",
		util.ResourceName("go.sessions.InitializeSessionImpl"),
		util.Tag("duplicate", true))
	defer initSpan.Finish()

	defer func() {
		redisSpan, redisCtx := util.StartSpanFromContext(ctx, "public-graph.InitializeSessionImpl", util.ResourceName("go.sessions.setRedis"))
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
	initSpan.SetAttribute("project_id", projectID)

	existingSession, err := r.getExistingSession(ctx, projectID, input.SessionSecureID)
	if err != nil {
		return nil, err
	}
	if existingSession != nil {
		if err := r.IndexSessionClickhouse(ctx, existingSession); err != nil {
			return nil, err
		}

		return existingSession, nil
	}
	initSpan.SetAttribute("duplicate", false)

	setupSpan, spanCtx := util.StartSpanFromContext(ctx, "public-graph.InitializeSessionImpl", util.ResourceName("go.sessions.setup"))
	project := &model.Project{}
	if err := r.DB.WithContext(ctx).Where(&model.Project{Model: model.Model{ID: projectID}}).Take(&project).Error; err != nil {
		return nil, e.Wrapf(err, "project doesn't exist project_id:%d", projectID)
	}
	workspace, err := r.Store.GetWorkspace(spanCtx, project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving workspace")
	}

	fpHash := fnv.New32a()
	defer fpHash.Reset()
	if _, err := fpHash.Write([]byte(input.Fingerprint)); err != nil {
		log.WithContext(spanCtx).Errorf("failed to hash fingerprint to int: %s", err)
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
		PrivacySetting:                 input.PrivacySetting,
		EnableRecordingNetworkContents: &input.EnableRecordingNetworkContents,
		FirstloadVersion:               input.FirstloadVersion,
		ClientVersion:                  input.ClientVersion,
		ClientConfig:                   &input.ClientConfig,
		Environment:                    input.Environment,
		AppVersion:                     input.AppVersion,
		ServiceName:                    input.ServiceName,
		VerboseID:                      input.ProjectVerboseID,
		Fields:                         []*model.Field{},
		ViewedByAdmins:                 []model.Admin{},
		ClientID:                       input.ClientID,
		Excluded:                       true, // A session is excluded by default until it receives events
		ExcludedReason:                 &excludedReason,
		ProcessWithRedis:               true,
	}

	// mark recording-less sessions as processed so they are considered excluded
	if input.DisableSessionRecording != nil && *input.DisableSessionRecording {
		initSpan.SetAttribute("disable_session_recording", true)
		session.Processed = &model.T
	}

	// determine if session is within billing quota
	withinBillingQuota, quotaPercent := r.IsWithinQuota(spanCtx, model.PricingProductTypeSessions, workspace, time.Now())
	setupSpan.Finish()

	if err := r.Redis.SetBillingQuotaExceeded(ctx, projectID, model.PricingProductTypeSessions, !withinBillingQuota); err != nil {
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
	fetchedLocation, err := GetLocationFromIP(ctx, input.IP)
	if err != nil || fetchedLocation == nil {
		log.WithContext(ctx).Errorf("error getting user's location: %v", err)
	} else {
		location = fetchedLocation
	}

	if s, err := r.Store.GetAllWorkspaceSettings(ctx, project.WorkspaceID); err == nil && s.StoreIP {
		session.IP = input.IP
	}
	session.City = location.City
	session.State = location.State
	session.Postal = location.Postal
	session.Country = location.Country
	session.Latitude = location.Latitude.(float64)
	session.Longitude = location.Longitude.(float64)
	session.WithinBillingQuota = &withinBillingQuota

	if err := r.DB.WithContext(ctx).Create(session).Error; err != nil {
		if input.SessionSecureID == "" || !strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			log.WithContext(ctx).Errorf("error creating session: %s", err)
			return nil, e.Wrap(err, "error creating session")
		}
		existingSession, err := r.getExistingSession(ctx, projectID, input.SessionSecureID)
		if err != nil {
			return nil, err
		}
		if existingSession != nil {
			initSpan.SetAttribute("duplicate", true)
			initSpan.SetAttribute("duplicateRace", true)
			return existingSession, nil
		}
		return nil, e.New("failed to find duplicate session: " + input.SessionSecureID)
	}

	var setupEventsCount int64
	if err := r.DB.WithContext(ctx).Model(&model.SetupEvent{}).Where("project_id = ? AND type = ?", projectID, model.MarkBackendSetupTypeSession).Count(&setupEventsCount).Error; err != nil {
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

	highlight.RecordMetric(
		ctx, "sessions", float64(session.ID),
		attribute.String("Bot", fmt.Sprintf("%v", deviceDetails.IsBot)),
		attribute.String("Browser", deviceDetails.BrowserName),
		attribute.String("BrowserVersion", deviceDetails.BrowserVersion),
		attribute.String("IP", session.IP),
		attribute.String("City", session.City),
		attribute.String("ClientID", session.ClientID),
		attribute.String("Country", session.Country),
		attribute.String("Identifier", session.Identifier),
		attribute.String("Language", session.Language),
		attribute.String("OS", session.OSName),
		attribute.String("OSVersion", session.OSVersion),
		attribute.String("Postal", session.Postal),
		attribute.String("State", session.State),
		attribute.Int(highlight.ProjectIDAttribute, session.ProjectID),
		attribute.String(highlight.SessionIDAttribute, session.SecureID),
		attribute.String(highlight.TraceTypeAttribute, string(highlight.TraceTypeHighlightInternal)),
		attribute.String(highlight.TraceKeyAttribute, session.SecureID),
	)
	if err := r.PushMetricsImpl(ctx, nil, &session.SecureID, []*publicModel.MetricInput{
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

	if err := r.IndexSessionClickhouse(ctx, session); err != nil {
		return nil, err
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

	if session.ServiceName != "" {
		// See: https://opentelemetry.io/docs/specs/otel/resource/semantic_conventions/process/#javascript-runtimes
		// We don't set `process.runtime.version` since it would change on the user
		attributes := map[string]string{
			string(semconv.ProcessRuntimeNameKey): "browser",
		}
		_, err := r.Store.UpsertService(ctx, *project, session.ServiceName, attributes)
		if err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "failed to create service"))
		}
	}

	return session, nil
}

func (r *Resolver) MarkBackendSetupImpl(ctx context.Context, projectID int, setupType model.MarkBackendSetupType) error {
	_, err := redis.CachedEval(ctx, r.Redis, fmt.Sprintf("mark-backend-setup-%d-%s", projectID, setupType), 150*time.Millisecond, time.Hour, func() (*bool, error) {
		if setupType == model.MarkBackendSetupTypeLogs || setupType == model.MarkBackendSetupTypeError {
			// Update Hubspot company and projects.backend_setup
			var backendSetupCount int64
			if err := r.DB.WithContext(ctx).Model(&model.Project{}).Where("id = ? AND backend_setup=true", projectID).Count(&backendSetupCount).Error; err != nil {
				return nil, e.Wrap(err, "error querying backend_setup flag")
			}
			if backendSetupCount < 1 {
				project, err := r.Store.GetProject(ctx, projectID)
				if err != nil {
					log.WithContext(ctx).Errorf("failed to query project %d: %s", projectID, err)
				} else {
					phonehome.ReportUsageMetrics(ctx, phonehome.WorkspaceUsage, project.WorkspaceID, []attribute.KeyValue{
						attribute.Bool(phonehome.BackendSetup, true),
					})
				}
				if err := r.DB.WithContext(ctx).Model(&model.Project{}).Where("id = ?", projectID).Updates(&model.Project{BackendSetup: &model.T}).Error; err != nil {
					return nil, e.Wrap(err, "error updating backend_setup flag")
				}
			}
		}

		// Create setup_events record
		var setupEventsCount int64
		if err := r.DB.WithContext(ctx).Model(&model.SetupEvent{}).Where("project_id = ? AND type = ?", projectID, setupType).Count(&setupEventsCount).Error; err != nil {
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
	if err := r.DB.Select("project_id", "environment", "id", "secure_id", "created_at", "excluded", "processed").Where(&model.Session{SecureID: input.SessionSecureID}).Take(&session).Error; err != nil {
		return e.Wrap(err, "error querying session by sessionSecureID for adding session feedback")
	}

	sessionTimestamp := input.Timestamp.UnixMilli() - session.CreatedAt.UnixMilli()

	feedbackComment := &model.SessionComment{SessionId: session.ID, Text: input.Verbatim, Metadata: metadata, Timestamp: int(sessionTimestamp), Type: model.SessionCommentTypes.FEEDBACK, ProjectID: session.ProjectID, SessionSecureId: session.SecureID}
	if err := r.DB.WithContext(ctx).Create(feedbackComment).Error; err != nil {
		return e.Wrap(err, "error creating session feedback")
	}

	var errorAlerts []*model.ErrorAlert
	if err := r.DB.WithContext(ctx).Model(&model.ErrorAlert{}).Where(&model.ErrorAlert{AlertDeprecated: model.AlertDeprecated{ProjectID: session.ProjectID, Disabled: &model.F}}).Find(&errorAlerts).Error; err != nil {
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
		if err := r.DB.WithContext(ctx).Raw(`
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

		workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
		if err != nil {
			log.WithContext(ctx).WithError(err).
				WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "comment_id": feedbackComment.ID}).
				Error(e.Wrap(err, "error fetching workspace"))
		}

		tempalerts.SendAlertFeedback(ctx, r.DB, r.MailClient, errorAlert, &tempalerts.SendSlackAlertInput{
			Workspace:       workspace,
			Project:         &project,
			SessionSecureID: session.SecureID,
			SessionExcluded: session.Excluded && *session.Processed,
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
	outerSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		util.ResourceName("go.sessions.IdentifySessionImpl"), util.Tag("sessionSecureID", sessionSecureID))
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

	getSessionSpan, _ := util.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		util.ResourceName("go.sessions.IdentifySessionImpl.getSession"), util.Tag("sessionSecureID", sessionSecureID))
	if sessionSecureID == "" {
		return e.New("IdentifySessionImpl called without secureID")
	}
	session := &model.Session{}
	if err := r.DB.WithContext(ctx).Where(&model.Session{SecureID: sessionSecureID}).Take(&session).Error; err != nil {
		return e.New("[IdentifySession] error querying session by sessionID")
	}
	getSessionSpan.Finish()
	sessionID := session.ID

	setUserPropsSpan, spanCtx := util.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		util.ResourceName("go.sessions.IdentifySessionImpl.SetUserProperties"), util.Tag("sessionID", sessionID))
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
	if err := r.AppendProperties(spanCtx, sessionID, newUserProperties, PropertyType.USER); err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[IdentifySession] error adding set of identify properties to db: session: %d", sessionID))
	}
	setUserPropsSpan.Finish()

	previousSessionSpan, _ := util.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
		util.ResourceName("go.sessions.IdentifySessionImpl.PreviousSession"), util.Tag("sessionID", sessionID))
	// Check if there is a session created by this user.
	firstTime := &model.F
	if err := r.DB.WithContext(ctx).Where(&model.Session{Identifier: userIdentifier, ProjectID: session.ProjectID}).Where("secure_id <> ?", sessionSecureID).Take(&model.Session{}).Error; err != nil {
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

	if err := r.DB.Save(&session).Error; err != nil {
		return e.Wrap(err, "[IdentifySession] failed to update session")
	}
	r.SessionCache.Add(sessionSecureID, session)

	if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(sessionID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: sessionID}}); err != nil {
		return err
	}

	hTags := []attribute.KeyValue{
		attribute.String("Identifier", session.Identifier),
		attribute.Bool("Identified", session.Identified),
		attribute.Bool("FirstTime", *session.FirstTime),
		attribute.Int(highlight.ProjectIDAttribute, session.ProjectID),
		attribute.String(highlight.SessionIDAttribute, session.SecureID),
		attribute.String(highlight.TraceTypeAttribute, string(highlight.TraceTypeHighlightInternal)),
		attribute.String(highlight.TraceKeyAttribute, session.Identifier),
	}
	for k, v := range allUserProperties {
		hTags = append(hTags, attribute.String(k, v))
	}
	highlight.RecordMetric(ctx, "users", 1, hTags...)

	tags := []*publicModel.MetricTag{
		{Name: "Identifier", Value: session.Identifier},
		{Name: "Identified", Value: strconv.FormatBool(session.Identified)},
		{Name: "FirstTime", Value: strconv.FormatBool(*session.FirstTime)},
	}
	for k, v := range allUserProperties {
		tags = append(tags, &publicModel.MetricTag{Name: k, Value: v})
	}
	if err := r.PushMetricsImpl(ctx, nil, &session.SecureID, []*publicModel.MetricInput{
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
		getToBackfillSpan, _ := util.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
			util.ResourceName("go.sessions.IdentifySessionImpl.GetToBackfill"), util.Tag("sessionID", sessionID))
		if err := r.DB.WithContext(ctx).Where(&model.Session{ClientID: session.ClientID, ProjectID: session.ProjectID}).
			Where("(identifier IS null OR identifier = '') AND (identified IS null OR identified = false)").
			Not(&model.Session{Model: model.Model{ID: sessionID}}).Find(&backfillSessions).Error; err != nil {
			return e.Wrap(err, "[IdentifySession] error querying backfillSessions by clientID")
		}
		getToBackfillSpan.Finish()

		doBackfillSpan, spanCtx := util.StartSpanFromContext(ctx, "public-graph.IdentifySessionImpl",
			util.ResourceName("go.sessions.IdentifySessionImpl.DoBackfill"), util.Tag("sessionID", sessionID))
		for _, session := range backfillSessions {
			if err := r.IdentifySessionImpl(spanCtx, session.SecureID, userIdentifier, userObject, true); err != nil {
				return e.Wrapf(err, "[IdentifySession] [client_id: %v] error identifying session {id: %d}", session.ClientID, session.ID)
			}
		}
		doBackfillSpan.Finish()
	}

	log.WithContext(ctx).WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("identified session: %s", session.Identifier)
	return nil
}

func (r *Resolver) AddSessionPropertiesImpl(ctx context.Context, sessionSecureID string, propertiesObject interface{}) error {
	outerSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.AddSessionPropertiesImpl",
		util.ResourceName("go.sessions.AddSessionPropertiesImpl"))
	defer outerSpan.Finish()

	sessionObj, err := r.getSession(ctx, sessionSecureID)
	if err != nil {
		return err
	}

	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return e.New("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err = r.AppendProperties(ctx, sessionObj.ID, fields, PropertyType.SESSION)
	if err != nil {
		return e.Wrap(err, "error adding set of properties to db")
	}
	return nil
}

func (r *Resolver) IsWithinQuota(ctx context.Context, productType model.PricingProductType, workspace *model.Workspace, now time.Time) (bool, float64) {
	if workspace == nil {
		return true, 0
	}
	if workspace.TrialEndDate != nil && workspace.TrialEndDate.After(now) {
		return true, 0
	}

	stripePlan := privateModel.PlanType(workspace.PlanTier)

	cfg := pricing.ProductTypeToQuotaConfig[productType]

	maxCostCents := cfg.MaxCostCents(workspace)
	if stripePlan == privateModel.PlanTypeFree {
		maxCostCents = pointy.Int(0)
	}

	// if the customer's billing is invalid, we want to block them from using the product
	if invalid, err := r.Redis.GetCustomerBillingInvalid(ctx, ptr.ToString(workspace.StripeCustomerID)); err == nil && invalid {
		maxCostCents = pointy.Int(0)
	}

	if maxCostCents == nil {
		return true, 0
	}

	meter, err := cfg.Meter(ctx, r.DB, r.Clickhouse, r.Redis, workspace)
	if err != nil {
		log.WithContext(ctx).Warn(fmt.Sprintf("error getting %s meter for workspace %d", productType, workspace.ID))
	}

	includedQuantity := cfg.Included(workspace)
	if includedQuantity >= meter {
		return true, 0
	}

	// check this before checking the EnableBillingLimits flag in case we manually disable a product for a company
	if *maxCostCents == 0 {
		return false, 1
	}

	settings, err := r.Store.GetAllWorkspaceSettings(ctx, workspace.ID)
	if err == nil && !settings.EnableBillingLimits {
		return true, 0
	}

	overage := meter - includedQuantity
	// offset by the default included amount since ProductToBasePriceCents will offset too,
	// but we want to use the local offset of includedQuantity which respects overrides
	basePriceCents := pricing.ProductToBasePriceCents(productType, stripePlan, meter+pricing.IncludedAmount(stripePlan, productType)-includedQuantity)
	costCents := float64(overage) *
		basePriceCents *
		pricing.RetentionMultiplier(cfg.RetentionPeriod(workspace))

	return costCents <= float64(*maxCostCents), costCents / float64(*maxCostCents)
}

type AlertCountsGroupedByRecent struct {
	Count       int64 `gorm:"column:count"`
	RecentAlert bool  `gorm:"column:recent_alert"`
}

func (r *Resolver) sendErrorAlert(ctx context.Context, projectID int, sessionObj *model.Session, group *model.ErrorGroup, errorObject *model.ErrorObject, visitedUrl string) {
	func() {
		var errorAlerts []*model.ErrorAlert
		if err := r.DB.WithContext(ctx).Model(&model.ErrorAlert{}).Where(&model.ErrorAlert{AlertDeprecated: model.AlertDeprecated{ProjectID: projectID, Disabled: &model.F}}).Find(&errorAlerts).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error fetching ErrorAlerts object"))
			return
		}

		for _, errorAlert := range errorAlerts {
			if errorAlert.CountThreshold < 1 {
				continue
			}
			matchesQuery := true
			if errorAlert.Query != "" {
				testErrorObject := &publicModel.BackendErrorObjectInput{
					Environment:     errorObject.Environment,
					Event:           errorObject.Event,
					Payload:         errorObject.Payload,
					SessionSecureID: &sessionObj.SecureID,
					Service: &modelInputs.ServiceInput{
						Name:    errorObject.ServiceName,
						Version: errorObject.ServiceVersion,
					},
					Source:     errorObject.Source,
					StackTrace: string(*errorObject.StackTrace),
					Timestamp:  errorObject.Timestamp,
					Type:       errorObject.Type,
					URL:        errorObject.URL,
				}

				filters := parser.Parse(errorAlert.Query, clickhouse.BackendErrorObjectInputConfig)
				matchesQuery = clickhouse.ErrorMatchesQuery(testErrorObject, filters)
			}

			if !matchesQuery {
				continue
			}

			// only used in older alerts
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

			if errorAlert.ThresholdWindow == nil {
				t := 30
				errorAlert.ThresholdWindow = &t
			}

			// Suppress alerts if ignored or snoozed.
			snoozed := group.SnoozedUntil != nil && group.SnoozedUntil.After(time.Now())
			if group == nil || group.State == privateModel.ErrorStateIgnored || snoozed {
				continue
			}

			numErrors := int64(-1)
			if err := r.DB.WithContext(ctx).Raw(`
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

			var alertCounts []AlertCountsGroupedByRecent
			if err := r.DB.WithContext(ctx).Raw(`
				SELECT ev.sent_at > NOW() - ? * (INTERVAL '1 SECOND') AS recent_alert, COUNT(*)
				FROM error_alert_events ev
				INNER JOIN error_objects obj
				ON obj.id = ev.error_object_id
				WHERE
					(obj.error_group_id IS NOT NULL
						AND obj.error_group_id=?)
					AND ev.error_alert_id=?
				GROUP BY recent_alert
			`, errorAlert.Frequency, group.ID, errorAlert.ID).Scan(&alertCounts).Error; err != nil {
				log.WithContext(ctx).Error(e.Wrapf(err, "error counting alert events from past %d seconds", errorAlert.Frequency))
				continue
			}

			recentAlertCount := int64(-1)
			totalAlertCount := int64(-1)

			if len(alertCounts) >= 2 {
				totalAlertCount = alertCounts[0].Count + alertCounts[1].Count
				if alertCounts[0].RecentAlert {
					recentAlertCount = alertCounts[0].Count
				} else {
					recentAlertCount = alertCounts[1].Count
				}
			} else if len(alertCounts) == 1 {
				totalAlertCount = alertCounts[0].Count
				if alertCounts[0].RecentAlert {
					recentAlertCount = alertCounts[0].Count
				}
			}

			if recentAlertCount > 0 {
				log.WithContext(ctx).Warnf("num alerts > 0 for project_id=%d, error_group_id=%d", projectID, group.ID)
				continue
			}

			var project model.Project
			if err := r.DB.WithContext(ctx).Model(&model.Project{}).Where(&model.Project{Model: model.Model{ID: projectID}}).Take(&project).Error; err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error querying project"))
				continue
			}

			workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
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
				Session:         sessionObj,
				ErrorAlert:      errorAlert,
				ErrorGroup:      group,
				ErrorObject:     errorObject,
				Workspace:       workspace,
				ErrorCount:      numErrors,
				FirstErrorAlert: totalAlertCount <= 0,
				VisitedURL:      visitedUrl,
			}); err != nil {
				log.WithContext(ctx).Error(err)
			}

			tempalerts.SendErrorAlerts(ctx, r.DB, r.MailClient, r.LambdaClient, errorAlert, &tempalerts.SendSlackAlertInput{
				Workspace:       workspace,
				Project:         &project,
				SessionSecureID: sessionObj.SecureID,
				SessionExcluded: sessionObj.Excluded && *sessionObj.Processed,
				UserIdentifier:  sessionObj.Identifier,
				Group:           group,
				ErrorObject:     errorObject,
				URL:             &visitedUrl,
				ErrorsCount:     &numErrors,
				FirstErrorAlert: totalAlertCount <= 0,
				UserObject:      sessionObj.UserObject,
			})
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
		var messages []kafka_queue.RetryableMessage
		for _, metric := range metrics {
			messages = append(messages, &kafka_queue.Message{
				Type: kafka_queue.PushMetrics,
				PushMetrics: &kafka_queue.PushMetricsArgs{
					SessionSecureID: &secureID,
					Metrics:         []*publicModel.MetricInput{metric},
				}})
		}
		err := r.ProducerQueue.Submit(ctx, secureID, messages...)
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

func (r *Resolver) PushMetricsImpl(ctx context.Context, projectVerboseID *string, sessionSecureID *string, metrics []*publicModel.MetricInput) error {
	span, ctx := util.StartSpanFromContext(ctx, "public-graph.PushMetricsImpl", util.ResourceName("go.push-metrics"))
	span.SetAttribute("SessionSecureID", sessionSecureID)
	span.SetAttribute("NumMetrics", len(metrics))
	defer span.Finish()

	var projectID int
	session := &model.Session{}
	if sessionSecureID != nil && *sessionSecureID != "" {
		r.DB.WithContext(ctx).Model(&session).Where(&model.Session{SecureID: *sessionSecureID}).Take(&session)
		projectID = session.ProjectID
	}

	if session.ID == 0 && projectVerboseID != nil {
		var err error
		projectID, err = model.FromVerboseID(*projectVerboseID)
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "An unsupported verboseID was used: %s", *projectVerboseID))
			return nil
		}
	}

	curTime := time.Now()
	var traceRows []*clickhouse.TraceRow
	for _, m := range metrics {
		var spanID, parentSpanID, traceID = ptr.ToString(m.SpanID), ptr.ToString(m.ParentSpanID), ptr.ToString(m.TraceID)
		if spanID == "" {
			spanID = uuid.New().String()
		}
		if traceID == "" {
			traceID = uuid.New().String()
		}

		var serviceName, serviceVersion = session.ServiceName, ptr.ToString(session.AppVersion)
		attributes := map[string]string{}
		for _, t := range m.Tags {
			attributes[t.Name] = t.Value
			if t.Name == string(semconv.ServiceNameKey) {
				serviceName = t.Value
			} else if t.Name == string(semconv.ServiceVersionKey) {
				serviceVersion = t.Value
			}
		}
		if m.Category != nil {
			attributes["category"] = *m.Category
		}
		if m.Group != nil {
			attributes["group"] = *m.Group
		}

		timestamp := ClampTime(m.Timestamp, curTime)
		event := map[string]any{
			"Name":       "metric",
			"Timestamp":  timestamp,
			"Attributes": map[string]any{"metric.name": m.Name, "metric.value": m.Value},
		}
		traceRows = append(traceRows, clickhouse.NewTraceRow(timestamp, projectID).
			WithSecureSessionId(session.SecureID).
			WithSpanId(spanID).
			WithParentSpanId(parentSpanID).
			WithTraceId(traceID).
			WithSpanName(highlight.MetricSpanName).
			WithServiceName(serviceName).
			WithServiceVersion(serviceVersion).
			WithEnvironment(session.Environment).
			WithTraceAttributes(attributes).
			WithEvents([]map[string]any{event}))
	}

	// TODO(vkorolik) write to an actual metrics table
	var messages []kafka_queue.RetryableMessage
	for _, traceRow := range traceRows {
		if !r.IsTraceIngested(ctx, traceRow) {
			continue
		}
		messages = append(messages, &kafka_queue.TraceRowMessage{
			Type:               kafka_queue.PushTracesFlattened,
			ClickhouseTraceRow: clickhouse.ConvertTraceRow(traceRow),
		})
	}
	return r.TracesQueue.Submit(ctx, "", messages...)
}

// If curTime is provided and the input is different by more than 2 hours,
// use curTime instead of the input.
func ClampTime(input time.Time, curTime time.Time) time.Time {
	if curTime.IsZero() {
		return input
	}

	minTime := curTime.Add(-2 * time.Hour)
	maxTime := curTime.Add(2 * time.Hour)
	if input.Before(minTime) || input.After(maxTime) {
		return curTime
	}

	return input
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

func (r *Resolver) updateErrorsCount(ctx context.Context, projectID int, errorsBySession map[string]int64, errors int, errorType string) {
	dailyErrorCountSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.processBackendPayload", util.ResourceName("db.updateDailyErrorCounts"))
	dailyErrorCountSpan.SetAttribute("numberOfErrors", errors)
	dailyErrorCountSpan.SetAttribute("numberOfSessions", len(errorsBySession))
	defer dailyErrorCountSpan.Finish()

	for sessionSecureId, count := range errorsBySession {
		highlight.RecordMetric(
			ctx, "errors", float64(count),
			attribute.String("error.type", errorType),
			attribute.Int(highlight.ProjectIDAttribute, projectID),
			attribute.String(highlight.SessionIDAttribute, sessionSecureId),
			attribute.String(highlight.TraceTypeAttribute, string(highlight.TraceTypeHighlightInternal)),
		)
		if err := r.PushMetricsImpl(context.Background(), nil, &sessionSecureId, []*publicModel.MetricInput{
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
	querySessionSpan, _ := util.StartSpanFromContext(ctx, "public-graph.processBackendPayload", util.ResourceName("db.querySessions"))
	querySessionSpan.SetAttribute("numberOfErrors", len(errorObjects))
	querySessionSpan.SetAttribute("numberOfSessions", 1)

	var sessionID *int
	session := &model.Session{}
	if sessionSecureID != nil && *sessionSecureID != "" {
		if r.DB.WithContext(ctx).Model(&session).Where(&model.Session{SecureID: *sessionSecureID}).Take(&session); session.ID != 0 {
			sessionID = &session.ID
		}
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

	verboseIdDeref := ""
	if projectVerboseID != nil {
		verboseIdDeref = *projectVerboseID
	}

	if projectID == 0 {
		log.WithContext(ctx).
			WithField("sessionSecureID", sessionSecureID).
			WithField("projectVerboseID", verboseIdDeref).
			Error("No project id found for error")
		return
	}

	querySessionSpan.Finish()

	var project model.Project
	if err := r.DB.WithContext(ctx).Model(&model.Project{}).Where("id = ?", projectID).Take(&project).Error; err != nil {
		log.WithContext(ctx).WithError(err).
			WithField("projectId", projectID).
			WithField("project", project).
			WithField("projectVerboseID", verboseIdDeref).
			Error("failed to find project")
		return
	}

	workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error querying workspace"))
		return
	}

	if !r.isWithinErrorQuota(ctx, workspace) {
		return
	}

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

	r.updateErrorsCount(ctx, projectID, errorsBySession, len(errorObjects), model.ErrorType.BACKEND)

	err = r.MarkBackendSetupImpl(ctx, projectID, model.MarkBackendSetupTypeError)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "Error marking backend error setup"))
	}

	// put errors in db
	putErrorsToDBSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.processBackendPayload",
		util.ResourceName("db.errors"))
	defer putErrorsToDBSpan.Finish()
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
			Environment:    v.Environment,
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
		var stackFrameInput []*publicModel.StackFrameInput

		if err := json.Unmarshal([]byte(v.StackTrace), &stackFrameInput); err == nil {
			mapped, structured, err := r.getMappedStackTraceString(ctx, stackFrameInput, projectID, errorToInsert)
			if err != nil {
				log.WithContext(ctx).Errorf("Error generating mapped stack trace: %v", v.StackTrace)
			} else if mapped != nil && *mapped != "null" {
				errorToInsert.MappedStackTrace = mapped
				structuredStackTrace = structured
			}
		}

		stack := errorToInsert.MappedStackTrace
		if stack == nil {
			stack = &v.StackTrace
		}

		mapped, structured, err := r.Store.EnhancedStackTrace(ctx, *stack, workspace, &project, errorToInsert, nil)
		if err != nil {
			log.WithContext(ctx).WithError(err).Errorf("Failed to generate structured stacktrace %v", *stack)
		} else if mapped != nil {
			errorToInsert.MappedStackTrace = mapped
			structuredStackTrace = structured
		}

		group, err := r.HandleErrorAndGroup(ctx, errorToInsert, structuredStackTrace, extractErrorFields(session, errorToInsert), projectID, workspace)
		if err != nil {
			if e.Is(err, ErrUserFilteredError) {
				log.WithContext(ctx).WithError(err).Info("Will not update error group")
			} else {
				log.WithContext(ctx).WithError(err).Error("Error updating error group")
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

	for _, errorInstances := range groupedErrors {
		instance := errorInstances[len(errorInstances)-1]
		data := groups[instance.ErrorGroupID]
		r.sendErrorAlert(ctx, data.Group.ProjectID, data.SessionObj, data.Group, instance, data.VisitedURL)
	}

	putErrorsToDBSpan.Finish()
}

// Deprecated, left for backward compatibility with older client versions. Use AddTrackProperties instead
func (r *Resolver) AddTrackPropertiesImpl(ctx context.Context, sessionSecureID string, propertiesObject interface{}) error {
	outerSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.AddTrackPropertiesImpl",
		util.ResourceName("go.sessions.AddTrackPropertiesImpl"))
	defer outerSpan.Finish()

	sessionObj, err := r.getSession(ctx, sessionSecureID)
	if err != nil {
		return err
	}

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
	err = r.AppendProperties(ctx, sessionObj.ID, fields, PropertyType.TRACK)
	if err != nil {
		return e.Wrap(err, "error adding set of properties to db")
	}
	return nil
}

func (r *Resolver) AddTrackProperties(ctx context.Context, sessionID int, events *parse.ReplayEvents) error {
	outerSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.AddTrackProperties",
		util.ResourceName("go.sessions.AddTrackProperties"))
	defer outerSpan.Finish()

	fields := map[string]string{}
	sessionEvents := []*clickhouse.SessionEventRow{}

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

			attributes := make(map[string]string)
			for k, v := range propertiesObject {
				attributes[k] = fmt.Sprintf("%v", v)
			}

			// make event name the event key and delete from attributes
			eventName := "unknown_event"
			if attributes["event"] != "" {
				eventName = attributes["event"]
				delete(attributes, "event")
			} else if attributes["segment-event"] != "" {
				eventName = attributes["segment-event"]
				delete(attributes, "segment-event")
			} else {
				log.WithContext(ctx).WithFields(
					log.Fields{
						"sessionID":  sessionID,
						"attributes": attributes,
					}).Warn("writing unknown event")
			}

			sessionEvents = append(sessionEvents,
				&clickhouse.SessionEventRow{
					Event:      eventName,
					Timestamp:  event.Timestamp,
					Attributes: attributes,
				},
			)

			for k, v := range propertiesObject {
				formattedVal := fmt.Sprintf("%.*v", SESSION_FIELD_MAX_LENGTH, v)
				if len(formattedVal) > 0 {
					fields[k] = formattedVal
				}
				// the value below is used for testing using /buttons
				testTrackingMessage := "therewasonceahumblebumblebeeflyingthroughtheforestwhensuddenlyadropofwaterfullyencasedhimittookhimasecondtofigureoutthathesinaraindropsuddenlytheraindrophitthegroundasifhewasdivingintoapoolandheflewawaywithnofurtherissues"
				if fields[k] == testTrackingMessage {
					return e.New(testTrackingMessage)
				}
			}
		}
	}

	if len(fields) > 0 {
		if err := r.AppendProperties(ctx, sessionID, fields, PropertyType.TRACK); err != nil {
			return e.Wrap(err, "error adding set of properties to db")
		}
	}

	if len(sessionEvents) > 0 {
		if err := r.CreateSessionEvents(ctx, sessionID, sessionEvents); err != nil {
			return e.Wrapf(err, "error creating session events for session %d", sessionID)
		}
	}

	return nil
}

func (r *Resolver) MoveSessionDataToStorage(ctx context.Context, sessionId int, payloadId *int, projectId int, payloadType model.RawPayloadType) error {
	zRangeSpan, spanCtx := util.StartSpanFromContext(ctx, "public-graph.SaveSessionData",
		util.ResourceName("go.parseEvents.processWithRedis.getRawZRange"), util.Tag("project_id", projectId))
	zRange, err := r.Redis.GetRawZRange(spanCtx, sessionId, payloadId, payloadType)
	if err != nil {
		return e.Wrap(err, "error retrieving previous event objects")
	}
	zRangeSpan.Finish()

	// If there are prior events, push them to S3 and remove them from Redis
	if len(zRange) != 0 {
		pushToS3Span, spanCtx := util.StartSpanFromContext(ctx, "public-graph.SaveSessionData",
			util.ResourceName("go.parseEvents.processWithRedis.pushToS3"), util.Tag("project_id", projectId))
		if err := r.StorageClient.PushRawEvents(spanCtx, sessionId, projectId, payloadType, zRange); err != nil {
			return e.Wrap(err, "error pushing events to S3")
		}
		pushToS3Span.Finish()

		values := []interface{}{}
		for _, z := range zRange {
			values = append(values, z.Member)
		}

		removeValuesSpan, spanCtx := util.StartSpanFromContext(ctx, "public-graph.SaveSessionData",
			util.ResourceName("go.parseEvents.processWithRedis.removeValues"), util.Tag("project_id", projectId))
		if err := r.Redis.RemoveValues(spanCtx, sessionId, payloadType, values); err != nil {
			return e.Wrap(err, "error removing previous values")
		}
		removeValuesSpan.Finish()
	}

	return nil
}

// Returns a variable processing delay based on the session's last processing time
func getSessionProcessingDelaySeconds(timeElapsed time.Duration) int {
	if timeElapsed >= time.Minute {
		return 600 // 10 minutes
	}
	return SessionProcessDelaySeconds
}

func (r *Resolver) SaveSessionData(ctx context.Context, projectId, sessionId, payloadId int, isBeacon bool, payloadType model.RawPayloadType, data []byte) error {
	redisSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.SaveSessionData",
		util.ResourceName("go.parseEvents.processWithRedis"), util.Tag("project_id", projectId), util.Tag("payload_type", payloadType))
	score := float64(payloadId)
	// A little bit of a hack to encode
	if isBeacon {
		score += .5
	}

	count, err := r.Redis.AddPayload(ctx, sessionId, score, payloadType, data)
	if err != nil {
		return e.Wrap(err, "error adding event payload")
	}
	redisSpan.Finish()

	if count >= PAYLOAD_STAGING_COUNT_MAX {
		return r.MoveSessionDataToStorage(ctx, sessionId, &payloadId, projectId, payloadType)
	}

	return nil
}

type PushPayloadMessages struct {
	Messages []*hlog.Message `json:"messages"`
}

type PushPayloadResources struct {
	Resources []*any `json:"resources"`
}

type PushPayloadWebSocketEvents struct {
	WebSocketEvents []*any `json:"webSocketEvents"`
}

type PushPayloadChunk struct {
	events          []*publicModel.ReplayEventInput
	errors          []*publicModel.ErrorObjectInput
	logRows         []*hlog.Message
	resources       []*any
	websocketEvents []*any
}

func (r *Resolver) ProcessCompressedPayload(ctx context.Context, sessionSecureID string, payloadID int, data string) error {
	reader, err := gzip.NewReader(base64.NewDecoder(base64.StdEncoding, strings.NewReader(data)))
	if err != nil {
		return err
	}

	js, err := io.ReadAll(reader)
	if err != nil {
		return err
	}

	var payload kafka_queue.PushPayloadArgs
	if err = json.Unmarshal(js, &payload); err != nil {
		return err
	}

	return r.ProcessPayload(ctx, sessionSecureID, payload.Events, payload.Messages, payload.Resources, payload.WebSocketEvents, payload.Errors, ptr.ToBool(payload.IsBeacon), ptr.ToBool(payload.HasSessionUnloaded), payload.HighlightLogs, pointy.Int(payloadID))
}

func (r *Resolver) ProcessPayload(ctx context.Context, sessionSecureID string, events publicModel.ReplayEventsInput, messages string, resources string, webSocketEvents *string, errors []*publicModel.ErrorObjectInput, isBeacon bool, hasSessionUnloaded bool, highlightLogs *string, payloadId *int) error {
	// old clients do not send web socket events, so the value can be nil.
	// use this str as a simpler way to reference
	webSocketEventsStr := ""
	if webSocketEvents != nil {
		webSocketEventsStr = *webSocketEvents
	}
	querySessionSpan, _ := util.StartSpanFromContext(ctx, "public-graph.pushPayload", util.ResourceName("db.querySession"))
	querySessionSpan.SetAttribute("sessionSecureID", sessionSecureID)
	querySessionSpan.SetAttribute("messagesLength", len(messages))
	querySessionSpan.SetAttribute("resourcesLength", len(resources))
	querySessionSpan.SetAttribute("webSocketEventsLength", len(webSocketEventsStr))
	querySessionSpan.SetAttribute("numberOfErrors", len(errors))
	querySessionSpan.SetAttribute("numberOfEvents", len(events.Events))
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

	sessionObj, err := r.getSession(ctx, sessionSecureID)
	if err != nil {
		querySessionSpan.Finish(err)
		return err
	}
	querySessionSpan.SetAttribute("secure_id", sessionObj.SecureID)
	querySessionSpan.SetAttribute("project_id", sessionObj.ProjectID)
	querySessionSpan.Finish()
	sessionID := sessionObj.ID

	if len(events.Events) > 10_000 {
		log.WithContext(ctx).
			WithField("sessionSecureID", sessionSecureID).
			WithField("sessionID", sessionObj.ID).
			WithField("projectID", sessionObj.ProjectID).
			WithField("numberOfEvents", len(events.Events)).
			WithField("messagesLength", len(messages)).
			WithField("resourcesLength", len(resources)).
			WithField("webSocketEventsLength", len(webSocketEventsStr)).
			WithField("numberOfErrors", len(errors)).
			Warn("ProcessPayload with large event count")
	}

	// If the session is processing or processed, set ResumedAfterProcessedTime and continue
	if (sessionObj.Lock.Valid && !sessionObj.Lock.Time.IsZero()) || (sessionObj.Processed != nil && *sessionObj.Processed) {
		if sessionObj.ResumedAfterProcessedTime == nil {
			now := time.Now()
			if err := r.DB.WithContext(ctx).Model(&model.Session{Model: model.Model{ID: sessionID}}).Update("ResumedAfterProcessedTime", &now).Error; err != nil {
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

		project, err := r.Store.GetProject(ctx, projectID)
		if err != nil {
			return err
		}

		workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
		if err != nil {
			return e.Wrap(err, "error querying workspace")
		}

		if withinBillingQuota, _ := r.IsWithinQuota(ctx, model.PricingProductTypeSessions, workspace, time.Now()); !withinBillingQuota {
			return nil
		}

		opts := []util.SpanOption{util.ResourceName("go.parseEvents"), util.Tag("project_id", projectID)}
		if len(events.Events) > 1_000 {
			opts = append(opts, util.WithSpanKind(trace.SpanKindServer))
		}
		parseEventsSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.pushPayload", opts...)
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

			if err := r.AddTrackProperties(ctx, sessionID, parsedEvents); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to add track properties"))
			}

			var lastUserInteractionTimestamp time.Time
			hasFullSnapshot := false
			hostUrl := parse.GetHostUrlFromEvents(parsedEvents.Events)

			for _, event := range parsedEvents.Events {
				if event.Type == parse.FullSnapshot || event.Type == parse.IncrementalSnapshot {
					snapshot, err := parse.NewSnapshot(event.Data, hostUrl)
					if err != nil {
						log.WithContext(ctx).WithField("projectID", projectID).WithField("sessionID", sessionID).WithField("length", len([]byte(event.Data))).WithError(err).Error("Error unmarshalling snapshot")
						continue
					}

					// escape script tags in any javascript
					err = snapshot.EscapeJavascript(ctx)
					if err != nil {
						log.WithContext(ctx).Error(e.Wrap(err, "Error escaping snapshot javascript"))
					}

					// Replace any static resources with our own, hosted in S3
					if settings != nil && settings.ReplaceAssets {
						project, err := r.Store.GetProject(ctx, projectID)
						if err != nil {
							return err
						}

						workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
						if err != nil {
							return err
						}

						err = snapshot.ReplaceAssets(ctx, projectID, r.Store, workspace.GetRetentionPeriod())
						if err != nil {
							log.WithContext(ctx).Error(e.Wrap(err, "error replacing assets"))
						}
					}

					if event.Type == parse.FullSnapshot {
						hasFullSnapshot = true
						stylesheetsSpan, _ := util.StartSpanFromContext(ctx, "public-graph.pushPayload",
							util.ResourceName("go.parseEvents.InjectStylesheets"), util.Tag("project_id", projectID))
						// If we see a snapshot event, attempt to inject CORS stylesheets.
						err := snapshot.InjectStylesheets(ctx)
						stylesheetsSpan.Finish(err)
						if err != nil {
							log.WithContext(ctx).Error(e.Wrap(err, "Error injecting snapshot stylesheets"))
						}
					}
					if event.Type == parse.IncrementalSnapshot {
						mouseInteractionEventData, err := parse.UnmarshallMouseInteractionEvent(event.Data)
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

			remarshalSpan, _ := util.StartSpanFromContext(ctx, "public-graph.pushPayload",
				util.ResourceName("go.parseEvents.remarshalEvents"), util.Tag("project_id", projectID))
			// Re-format as a string to write to the db.
			b, err := json.Marshal(parsedEvents)
			if err != nil {
				return e.Wrap(err, "error marshaling events from schema interfaces")
			}
			remarshalSpan.Finish()

			if hasFullSnapshot {
				if err := r.MoveSessionDataToStorage(ctx, sessionID, pointy.Int(payloadIdDeref), projectID, model.PayloadTypeEvents); err != nil {
					return err
				}
			}

			if err := r.SaveSessionData(ctx, projectID, sessionID, payloadIdDeref, isBeacon, model.PayloadTypeEvents, b); err != nil {
				return e.Wrap(err, "error saving events data")
			}

			if !lastUserInteractionTimestamp.IsZero() {
				if err := r.DB.WithContext(ctx).Model(&sessionObj).Updates(&model.Session{
					LastUserInteractionTime: lastUserInteractionTimestamp,
				}).Error; err != nil {
					return e.Wrap(err, "error updating LastUserInteractionTime")
				}
				updatedSession := *sessionObj
				updatedSession.LastUserInteractionTime = lastUserInteractionTimestamp
				r.SessionCache.Add(sessionSecureID, &updatedSession)
			}
		}
		return nil
	})

	// unmarshal messages
	g.Go(func() error {
		defer util.Recover()
		unmarshalMessagesSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.pushPayload",
			util.ResourceName("go.unmarshal.messages"), util.Tag("project_id", projectID), util.Tag("message_string_len", len(messages)), util.Tag("secure_session_id", sessionSecureID))

		err := r.submitFrontendConsoleMessages(ctx, sessionObj, messages)
		unmarshalMessagesSpan.Finish(err)
		return err
	})

	// unmarshal resources
	g.Go(func() error {
		defer util.Recover()
		unmarshalResourcesSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.pushPayload",
			util.ResourceName("go.unmarshal.resources"), util.Tag("project_id", projectID))
		defer unmarshalResourcesSpan.Finish()

		if err := r.SaveSessionData(ctx, projectID, sessionID, payloadIdDeref, isBeacon, model.PayloadTypeResources, []byte(resources)); err != nil {
			return e.Wrap(err, "error saving resources data")
		}

		settings, err := r.Store.GetAllWorkspaceSettingsByProject(ctx, projectID)
		if err == nil && settings.EnableNetworkTraces {
			resourcesParsed := make(map[string][]NetworkResource)
			if err := json.Unmarshal([]byte(resources), &resourcesParsed); err != nil {
				return e.Wrap(err, "failed to unmarshal network resources")
			}
			if err := r.submitFrontendNetworkMetric(ctx, sessionObj, resourcesParsed["resources"]); err != nil {
				return err
			}
		}

		return nil
	})

	// unmarshal WebSocket events
	g.Go(func() error {
		defer util.Recover()
		if webSocketEventsStr != "" {
			unmarshalWebSocketEventsSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.pushPayload",
				util.ResourceName("go.unmarshal.web_socket_events"), util.Tag("project_id", projectID))
			defer unmarshalWebSocketEventsSpan.Finish()

			if err := r.SaveSessionData(ctx, projectID, sessionID, payloadIdDeref, isBeacon, model.PayloadTypeWebSocketEvents, []byte(webSocketEventsStr)); err != nil {
				return e.Wrap(err, "error saving web socket events data")
			}

			settings, err := r.Store.GetAllWorkspaceSettingsByProject(ctx, projectID)
			if err == nil && settings.EnableNetworkTraces {
				resourcesParsed := make(map[string][]privateModel.WebSocketEvent)
				if err := json.Unmarshal([]byte(webSocketEventsStr), &resourcesParsed); err != nil {
					return e.Wrap(err, "failed to unmarshal websocket events")
				}
				if err := r.submitFrontendWebsocketMetric(sessionObj, resourcesParsed["webSocketEvents"]); err != nil {
					return err
				}
			}
		}

		return nil
	})

	// process errors
	g.Go(func() error {
		defer util.Recover()

		project, err := r.Store.GetProject(ctx, projectID)
		if err != nil {
			return err
		}

		workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
		if err != nil {
			return e.Wrap(err, "error querying workspace")
		}

		if !r.isWithinErrorQuota(ctx, workspace) {
			return nil
		}

		if hasBeacon {
			r.DB.WithContext(ctx).Where(&model.ErrorObject{SessionID: &sessionID, IsBeacon: true}).Delete(&model.ErrorObject{})
		}

		errors = lo.Filter(errors, func(item *publicModel.ErrorObjectInput, index int) bool {
			return r.IsFrontendErrorIngested(ctx, project.ID, sessionObj, item)
		})

		// increment daily error table
		numErrors := int64(len(errors))
		if numErrors > 0 {
			r.updateErrorsCount(ctx, projectID, map[string]int64{sessionSecureID: numErrors}, len(errors), model.ErrorType.FRONTEND)
		}

		// put errors in db
		putErrorsToDBSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.pushPayload",
			util.ResourceName("db.errors"), util.Tag("project_id", projectID))
		defer putErrorsToDBSpan.Finish()
		groupedErrors := make(map[int][]*model.ErrorObject)
		groups := make(map[int]struct {
			Group      *model.ErrorGroup
			VisitedURL string
			SessionObj *model.Session
		})

		for _, v := range errors {
			span, c := util.StartSpanFromContext(ctx, "MarshalError")
			traceBytes, err := json.Marshal(v.StackTrace)
			if err != nil {
				log.WithContext(c).Errorf("Error marshaling trace: %v", v.StackTrace)
				continue
			}

			traceString := string(traceBytes)

			serviceVersion := ""
			if sessionObj.AppVersion != nil {
				serviceVersion = *sessionObj.AppVersion
			}

			errorToInsert := &model.ErrorObject{
				ProjectID:      projectID,
				SessionID:      &sessionID,
				Environment:    sessionObj.Environment,
				Event:          v.Event,
				Type:           v.Type,
				URL:            v.URL,
				Source:         v.Source,
				LineNumber:     v.LineNumber,
				ColumnNumber:   v.ColumnNumber,
				OS:             sessionObj.OSName,
				Browser:        sessionObj.BrowserName,
				StackTrace:     &traceString,
				Timestamp:      v.Timestamp,
				Payload:        v.Payload,
				IsBeacon:       isBeacon,
				ServiceVersion: serviceVersion,
				ServiceName:    sessionObj.ServiceName,
			}
			span.Finish()

			var structuredStackTrace []*privateModel.ErrorTrace
			mapped, structured, err := r.getMappedStackTraceString(ctx, v.StackTrace, projectID, errorToInsert)

			if err != nil {
				log.WithContext(ctx).Errorf("Error generating mapped stack trace: %v", v.StackTrace)
			} else {
				errorToInsert.MappedStackTrace = mapped
				structuredStackTrace = structured
			}

			stack := errorToInsert.MappedStackTrace
			if stack == nil {
				stack = errorToInsert.StackTrace
			}
			// use github enhancement for frontend errors
			mapped, structured, err = r.Store.EnhancedStackTrace(ctx, *stack, workspace, project, errorToInsert, nil)
			if err != nil {
				log.WithContext(ctx).WithError(err).WithField("stacktrace", v.StackTrace).Errorf("Failed to generate frontend structured stacktrace %v", v.StackTrace)
			} else if mapped != nil {
				errorToInsert.MappedStackTrace = mapped
				structuredStackTrace = structured
			}

			group, err := r.HandleErrorAndGroup(ctx, errorToInsert, structuredStackTrace, extractErrorFields(sessionObj, errorToInsert), projectID, workspace)
			if err != nil {
				if e.Is(err, ErrUserFilteredError) {
					log.WithContext(ctx).WithError(err).Info("Will not update error group")
				} else {
					log.WithContext(ctx).WithError(err).Error("Error updating error group")
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

		for _, errorInstances := range groupedErrors {
			instance := errorInstances[len(errorInstances)-1]
			data := groups[instance.ErrorGroupID]
			r.sendErrorAlert(ctx, data.Group.ProjectID, data.SessionObj, data.Group, instance, data.VisitedURL)
		}

		return nil
	})

	if err := g.Wait(); err != nil {
		return err
	}

	project, err := r.Store.GetProject(ctx, projectID)
	if err != nil {
		return err
	}

	workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
	if err != nil {
		return e.Wrap(err, "error querying workspace")
	}

	if withinBillingQuota, _ := r.IsWithinQuota(ctx, model.PricingProductTypeSessions, workspace, time.Now()); !withinBillingQuota {
		return nil
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

	updateSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.pushPayload", util.ResourceName("doSessionFieldsUpdate"))
	defer updateSpan.Finish()

	excluded, reason := r.IsSessionExcluded(ctx, sessionObj, sessionHasErrors)
	elapsedSinceUpdate := time.Hour
	if sessionObj.PayloadUpdatedAt != nil {
		elapsedSinceUpdate = now.Sub(*sessionObj.PayloadUpdatedAt)
	}

	// Update only if any of these fields are changing
	// Update the PayloadUpdatedAt field only if it's been >15s since the last one
	doUpdate := sessionObj.PayloadUpdatedAt == nil ||
		elapsedSinceUpdate > 15*time.Second ||
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
		if err := r.DB.WithContext(ctx).Model(&model.Session{Model: model.Model{ID: sessionID}}).
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
		updatedSession := *sessionObj
		updatedSession.PayloadUpdatedAt = &now
		updatedSession.BeaconTime = beaconTime
		updatedSession.HasUnloaded = hasSessionUnloaded
		updatedSession.Processed = &model.F
		updatedSession.ObjectStorageEnabled = &model.F
		updatedSession.DirectDownloadEnabled = false
		updatedSession.Chunked = &model.F
		updatedSession.Excluded = false
		updatedSession.ExcludedReason = nil
		updatedSession.HasErrors = &sessionHasErrors
		r.SessionCache.Add(sessionSecureID, &updatedSession)
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
			if err := r.DB.WithContext(ctx).Model(&model.Session{Model: model.Model{ID: sessionID}}).
				Select("Excluded", "ExcludedReason").Updates(&model.Session{
				Excluded:       excluded,
				ExcludedReason: reason,
			}).Error; err != nil {
				return err
			}
			if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(sessionObj.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: sessionObj.ID}}); err != nil {
				return err
			}
		}
		updatedSession := *sessionObj
		updatedSession.Excluded = excluded
		updatedSession.ExcludedReason = reason
		r.SessionCache.Add(sessionSecureID, &updatedSession)
	}

	opensearchSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.pushPayload", util.ResourceName("opensearch.update"))
	defer opensearchSpan.Finish()
	// If the session was previously marked as processed, clear this
	// in OpenSearch so that it's treated as a live session again.
	// If the session was previously excluded (as we do with new sessions by default),
	// clear it so it is shown as live in OpenSearch since we now have data for it.
	if (sessionObj.Processed != nil && *sessionObj.Processed) || (!excluded) {
		if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(sessionObj.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: sessionObj.ID}}); err != nil {
			return err
		}
	}

	if !excluded {
		processingDelay := getSessionProcessingDelaySeconds(elapsedSinceUpdate)
		if err := r.Redis.AddSessionToProcess(ctx, sessionID, processingDelay); err != nil {
			return err
		}
	}

	if sessionHasErrors && (sessionObj.HasErrors == nil || !*sessionObj.HasErrors) {
		if err := r.DataSyncQueue.Submit(ctx, strconv.Itoa(sessionObj.ID), &kafka_queue.Message{Type: kafka_queue.SessionDataSync, SessionDataSync: &kafka_queue.SessionDataSyncArgs{SessionID: sessionObj.ID}}); err != nil {
			return err
		}
	}

	// if the session changed from excluded to not excluded, it is viewable, so send any relevant alerts
	if !excluded && (sessionObj.Excluded || (sessionObj.FirstTime != nil && *sessionObj.FirstTime)) {
		return r.HandleSessionViewable(ctx, projectID, sessionObj)
	}

	return nil
}

// HandleSessionViewable is called after the first events to a session are written.
// It handles any alerts that must be sent for this session after it is able to be played.
func (r *Resolver) HandleSessionViewable(ctx context.Context, projectID int, session *model.Session) error {
	project, err := r.Store.GetProject(ctx, projectID)
	if err != nil {
		return err
	}

	workspace, err := r.Store.GetWorkspace(ctx, project.WorkspaceID)
	if err != nil {
		return err
	}

	g := errgroup.Group{}
	g.Go(func() error {
		return r.SendSessionInitAlert(ctx, workspace, project, session.ID)
	})
	if session.FirstTime != nil && *session.FirstTime {
		g.Go(func() error {
			return r.SendSessionIdentifiedAlert(ctx, workspace, project, session)
		})
	}
	return g.Wait()
}

func (r *Resolver) SendSessionInitAlert(ctx context.Context, workspace *model.Workspace, project *model.Project, sessionID int) error {
	// Sending session init alert
	var sessionAlerts []*model.SessionAlert
	if err := r.DB.WithContext(ctx).Model(&model.SessionAlert{}).Where(&model.SessionAlert{AlertDeprecated: model.AlertDeprecated{ProjectID: project.ID, Disabled: &model.F}}).
		Where("type=?", model.AlertType.NEW_SESSION).Find(&sessionAlerts).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error fetching new session alert", project.ID))
		return err
	}

	sessionObj := &model.Session{}
	if err := r.DB.WithContext(ctx).Preload("Fields").Where(&model.Session{Model: model.Model{ID: sessionID}}).Take(&sessionObj).Error; err != nil {
		retErr := e.Wrapf(err, "error reading from session %v", sessionID)
		log.WithContext(ctx).Error(retErr)
		return nil
	}

	for _, sessionAlert := range sessionAlerts {
		// skip alerts that have already been sent for this session
		var count int64
		if err := r.DB.WithContext(ctx).Model(&model.SessionAlertEvent{}).Where(&model.SessionAlertEvent{
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

		tempalerts.SendSessionAlerts(ctx, r.DB, r.MailClient, r.LambdaClient, sessionAlert, &tempalerts.SendSlackAlertInput{
			Workspace:       workspace,
			Project:         project,
			SessionSecureID: sessionObj.SecureID,
			SessionExcluded: sessionObj.Excluded && *sessionObj.Processed,
			UserIdentifier:  sessionObj.Identifier,
			UserObject:      sessionObj.UserObject,
			UserProperties:  userProperties,
			URL:             visitedUrl,
		})
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

func (r *Resolver) submitFrontendNetworkMetric(ctx context.Context, sessionObj *model.Session, resources []NetworkResource) error {
	for _, re := range resources {
		requestHeaders, _ := re.RequestResponsePairs.Request.HeadersRaw.(map[string]interface{})

		// if traceparent header is set, this means otel is enabled in the client
		// and we don't want to create a new trace.
		if _, ok := requestHeaders["traceparent"]; ok {
			continue
		}

		method := re.RequestResponsePairs.Request.Method
		if method == "" {
			method = http.MethodGet
		}
		start := re.Start(sessionObj.CreatedAt)
		end := re.End(sessionObj.CreatedAt)
		if url, err := url2.Parse(re.Name); err == nil && url.Host == "pub.highlight.io" {
			continue
		}

		responseHeaders, _ := re.RequestResponsePairs.Response.HeadersRaw.(map[string]interface{})
		userAgent, _ := requestHeaders["User-Agent"].(string)
		requestBody, ok := re.RequestResponsePairs.Request.Body.(string)
		if !ok {
			bdBytes, err := json.Marshal(requestBody)
			if err != nil {
				log.WithContext(ctx).WithError(err).WithField("sessionID", sessionObj.ID).Error("failed to serialize network request body as json")
			} else {
				requestBody = string(bdBytes)
			}
		}
		responseBody, ok := re.RequestResponsePairs.Response.Body.(string)
		if !ok {
			bdBytes, err := json.Marshal(responseBody)
			if err != nil {
				log.WithContext(ctx).WithError(err).WithField("sessionID", sessionObj.ID).Error("failed to serialize network response body as json")
			} else {
				responseBody = string(bdBytes)
			}
		}
		var attributes []attribute.KeyValue
		attributes = append(attributes, attribute.String(highlight.TraceTypeAttribute, string(highlight.TraceTypeNetworkRequest)),
			attribute.Int(highlight.ProjectIDAttribute, sessionObj.ProjectID),
			attribute.String(highlight.SessionIDAttribute, sessionObj.SecureID),
			attribute.String(highlight.RequestIDAttribute, re.RequestResponsePairs.Request.ID),
			attribute.String(highlight.TraceKeyAttribute, re.Name),
			semconv.DeploymentEnvironment(sessionObj.Environment),
			semconv.ServiceName(sessionObj.ServiceName),
			semconv.ServiceVersion(ptr.ToString(sessionObj.AppVersion)),
			semconv.HTTPURL(re.Name),
			attribute.String("http.request.body", requestBody),
			attribute.String("http.response.body", responseBody),
			attribute.Float64("http.response.encoded.size", re.EncodedBodySize),
			attribute.Float64("http.response.decoded.size", re.DecodedBodySize),
			attribute.Float64("http.response.transfer.size", re.TransferSize),
			semconv.HTTPRequestContentLength(len(requestBody)),
			semconv.HTTPResponseContentLength(int(re.RequestResponsePairs.Response.Size)),
			semconv.HTTPStatusCode(int(re.RequestResponsePairs.Response.Status)),
			semconv.HTTPMethod(method),
			semconv.HTTPUserAgent(userAgent),
			semconv.UserAgentOriginal(userAgent),
			attribute.String(privateModel.NetworkRequestAttributeInitiatorType.String(), re.InitiatorType),
			attribute.Float64(privateModel.NetworkRequestAttributeLatency.String(), float64(end.Sub(start).Nanoseconds())),
			attribute.Float64(privateModel.NetworkRequestAttributeConnectLatency.String(), (re.ConnectEndAbs-re.ConnectStartAbs)*1e6),
			attribute.Float64(privateModel.NetworkRequestAttributeDNSLatency.String(), (re.DomainLookupEndAbs-re.DomainLookupStartAbs)*1e6),
			attribute.Float64(privateModel.NetworkRequestAttributeRedirectLatency.String(), (re.RedirectEndAbs-re.RedirectStartAbs)*1e6),
		)
		if u, err := url2.Parse(re.Name); err == nil {
			attributes = append(attributes, semconv.HTTPScheme(u.Scheme), semconv.HTTPTarget(u.Path))
		}
		for requestHeader, requestHeaderValue := range requestHeaders {
			str, ok := requestHeaderValue.(string)
			if ok {
				attributes = append(attributes, attribute.String(fmt.Sprintf("http.request.header.%s", requestHeader), str))
			}
		}
		for responseHeader, responseHeaderValue := range responseHeaders {
			str, ok := responseHeaderValue.(string)
			if ok {
				attributes = append(attributes, attribute.String(fmt.Sprintf("http.response.header.%s", responseHeader), str))
			}
		}
		requestBodyJson := make(map[string]interface{})
		// if the request body is json and contains the graphql key operationName, treat it as an operation
		if err := json.Unmarshal([]byte(requestBody), &requestBodyJson); err == nil {
			if _, ok := requestBodyJson["operationName"]; ok {
				if opName, ok := requestBodyJson["operationName"].(string); ok {
					attributes = append(attributes, semconv.GraphqlOperationName(opName))
				}
			}
		}

		ctx := context.Background()
		ctx = context.WithValue(ctx, highlight.ContextKeys.SessionSecureID, sessionObj.SecureID)
		ctx = context.WithValue(ctx, highlight.ContextKeys.RequestID, re.RequestResponsePairs.Request.ID)
		span, _ := highlight.StartTraceWithTracer(ctx, r.TracerNoResources, strings.Join([]string{method, re.Name}, " "), start, []trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)}, attributes...)
		span.End(trace.WithTimestamp(end))
	}
	return nil
}

func (r *Resolver) submitFrontendWebsocketMetric(sessionObj *model.Session, events []privateModel.WebSocketEvent) error {
	for _, event := range events {
		ts := time.UnixMicro(int64(1000. * event.TimeStamp))
		var attributes []attribute.KeyValue
		attributes = append(attributes, attribute.String(highlight.TraceTypeAttribute, string(highlight.TraceTypeWebSocketRequest)),
			attribute.Int(highlight.ProjectIDAttribute, sessionObj.ProjectID),
			attribute.String(highlight.SessionIDAttribute, sessionObj.SecureID),
			attribute.String(highlight.RequestIDAttribute, event.SocketID),
			attribute.String(highlight.TraceKeyAttribute, event.Name),
			semconv.DeploymentEnvironmentKey.String(sessionObj.Environment),
			semconv.ServiceNameKey.String(sessionObj.ServiceName),
			semconv.ServiceVersionKey.String(ptr.ToString(sessionObj.AppVersion)),
			semconv.HTTPURLKey.String(event.Name),
			attribute.String("ws.message", event.Message),
			attribute.Int("ws.size", event.Size),
			attribute.Int("ws.message.length", len(event.Message)),
		)

		requestBody := make(map[string]interface{})
		// if the request body is json, send the message as structured attributes
		if err := json.Unmarshal([]byte(event.Message), &requestBody); event.Message != "" && err == nil {
			attributes = append(attributes, attribute.String("ws.message.type", "json"))
			for k, v := range requestBody {
				for key, value := range hlog.FormatLogAttributes(k, v) {
					if v != "" {
						attributes = append(attributes, attribute.String(fmt.Sprintf("ws.json.%s", key), value))
					}
				}
			}
		}

		ctx := context.Background()
		ctx = context.WithValue(ctx, highlight.ContextKeys.SessionSecureID, sessionObj.SecureID)
		ctx = context.WithValue(ctx, highlight.ContextKeys.RequestID, event.SocketID)
		span, _ := highlight.StartTraceWithTracer(ctx, r.TracerNoResources, strings.Join([]string{"WS", event.Name}, " "), ts, []trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)}, attributes...)
		// ws messsages don't have a duration, but record them with some duration so they are rendered correctly
		span.End(trace.WithTimestamp(ts.Add(time.Microsecond)))
	}
	return nil
}

func (r *Resolver) submitFrontendConsoleMessages(ctx context.Context, sessionObj *model.Session, messages string) error {
	logRows, err := hlog.ParseConsoleMessages(messages)
	if err != nil {
		return err
	}

	for _, row := range logRows {
		t := time.UnixMilli(row.Time)
		attributes := []attribute.KeyValue{
			attribute.String(highlight.TraceTypeAttribute, string(highlight.TraceTypeFrontendConsole)),
			attribute.Int(highlight.ProjectIDAttribute, sessionObj.ProjectID),
			attribute.String(highlight.SessionIDAttribute, sessionObj.SecureID),
			attribute.String(highlight.SourceAttribute, string(privateModel.LogSourceFrontend)),
			semconv.DeploymentEnvironmentKey.String(sessionObj.Environment),
			semconv.ServiceNameKey.String(sessionObj.ServiceName),
			semconv.ServiceVersionKey.String(ptr.ToString(sessionObj.AppVersion)),
		}
		span, _ := highlight.StartTraceWithTracer(
			ctx, r.TracerNoResources, highlight.LogSpanName, t,
			[]trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)}, attributes...,
		)
		message := strings.Join(row.Value, " ")
		attrs := []attribute.KeyValue{
			hlog.LogSeverityKey.String(row.Type),
			hlog.LogMessageKey.String(message),
		}
		for k, v := range row.Attributes {
			for key, value := range hlog.FormatLogAttributes(k, v) {
				if v != "" {
					attrs = append(attrs, attribute.String(key, value))
				}
			}
		}
		if len(row.Trace) > 0 {
			traceEnd := &row.Trace[len(row.Trace)-1]
			attrs = append(
				attrs,
				semconv.CodeFunctionKey.String(traceEnd.FunctionName),
				semconv.CodeNamespaceKey.String(traceEnd.Source),
				semconv.CodeFilepathKey.String(traceEnd.FileName),
			)

			var ln int
			if x, ok := traceEnd.LineNumber.(int); ok {
				ln = x
			} else if x, ok := traceEnd.LineNumber.(string); ok {
				if i, err := strconv.ParseInt(x, 10, 32); err == nil {
					ln = int(i)
				}
			}
			if ln != 0 {
				attrs = append(attrs, semconv.CodeLineNumberKey.Int(ln))
			}

			var cn int
			if x, ok := traceEnd.ColumnNumber.(int); ok {
				cn = x
			} else if x, ok := traceEnd.ColumnNumber.(string); ok {
				if i, err := strconv.ParseInt(x, 10, 32); err == nil {
					cn = int(i)
				}
			}
			if cn != 0 {
				attrs = append(attrs, semconv.CodeColumnKey.Int(cn))
			}
			stackTrace := message
			for _, t := range row.Trace {
				if t.Source != "" {
					stackTrace += "\n" + t.Source
				} else {
					stackTrace += fmt.Sprintf("\n\tat %s (%s:%+v:%+v)", t.FunctionName, t.FileName, t.LineNumber, t.ColumnNumber)
				}
			}
			attrs = append(attrs, semconv.ExceptionStacktraceKey.String(stackTrace))
		}

		span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...), trace.WithTimestamp(t))
		if row.Type == "error" {
			span.SetStatus(codes.Error, message)
		}
		highlight.EndTrace(span)
	}

	return nil
}

func (r *Resolver) SendSessionTrackPropertiesAlert(ctx context.Context, workspace *model.Workspace, project *model.Project, session *model.Session, properties map[string]string) error {
	alertWorkerSpan, ctx := util.StartSpanFromContext(ctx, "public-graph.AppendProperties",
		util.ResourceName("go.sessions.AppendProperties.alertWorker"), util.Tag("sessionID", session.ID))
	defer alertWorkerSpan.Finish()
	// Sending Track Properties Alert
	var sessionAlerts []*model.SessionAlert
	if err := r.DB.WithContext(ctx).Model(&model.SessionAlert{}).Where(&model.SessionAlert{AlertDeprecated: model.AlertDeprecated{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type=?", model.AlertType.TRACK_PROPERTIES).Find(&sessionAlerts).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error fetching track properties alert", session.ProjectID))
		return err
	}

	for _, sessionAlert := range sessionAlerts {
		// skip alerts that have already been sent for this session
		var count int64
		if err := r.DB.WithContext(ctx).Model(&model.SessionAlertEvent{}).Where(&model.SessionAlertEvent{
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
		stmt := r.DB.WithContext(ctx).Model(&model.Field{}).
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

		tempalerts.SendSessionAlerts(ctx, r.DB, r.MailClient, r.LambdaClient, sessionAlert, &tempalerts.SendSlackAlertInput{
			Workspace:       workspace,
			Project:         project,
			SessionSecureID: session.SecureID,
			SessionExcluded: session.Excluded && *session.Processed,
			UserIdentifier:  session.Identifier,
			MatchedFields:   matchedFields,
			RelatedFields:   relatedFields,
			UserObject:      session.UserObject,
		})
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

func (r *Resolver) SendSessionIdentifiedAlert(ctx context.Context, workspace *model.Workspace, project *model.Project, session *model.Session) error {
	// Sending New User Alert
	var sessionAlerts []*model.SessionAlert
	if err := r.DB.WithContext(ctx).Model(&model.SessionAlert{}).Where(&model.SessionAlert{AlertDeprecated: model.AlertDeprecated{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type=?", model.AlertType.NEW_USER).Find(&sessionAlerts).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error fetching new user alert", session.ProjectID))
		return err
	}

	refetchedSession := &model.Session{}
	if err := r.DB.WithContext(ctx).Where(&model.Session{Model: model.Model{ID: session.ID}}).Take(&refetchedSession).Error; err != nil {
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
		if err := r.DB.WithContext(ctx).Model(&model.SessionAlertEvent{}).Where(&model.SessionAlertEvent{
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

		tempalerts.SendSessionAlerts(ctx, r.DB, r.MailClient, r.LambdaClient, sessionAlert, &tempalerts.SendSlackAlertInput{
			Workspace:       workspace,
			Project:         project,
			SessionSecureID: refetchedSession.SecureID,
			SessionExcluded: refetchedSession.Excluded && *refetchedSession.Processed,
			UserIdentifier:  refetchedSession.Identifier,
			UserProperties:  userProperties,
			UserObject:      refetchedSession.UserObject,
		})
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

func (r *Resolver) SendSessionUserPropertiesAlert(ctx context.Context, workspace *model.Workspace, project *model.Project, session *model.Session) error {
	alertSpan, ctx := util.StartSpanFromContext(ctx, "SendSessionUserPropertiesAlert")
	defer alertSpan.Finish()
	// Sending User Properties Alert
	var sessionAlerts []*model.SessionAlert
	if err := r.DB.WithContext(ctx).Model(&model.SessionAlert{}).Where(&model.SessionAlert{AlertDeprecated: model.AlertDeprecated{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type=?", model.AlertType.USER_PROPERTIES).Find(&sessionAlerts).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrapf(err, "[project_id: %d] error fetching user properties alert", session.ProjectID))
		return err
	}

	for _, sessionAlert := range sessionAlerts {
		// skip alerts that have already been sent for this session
		var count int64
		if err := r.DB.WithContext(ctx).Model(&model.SessionAlertEvent{}).Where(&model.SessionAlertEvent{
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
		stmt := r.DB.WithContext(ctx).Model(&model.Field{}).
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

		tempalerts.SendSessionAlerts(ctx, r.DB, r.MailClient, r.LambdaClient, sessionAlert, &tempalerts.SendSlackAlertInput{
			Workspace:       workspace,
			Project:         project,
			SessionSecureID: session.SecureID,
			SessionExcluded: session.Excluded && *session.Processed,
			UserIdentifier:  session.Identifier,
			MatchedFields:   matchedFields,
			UserObject:      session.UserObject,
		})
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
