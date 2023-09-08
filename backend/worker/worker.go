package worker

import (
	"container/list"
	"context"
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"os"
	"sort"
	"strconv"
	"sync"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/golang/snappy"
	"github.com/highlight-run/highlight/backend/alerts"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/hlog"
	log_alerts "github.com/highlight-run/highlight/backend/jobs/log-alerts"
	metric_monitor "github.com/highlight-run/highlight/backend/jobs/metric-monitor"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	journey_handlers "github.com/highlight-run/highlight/backend/lambda-functions/journeys/handlers"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/payload"
	"github.com/highlight-run/highlight/backend/phonehome"
	"github.com/highlight-run/highlight/backend/pricing"
	mgraph "github.com/highlight-run/highlight/backend/private-graph/graph"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	pubgraph "github.com/highlight-run/highlight/backend/public-graph/graph"
	publicModel "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/stacktraces"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/zapier"
	"github.com/highlight-run/workerpool"
	"github.com/leonelquinteros/hubspot"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"
	e "github.com/pkg/errors"
	"github.com/shirou/gopsutil/mem"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
)

// Worker is a job runner that parses sessions
const MIN_INACTIVE_DURATION = 10

// For active and inactive segment calculation
const INACTIVE_THRESHOLD = 0.02

// Stop trying to reprocess a session if its retry count exceeds this
const MAX_RETRIES = 5

// cancel events_objects reads after 5 minutes
const EVENTS_READ_TIMEOUT = 300000

// cancel refreshing materialized views after 30 minutes
const REFRESH_MATERIALIZED_VIEW_TIMEOUT = 30 * 60 * 1000

type Worker struct {
	Resolver       *mgraph.Resolver
	PublicResolver *pubgraph.Resolver
	StorageClient  storage.Client
}

func (w *Worker) pushToObjectStorage(ctx context.Context, s *model.Session, payloadManager *payload.PayloadManager) error {
	totalPayloadSize, err := w.StorageClient.PushFiles(ctx, s.ID, s.ProjectID, payloadManager)
	// If this is unsuccessful, return early (we treat this session as if it is stored in psql).
	if err != nil {
		return errors.Wrap(err, "error pushing files to s3")
	}

	// Mark this session as stored in S3.
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{ObjectStorageEnabled: &model.T, Chunked: &model.T, PayloadSize: &totalPayloadSize, DirectDownloadEnabled: true, AllObjectsCompressed: true},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to storage enabled")
	}

	if err := w.Resolver.OpenSearch.UpdateSynchronous(opensearch.IndexSessions, s.ID, map[string]interface{}{
		"object_storage_enabled":  true,
		"payload_size":            totalPayloadSize,
		"direct_download_enabled": true,
	}); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
	}

	if err := w.Resolver.DataSyncQueue.Submit(ctx, strconv.Itoa(s.ID), &kafkaqueue.Message{Type: kafkaqueue.SessionDataSync, SessionDataSync: &kafkaqueue.SessionDataSyncArgs{SessionID: s.ID}}); err != nil {
		return err
	}

	return nil
}

func (w *Worker) writeToEventChunk(ctx context.Context, manager *payload.PayloadManager, dataObject model.Object, s *model.Session, accumulator *EventProcessingAccumulator) error {
	events, err := parse.EventsFromString(dataObject.Contents())
	if err != nil {
		return errors.Wrap(err, "error parsing events from string")
	}

	chunkIdx := 0
	hadFullSnapshot := false
	var eventChunks [][]*parse.ReplayEvent
	for _, event := range events.Events {
		if event.Type == parse.FullSnapshot {
			if hadFullSnapshot {
				chunkIdx++
			}
			hadFullSnapshot = true
		}
		if len(eventChunks) <= chunkIdx {
			eventChunks = append(eventChunks, []*parse.ReplayEvent{})
		}
		eventChunks[chunkIdx] = append(eventChunks[chunkIdx], event)
	}
	for _, events := range eventChunks {
		if len(events) == 0 {
			continue
		}
		if hadFullSnapshot {
			sessionIdString := os.Getenv("SESSION_FILE_PATH_PREFIX") + strconv.FormatInt(int64(s.ID), 10)
			if manager.EventsChunked != nil {
				// close the chunk file
				if err := manager.EventsChunked.Close(); err != nil {
					return errors.Wrap(err, "error closing chunked events writer")
				}
			}
			curChunkedFile := manager.GetFile(payload.EventsChunked)
			if curChunkedFile != nil {
				curOffset := manager.ChunkIndex
				_, err = w.StorageClient.PushCompressedFile(ctx, s.ID, s.ProjectID, curChunkedFile, storage.GetChunkedPayloadType(curOffset))
				if err != nil {
					return errors.Wrap(err, "error pushing event chunk file to s3")
				}
			}
			if err := manager.NewChunkedFile(ctx, sessionIdString); err != nil {
				return errors.Wrap(err, "error creating new chunked events file")
			}
			eventChunk := &model.EventChunk{
				SessionID:  s.ID,
				ChunkIndex: manager.ChunkIndex,
				Timestamp:  int64(events[0].TimestampRaw),
			}
			accumulator.EventChunks = append(accumulator.EventChunks, eventChunk)
		}
		eventsBytes, err := json.Marshal(&parse.ReplayEvents{Events: events})
		if err != nil {
			return errors.Wrap(err, "error marshalling chunked events")
		}
		if manager.GetFile(payload.EventsChunked) != nil {
			if err := manager.EventsChunked.WriteObject(&model.EventsObject{Events: string(eventsBytes)}, &payload.EventsUnmarshalled{}); err != nil {
				if err != nil {
					return errors.Wrap(err, "error writing chunked event")
				}
			}
		}
	}
	return nil
}

func (w *Worker) writeSessionDataFromRedis(ctx context.Context, manager *payload.PayloadManager, s *model.Session, payloadType model.RawPayloadType, accumulator *EventProcessingAccumulator) error {
	var compressedWriter *payload.CompressedWriter
	var unmarshalled payload.Unmarshalled
	switch payloadType {
	case model.PayloadTypeEvents:
		compressedWriter = manager.EventsCompressed
		unmarshalled = &payload.EventsUnmarshalled{}
	case model.PayloadTypeResources:
		compressedWriter = manager.ResourcesCompressed
		unmarshalled = &payload.ResourcesUnmarshalled{}
	case model.PayloadTypeWebSocketEvents:
		compressedWriter = manager.WebSocketEventsCompressed
		unmarshalled = &payload.WebSocketEventsUnmarshalled{}
	}

	writeChunks := os.Getenv("ENABLE_OBJECT_STORAGE") == "true" && payloadType == model.PayloadTypeEvents

	s3Events, err := w.Resolver.StorageClient.GetRawData(ctx, s.ID, s.ProjectID, payloadType)
	if err != nil {
		return errors.Wrap(err, "error retrieving objects from S3")
	}

	dataStrs, err := w.Resolver.Redis.GetSessionData(ctx, s.ID, payloadType, s3Events)
	if err != nil {
		return errors.Wrap(err, "error retrieving objects from Redis")
	}

	for _, dataStr := range dataStrs {
		asBytes := []byte(dataStr)

		// Messages may be encoded with `snappy`.
		// Try decoding them, but if decoding fails, use the original message.
		decoded, err := snappy.Decode(nil, asBytes)
		if err != nil {
			decoded = asBytes
		}

		dataObject := model.SessionData{
			Data: string(decoded),
		}

		if payloadType == model.PayloadTypeEvents {
			*accumulator = processEventChunk(ctx, *accumulator, model.EventsObject{
				Events: dataObject.Contents(),
			})
			if accumulator.Error != nil {
				return e.Wrap(accumulator.Error, "error processing event chunk")
			}
		}

		if err := compressedWriter.WriteObject(&dataObject, unmarshalled); err != nil {
			return errors.Wrap(err, "error writing compressed row")
		}
		if writeChunks {
			if err := w.writeToEventChunk(ctx, manager, &dataObject, s, accumulator); err != nil {
				return errors.Wrap(err, "error writing chunk")
			}
		}
	}

	if err := compressedWriter.Close(); err != nil {
		return errors.Wrap(err, "error closing compressed writer")
	}

	// If the last event chunk file hasn't been closed / written to s3, do that here
	if manager.EventsChunked != nil {
		if err := manager.EventsChunked.Close(); err != nil {
			return errors.Wrap(err, "error closing compressed events chunk writer")
		}
		curOffset := manager.ChunkIndex
		_, err = w.StorageClient.PushCompressedFile(ctx, s.ID, s.ProjectID, manager.GetFile(payload.EventsChunked), storage.GetChunkedPayloadType(curOffset))
		if err != nil {
			return errors.Wrap(err, "error pushing event chunk file to s3")
		}
		manager.EventsChunked = nil
	}

	return nil
}

