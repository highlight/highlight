package worker

import (
	"container/list"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"math/rand"
	"os"
	"strconv"
	"time"

	"gorm.io/gorm"

	highlightErrors "github.com/highlight-run/highlight/backend/errors"

	"github.com/pkg/errors"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/hlog"
	metric_monitor "github.com/highlight-run/highlight/backend/jobs/metric-monitor"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/payload"
	"github.com/highlight-run/highlight/backend/pricing"
	mgraph "github.com/highlight-run/highlight/backend/private-graph/graph"
	publicModel "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/workerpool"
)

// Worker is a job runner that parses sessions
const MIN_INACTIVE_DURATION = 10

// For active and inactive segment calculation
const INACTIVE_THRESHOLD = 0.02

// Stop trying to reprocess a session if its retry count exceeds this
const MAX_RETRIES = 5

type Worker struct {
	Resolver *mgraph.Resolver
	S3Client *storage.StorageClient
}

func (w *Worker) pushToObjectStorage(ctx context.Context, s *model.Session, migrationState *string, payloadManager *payload.PayloadManager) error {
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{MigrationState: migrationState},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	if err := w.Resolver.OpenSearch.Update(opensearch.IndexSessions, s.ID, map[string]interface{}{"migration_state": migrationState}); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
	}

	totalPayloadSize, err := w.S3Client.PushFilesToS3(ctx, s.ID, s.ProjectID, storage.S3SessionsPayloadBucketName, payloadManager)
	// If this is unsucessful, return early (we treat this session as if it is stored in psql).
	if err != nil {
		return errors.Wrap(err, "error pushing files to s3")
	}

	// Mark this session as stored in S3.
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{ObjectStorageEnabled: &model.T, PayloadSize: &totalPayloadSize, DirectDownloadEnabled: true, AllObjectsCompressed: true},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to storage enabled")
	}

	if err := w.Resolver.OpenSearch.Update(opensearch.IndexSessions, s.ID, map[string]interface{}{
		"object_storage_enabled":  true,
		"payload_size":            totalPayloadSize,
		"direct_download_enabled": true,
	}); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
	}

	return nil
}

func (w *Worker) scanSessionPayload(ctx context.Context, manager *payload.PayloadManager, s *model.Session) error {
	// Fetch/write events.
	eventRows, err := w.Resolver.DB.Model(&model.EventsObject{}).
		Where(&model.EventsObject{SessionID: s.ID}).
		Order("substring(events, '\"timestamp\":[0-9]+') asc").Rows()
	if err != nil {
		return errors.Wrap(err, "error retrieving events objects")
	}
	var numberOfRows int64 = 0
	eventsWriter := manager.Events.Writer()
	for eventRows.Next() {
		eventObject := model.EventsObject{}
		err := w.Resolver.DB.ScanRows(eventRows, &eventObject)
		if err != nil {
			return errors.Wrap(err, "error scanning event row")
		}
		if err := eventsWriter.Write(&eventObject); err != nil {
			return errors.Wrap(err, "error writing event row")
		}
		if err := manager.EventsCompressed.WriteObject(&eventObject, &payload.EventsUnmarshalled{}); err != nil {
			return errors.Wrap(err, "error writing compressed event row")
		}
		numberOfRows += 1
	}
	manager.Events.Length = numberOfRows
	if err := manager.EventsCompressed.Close(); err != nil {
		return errors.Wrap(err, "error closing compressed events writer")
	}

	// Fetch/write resources.
	resourcesRows, err := w.Resolver.DB.Model(&model.ResourcesObject{}).Where(&model.ResourcesObject{SessionID: s.ID}).Order("created_at asc").Rows()
	if err != nil {
		return errors.Wrap(err, "error retrieving resources objects")
	}
	resourceWriter := manager.Resources.Writer()
	numberOfRows = 0
	for resourcesRows.Next() {
		resourcesObject := model.ResourcesObject{}
		err := w.Resolver.DB.ScanRows(resourcesRows, &resourcesObject)
		if err != nil {
			return errors.Wrap(err, "error scanning resource row")
		}
		if err := resourceWriter.Write(&resourcesObject); err != nil {
			return errors.Wrap(err, "error writing resource row")
		}
		if err := manager.ResourcesCompressed.WriteObject(&resourcesObject, &payload.ResourcesUnmarshalled{}); err != nil {
			return errors.Wrap(err, "error writing compressed event row")
		}
		numberOfRows += 1
	}
	manager.Resources.Length = numberOfRows
	if err := manager.ResourcesCompressed.Close(); err != nil {
		return errors.Wrap(err, "error closing compressed resources writer")
	}

	// Fetch/write messages.
	messageRows, err := w.Resolver.DB.Model(&model.MessagesObject{}).Where(&model.MessagesObject{SessionID: s.ID}).Order("created_at asc").Rows()
	if err != nil {
		return errors.Wrap(err, "error retrieving messages objects")
	}

	numberOfRows = 0
	messagesWriter := manager.Messages.Writer()
	for messageRows.Next() {
		messageObject := model.MessagesObject{}
		if err := w.Resolver.DB.ScanRows(messageRows, &messageObject); err != nil {
			return errors.Wrap(err, "error scanning message row")
		}
		if err := messagesWriter.Write(&messageObject); err != nil {
			return errors.Wrap(err, "error writing messages object")
		}
		if err := manager.MessagesCompressed.WriteObject(&messageObject, &payload.MessagesUnmarshalled{}); err != nil {
			return errors.Wrap(err, "error writing compressed event row")
		}
		numberOfRows += 1
	}
	manager.Messages.Length = numberOfRows
	if err := manager.MessagesCompressed.Close(); err != nil {
		return errors.Wrap(err, "error closing compressed messages writer")
	}
	return nil
}