func (w *Worker) scanSessionPayload(ctx context.Context, manager *payload.PayloadManager, s *model.Session, accumulator *EventProcessingAccumulator) error {
	if err := w.writeSessionDataFromRedis(ctx, manager, s, model.PayloadTypeEvents, accumulator); err != nil {
		return errors.Wrap(err, "error fetching events from Redis")
	}

	if len(accumulator.EventChunks) > 0 {
		if err := w.Resolver.DB.Create(accumulator.EventChunks).Error; err != nil {
			return errors.Wrap(err, "error saving event chunk metadata")
		}
	}

	// Fetch/write resources.
	if err := w.writeSessionDataFromRedis(ctx, manager, s, model.PayloadTypeResources, accumulator); err != nil {
		return errors.Wrap(err, "error fetching resources from Redis")
	}

	// Fetch/write web socket events.
	if err := w.writeSessionDataFromRedis(ctx, manager, s, model.PayloadTypeWebSocketEvents, accumulator); err != nil {
		return errors.Wrap(err, "error fetching web socket events from Redis")
	}

	return nil
}

func (w *Worker) getSessionID(ctx context.Context, sessionSecureID string) (id int, err error) {
	s, _ := tracer.StartSpanFromContext(ctx, "getSessionID", tracer.ResourceName("worker.getSessionID"))
	s.SetTag("secure_id", sessionSecureID)
	defer s.Finish()
	if sessionSecureID == "" {
		return 0, e.New("getSessionID called with no secure id")
	}
	session := &model.Session{}
	w.Resolver.DB.Select("id").Where(&model.Session{SecureID: sessionSecureID}).Take(&session)
	if session.ID == 0 {
		return 0, e.New(fmt.Sprintf("no session found for secure id: '%s'", sessionSecureID))
	}
	id = session.ID
	return
}

func (w *Worker) processPublicWorkerMessage(ctx context.Context, task *kafkaqueue.Message) error {
	switch task.Type {
	case kafkaqueue.PushPayload:
		if task.PushPayload == nil {
			break
		}
		if err := w.PublicResolver.ProcessPayload(
			ctx,
			task.PushPayload.SessionSecureID,
			task.PushPayload.Events,
			task.PushPayload.Messages,
			task.PushPayload.Resources,
			task.PushPayload.WebSocketEvents,
			task.PushPayload.Errors,
			task.PushPayload.IsBeacon != nil && *task.PushPayload.IsBeacon,
			task.PushPayload.HasSessionUnloaded != nil && *task.PushPayload.HasSessionUnloaded,
			task.PushPayload.HighlightLogs,
			task.PushPayload.PayloadID); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.InitializeSession:
		if task.InitializeSession == nil {
			break
		}
		s, err := w.PublicResolver.InitializeSessionImpl(ctx, task.InitializeSession)
		tags := []string{fmt.Sprintf("success:%t", err == nil)}
		if s != nil {
			tags = append(tags, fmt.Sprintf("secure_id:%q", s.SecureID), fmt.Sprintf("project_id:%d", s.ProjectID))
		}
		hlog.Incr("worker.initializeSession.count", tags, 1)
		if err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.IdentifySession:
		if task.IdentifySession == nil {
			break
		}
		if err := w.PublicResolver.IdentifySessionImpl(ctx, task.IdentifySession.SessionSecureID, task.IdentifySession.UserIdentifier, task.IdentifySession.UserObject, false); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.AddTrackProperties:
		if task.AddTrackProperties == nil {
			break
		}
		sessionID, err := w.getSessionID(ctx, task.AddTrackProperties.SessionSecureID)
		if err != nil {
			return err
		}
		if err := w.PublicResolver.AddTrackPropertiesImpl(ctx, sessionID, task.AddTrackProperties.PropertiesObject); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.AddSessionProperties:
		if task.AddSessionProperties == nil {
			break
		}
		sessionID, err := w.getSessionID(ctx, task.AddSessionProperties.SessionSecureID)
		if err != nil {
			return err
		}
		if err := w.PublicResolver.AddSessionPropertiesImpl(ctx, sessionID, task.AddSessionProperties.PropertiesObject); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.PushBackendPayload:
		if task.PushBackendPayload == nil {
			break
		}
		w.PublicResolver.ProcessBackendPayloadImpl(ctx, task.PushBackendPayload.SessionSecureID, task.PushBackendPayload.ProjectVerboseID, task.PushBackendPayload.Errors)
	case kafkaqueue.PushMetrics:
		if task.PushMetrics == nil {
			break
		}
		if err := w.PublicResolver.PushMetricsImpl(ctx, task.PushMetrics.SessionSecureID, task.PushMetrics.Metrics); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.AddSessionFeedback:
		if task.AddSessionFeedback == nil {
			break
		}
		if err := w.PublicResolver.AddSessionFeedbackImpl(ctx, task.AddSessionFeedback); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.HubSpotCreateContactForAdmin:
		if task.HubSpotCreateContactForAdmin == nil {
			break
		}
		if _, err := w.PublicResolver.HubspotApi.CreateContactForAdminImpl(ctx,
			task.HubSpotCreateContactForAdmin.AdminID,
			task.HubSpotCreateContactForAdmin.Email,
			task.HubSpotCreateContactForAdmin.UserDefinedRole,
			task.HubSpotCreateContactForAdmin.UserDefinedPersona,
			task.HubSpotCreateContactForAdmin.UserDefinedTeamSize,
			task.HubSpotCreateContactForAdmin.First,
			task.HubSpotCreateContactForAdmin.Last,
			task.HubSpotCreateContactForAdmin.Phone,
			task.HubSpotCreateContactForAdmin.Referral,
		); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.HubSpotCreateCompanyForWorkspace:
		if task.HubSpotCreateCompanyForWorkspace == nil {
			break
		}
		if _, err := w.PublicResolver.HubspotApi.CreateCompanyForWorkspaceImpl(ctx,
			task.HubSpotCreateCompanyForWorkspace.WorkspaceID,
			task.HubSpotCreateCompanyForWorkspace.AdminEmail,
			task.HubSpotCreateCompanyForWorkspace.Name,
		); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.HubSpotUpdateContactProperty:
		if task.HubSpotUpdateContactProperty == nil {
			break
		}
		if err := w.PublicResolver.HubspotApi.UpdateContactPropertyImpl(ctx,
			task.HubSpotUpdateContactProperty.AdminID,
			task.HubSpotUpdateContactProperty.Properties,
		); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.HubSpotUpdateCompanyProperty:
		if task.HubSpotUpdateCompanyProperty == nil {
			break
		}
		if err := w.PublicResolver.HubspotApi.UpdateCompanyPropertyImpl(ctx,
			task.HubSpotUpdateCompanyProperty.WorkspaceID,
			task.HubSpotUpdateCompanyProperty.Properties,
		); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.HubSpotCreateContactCompanyAssociation:
		if task.HubSpotCreateContactCompanyAssociation == nil {
			break
		}
		if err := w.PublicResolver.HubspotApi.CreateContactCompanyAssociationImpl(ctx,
			task.HubSpotCreateContactCompanyAssociation.AdminID,
			task.HubSpotCreateContactCompanyAssociation.WorkspaceID,
		); err != nil {
			log.WithContext(ctx).WithError(err).WithField("type", task.Type).Error("failed to process task")
			return err
		}
	case kafkaqueue.HealthCheck:
	default:
		log.WithContext(ctx).Errorf("Unknown task type %+v", task.Type)
	}
	return nil
}

type WorkerConfig struct {
	Workers      int
	FlushSize    int
	FlushTimeout time.Duration
	Topic        kafkaqueue.TopicType
}

func (w *Worker) PublicWorker(ctx context.Context) {
	// creates N parallel kafka message consumers that process messages.
	// each consumer is considered part of the same consumer group and gets
	// allocated a slice of all partitions. this ensures that a particular subset of partitions
	// is processed serially, so messages in that slice are processed in order.

	mainWorkers := 64
	sys, cfgErr := w.PublicResolver.Store.GetSystemConfiguration(ctx)
	if cfgErr == nil {
		mainWorkers = sys.MainWorkers
	}

	logsConfig := WorkerConfig{
		Topic:        kafkaqueue.TopicTypeBatched,
		Workers:      sys.LogsWorkers,
		FlushSize:    sys.LogsFlushSize,
		FlushTimeout: sys.LogsFlushTimeout,
	}

	tracesConfig := WorkerConfig{
		Topic:        kafkaqueue.TopicTypeTraces,
		Workers:      sys.TraceWorkers,
		FlushSize:    sys.TraceFlushSize,
		FlushTimeout: sys.TraceFlushTimeout,
	}

	dataSyncConfig := WorkerConfig{
		Topic:        kafkaqueue.TopicTypeDataSync,
		Workers:      sys.DataSyncWorkers,
		FlushSize:    sys.DataSyncFlushSize,
		FlushTimeout: sys.DataSyncTimeout,
	}

	wg := sync.WaitGroup{}
	wg.Add(mainWorkers)
	for i := 0; i < mainWorkers; i++ {
		go func(workerId int) {
			k := KafkaWorker{
				KafkaQueue:   kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeDefault}), kafkaqueue.Consumer, nil),
				Worker:       w,
				WorkerThread: workerId,
			}
			k.ProcessMessages(ctx)
			wg.Done()
		}(i)
	}

	for _, cfg := range []WorkerConfig{logsConfig, tracesConfig, dataSyncConfig} {
		if cfg.Workers == 0 {
			cfg.Workers = 1
		}
		if cfg.FlushSize == 0 {
			cfg.FlushSize = DefaultBatchFlushSize
		}
		if cfg.FlushTimeout == 0 {
			cfg.FlushTimeout = DefaultBatchedFlushTimeout
		}
		wg.Add(cfg.Workers)
		for i := 0; i < cfg.Workers; i++ {
			go func(config WorkerConfig, workerId int) {
				ctx := context.Background()
				k := KafkaBatchWorker{
					KafkaQueue: kafkaqueue.New(
						ctx,
						kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: config.Topic}),
						kafkaqueue.Consumer, &kafkaqueue.ConfigOverride{QueueCapacity: pointy.Int(config.FlushSize)},
					),
					Worker:              w,
					BatchFlushSize:      config.FlushSize,
					BatchedFlushTimeout: config.FlushTimeout,
					Name:                string(config.Topic),
				}
				k.ProcessMessages(ctx)
				wg.Done()
			}(cfg, i)
		}
	}

	wg.Wait()
}

// Delete data for any sessions created > 4 hours ago
// if all session data has been written to s3
func (w *Worker) DeleteCompletedSessions(ctx context.Context) {
	lookbackPeriod := 4*60 + 10 // 4h10m

	baseQuery := `
				DELETE
				FROM %s o
				USING sessions s
				WHERE o.session_id = s.id
				AND s.object_storage_enabled = True
				AND s.payload_updated_at < s.lock
				AND s.created_at < NOW() - (? * INTERVAL '1 MINUTE')
				AND s.created_at > NOW() - INTERVAL '1 WEEK'`

	for _, table := range []string{"resources_objects", "messages_objects"} {
		deleteSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.deleteObjects",
			tracer.ResourceName("worker.deleteObjects"), tracer.Tag("table", table))
		if err := w.Resolver.DB.Exec(fmt.Sprintf(baseQuery, table), lookbackPeriod).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error deleting expired objects from %s", table))
		}
		deleteSpan.Finish()
	}
}

// Autoresolves error groups that have not had any recent instances
func (w *Worker) AutoResolveStaleErrors(ctx context.Context) {
	autoResolver := NewAutoResolver(w.PublicResolver.Store, w.PublicResolver.DB)
	autoResolver.AutoResolveStaleErrors(ctx)
}

func (w *Worker) excludeSession(ctx context.Context, s *model.Session, reason backend.SessionExcludedReason) error {
	s.Excluded = true
	s.ExcludedReason = &reason
	s.Processed = &model.T
	if err := w.Resolver.DB.Table(model.SESSIONS_TBL).Model(&model.Session{Model: model.Model{ID: s.ID}}).Updates(s).Error; err != nil {
		log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier,
			"session_obj": s}).Warnf("error excluding session (session_id=%d, identifier=%s, is_in_obj_already=%v, processed=%v): %v", s.ID, s.Identifier, s.ObjectStorageEnabled, s.Processed, err)
	}

	if err := w.Resolver.OpenSearch.UpdateSynchronous(opensearch.IndexSessions, s.ID, map[string]interface{}{
		"Excluded":  true,
		"processed": true,
	}); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
	}

	if err := w.Resolver.DataSyncQueue.Submit(ctx, strconv.Itoa(s.ID), &kafkaqueue.Message{Type: kafkaqueue.SessionDataSync, SessionDataSync: &kafkaqueue.SessionDataSyncArgs{SessionID: s.ID}}); err != nil {
		return err
	}

	return nil
}