// Every 5 minutes, delete data for any sessions created > 4 hours ago
// if all session data has been written to s3
func deleteCompletedSessions(ctx context.Context, db *gorm.DB) {
	lookbackPeriod := 4 * 60 // 4 hours

	for {
		func() {
			defer util.Recover()

			baseQuery := `
				DELETE
				FROM %s o
				USING sessions s
				WHERE o.session_id = s.id
				AND s.object_storage_enabled = True
				AND s.payload_updated_at < s.lock
				AND s.created_at < NOW() - (? * INTERVAL '1 MINUTE')
				AND s.created_at > NOW() - INTERVAL '1 WEEK'`

			for _, table := range []string{"events_objects", "resources_objects", "messages_objects"} {
				deleteSpan, _ := tracer.StartSpanFromContext(ctx, "worker.deleteObjects",
					tracer.ResourceName("worker.deleteObjects"), tracer.Tag("table", table))
				if err := db.Exec(fmt.Sprintf(baseQuery, table), lookbackPeriod).Error; err != nil {
					log.Error(e.Wrapf(err, "error deleting expired objects from %s", table))
				}
				deleteSpan.Finish()
			}

			time.Sleep(5 * time.Minute)
		}()
	}
}

func (w *Worker) processSession(ctx context.Context, s *model.Session) error {
	sessionIdString := os.Getenv("SESSION_FILE_PATH_PREFIX") + strconv.FormatInt(int64(s.ID), 10)

	payloadManager, err := payload.NewPayloadManager(sessionIdString)
	if err != nil {
		return errors.Wrap(err, "error creating payload manager")
	}
	defer payloadManager.Close()

	if err := w.scanSessionPayload(ctx, payloadManager, s); err != nil {
		return errors.Wrap(err, "error scanning session payload")
	}

	// Measure payload sizes.
	if err := payloadManager.ReportPayloadSizes(); err != nil {
		return errors.Wrap(err, "error reporting payload sizes")
	}

	//Delete the session if there's no events.
	if payloadManager.Events.Length == 0 && s.Length <= 0 {
		log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier,
			"session_obj": s}).Warnf("deleting session with no events (session_id=%d, identifier=%s, is_in_obj_already=%v, processed=%v)", s.ID, s.Identifier, s.ObjectStorageEnabled, s.Processed)
		s.Excluded = &model.T
		s.Processed = &model.T
		if err := w.Resolver.DB.Table(model.SESSIONS_TBL).Model(&model.Session{Model: model.Model{ID: s.ID}}).Updates(s).Error; err != nil {
			log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier,
				"session_obj": s}).Warnf("error excluding session with no events (session_id=%d, identifier=%s, is_in_obj_already=%v, processed=%v): %v", s.ID, s.Identifier, s.ObjectStorageEnabled, s.Processed, err)
		}

		if err := w.Resolver.OpenSearch.Update(opensearch.IndexSessions, s.ID, map[string]interface{}{
			"Excluded":  true,
			"processed": true,
		}); err != nil {
			return e.Wrap(err, "error updating session in opensearch")
		}

		return nil
	}

	payloadManager.SeekStart()

	var userInteractionEvents []*parse.ReplayEvent
	accumulator := MakeEventProcessingAccumulator(s.SecureID)
	p := payload.NewPayloadReadWriter(payloadManager.GetFile(payload.Events))
	re := p.Reader()
	hasNext := true
	for hasNext {
		se, err := re.Next()
		if err != nil {
			if !errors.Is(err, io.EOF) {
				return e.Wrap(err, "error reading next line")
			}
			hasNext = false
		}
		if se != nil && *se != "" {
			eventsObject := model.EventsObject{Events: *se}
			accumulator = processEventChunk(accumulator, eventsObject)
			if accumulator.Error != nil {
				return e.Wrap(accumulator.Error, "error processing event chunk")
			}

			userInteractionEvents = append(userInteractionEvents, accumulator.UserInteractionEvents...)
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
			log.Error(e.Wrap(err, "error creating rage click sets"))
		}
	}

	userInteractionEvents = append([]*parse.ReplayEvent{{
		Timestamp: accumulator.FirstEventTimestamp,
	}}, userInteractionEvents...)
	userInteractionEvents = append(userInteractionEvents, &parse.ReplayEvent{
		Timestamp: accumulator.LastEventTimestamp,
	})

	var allIntervals []model.SessionInterval
	for i := 1; i < len(userInteractionEvents); i++ {
		currentEvent := userInteractionEvents[i-1]
		nextEvent := userInteractionEvents[i]
		diff := nextEvent.Timestamp.Sub(currentEvent.Timestamp)
		if diff.Seconds() <= MIN_INACTIVE_DURATION {
			allIntervals = append(allIntervals, model.SessionInterval{
				ProjectID:       s.ProjectID,
				SessionSecureID: s.SecureID,
				StartTime:       currentEvent.Timestamp,
				EndTime:         nextEvent.Timestamp,
				Duration:        int(diff.Milliseconds()),
				Active:          model.T,
			})
		} else {
			allIntervals = append(allIntervals, model.SessionInterval{
				ProjectID:       s.ProjectID,
				SessionSecureID: s.SecureID,
				StartTime:       currentEvent.Timestamp,
				EndTime:         nextEvent.Timestamp,
				Duration:        int(diff.Milliseconds()),
				Active:          model.F,
			})
		}
	}

	if len(allIntervals) < 1 {
		return nil
	}

	// Merges continuous active and inactive segments
	var mergedIntervals []model.SessionInterval
	startInterval := allIntervals[0]
	for i := 1; i < len(allIntervals); i++ {
		currentInterval := allIntervals[i-1]
		nextInterval := allIntervals[i]
		if currentInterval.Active != nextInterval.Active {
			mergedIntervals = append(mergedIntervals, model.SessionInterval{
				ProjectID:       s.ProjectID,
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
		mergedIntervals = append(mergedIntervals, model.SessionInterval{
			ProjectID:       s.ProjectID,
			SessionSecureID: s.SecureID,
			StartTime:       startInterval.StartTime,
			EndTime:         allIntervals[len(allIntervals)-1].EndTime,
			Duration:        int(allIntervals[len(allIntervals)-1].EndTime.Sub(startInterval.StartTime).Milliseconds()),
			Active:          allIntervals[len(allIntervals)-1].Active,
		})
	}

	// Merges inactive segments that are less than a threshold into surrounding active sessions
	var finalIntervals []model.SessionInterval
	startInterval = mergedIntervals[0]
	sessionLength := float64(CalculateSessionLength(accumulator.FirstEventTimestamp, accumulator.LastEventTimestamp).Milliseconds())
	for i := 1; i < len(mergedIntervals); i++ {
		currentInterval := mergedIntervals[i-1]
		nextInterval := mergedIntervals[i]
		if (!nextInterval.Active && nextInterval.Duration > int(INACTIVE_THRESHOLD*sessionLength)) || (!currentInterval.Active && currentInterval.Duration > int(INACTIVE_THRESHOLD*sessionLength)) {
			finalIntervals = append(finalIntervals, model.SessionInterval{
				ProjectID:       s.ProjectID,
				SessionSecureID: s.SecureID,
				StartTime:       startInterval.StartTime,
				EndTime:         currentInterval.EndTime,
				Duration:        int(currentInterval.EndTime.Sub(startInterval.StartTime).Milliseconds()),
				Active:          currentInterval.Active,
			})
			startInterval = nextInterval
		}
	}
	if len(mergedIntervals) > 0 {
		finalIntervals = append(finalIntervals, model.SessionInterval{
			ProjectID:       s.ProjectID,
			SessionSecureID: s.SecureID,
			StartTime:       startInterval.StartTime,
			EndTime:         mergedIntervals[len(mergedIntervals)-1].EndTime,
			Duration:        int(mergedIntervals[len(mergedIntervals)-1].EndTime.Sub(startInterval.StartTime).Milliseconds()),
			Active:          mergedIntervals[len(mergedIntervals)-1].Active,
		})
	}

	fmt.Println("LENGTH OF session: ", len(finalIntervals))
	if err := w.Resolver.DB.Create(finalIntervals).Error; err != nil {
		log.Error(e.Wrap(err, "error creating session activity intervals"))
	}

	var eventCountsLen int64 = 100
	window := float64(accumulator.LastEventTimestamp.Sub(accumulator.FirstEventTimestamp).Milliseconds()) / float64(eventCountsLen)
	eventCounts := make([]int64, eventCountsLen)
	for t, c := range accumulator.TimestampCounts {
		i := int64(math.Round(float64(t.Sub(accumulator.FirstEventTimestamp).Milliseconds()) / window))
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
	sessionTotalLength := CalculateSessionLength(accumulator.FirstEventTimestamp, accumulator.LastEventTimestamp)
	sessionTotalLengthInMilliseconds := sessionTotalLength.Milliseconds()

	// Delete the session if the length of the session is 0.
	// 1. Nothing happened in the session
	// 2. A web crawler visited the page and produced no events
	if accumulator.ActiveDuration == 0 {
		log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier,
			"session_obj": s}).Warnf("deleting session with 0ms length active duration (session_id=%d, identifier=%s)", s.ID, s.Identifier)
		s.Excluded = &model.T
		s.Processed = &model.T
		if err := w.Resolver.DB.Table(model.SESSIONS_TBL).Model(&model.Session{Model: model.Model{ID: s.ID}}).Updates(s).Error; err != nil {
			log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier,
				"session_obj": s}).Warnf("error excluding session with 0ms length active duration (session_id=%d, identifier=%s, is_in_obj_already=%v, processed=%v): %v", s.ID, s.Identifier, s.ObjectStorageEnabled, s.Processed, err)
		}

		if err := w.Resolver.OpenSearch.Update(opensearch.IndexSessions, s.ID, map[string]interface{}{
			"Excluded":  true,
			"processed": true,
		}); err != nil {
			return e.Wrap(err, "error updating session in opensearch")
		}

		return nil
	}

	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		model.Session{
			Processed:     &model.T,
			Length:        sessionTotalLengthInMilliseconds,
			ActiveLength:  accumulator.ActiveDuration.Milliseconds(),
			EventCounts:   &eventCountsString,
			HasRageClicks: &hasRageClicks,
		},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	if err := w.Resolver.OpenSearch.Update(opensearch.IndexSessions, s.ID, map[string]interface{}{
		"processed":       true,
		"length":          sessionTotalLengthInMilliseconds,
		"active_length":   accumulator.ActiveDuration.Milliseconds(),
		"EventCounts":     eventCountsString,
		"has_rage_clicks": hasRageClicks,
	}); err != nil {
		return e.Wrap(err, "error updating session in opensearch")
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
	project := &model.Project{}
	if err := w.Resolver.DB.Where(&model.Project{Model: model.Model{ID: s.ProjectID}}).First(&project).Error; err != nil {
		return e.Wrap(err, "error querying project")
	}

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
				sessionAlert.ThresholdWindow = util.MakeIntPointer(30)
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
			sessionAlert.SendAlerts(w.Resolver.DB, w.Resolver.MailClient, &model.SendSlackAlertInput{Workspace: workspace,
				SessionSecureID: s.SecureID, UserIdentifier: s.Identifier, UserObject: s.UserObject, RageClicksCount: &count64,
				QueryParams: map[string]string{"tsAbs": fmt.Sprintf("%d", accumulator.RageClickSets[0].StartTimestamp.UnixNano()/int64(time.Millisecond))}})
		}
		return nil
	})

	// Waits for all goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Error(e.Wrap(err, "error sending slack alert"))
	}

	// Upload to s3 and wipe from the db.
	if os.Getenv("ENABLE_OBJECT_STORAGE") == "true" {
		state := "normal"
		if err := w.pushToObjectStorage(ctx, s, &state, payloadManager); err != nil {
			log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Error(e.Wrap(err, "error pushing to object and wiping from db"))
		}
	}
	return nil
}