func (w *Worker) processSession(ctx context.Context, s *model.Session) error {
	project := &model.Project{}
	if err := w.Resolver.DB.Where(&model.Project{Model: model.Model{ID: s.ProjectID}}).Take(&project).Error; err != nil {
		return e.Wrap(err, "error querying project")
	}

	var rageClickSettings = RageClickSettings{
		Window: time.Duration(project.RageClickCount) * time.Second,
		Radius: project.RageClickRadiusPixels,
		Count:  project.RageClickCount,
	}

	accumulator := MakeEventProcessingAccumulator(s.SecureID, rageClickSettings)

	sessionIdString := os.Getenv("SESSION_FILE_PATH_PREFIX") + strconv.FormatInt(int64(s.ID), 10)

	payloadManager, err := payload.NewPayloadManager(ctx, sessionIdString)
	if err != nil {
		return errors.Wrap(err, "error creating payload manager")
	}
	defer payloadManager.Close()

	if !s.AvoidPostgresStorage {
		// Delete any timeline indicator events which were previously written for this session
		if err := w.Resolver.DB.Where("session_secure_id = ?", s.SecureID).
			Delete(&model.TimelineIndicatorEvent{}).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error deleting outdated timeline indicator events"))
		}
	}

	// Delete any event chunks which were previously written for this session
	if err := w.Resolver.DB.Where("session_id = ?", s.ID).
		Delete(&model.EventChunk{}).Error; err != nil {
		return errors.Wrap(err, "failed to delete existing event chunks")
	}

	// Delete any rage click events which were previously written for this session
	if err := w.Resolver.DB.Where("session_secure_id = ?", s.SecureID).
		Delete(&model.RageClickEvent{}).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error deleting outdated rage click events"))
	}

	// Delete any session intervals which were previously written for this session
	if err := w.Resolver.DB.Where("session_secure_id = ?", s.SecureID).
		Delete(&model.SessionInterval{}).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error deleting outdated session intervals"))
	}

	if err := w.scanSessionPayload(ctx, payloadManager, s, &accumulator); err != nil {
		return errors.Wrap(err, "error scanning session payload")
	}

	// Measure payload sizes.
	if err := payloadManager.ReportPayloadSizes(); err != nil {
		return errors.Wrap(err, "error reporting payload sizes")
	}

	// Exclude the session if there's no events.
	if len(accumulator.EventsForTimelineIndicator) == 0 && s.Length <= 0 {
		return w.excludeSession(ctx, s, backend.SessionExcludedReasonNoTimelineIndicatorEvents)
	}

	payloadManager.SeekStart(ctx)

	var normalness float64
	if len(accumulator.EventsForTimelineIndicator) > 0 {
		var eventsForTimelineIndicator []*model.TimelineIndicatorEvent
		for _, customEvent := range accumulator.EventsForTimelineIndicator {
			var parsedData model.JSONB
			err = json.Unmarshal(customEvent.Data, &parsedData)
			if err != nil {
				return e.Wrap(err, "error unmarshalling event chunk")
			}
			eventsForTimelineIndicator = append(eventsForTimelineIndicator, &model.TimelineIndicatorEvent{
				SessionSecureID: s.SecureID,
				Timestamp:       customEvent.TimestampRaw,
				SID:             customEvent.SID,
				Type:            int(customEvent.Type),
				Data:            parsedData,
			})
		}
		if s.AvoidPostgresStorage {
			eventBytes, err := json.Marshal(eventsForTimelineIndicator)
			if err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error marshalling eventsForTimelineIndicator"))
			}
			if err := payloadManager.TimelineIndicatorEvents.WriteString(string(eventBytes)); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error writing to TimelineIndicatorEvents"))
			}
			if err := payloadManager.TimelineIndicatorEvents.Close(); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error closing TimelineIndicatorEvents writer"))
			}

			// Extract and save the user journey steps from the timeline indicator events
			userJourneySteps, err := journey_handlers.GetUserJourneySteps(s.ProjectID, s.ID, eventBytes)
			if err != nil {
				return err
			}
			if err := w.Resolver.DB.Model(&model.UserJourneyStep{}).Save(&userJourneySteps).Error; err != nil {
				return err
			}
		} else {
			if err := w.Resolver.DB.Create(eventsForTimelineIndicator).Error; err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error creating events for timeline indicator"))
			}
		}
	}

	for i, r := range accumulator.RageClickSets {
		r.SessionSecureID = s.SecureID
		r.ProjectID = s.ProjectID
		accumulator.RageClickSets[i] = r
	}
	hasRageClicks := len(accumulator.RageClickSets) > 0
	if hasRageClicks {
		if err := w.Resolver.DB.Create(&accumulator.RageClickSets).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error creating rage click sets"))
		}
	}

	userInteractionEvents := accumulator.UserInteractionEvents
	if len(userInteractionEvents) == 0 {
		return w.excludeSession(ctx, s, backend.SessionExcludedReasonNoUserInteractionEvents)
	}

	userInteractionEvents = append(userInteractionEvents, []*parse.ReplayEvent{{
		Timestamp: accumulator.FirstFullSnapshotTimestamp,
	}, {
		Timestamp: accumulator.LastEventTimestamp,
	}}...)

	// sort events by timestamp since calculations assume this
	sort.Slice(userInteractionEvents, func(i, j int) bool {
		return userInteractionEvents[i].Timestamp.UnixNano() < userInteractionEvents[j].Timestamp.UnixNano()
	})

	var allIntervals []model.SessionInterval
	startTime := userInteractionEvents[0].Timestamp
	var activeInterval bool
	for i := 1; i < len(userInteractionEvents); i++ {
		currentEvent := userInteractionEvents[i-1]
		nextEvent := userInteractionEvents[i]
		diff := nextEvent.Timestamp.Sub(currentEvent.Timestamp)
		intervalDiff := currentEvent.Timestamp.Sub(startTime)
		if diff.Seconds() <= MIN_INACTIVE_DURATION {
			if i == 1 {
				activeInterval = model.T
			}
			if !activeInterval {
				allIntervals = append(allIntervals, model.SessionInterval{
					SessionSecureID: s.SecureID,
					StartTime:       startTime,
					EndTime:         currentEvent.Timestamp,
					Duration:        int(intervalDiff.Milliseconds()),
					Active:          model.F,
				})
				startTime = currentEvent.Timestamp
				activeInterval = model.T
			}
		} else {
			if i == 1 {
				activeInterval = model.F
			}
			if activeInterval {
				allIntervals = append(allIntervals, model.SessionInterval{
					SessionSecureID: s.SecureID,
					StartTime:       startTime,
					EndTime:         currentEvent.Timestamp,
					Duration:        int(intervalDiff.Milliseconds()),
					Active:          model.T,
				})
				startTime = currentEvent.Timestamp
				activeInterval = model.F
			}
		}
		if i == len(userInteractionEvents)-1 {
			allIntervals = append(allIntervals, model.SessionInterval{
				SessionSecureID: s.SecureID,
				StartTime:       startTime,
				EndTime:         nextEvent.Timestamp,
				Duration:        int(nextEvent.Timestamp.Sub(startTime).Milliseconds()),
				Active:          activeInterval,
			})
		}
	}

	if len(allIntervals) < 1 {
		return nil
	}
	// Merges inactive segments that are less than a threshold into surrounding active sessions
	var finalIntervals []model.SessionInterval
	startInterval := allIntervals[0]
	sessionLength := float64(CalculateSessionLength(accumulator.FirstFullSnapshotTimestamp, accumulator.LastEventTimestamp).Milliseconds())
	for i := 1; i < len(allIntervals); i++ {
		currentInterval := allIntervals[i-1]
		nextInterval := allIntervals[i]
		if (!nextInterval.Active && nextInterval.Duration > int(INACTIVE_THRESHOLD*sessionLength)) || (!currentInterval.Active && currentInterval.Duration > int(INACTIVE_THRESHOLD*sessionLength)) {
			finalIntervals = append(finalIntervals, model.SessionInterval{
				SessionSecureID: s.SecureID,
				StartTime:       startInterval.StartTime,
				EndTime:         currentInterval.EndTime,
				Duration:        int(currentInterval.EndTime.Sub(startInterval.StartTime).Milliseconds()),
				Active:          currentInterval.Active,
			})
			startInterval = nextInterval
		}
	}
	if len(allIntervals) > 0 {
		finalIntervals = append(finalIntervals, model.SessionInterval{
			SessionSecureID: s.SecureID,
			StartTime:       startInterval.StartTime,
			EndTime:         allIntervals[len(allIntervals)-1].EndTime,
			Duration:        int(allIntervals[len(allIntervals)-1].EndTime.Sub(startInterval.StartTime).Milliseconds()),
			Active:          allIntervals[len(allIntervals)-1].Active,
		})
	}

	if err := w.Resolver.DB.Create(finalIntervals).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error creating session activity intervals"))
	}

	var eventCountsLen int64 = 100
	window := float64(accumulator.LastEventTimestamp.Sub(accumulator.FirstFullSnapshotTimestamp).Milliseconds()) / float64(eventCountsLen)
	eventCounts := make([]int64, eventCountsLen)
	for t, c := range accumulator.TimestampCounts {
		i := int64(math.Round(float64(t.Sub(accumulator.FirstFullSnapshotTimestamp).Milliseconds()) / window))
		if i < 0 {
			i = 0
		} else if i > 99 {
			i = 99
		}
		eventCounts[i] += int64(c)
	}
	eventCountsBytes, err := json.Marshal(eventCounts)
	if err != nil {
		return err
	}
	eventCountsString := string(eventCountsBytes)

	// Calculate total session length and write the length to the session.
	sessionTotalLength := CalculateSessionLength(accumulator.FirstFullSnapshotTimestamp, accumulator.LastEventTimestamp)
	sessionTotalLengthInMilliseconds := sessionTotalLength.Milliseconds()

	// Delete the session if the length of the session is 0.
	// 1. Nothing happened in the session
	// 2. A web crawler visited the page and produced no events
	if accumulator.ActiveDuration == 0 {
		return w.excludeSession(ctx, s, backend.SessionExcludedReasonNoActivity)
	}

	visitFields := []model.Field{}
	if err := w.Resolver.DB.Model(&model.Session{Model: model.Model{ID: s.ID}}).Where("Name = ?", "visited-url").Where("session_fields.id IS NOT NULL").Order("session_fields.id asc").Association("Fields").Find(&visitFields); err != nil {
		return e.Wrap(err, "error querying session fields for determining landing/exit pages")
	}

	pagesVisited := len(visitFields)

	workspace, err := w.Resolver.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return err
	}
	withinBillingQuota, _ := w.PublicResolver.IsWithinQuota(ctx, model.PricingProductTypeSessions, workspace, time.Now())

	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		model.Session{
			Processed:           &model.T,
			Length:              sessionTotalLengthInMilliseconds,
			ActiveLength:        accumulator.ActiveDuration.Milliseconds(),
			EventCounts:         &eventCountsString,
			HasRageClicks:       &hasRageClicks,
			HasOutOfOrderEvents: accumulator.AreEventsOutOfOrder,
			PagesVisited:        pagesVisited,
			WithinBillingQuota:  &withinBillingQuota,
			Normalness:          &normalness,
		},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	if err := w.Resolver.OpenSearch.UpdateSynchronous(opensearch.IndexSessions, s.ID, map[string]interface{}{
		"processed":       true,
		"length":          sessionTotalLengthInMilliseconds,
		"active_length":   accumulator.ActiveDuration.Milliseconds(),
		"EventCounts":     eventCountsString,
		"has_rage_clicks": hasRageClicks,
		"pages_visited":   pagesVisited,
	}); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
	}

	if err := w.Resolver.DataSyncQueue.Submit(ctx, strconv.Itoa(s.ID), &kafkaqueue.Message{Type: kafkaqueue.SessionDataSync, SessionDataSync: &kafkaqueue.SessionDataSyncArgs{SessionID: s.ID}}); err != nil {
		return err
	}

	if len(visitFields) >= 1 {
		sessionProperties := map[string]string{
			"landing_page": visitFields[0].Value,
			"exit_page":    visitFields[len(visitFields)-1].Value,
		}
		if err := w.PublicResolver.AppendProperties(ctx, s.ID, sessionProperties, pubgraph.PropertyType.SESSION); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "[processSession] error appending properties for session %d", s.ID))
		}
	}

	if err := w.PublicResolver.PushMetricsImpl(ctx, s.SecureID, []*publicModel.MetricInput{
		{
			SessionSecureID: s.SecureID,
			Timestamp:       s.CreatedAt,
			Name:            mgraph.SessionActiveMetricName,
			Value:           float64(accumulator.ActiveDuration.Milliseconds()),
			Category:        pointy.String(model.InternalMetricCategory),
			Tags: []*publicModel.MetricTag{
				{Name: "Excluded", Value: "false"},
				{Name: "Processed", Value: "true"},
			},
		},
		{
			SessionSecureID: s.SecureID,
			Timestamp:       s.CreatedAt,
			Name:            mgraph.SessionProcessedMetricName,
			Value:           float64(s.ID),
			Category:        pointy.String(model.InternalMetricCategory),
			Tags: []*publicModel.MetricTag{
				{Name: "Excluded", Value: "false"},
				{Name: "Processed", Value: "true"},
			},
		},
	}); err != nil {
		log.WithContext(ctx).Errorf("failed to submit session processing metric for %s: %s", s.SecureID, err)
	}

	// Update session count on dailydb
	currentDate := time.Date(s.CreatedAt.UTC().Year(), s.CreatedAt.UTC().Month(), s.CreatedAt.UTC().Day(), 0, 0, 0, 0, time.UTC)
	dailySession := &model.DailySessionCount{}
	if err := w.Resolver.DB.
		Where(&model.DailySessionCount{
			ProjectID: s.ProjectID,
			Date:      &currentDate,
		}).Attrs(&model.DailySessionCount{Count: 0}).
		FirstOrCreate(&dailySession).Error; err != nil {
		return e.Wrap(err, "Error creating new daily session")
	}

	if err := w.Resolver.DB.
		Where(&model.DailySessionCount{Model: model.Model{ID: dailySession.ID}}).
		Updates(&model.DailySessionCount{Count: dailySession.Count + 1}).Error; err != nil {
		return e.Wrap(err, "Error incrementing session count in db")
	}

	var g errgroup.Group
	projectID := s.ProjectID

	g.Go(func() error {
		if len(accumulator.RageClickSets) < 1 {
			return nil
		}
		// Sending Rage Click Alert
		var sessionAlerts []*model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID, Disabled: &model.F}}).Where("type=?", model.AlertType.RAGE_CLICK).Find(&sessionAlerts).Error; err != nil {
			return e.Wrapf(err, "[project_id: %d] error fetching rage click alert", projectID)
		}

		for _, sessionAlert := range sessionAlerts {
			if sessionAlert.CountThreshold < 1 {
				return nil
			}

			// check if session was produced from an excluded environment
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				return e.Wrapf(err, "[project_id: %d] error getting excluded environments from user properties alert", projectID)
			}
			isExcludedEnvironment := false
			for _, env := range excludedEnvironments {
				if env != nil && *env == s.Environment {
					isExcludedEnvironment = true
					break
				}
			}
			if isExcludedEnvironment {
				return nil
			}

			workspace, err := w.Resolver.GetWorkspace(project.WorkspaceID)
			if err != nil {
				return e.Wrap(err, "error querying workspace")
			}

			if sessionAlert.ThresholdWindow == nil {
				sessionAlert.ThresholdWindow = ptr.Int(30)
			}
			var count int
			if err := w.Resolver.DB.Raw(`
				SELECT COUNT(*)
				FROM rage_click_events
				WHERE
					project_id=?
					AND created_at > (NOW() - ? * INTERVAL '1 MINUTE')
				`, projectID, sessionAlert.ThresholdWindow).Scan(&count).Error; err != nil {
				return e.Wrap(err, "error counting rage clicks")
			}
			if count < sessionAlert.CountThreshold {
				return nil
			}

			count64 := int64(count)
			slackAlertPayload := model.SendSlackAlertInput{
				Workspace:       workspace,
				SessionSecureID: s.SecureID,
				SessionExcluded: s.Excluded,
				UserIdentifier:  s.Identifier,
				UserObject:      s.UserObject,
				RageClicksCount: &count64,
				QueryParams:     map[string]string{"tsAbs": fmt.Sprintf("%d", accumulator.RageClickSets[0].StartTimestamp.UnixNano()/int64(time.Millisecond))},
			}

			hookPayload := zapier.HookPayload{
				UserIdentifier: s.Identifier, UserObject: s.UserObject, RageClicksCount: &count64,
			}

			if err := w.Resolver.RH.Notify(s.ProjectID, fmt.Sprintf("SessionAlert_%d", sessionAlert.ID), hookPayload); err != nil {
				log.WithContext(ctx).Error(e.Wrapf(err, "couldn't notify zapier on session alert (id: %d)", sessionAlert.ID))
			}
			sessionAlert.SendAlerts(ctx, w.Resolver.DB, w.Resolver.MailClient, &slackAlertPayload)

			if err = alerts.SendRageClicksAlert(alerts.RageClicksAlertEvent{
				Session:         s,
				SessionAlert:    sessionAlert,
				Workspace:       workspace,
				RageClicksCount: count64,
			}); err != nil {
				log.WithContext(ctx).Error(err)
			}
		}
		return nil
	})

	// Waits for all goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Error(e.Wrap(err, "error sending slack alert"))
	}

	// Upload to s3 and wipe from the db.
	if os.Getenv("ENABLE_OBJECT_STORAGE") == "true" {
		if err := w.pushToObjectStorage(ctx, s, payloadManager); err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Error(e.Wrap(err, "error pushing to object and wiping from db"))
		}
	}

	return nil
}

// Start begins the worker's tasks.
func (w *Worker) Start(ctx context.Context) {
	payloadLookbackPeriod := 60 // a session must be stale for at least this long to be processed
	lockPeriod := 30            // time in minutes

	if util.IsDevEnv() {
		payloadLookbackPeriod = 8
		lockPeriod = 1
	}

	go reportProcessSessionCount(ctx, w.Resolver.DB, payloadLookbackPeriod, lockPeriod)
	maxWorkerCount := 10
	processSessionLimit := 200
	wp := workerpool.New(maxWorkerCount)
	wp.SetPanicHandler(util.Recover)
	for {
		time.Sleep(1 * time.Second)
		sessions := []*model.Session{}
		sessionsSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.sessionsQuery", tracer.ResourceName("worker.sessionsQuery"))
		sessionLimitJitter := rand.Intn(100)
		limit := processSessionLimit + sessionLimitJitter
		txStart := time.Now()
		if err := w.Resolver.DB.Transaction(func(tx *gorm.DB) error {
			transactionCtx, cancel := context.WithTimeout(ctx, 20*time.Minute)
			defer cancel()

			errs := make(chan error, 1)
			go func() {
				defer util.Recover()
				if err := tx.Raw(`
						WITH t AS (
							UPDATE sessions
							SET lock=NOW()
							WHERE id in (
								SELECT ID FROM (
									SELECT id
									FROM sessions
									WHERE (processed = false)
										AND (excluded = false)
										AND (payload_updated_at < NOW() - (? * INTERVAL '1 SECOND'))
										AND (lock is null OR lock < NOW() - (? * INTERVAL '1 MINUTE'))
										AND (retry_count < ?)
									LIMIT ?
									FOR UPDATE SKIP LOCKED
								) s
								ORDER BY id
								FOR UPDATE SKIP LOCKED
							)
							RETURNING *
						)
						SELECT * FROM t;
					`, payloadLookbackPeriod, lockPeriod, MAX_RETRIES, limit). // why do we get payload_updated_at IS NULL?
					Find(&sessions).Error; err != nil {
					errs <- err
					return
				}
				errs <- nil
			}()

			select {
			case <-transactionCtx.Done():
				return e.New("transaction timeout occurred")
			case err := <-errs:
				if err != nil {
					return err
				}
			}
			return nil
		}); err != nil {
			log.WithContext(ctx).Errorf("error querying unparsed, outdated sessions, took [%v]: %v", time.Since(txStart), err)
			sessionsSpan.Finish()
			continue
		}
		rand.New(rand.NewSource(time.Now().UnixNano()))
		rand.Shuffle(len(sessions), func(i, j int) {
			sessions[i], sessions[j] = sessions[j], sessions[i]
		})
		// Sends a "count" metric to datadog so that we can see how many sessions are being queried.
		hlog.Histogram("worker.sessionsQuery.sessionCount", float64(len(sessions)), nil, 1) //nolint
		sessionsSpan.Finish()
		type SessionLog struct {
			SessionID int
			ProjectID int
		}
		sessionIds := []SessionLog{}
		for _, session := range sessions {
			sessionIds = append(sessionIds, SessionLog{SessionID: session.ID, ProjectID: session.ProjectID})
		}
		if len(sessionIds) > 0 {
			log.WithContext(ctx).Infof("sessions that will be processed: %v", sessionIds)
		}

		for _, session := range sessions {
			session := session
			wp.SubmitRecover(func() {
				ctx := context.Background()
				vmStat, _ := mem.VirtualMemory()

				// If WORKER_MAX_MEMORY_THRESHOLD is defined,
				// sleep until vmStat.UsedPercent is lower than this value
				workerMaxMemStr := os.Getenv("WORKER_MAX_MEMORY_THRESHOLD")
				workerMaxMem := math.Inf(1)
				if workerMaxMemStr != "" {
					workerMaxMem, _ = strconv.ParseFloat(workerMaxMemStr, 64)
				}
				for vmStat.UsedPercent > workerMaxMem {
					log.WithContext(ctx).Infof("worker memory use over threshold, sleeping. value: %f", vmStat.UsedPercent)
					time.Sleep(5 * time.Second)
					vmStat, _ = mem.VirtualMemory()
				}

				span, ctx := tracer.StartSpanFromContext(ctx, "worker.operation", tracer.ResourceName("worker.processSession"), tracer.Tag("project_id", session.ProjectID), tracer.Tag("session_secure_id", session.SecureID))
				if err := w.processSession(ctx, session); err != nil {
					nextCount := session.RetryCount + 1
					var excluded bool
					if nextCount >= MAX_RETRIES {
						excluded = true
					}

					if err := w.Resolver.DB.Model(&model.Session{}).
						Where(&model.Session{Model: model.Model{ID: session.ID}}).
						Updates(&model.Session{RetryCount: nextCount, Excluded: excluded}).Error; err != nil {
						log.WithContext(ctx).WithField("session_secure_id", session.SecureID).Error(e.Wrap(err, "error incrementing retry count"))
					}

					if excluded {
						log.WithContext(ctx).WithField("session_secure_id", session.SecureID).Warn(e.Wrap(err, "session has reached the max retry count and will be excluded"))
						if err := w.Resolver.OpenSearch.UpdateSynchronous(opensearch.IndexSessions, session.ID, map[string]interface{}{"Excluded": true}); err != nil {
							log.WithContext(ctx).WithField("session_secure_id", session.SecureID).Error(e.Wrap(err, "error updating session in opensearch"))
						}

						if err := w.Resolver.DataSyncQueue.Submit(ctx, strconv.Itoa(session.ID), &kafkaqueue.Message{Type: kafkaqueue.SessionDataSync, SessionDataSync: &kafkaqueue.SessionDataSyncArgs{SessionID: session.ID}}); err != nil {
							log.WithContext(ctx).WithField("session_secure_id", session.SecureID).Error(e.Wrap(err, "error submitting data sync message"))
						}

						span.Finish()
					} else {
						log.WithContext(ctx).WithField("session_secure_id", session.SecureID).Error(e.Wrap(err, "error processing main session"))
						span.Finish(tracer.WithError(e.Wrapf(err, "error processing session: %v", session.ID)))
					}

					return
				}
				hlog.Incr("sessionsProcessed", nil, 1)
				span.Finish()
			})
		}

		// While the waiting queue is saturated, sleep. Else, continue reading sessions to be processed.
		for wp.WaitingQueueSize() >= processSessionLimit {
			time.Sleep(1 * time.Second)
		}
	}
}