// Start begins the worker's tasks.
func (w *Worker) Start() {
	ctx := context.Background()
	payloadLookbackPeriod := 60 // a session must be stale for at least this long to be processed
	lockPeriod := 10            // time in minutes

	if util.IsDevEnv() {
		payloadLookbackPeriod = 8
		lockPeriod = 1
	}

	go deleteCompletedSessions(ctx, w.Resolver.DB)
	go reportProcessSessionCount(w.Resolver.DB, payloadLookbackPeriod, lockPeriod)
	maxWorkerCount := 40
	processSessionLimit := 10000
	for {
		time.Sleep(1 * time.Second)
		sessions := []*model.Session{}
		sessionsSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.sessionsQuery", tracer.ResourceName("worker.sessionsQuery"))
		txStart := time.Now()
		if err := w.Resolver.DB.Transaction(func(tx *gorm.DB) error {
			transactionCtx, cancel := context.WithTimeout(ctx, 20*time.Second)
			defer cancel()

			errs := make(chan error, 1)
			go func() {
				defer util.Recover()
				if err := tx.Raw(`
						WITH t AS (
							UPDATE sessions
							SET lock=NOW()
							WHERE id in (
								SELECT id
								FROM sessions
								WHERE (processed = ?)
									AND (COALESCE(payload_updated_at, to_timestamp(0)) < NOW() - (? * INTERVAL '1 SECOND'))
									AND (COALESCE(lock, to_timestamp(0)) < NOW() - (? * INTERVAL '1 MINUTE'))
									AND (COALESCE(retry_count, 0) < ?)
								LIMIT ?
								FOR UPDATE SKIP LOCKED
							)
							RETURNING *
						)
						SELECT * FROM t;
					`, false, payloadLookbackPeriod, lockPeriod, MAX_RETRIES, processSessionLimit). // why do we get payload_updated_at IS NULL?
					Find(&sessions).Debug().Error; err != nil {
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
			log.Errorf("error querying unparsed, outdated sessions, took [%v]: %v", time.Since(txStart), err)
			sessionsSpan.Finish()
			continue
		}
		rand.Seed(time.Now().UnixNano())
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
			log.Infof("sessions that will be processed: %v", sessionIds)
		}

		wp := workerpool.New(maxWorkerCount)
		wp.SetPanicHandler(util.Recover)
		// process 80 sessions at a time.
		for _, session := range sessions {
			session := session
			ctx := ctx
			wp.SubmitRecover(func() {
				span, ctx := tracer.StartSpanFromContext(ctx, "worker.operation", tracer.ResourceName("worker.processSession"))
				if err := w.processSession(ctx, session); err != nil {
					nextCount := session.RetryCount + 1
					var excluded *bool
					if nextCount >= MAX_RETRIES {
						excluded = &model.T
					}

					if err := w.Resolver.DB.Model(&model.Session{}).
						Where(&model.Session{Model: model.Model{ID: session.ID}}).
						Updates(&model.Session{RetryCount: nextCount, Excluded: excluded}).Error; err != nil {
						log.WithField("session_id", session.ID).Error(e.Wrap(err, "error incrementing retry count"))
					}

					if excluded != nil && *excluded {
						log.WithField("session_id", session.ID).Error(e.Wrap(err, "session has reached the max retry count and will be excluded"))
						if err := w.Resolver.OpenSearch.Update(opensearch.IndexSessions, session.ID, map[string]interface{}{"Excluded": true}); err != nil {
							log.WithField("session_id", session.ID).Error(e.Wrap(err, "error updating session in opensearch"))
						}
					}

					log.WithField("session_id", session.ID).Error(e.Wrap(err, "error processing main session"))
					span.Finish(tracer.WithError(e.Wrapf(err, "error processing session: %v", session.ID)))
					return
				}
				hlog.Incr("sessionsProcessed", nil, 1)
				span.Finish()
			})
		}
		wp.StopWait()
	}
}

func (w *Worker) ReportStripeUsage() {
	pricing.ReportAllUsage(w.Resolver.DB, w.Resolver.StripeClient)
}

func (w *Worker) UpdateOpenSearchIndex() {
	w.IndexTable(opensearch.IndexFields, &model.Field{}, true)
	w.IndexTable(opensearch.IndexErrorFields, &model.ErrorField{}, true)
	w.IndexErrorGroups(true)
	w.IndexErrorObjects(true)
	w.IndexSessions(true)

	// Close the indexer channel and flush remaining items
	if err := w.Resolver.OpenSearch.Close(); err != nil {
		log.Fatalf("OPENSEARCH_ERROR unexpected error while closing OpenSearch client: %+v", err)
	}

	// Report the indexer statistics
	stats := w.Resolver.OpenSearch.BulkIndexer.Stats()
	if stats.NumFailed > 0 {
		log.Errorf("Indexed [%d] documents with [%d] errors", stats.NumFlushed, stats.NumFailed)
	} else {
		log.Infof("Successfully indexed [%d] documents", stats.NumFlushed)
	}
}

func (w *Worker) InitializeOpenSearchIndex() {
	w.InitIndexMappings()
	w.IndexTable(opensearch.IndexFields, &model.Field{}, false)
	w.IndexTable(opensearch.IndexErrorFields, &model.ErrorField{}, false)
	w.IndexErrorGroups(false)
	w.IndexErrorObjects(false)
	w.IndexSessions(false)

	// Close the indexer channel and flush remaining items
	if err := w.Resolver.OpenSearch.Close(); err != nil {
		log.Fatalf("OPENSEARCH_ERROR unexpected error while closing OpenSearch client: %+v", err)
	}

	// Report the indexer statistics
	stats := w.Resolver.OpenSearch.BulkIndexer.Stats()
	if stats.NumFailed > 0 {
		log.Errorf("Indexed [%d] documents with [%d] errors", stats.NumFlushed, stats.NumFailed)
	} else {
		log.Infof("Successfully indexed [%d] documents", stats.NumFlushed)
	}
}

func (w *Worker) StartMetricMonitorWatcher() {
	metric_monitor.WatchMetricMonitors(w.Resolver.DB, w.Resolver.MailClient)
}

func (w *Worker) RefreshMaterializedViews() {
	ctx := context.Background()
	span, _ := tracer.StartSpanFromContext(ctx, "worker.refreshMaterializedViews",
		tracer.ResourceName("worker.refreshMaterializedViews"))
	defer span.Finish()

	if err := w.Resolver.DB.Exec(`
		REFRESH MATERIALIZED VIEW CONCURRENTLY daily_session_counts_view;
	`).Error; err != nil {
		log.Fatal(e.Wrap(err, "Error refreshing materialized views"))
	}
}

func (w *Worker) BackfillStackFrames() {
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
		log.Fatalf("error retrieving objects: %+v", err)
	}

	backfiller := workerpool.New(200)
	backfiller.SetPanicHandler(util.Recover)

	for rows.Next() {
		backfiller.SubmitRecover(func() {
			modelObj := &model.ErrorObject{}
			if err := w.Resolver.DB.ScanRows(rows, modelObj); err != nil {
				log.Fatalf("error scanning rows: %+v", err)
			}

			var inputs []*publicModel.StackFrameInput
			if err := json.Unmarshal([]byte(*modelObj.StackTrace), &inputs); err != nil {
				log.Errorf("error unmarshalling stack trace from error object: %+v", err)
				return
			}

			mappedStackTrace, err := highlightErrors.EnhanceStackTrace(inputs, modelObj.ProjectID, nil, w.Resolver.StorageClient)
			if err != nil {
				log.Errorf("error getting stack trace string: %+v", err)
				return
			}

			mappedStackTraceBytes, err := json.Marshal(mappedStackTrace)
			if err != nil {
				log.Errorf("error marshalling mapped stack trace %+v", err)
				return
			}

			mappedStackTraceString := string(mappedStackTraceBytes)

			if err := w.Resolver.DB.Model(&model.ErrorObject{}).
				Where("id = ?", modelObj.ID).
				Updates(&model.ErrorObject{MappedStackTrace: &mappedStackTraceString}).Error; err != nil {
				log.Errorf("error updating stack trace string: %+v", err)
				return
			}
		})
	}
}

func (w *Worker) GetHandler(handlerFlag string) func() {
	switch handlerFlag {
	case "report-stripe-usage":
		return w.ReportStripeUsage
	case "init-opensearch":
		return w.InitializeOpenSearchIndex
	case "update-opensearch":
		return w.UpdateOpenSearchIndex
	case "metric-monitors":
		return w.StartMetricMonitorWatcher
	case "backfill-stack-frames":
		return w.BackfillStackFrames
	case "refresh-materialized-views":
		return w.RefreshMaterializedViews
	default:
		log.Fatalf("unrecognized worker-handler [%s]", handlerFlag)
		return nil
	}
}

// CalculateSessionLength gets the session length given two sets of ReplayEvents.
func CalculateSessionLength(first time.Time, last time.Time) (d time.Duration) {
	if first.IsZero() {
		return d
	}
	d = last.Sub(first)
	return d
}

type EventProcessingAccumulator struct {
	SessionSecureID string
	// ClickEventQueue is a queue containing the last 2 seconds worth of clustered click events
	ClickEventQueue *list.List
	// CurrentlyInRageClickSet denotes whether the currently parsed event is within a rage click set
	CurrentlyInRageClickSet bool
	// RageClickSets contains all rage click sets that will be inserted into the db
	RageClickSets []*model.RageClickEvent
	// FirstEventTimestamp represents the timestamp for the first event
	FirstEventTimestamp time.Time
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
	// LatestSID represents the last sequential ID seen
	LatestSID int
	// AreEventsOutOfOrder is true if the list of event SID's is not monotonically increasing from 1
	AreEventsOutOfOrder bool
	// Error
	Error error
}

func MakeEventProcessingAccumulator(sessionSecureID string) EventProcessingAccumulator {
	return EventProcessingAccumulator{
		SessionSecureID:            sessionSecureID,
		ClickEventQueue:            list.New(),
		CurrentlyInRageClickSet:    false,
		RageClickSets:              []*model.RageClickEvent{},
		FirstEventTimestamp:        time.Time{},
		FirstFullSnapshotTimestamp: time.Time{},
		LastEventTimestamp:         time.Time{},
		ActiveDuration:             0,
		TimestampCounts:            map[time.Time]int{},
		LatestSID:                  0,
		AreEventsOutOfOrder:        false,
		Error:                      nil,
	}
}

func processEventChunk(a EventProcessingAccumulator, eventsChunk model.EventsObject) EventProcessingAccumulator {
	if a.ClickEventQueue == nil {
		a.Error = errors.New("ClickEventQueue cannot be nil")
		return a
	}
	events, err := parse.EventsFromString(eventsChunk.Events)
	if err != nil {
		a.Error = err
		return a
	}

	var userInteractionEvents []*parse.ReplayEvent
	a.UserInteractionEvents = userInteractionEvents

	for _, event := range events.Events {
		if event == nil {
			continue
		}
		sequentialID := int(event.SID)
		if !a.AreEventsOutOfOrder {
			eventTime := event.Timestamp.Unix()
			if sequentialID <= 0 {
				log.Warn(fmt.Sprintf("The payload for %s has an event after SID %d with an invald SID at time %d", a.SessionSecureID, a.LatestSID, eventTime))
				a.AreEventsOutOfOrder = true
			} else if sequentialID != a.LatestSID+1 {
				log.Warn(fmt.Sprintf("The payload for %s has two SID's out-of-order: %d and %d at time %d", a.SessionSecureID, a.LatestSID, sequentialID, eventTime))
				a.AreEventsOutOfOrder = true
			}
		}
		a.LatestSID = sequentialID
		// If FirstFullSnapshotTimestamp is uninitialized and a first snapshot has not been found yet
		if a.FirstFullSnapshotTimestamp.IsZero() {
			if event.Type == parse.FullSnapshot {
				a.FirstFullSnapshotTimestamp = event.Timestamp
			} else if event.Type == parse.IncrementalSnapshot {
				a.Error = errors.New("The payload has an IncrementalSnapshot before the first FullSnapshot")
				return a
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
			if a.FirstEventTimestamp.IsZero() {
				a.FirstEventTimestamp = event.Timestamp
			}

			// purge old clicks
			var toRemove []*list.Element
			for element := a.ClickEventQueue.Front(); element != nil; element = element.Next() {
				if event.Timestamp.Sub(element.Value.(*parse.ReplayEvent).Timestamp) > time.Second*5 {
					toRemove = append(toRemove, element)
				}
			}

			for _, elem := range toRemove {
				a.ClickEventQueue.Remove(elem)
			}

			var mouseInteractionEventData parse.MouseInteractionEventData
			err = json.Unmarshal(event.Data, &mouseInteractionEventData)
			if err != nil {
				a.Error = err
				return a
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

			// Obtains all user interaction events for calculating active and inactive segments
			userInteractionEvents = append(userInteractionEvents, event)

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
				TotalClicks: 5,
			}
			for element := a.ClickEventQueue.Front(); element != nil; element = element.Next() {
				el := element.Value.(*parse.ReplayEvent)
				if el == event {
					continue
				}
				var prev *parse.MouseInteractionEventData
				err = json.Unmarshal(el.Data, &prev)
				if err != nil {
					a.Error = err
					return a
				}
				first := math.Pow(*mouseInteractionEventData.X-*prev.X, 2)
				second := math.Pow(*mouseInteractionEventData.Y-*prev.Y, 2)

				RADIUS := 8.0
				// if the distance between the current and previous click is less than the threshold
				if math.Sqrt(first+second) <= RADIUS {
					numTotal += 1
					if !a.CurrentlyInRageClickSet && rageClick.StartTimestamp.IsZero() {
						rageClick.StartTimestamp = el.Timestamp
					}
				}
			}
			if numTotal >= 5 {
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
		}
	}
	a.UserInteractionEvents = userInteractionEvents
	return a
}

func reportProcessSessionCount(db *gorm.DB, lookbackPeriod, lockPeriod int) {
	defer util.Recover()
	for {
		time.Sleep(5 * time.Second)
		var count int64
		if err := db.Raw(`
			SELECT COUNT(*)
			FROM sessions
			WHERE
				(COALESCE(payload_updated_at, to_timestamp(0)) < NOW() - (? * INTERVAL '1 SECOND'))
				AND (COALESCE(lock, to_timestamp(0)) < NOW() - (? * INTERVAL '1 MINUTE'))
				AND (COALESCE(retry_count, 0) < ?)
				AND NOT processed
				AND NOT excluded;
			`, lookbackPeriod, lockPeriod, MAX_RETRIES).Scan(&count).Error; err != nil {
			log.Error(e.Wrap(err, "error getting count of sessions to process"))
			continue
		}
		hlog.Histogram("processSessionsCount", float64(count), nil, 1)
	}
}