func (w *Worker) ReportStripeUsage(ctx context.Context) {
	pricing.NewWorker(w.Resolver.DB, w.Resolver.ClickhouseClient, w.Resolver.StripeClient, w.Resolver.MailClient, w.Resolver.HubspotApi).ReportAllUsage(ctx)
}

func (w *Worker) UpdateOpenSearchIndex(ctx context.Context) {
	w.IndexTable(ctx, opensearch.IndexFields, &model.Field{}, true)
	w.IndexTable(ctx, opensearch.IndexErrorFields, &model.ErrorField{}, true)
	w.IndexErrorGroups(ctx, true)
	w.IndexErrorObjects(ctx, true)
	w.IndexSessions(ctx, true)

	// Close the indexer channel and flush remaining items
	if err := w.Resolver.OpenSearch.Close(); err != nil {
		log.WithContext(ctx).Fatalf("OPENSEARCH_ERROR unexpected error while closing OpenSearch client: %+v", err)
	}

	// Report the indexer statistics
	stats := w.Resolver.OpenSearch.BulkIndexer.Stats()
	if stats.NumFailed > 0 {
		log.WithContext(ctx).Errorf("Indexed [%d] documents with [%d] errors", stats.NumFlushed, stats.NumFailed)
	} else {
		log.WithContext(ctx).Infof("Successfully indexed [%d] documents", stats.NumFlushed)
	}
}

func (w *Worker) MigrateDB(ctx context.Context) {
	_, err := model.MigrateDB(ctx, w.Resolver.DB)

	if err != nil {
		log.WithContext(ctx).Fatalf("Error migrating DB: %v", err)
	}
}

func (w *Worker) InitializeOpenSearchSessions(ctx context.Context) {
	w.InitIndexMappings(ctx)
	w.IndexSessions(ctx, false)

	// Close the indexer channel and flush remaining items
	if err := w.Resolver.OpenSearch.Close(); err != nil {
		log.WithContext(ctx).Fatalf("OPENSEARCH_ERROR unexpected error while closing OpenSearch client: %+v", err)
	}

	// Report the indexer statistics
	stats := w.Resolver.OpenSearch.BulkIndexer.Stats()
	if stats.NumFailed > 0 {
		log.WithContext(ctx).Errorf("Indexed [%d] documents with [%d] errors", stats.NumFlushed, stats.NumFailed)
	} else {
		log.WithContext(ctx).Infof("Successfully indexed [%d] documents", stats.NumFlushed)
	}
}

func (w *Worker) InitializeOpenSearchIndex(ctx context.Context) {
	w.InitIndexMappings(ctx)
	w.IndexTable(ctx, opensearch.IndexFields, &model.Field{}, false)
	w.IndexTable(ctx, opensearch.IndexErrorFields, &model.ErrorField{}, false)
	w.IndexErrorGroups(ctx, false)
	w.IndexErrorObjects(ctx, false)
	w.IndexSessions(ctx, false)

	// Close the indexer channel and flush remaining items
	if err := w.Resolver.OpenSearch.Close(); err != nil {
		log.WithContext(ctx).Fatalf("OPENSEARCH_ERROR unexpected error while closing OpenSearch client: %+v", err)
	}

	// Report the indexer statistics
	stats := w.Resolver.OpenSearch.BulkIndexer.Stats()
	if stats.NumFailed > 0 {
		log.WithContext(ctx).Errorf("Indexed [%d] documents with [%d] errors", stats.NumFlushed, stats.NumFailed)
	} else {
		log.WithContext(ctx).Infof("Successfully indexed [%d] documents", stats.NumFlushed)
	}
}

func (w *Worker) StartMetricMonitorWatcher(ctx context.Context) {
	metric_monitor.WatchMetricMonitors(ctx, w.Resolver.DB, w.Resolver.TDB, w.Resolver.MailClient, w.Resolver.RH)
}

func (w *Worker) StartLogAlertWatcher(ctx context.Context) {
	log_alerts.WatchLogAlerts(ctx, w.Resolver.DB, w.Resolver.TDB, w.Resolver.MailClient, w.Resolver.RH, w.Resolver.Redis, w.Resolver.ClickhouseClient)
}

func (w *Worker) RefreshMaterializedViews(ctx context.Context) {
	span, _ := tracer.StartSpanFromContext(ctx, "worker.refreshMaterializedViews",
		tracer.ResourceName("worker.refreshMaterializedViews"))
	defer span.Finish()

	if err := w.Resolver.DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Exec(fmt.Sprintf("SET LOCAL statement_timeout TO %d", REFRESH_MATERIALIZED_VIEW_TIMEOUT)).Error
		if err != nil {
			return err
		}

		return tx.Exec(`
			REFRESH MATERIALIZED VIEW CONCURRENTLY daily_session_counts_view;
		`).Error

	}); err != nil {
		log.WithContext(ctx).Fatal(e.Wrap(err, "Error refreshing daily_session_counts_view"))
	}

	if err := w.Resolver.DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Exec(fmt.Sprintf("SET LOCAL statement_timeout TO %d", REFRESH_MATERIALIZED_VIEW_TIMEOUT)).Error
		if err != nil {
			return err
		}

		return tx.Exec(`
			REFRESH MATERIALIZED VIEW CONCURRENTLY daily_error_counts_view;
		`).Error

	}); err != nil {
		log.WithContext(ctx).Fatal(e.Wrap(err, "Error refreshing daily_error_counts_view"))
	}

	type AggregateSessionCount struct {
		WorkspaceID                      int        `json:"workspace_id"`
		SessionCount                     int64      `json:"session_count"`
		ErrorCount                       int64      `json:"error_count"`
		LogCount                         int64      `json:"log_count"`
		SessionCountLastWeek             int64      `json:"session_count_last_week"`
		ErrorCountLastWeek               int64      `json:"error_count_last_week"`
		LogCountLastWeek                 int64      `json:"log_count_last_week"`
		SessionCountLastDay              int64      `json:"session_count_last_day"`
		ErrorCountLastDay                int64      `json:"error_count_last_day"`
		LogCountLastDay                  int64      `json:"log_count_last_day"`
		TrialEndDate                     *time.Time `json:"trial_end_date"`
		PlanTier                         string     `json:"plan_tier"`
		SessionReplayIntegrated          bool       `json:"session_replay_integrated"`
		BackendErrorMonitoringIntegrated bool       `json:"backend_error_monitoring_integrated"`
		BackendLoggingIntegrated         bool       `json:"backend_logging_integrated"`
	}
	var counts []*AggregateSessionCount

	if err := w.Resolver.DB.Raw(`
		SELECT p.workspace_id,
		       sum(dsc.count) as session_count,
		       sum(dsc.count) filter ( where dsc.date > NOW() - interval '1 week' ) as session_count_last_week,
		       sum(dsc.count) filter ( where dsc.date > NOW() - interval '1 day' ) as session_count_last_day
		FROM projects p
				 LEFT OUTER JOIN daily_session_counts_view dsc on p.id = dsc.project_id
		GROUP BY p.workspace_id`).Scan(&counts).Error; err != nil {
		log.WithContext(ctx).Fatal(e.Wrap(err, "Error retrieving session counts for Hubspot update"))
	}

	var errorResults []*AggregateSessionCount
	if err := w.Resolver.DB.Raw(`
		SELECT p.workspace_id,
			   sum(dec.count) as error_count,
			   sum(dec.count) filter ( where dec.date > NOW() - interval '1 week' ) as error_count_last_week,
			   sum(dec.count) filter ( where dec.date > NOW() - interval '1 day' ) as error_count_last_day
		FROM projects p
				 LEFT OUTER JOIN daily_error_counts_view dec on p.id = dec.project_id
		GROUP BY p.workspace_id;`).Scan(&errorResults).Error; err != nil {
		log.WithContext(ctx).Fatal(e.Wrap(err, "Error retrieving session counts for Hubspot update"))
	}

	for idx, c := range counts {
		c.ErrorCount += errorResults[idx].ErrorCount
		c.ErrorCountLastWeek += errorResults[idx].ErrorCountLastWeek
		c.ErrorCountLastDay += errorResults[idx].ErrorCountLastDay

		workspace := &model.Workspace{}
		if err := w.Resolver.DB.Preload("Projects").Model(&model.Workspace{}).Where("id = ?", c.WorkspaceID).Take(&workspace).Error; err != nil {
			continue
		}
		c.TrialEndDate = workspace.TrialEndDate
		c.PlanTier = workspace.PlanTier
		for t, ptr := range map[model.MarkBackendSetupType]*bool{
			model.MarkBackendSetupTypeSession: &c.SessionReplayIntegrated,
			model.MarkBackendSetupTypeError:   &c.BackendErrorMonitoringIntegrated,
			model.MarkBackendSetupTypeLogs:    &c.BackendLoggingIntegrated,
		} {
			setupEvent := model.SetupEvent{}
			if err := w.Resolver.DB.Model(&model.SetupEvent{}).Joins("INNER JOIN projects p on p.id = project_id").Joins("INNER JOIN workspaces w on w.id = p.workspace_id").Where("w.id = ? AND type = ?", workspace.ID, t).Take(&setupEvent).Error; err == nil {
				*ptr = setupEvent.ID != 0
			}
		}
		for _, p := range workspace.Projects {
			backendErrors, err := w.Resolver.Query().ServerIntegration(ctx, p.ID)
			if err == nil && backendErrors.Integrated {
				c.BackendErrorMonitoringIntegrated = c.BackendErrorMonitoringIntegrated || backendErrors.Integrated
			}
			logs, err := w.Resolver.Query().LogsIntegration(ctx, p.ID)
			if err == nil && logs.Integrated {
				c.BackendLoggingIntegrated = c.BackendLoggingIntegrated || logs.Integrated
			}
			count, _ := w.Resolver.ClickhouseClient.ReadLogsTotalCount(ctx, p.ID, backend.LogsParamsInput{DateRange: &backend.DateRangeRequiredInput{
				StartDate: time.Now().Add(-time.Hour * 24 * 30),
				EndDate:   time.Now(),
			}})
			c.LogCount += int64(count)
			countWeek, _ := w.Resolver.ClickhouseClient.ReadLogsTotalCount(ctx, p.ID, backend.LogsParamsInput{DateRange: &backend.DateRangeRequiredInput{
				StartDate: time.Now().Add(-time.Hour * 24 * 7),
				EndDate:   time.Now(),
			}})
			c.LogCountLastWeek += int64(countWeek)
			countDay, _ := w.Resolver.ClickhouseClient.ReadLogsTotalCount(ctx, p.ID, backend.LogsParamsInput{DateRange: &backend.DateRangeRequiredInput{
				StartDate: time.Now().Add(-time.Hour * 24),
				EndDate:   time.Now(),
			}})
			c.LogCountLastDay += int64(countDay)
		}
	}

	for _, c := range counts {
		// See HIG-2743
		// Skip updating session count for demo workspace because we exclude it from Hubspot
		if c.WorkspaceID == 0 {
			continue
		}

		if util.IsHubspotEnabled() {
			properties := []hubspot.Property{{
				Name:     "highlight_session_count",
				Property: "highlight_session_count",
				Value:    c.SessionCount,
			}, {
				Name:     "highlight_error_count",
				Property: "highlight_error_count",
				Value:    c.ErrorCount,
			}, {
				Name:     "highlight_logs_count",
				Property: "highlight_logs_count",
				Value:    c.LogCount,
			}, {
				Name:     "session_last_week",
				Property: "session_last_week",
				Value:    c.SessionCountLastWeek,
			}, {
				Name:     "errors_last_week",
				Property: "errors_last_week",
				Value:    c.ErrorCountLastWeek,
			}, {
				Name:     "logs_last_week",
				Property: "logs_last_week",
				Value:    c.LogCountLastWeek,
			}, {
				Name:     "sessions_last_day",
				Property: "sessions_last_day",
				Value:    c.SessionCountLastDay,
			}, {
				Name:     "errors_last_day",
				Property: "errors_last_day",
				Value:    c.ErrorCountLastDay,
			}, {
				Name:     "logs_last_day",
				Property: "logs_last_day",
				Value:    c.LogCountLastDay,
			}, {
				Name:     "plan_tier",
				Property: "plan_tier",
				Value:    c.PlanTier,
			}, {
				Name:     "is_session_replay_integrated",
				Property: "is_session_replay_integrated",
				Value:    c.SessionReplayIntegrated,
			}, {
				Name:     "is_backend_error_monitoring_integrated",
				Property: "is_backend_error_monitoring_integrated",
				Value:    c.BackendErrorMonitoringIntegrated,
			}, {
				Name:     "is_backend_logging_integrated",
				Property: "is_backend_logging_integrated",
				Value:    c.BackendLoggingIntegrated,
			}}
			if c.TrialEndDate != nil {
				properties = append(properties, hubspot.Property{
					Property: "date_of_trial_end",
					Name:     "date_of_trial_end",
					Value:    c.TrialEndDate.UTC().Truncate(24 * time.Hour).UnixMilli(),
				})
			}
			if err := w.Resolver.HubspotApi.UpdateCompanyProperty(ctx, c.WorkspaceID, properties); err != nil {
				log.WithContext(ctx).WithField("data", *c).Error(e.Wrap(err, "error updating highlight session count in hubspot"))
			}
		}

		phonehome.ReportUsageMetrics(ctx, phonehome.WorkspaceUsage, c.WorkspaceID, []attribute.KeyValue{
			attribute.Int64(phonehome.SessionCount, c.SessionCount),
			attribute.Int64(phonehome.ErrorCount, c.ErrorCount),
			attribute.Int64(phonehome.LogCount, c.LogCount),
		})

		time.Sleep(150 * time.Millisecond)
	}
}

func (w *Worker) BackfillStackFrames(ctx context.Context) {
	rows, err := w.Resolver.DB.Model(&model.ErrorObject{}).
		Where(`
			type <> 'Backend'
			AND stack_trace is not null
			AND mapped_stack_trace is null
			AND exists (
				select 1 from error_groups eg
				where eg.id = error_group_id
				and mapped_stack_trace ilike '%\"error\":null%')`).
		Order("id desc").Rows()
	if err != nil {
		log.WithContext(ctx).Fatalf("error retrieving objects: %+v", err)
	}

	backfiller := workerpool.New(200)
	backfiller.SetPanicHandler(util.Recover)

	for rows.Next() {
		backfiller.SubmitRecover(func() {
			ctx := context.Background()
			modelObj := &model.ErrorObject{}
			if err := w.Resolver.DB.ScanRows(rows, modelObj); err != nil {
				log.WithContext(ctx).Fatalf("error scanning rows: %+v", err)
			}

			var inputs []*publicModel.StackFrameInput
			if err := json.Unmarshal([]byte(*modelObj.StackTrace), &inputs); err != nil {
				log.WithContext(ctx).Errorf("error unmarshalling stack trace from error object: %+v", err)
				return
			}

			version := w.PublicResolver.GetErrorAppVersion(modelObj)
			mappedStackTrace, err := stacktraces.EnhanceStackTrace(ctx, inputs, modelObj.ProjectID, version, w.Resolver.StorageClient)
			if err != nil {
				log.WithContext(ctx).Errorf("error getting stack trace string: %+v", err)
				return
			}

			mappedStackTraceBytes, err := json.Marshal(mappedStackTrace)
			if err != nil {
				log.WithContext(ctx).Errorf("error marshalling mapped stack trace %+v", err)
				return
			}

			mappedStackTraceString := string(mappedStackTraceBytes)

			if err := w.Resolver.DB.Model(&model.ErrorObject{}).
				Where("id = ?", modelObj.ID).
				Updates(&model.ErrorObject{MappedStackTrace: &mappedStackTraceString}).Error; err != nil {
				log.WithContext(ctx).Errorf("error updating stack trace string: %+v", err)
				return
			}
		})
	}
}

func (w *Worker) GetHandler(ctx context.Context, handlerFlag string) func(ctx context.Context) {
	switch handlerFlag {
	case "report-stripe-usage":
		return w.ReportStripeUsage
	case "init-opensearch":
		return w.InitializeOpenSearchIndex
	case "init-opensearch-sessions":
		return w.InitializeOpenSearchSessions
	case "migrate-db":
		return w.MigrateDB
	case "update-opensearch":
		return w.UpdateOpenSearchIndex
	case "metric-monitors":
		return w.StartMetricMonitorWatcher
	case "log-alerts":
		return w.StartLogAlertWatcher
	case "backfill-stack-frames":
		return w.BackfillStackFrames
	case "refresh-materialized-views":
		return w.RefreshMaterializedViews
	case "delete-completed-sessions":
		return w.DeleteCompletedSessions
	case "public-worker":
		return w.PublicWorker
	case "auto-resolve-stale-errors":
		return w.AutoResolveStaleErrors
	default:
		log.WithContext(ctx).Fatalf("unrecognized worker-handler [%s]", handlerFlag)
		return nil
	}
}

// CalculateSessionLength gets the session length given two sets of ReplayEvents.
func CalculateSessionLength(first time.Time, last time.Time) (d time.Duration) {
	if first.IsZero() || last.IsZero() {
		return d
	}
	d = last.Sub(first)
	return d
}

type RageClickSettings struct {
	Window time.Duration
	Radius int
	Count  int
}

type EventProcessingAccumulator struct {
	SessionSecureID string
	// ClickEventQueue is a queue containing the last 2 seconds worth of clustered click events
	ClickEventQueue *list.List
	// CurrentlyInRageClickSet denotes whether the currently parsed event is within a rage click set
	CurrentlyInRageClickSet bool
	// RageClickSets contains all rage click sets that will be inserted into the db
	RageClickSets []*model.RageClickEvent
	// FirstFullSnapshotTimestamp represents the timestamp for the first full snapshot
	FirstFullSnapshotTimestamp time.Time
	// LastEventTimestamp represents the timestamp for the first event
	LastEventTimestamp time.Time
	// ActiveDuration represents the duration that the user was active
	ActiveDuration time.Duration
	// TimestampCounts represents a count of all user interaction events per second
	TimestampCounts map[time.Time]int
	// UserInteractionEvents represents the user interaction events in the session from rrweb
	UserInteractionEvents []*parse.ReplayEvent
	// EventsForTimelineIndicator represents the custom events that will be shown on the timeline indicator
	EventsForTimelineIndicator []*parse.ReplayEvent
	// LatestSID represents the last sequential ID seen
	LatestSID int
	// AreEventsOutOfOrder is true if the list of event SID's is not monotonically increasing from 1
	AreEventsOutOfOrder bool
	// Error
	Error error
	// Parameters for triggering rage click detection
	RageClickSettings RageClickSettings
	// Event chunk metadata for syncing player time with event chunks
	EventChunks []*model.EventChunk
}

func MakeEventProcessingAccumulator(sessionSecureID string, rageClickSettings RageClickSettings) EventProcessingAccumulator {
	return EventProcessingAccumulator{
		SessionSecureID:            sessionSecureID,
		ClickEventQueue:            list.New(),
		CurrentlyInRageClickSet:    false,
		RageClickSets:              []*model.RageClickEvent{},
		FirstFullSnapshotTimestamp: time.Time{},
		LastEventTimestamp:         time.Time{},
		ActiveDuration:             0,
		TimestampCounts:            map[time.Time]int{},
		UserInteractionEvents:      []*parse.ReplayEvent{},
		EventsForTimelineIndicator: []*parse.ReplayEvent{},
		LatestSID:                  0,
		AreEventsOutOfOrder:        false,
		Error:                      nil,
		RageClickSettings:          rageClickSettings,
	}
}

func processEventChunk(ctx context.Context, a EventProcessingAccumulator, eventsChunk model.EventsObject) EventProcessingAccumulator {
	if a.ClickEventQueue == nil {
		a.Error = errors.New("ClickEventQueue cannot be nil")
		return a
	}
	events, err := parse.EventsFromString(eventsChunk.Events)
	if err != nil {
		a.Error = err
		return a
	}

	for _, event := range events.Events {
		if event == nil {
			continue
		}
		sequentialID := int(event.SID)
		if !a.AreEventsOutOfOrder {
			eventTime := event.Timestamp.Unix()
			if sequentialID <= 0 {
				log.WithContext(ctx).WithField("session_secure_id", a.SessionSecureID).Warn(fmt.Sprintf("The payload has an event after SID %d with an invalid SID at time %d", a.LatestSID, eventTime))
				a.AreEventsOutOfOrder = true
			} else if sequentialID != a.LatestSID+1 && sequentialID != 1 { // The ID can reset to 1 if a navigation or refresh happens
				log.WithContext(ctx).WithField("session_secure_id", a.SessionSecureID).Warn(fmt.Sprintf("The payload has two SID's out-of-order: %d and %d at time %d", a.LatestSID, sequentialID, eventTime))
				a.AreEventsOutOfOrder = true
			}
		}
		a.LatestSID = sequentialID
		// If FirstFullSnapshotTimestamp is uninitialized and a first snapshot has not been found yet
		if a.FirstFullSnapshotTimestamp.IsZero() {
			if event.Type == parse.FullSnapshot {
				a.FirstFullSnapshotTimestamp = event.Timestamp
			} else if event.Type == parse.IncrementalSnapshot {
				continue
			}
		}
		if event.Type == parse.IncrementalSnapshot {
			var diff time.Duration
			if !a.LastEventTimestamp.IsZero() {
				diff = event.Timestamp.Sub(a.LastEventTimestamp)
				if diff.Seconds() <= MIN_INACTIVE_DURATION {
					a.ActiveDuration += diff
				}
			}
			a.LastEventTimestamp = event.Timestamp

			// purge old clicks
			var toRemove []*list.Element
			for element := a.ClickEventQueue.Front(); element != nil; element = element.Next() {
				if event.Timestamp.Sub(element.Value.(*parse.ReplayEvent).Timestamp) > a.RageClickSettings.Window {
					toRemove = append(toRemove, element)
				}
			}

			for _, elem := range toRemove {
				a.ClickEventQueue.Remove(elem)
			}

			mouseInteractionEventData, err := parse.UnmarshallMouseInteractionEvent(event.Data)
			if err != nil {
				a.Error = err
				return a
			}
			if _, ok := map[parse.EventSource]bool{
				parse.MouseMove: true, parse.MouseInteraction: true, parse.Scroll: true,
				parse.Input: true, parse.TouchMove: true, parse.Drag: true,
			}[*mouseInteractionEventData.Source]; !ok {
				continue
			}

			// Obtains all user interaction events for calculating active and inactive segments
			a.UserInteractionEvents = append(a.UserInteractionEvents, event)

			ts := event.Timestamp.Round(time.Millisecond)
			if _, ok := a.TimestampCounts[ts]; !ok {
				a.TimestampCounts[ts] = 0
			}
			a.TimestampCounts[ts] += 1
			if mouseInteractionEventData.X == nil || mouseInteractionEventData.Y == nil ||
				mouseInteractionEventData.Type == nil {
				// all values must be not nil on a click/touch event
				continue
			}
			if *mouseInteractionEventData.Source != parse.MouseInteraction {
				// Source must be MouseInteraction for a click/touch event
				continue
			}
			if _, ok := map[parse.MouseInteractions]bool{parse.Click: true,
				parse.DblClick: true}[*mouseInteractionEventData.Type]; !ok {
				// Type must be a Click, Double Click, or Touch Start for a click/touch event
				continue
			}

			// save all new click events
			a.ClickEventQueue.PushBack(event)

			numTotal := 0
			rageClick := model.RageClickEvent{
				TotalClicks: a.RageClickSettings.Count,
			}
			for element := a.ClickEventQueue.Front(); element != nil; element = element.Next() {
				el := element.Value.(*parse.ReplayEvent)
				if el == event {
					continue
				}
				prev, err := parse.UnmarshallMouseInteractionEvent(el.Data)
				if err != nil {
					a.Error = err
					return a
				}
				first := math.Pow(*mouseInteractionEventData.X-*prev.X, 2)
				second := math.Pow(*mouseInteractionEventData.Y-*prev.Y, 2)

				// if the distance between the current and previous click is less than the threshold
				if math.Sqrt(first+second) <= float64(a.RageClickSettings.Radius) {
					numTotal += 1
					if !a.CurrentlyInRageClickSet && rageClick.StartTimestamp.IsZero() {
						rageClick.StartTimestamp = el.Timestamp
					}
				}
			}
			if numTotal >= a.RageClickSettings.Count {
				if a.CurrentlyInRageClickSet {
					a.RageClickSets[len(a.RageClickSets)-1].TotalClicks += 1
					a.RageClickSets[len(a.RageClickSets)-1].EndTimestamp = event.Timestamp
				} else {
					a.CurrentlyInRageClickSet = true
					rageClick.EndTimestamp = event.Timestamp
					rageClick.TotalClicks = numTotal
					a.RageClickSets = append(a.RageClickSets, &rageClick)
				}
			} else if a.CurrentlyInRageClickSet {
				a.CurrentlyInRageClickSet = false
			}
		} else if event.Type == parse.Custom {
			ts := event.Timestamp.Round(time.Millisecond)
			if _, ok := a.TimestampCounts[ts]; !ok {
				a.TimestampCounts[ts] = 0
			}
			a.TimestampCounts[ts] += 1
			a.EventsForTimelineIndicator = append(a.EventsForTimelineIndicator, event)
		}
	}
	return a
}

func reportProcessSessionCount(ctx context.Context, db *gorm.DB, lookbackPeriod, lockPeriod int) {
	defer util.Recover()
	for {
		time.Sleep(1*time.Minute + time.Duration(59*float64(time.Minute.Nanoseconds())*rand.Float64()))
		var count int64
		if err := db.Raw(`
			SELECT COUNT(*)
			FROM sessions
			WHERE (processed = false)
				AND (excluded = false)
				AND (payload_updated_at < NOW() - (? * INTERVAL '1 SECOND'))
				AND (lock is null OR lock < NOW() - (? * INTERVAL '1 MINUTE'))
				AND (retry_count < ?)
			`, lookbackPeriod, lockPeriod, MAX_RETRIES).Scan(&count).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error getting count of sessions to process"))
			continue
		}
		hlog.Histogram("processSessionsCount", float64(count), nil, 1)
	}
}
