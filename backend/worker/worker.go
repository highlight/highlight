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

	"github.com/pkg/errors"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/payload"
	"github.com/highlight-run/highlight/backend/pricing"
	mgraph "github.com/highlight-run/highlight/backend/private-graph/graph"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/workerpool"
)

// Worker is a job runner that parses sessions
const MIN_INACTIVE_DURATION = 10

type Worker struct {
	Resolver *mgraph.Resolver
	S3Client *storage.StorageClient
}

func (w *Worker) pushToObjectStorageAndWipe(ctx context.Context, s *model.Session, migrationState *string, payloadManager *payload.PayloadManager) error {
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{MigrationState: migrationState},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
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

	// Delete all the events_objects in the DB.
	log.Warnf("deleting all events associated with session (session_id=%d, identifier=%s)", s.ID, s.Identifier)
	if err := w.Resolver.DB.Unscoped().Where(&model.EventsObject{SessionID: s.ID}).Delete(&model.EventsObject{}).Error; err != nil {
		return errors.Wrapf(err, "error deleting all event records")
	}
	if err := w.Resolver.DB.Unscoped().Where(&model.ResourcesObject{SessionID: s.ID}).Delete(&model.ResourcesObject{}).Error; err != nil {
		return errors.Wrap(err, "error deleting all network resource records")
	}
	if err := w.Resolver.DB.Unscoped().Where(&model.MessagesObject{SessionID: s.ID}).Delete(&model.MessagesObject{}).Error; err != nil {
		return errors.Wrap(err, "error deleting all messages")
	}
	return nil
}

func (w *Worker) scanSessionPayload(ctx context.Context, manager *payload.PayloadManager, s *model.Session) error {
	// Fetch/write events.
	eventRows, err := w.Resolver.DB.Model(&model.EventsObject{}).Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").Rows()
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

		return nil
	}

	payloadManager.SeekStart()

	activeDuration := time.Duration(0)
	var (
		firstEventTimestamp time.Time
		lastEventTimestamp  time.Time
	)
	p := payload.NewPayloadReadWriter(payloadManager.GetFile(payload.Events))
	re := p.Reader()
	hasNext := true
	clickEventQueue := list.New()
	var rageClickSets []*model.RageClickEvent
	var currentlyInRageClickSet bool
	timestamps := make(map[time.Time]int)
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
			o := processEventChunk(&processEventChunkInput{
				EventsChunk:             &eventsObject,
				ClickEventQueue:         clickEventQueue,
				FirstEventTimestamp:     firstEventTimestamp,
				LastEventTimestamp:      lastEventTimestamp,
				RageClickSets:           rageClickSets,
				CurrentlyInRageClickSet: currentlyInRageClickSet,
				TimestampCounts:         timestamps,
			})
			if o.Error != nil {
				return e.Wrap(err, "error processing event chunk")
			}
			firstEventTimestamp = o.FirstEventTimestamp
			lastEventTimestamp = o.LastEventTimestamp
			activeDuration += o.CalculatedDuration
			rageClickSets = o.RageClickSets
			currentlyInRageClickSet = o.CurrentlyInRageClickSet
			timestamps = o.TimestampCounts
		}
	}
	for i, r := range rageClickSets {
		r.SessionSecureID = s.SecureID
		r.ProjectID = s.ProjectID
		rageClickSets[i] = r
	}
	if len(rageClickSets) > 0 {
		if err := w.Resolver.DB.Create(&rageClickSets).Error; err != nil {
			log.Error(e.Wrap(err, "error creating rage click sets"))
		}
	}

	var eventCountsLen int64 = 100
	window := float64(lastEventTimestamp.Sub(firstEventTimestamp).Milliseconds()) / float64(eventCountsLen)
	eventCounts := make([]int64, eventCountsLen)
	for t, c := range timestamps {
		i := int64(math.Round(float64(t.Sub(firstEventTimestamp).Milliseconds()) / window))
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
	sessionTotalLength := CalculateSessionLength(firstEventTimestamp, lastEventTimestamp)
	sessionTotalLengthInMilliseconds := sessionTotalLength.Milliseconds()

	// Delete the session if the length of the session is 0.
	// 1. Nothing happened in the session
	// 2. A web crawler visited the page and produced no events
	if activeDuration == 0 {
		log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier,
			"session_obj": s}).Warnf("deleting session with 0ms length active duration (session_id=%d, identifier=%s)", s.ID, s.Identifier)
		s.Excluded = &model.T
		s.Processed = &model.T
		if err := w.Resolver.DB.Table(model.SESSIONS_TBL).Model(&model.Session{Model: model.Model{ID: s.ID}}).Updates(s).Error; err != nil {
			log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier,
				"session_obj": s}).Warnf("error excluding session with 0ms length active duration (session_id=%d, identifier=%s, is_in_obj_already=%v, processed=%v): %v", s.ID, s.Identifier, s.ObjectStorageEnabled, s.Processed, err)
		}

		return nil
	}

	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		model.Session{
			Processed:    &model.T,
			Length:       sessionTotalLengthInMilliseconds,
			ActiveLength: activeDuration.Milliseconds(),
			EventCounts:  &eventCountsString,
		},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
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
		// Sending Track Properties Alert
		var sessionAlerts []*model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID}}).Where("type=?", model.AlertType.TRACK_PROPERTIES).Find(&sessionAlerts).Error; err != nil {
			return e.Wrapf(err, "[project_id: %d] error fetching track properties alert", projectID)
		}

		for _, sessionAlert := range sessionAlerts {
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				return e.Wrapf(err, "[project_id: %d] error getting excluded environments from track properties alert", projectID)
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

			// get matched track properties between the alert and session
			trackProperties, err := sessionAlert.GetTrackProperties()
			if err != nil {
				return e.Wrap(err, "error getting track properties from session")
			}
			var trackPropertyIds []int
			for _, trackProperty := range trackProperties {
				trackPropertyIds = append(trackPropertyIds, trackProperty.ID)
			}
			stmt := w.Resolver.DB.Model(&model.Field{}).
				Where(&model.Field{ProjectID: projectID, Type: "track"}).
				Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", s.ID).
				Where("id IN ?", trackPropertyIds)
			var matchedFields []*model.Field
			if err := stmt.Find(&matchedFields).Error; err != nil {
				return e.Wrap(err, "error querying matched fields by session_id")
			}
			if len(matchedFields) < 1 {
				return nil
			}

			workspace, err := w.Resolver.GetWorkspace(project.WorkspaceID)
			if err != nil {
				return e.Wrap(err, "error querying workspace")
			}

			// send Slack message
			err = sessionAlert.SendSlackAlert(w.Resolver.DB, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: s.SecureID, UserIdentifier: s.Identifier, MatchedFields: matchedFields, UserObject: s.UserObject})
			if err != nil {
				return e.Wrap(err, "error sending track properties alert slack message")
			}

		}

		return nil
	})

	g.Go(func() error {
		// Sending User Properties Alert
		var sessionAlerts []*model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID}}).Where("type=?", model.AlertType.USER_PROPERTIES).Find(&sessionAlerts).Error; err != nil {
			return e.Wrapf(err, "[project_id: %d] error fetching user properties alert", projectID)
		}

		for _, sessionAlert := range sessionAlerts {
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

			// get matched user properties between the alert and session
			userProperties, err := sessionAlert.GetUserProperties()
			if err != nil {
				return e.Wrap(err, "error getting user properties from session")
			}
			var userPropertyIds []int
			for _, userProperty := range userProperties {
				userPropertyIds = append(userPropertyIds, userProperty.ID)
			}
			stmt := w.Resolver.DB.Model(&model.Field{}).
				Where(&model.Field{ProjectID: projectID, Type: "user"}).
				Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", s.ID).
				Where("id IN ?", userPropertyIds)
			var matchedFields []*model.Field
			if err := stmt.Find(&matchedFields).Error; err != nil {
				return e.Wrap(err, "error querying matched fields by session_id")
			}
			if len(matchedFields) < 1 {
				return nil
			}

			workspace, err := w.Resolver.GetWorkspace(project.WorkspaceID)
			if err != nil {
				return e.Wrap(err, "error querying workspace")
			}

			// send Slack message
			err = sessionAlert.SendSlackAlert(w.Resolver.DB, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: s.SecureID, UserIdentifier: s.Identifier, MatchedFields: matchedFields, UserObject: s.UserObject})
			if err != nil {
				return e.Wrapf(err, "error sending user properties alert slack message")
			}
		}
		return nil
	})

	g.Go(func() error {
		// Sending session init alert
		var sessionAlerts []*model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID}}).
			Where("type=?", model.AlertType.NEW_SESSION).Find(&sessionAlerts).Error; err != nil {
			return e.Wrapf(err, "[project_id: %d] error fetching new session alert", projectID)
		}

		for _, sessionAlert := range sessionAlerts {
			// check if session was produced from an excluded environment
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				return e.Wrapf(err, "[project_id: %d] error getting excluded environments from new session alert", projectID)
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

			// check if session was created by a should-ignore identifier
			excludedIdentifiers, err := sessionAlert.GetExcludeRules()
			if err != nil {
				return e.Wrapf(err, "[project_id: %d] error getting exclude rules from new session alert", projectID)
			}
			isSessionByExcludedIdentifier := false
			for _, identifier := range excludedIdentifiers {
				if identifier != nil && *identifier == s.Identifier {
					isSessionByExcludedIdentifier = true
					break
				}
			}
			if isSessionByExcludedIdentifier {
				return nil
			}

			workspace, err := w.Resolver.GetWorkspace(project.WorkspaceID)
			if err != nil {
				return e.Wrap(err, "error querying workspace")
			}

			// send Slack message
			err = sessionAlert.SendSlackAlert(w.Resolver.DB, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: s.SecureID, UserIdentifier: s.Identifier, UserObject: s.UserObject})
			if err != nil {
				return e.Wrapf(err, "[project_id: %d] error sending slack message for new session alert", projectID)
			}

		}
		return nil
	})

	g.Go(func() error {
		if len(rageClickSets) < 1 {
			return nil
		}
		// Sending Rage Click Alert
		var sessionAlerts []*model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID}}).Where("type=?", model.AlertType.RAGE_CLICK).Find(&sessionAlerts).Error; err != nil {
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

			// send Slack message
			count64 := int64(count)
			err = sessionAlert.SendSlackAlert(w.Resolver.DB, &model.SendSlackAlertInput{Workspace: workspace,
				SessionSecureID: s.SecureID, UserIdentifier: s.Identifier, UserObject: s.UserObject, RageClicksCount: &count64,
				QueryParams: map[string]string{"tsAbs": fmt.Sprintf("%d", rageClickSets[0].StartTimestamp.UnixNano()/int64(time.Millisecond))}})
			if err != nil {
				return e.Wrapf(err, "error sending rage click alert slack message")
			}
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
		if err := w.pushToObjectStorageAndWipe(ctx, s, &state, payloadManager); err != nil {
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

	go reportProcessSessionCount(w.Resolver.DB, payloadLookbackPeriod, lockPeriod)
	maxWorkerCount := 40
	processSessionLimit := 10000
	txStart := time.Now()
	for {
		time.Sleep(1 * time.Second)
		sessions := []*model.Session{}
		sessionsSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.sessionsQuery", tracer.ResourceName("worker.sessionsQuery"))
		if err := w.Resolver.DB.Transaction(func(tx *gorm.DB) error {
			transactionCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
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
								LIMIT ?
								FOR UPDATE SKIP LOCKED
							)
							RETURNING *
						)
						SELECT * FROM t;
					`, false, payloadLookbackPeriod, lockPeriod, processSessionLimit). // why do we get payload_updated_at IS NULL?
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

func (w *Worker) InitializeOpenSearchIndex() {
	w.IndexTable(opensearch.IndexFields, &model.Field{})
	w.IndexTable(opensearch.IndexErrors, &model.ErrorGroup{})
	w.IndexSessions()

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

func (w *Worker) GetHandler(handlerFlag string) func() {
	switch handlerFlag {
	case "report-stripe-usage":
		return w.ReportStripeUsage
	case "init-opensearch":
		return w.InitializeOpenSearchIndex
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

type processEventChunkInput struct {
	// EventsChunk represents the chunk of events to be processed in this iteration of processEventChunk
	EventsChunk *model.EventsObject
	// ClickEventQueue is a queue containing the last 2 seconds worth of clustered click events
	ClickEventQueue *list.List
	// CurrentlyInRageClickSet denotes whether the currently parsed event is within a rage click set
	CurrentlyInRageClickSet bool
	// CurrentlyInRageClickSet denotes whether the currently parsed event is within a rage click set
	RageClickSets []*model.RageClickEvent
	// FirstEventTimestamp represents the timestamp for the first event
	FirstEventTimestamp time.Time
	// LastEventTimestamp represents the timestamp for the first event
	LastEventTimestamp time.Time
	// TimestampCounts represents a count of all user interaction events per second
	TimestampCounts map[time.Time]int
}

type processEventChunkOutput struct {
	// DidEventsChunkChange denotes whether the events chunk was altered and needs to be updated in the stored file
	DidEventsChunkChange bool
	// CurrentlyInRageClickSet denotes whether the currently parsed event is within a rage click set
	CurrentlyInRageClickSet bool
	// RageClickSets contains all rage click sets that will be inserted into the db
	RageClickSets []*model.RageClickEvent
	// FirstEventTimestamp represents the timestamp for the first event
	FirstEventTimestamp time.Time
	// LastEventTimestamp represents the timestamp for the first event
	LastEventTimestamp time.Time
	// CalculatedDuration represents the calculated active duration for the current event chunk
	CalculatedDuration time.Duration
	// TimestampCounts represents a count of all user interaction events per second
	TimestampCounts map[time.Time]int
	// Error
	Error error
}

func processEventChunk(input *processEventChunkInput) (o processEventChunkOutput) {
	var events *parse.ReplayEvents
	var err error
	if input == nil {
		o.Error = errors.New("processEventChunkInput cannot be nil")
		return o
	}
	if input.EventsChunk == nil {
		o.Error = errors.New("EventsChunk cannot be nil")
		return o
	}
	if input.ClickEventQueue == nil {
		o.Error = errors.New("ClickEventQueue cannot be nil")
		return o
	}
	events, err = parse.EventsFromString(input.EventsChunk.Events)
	if err != nil {
		o.Error = err
		return o
	}
	o.FirstEventTimestamp = input.FirstEventTimestamp
	o.LastEventTimestamp = input.LastEventTimestamp
	o.CurrentlyInRageClickSet = input.CurrentlyInRageClickSet
	o.RageClickSets = input.RageClickSets
	o.TimestampCounts = input.TimestampCounts
	for _, event := range events.Events {
		if event == nil {
			continue
		}
		if event.Type == parse.IncrementalSnapshot {
			var diff time.Duration
			if !o.LastEventTimestamp.IsZero() {
				diff = event.Timestamp.Sub(o.LastEventTimestamp)
				if diff.Seconds() <= MIN_INACTIVE_DURATION {
					o.CalculatedDuration += diff
				}
			}
			o.LastEventTimestamp = event.Timestamp
			if o.FirstEventTimestamp.IsZero() {
				o.FirstEventTimestamp = event.Timestamp
			}

			// purge old clicks
			var toRemove []*list.Element
			for element := input.ClickEventQueue.Front(); element != nil; element = element.Next() {
				if event.Timestamp.Sub(element.Value.(*parse.ReplayEvent).Timestamp) > time.Second*5 {
					toRemove = append(toRemove, element)
				}
			}

			for _, elem := range toRemove {
				input.ClickEventQueue.Remove(elem)
			}

			var mouseInteractionEventData parse.MouseInteractionEventData
			err = json.Unmarshal(event.Data, &mouseInteractionEventData)
			if err != nil {
				o.Error = err
				return o
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
			ts := event.Timestamp.Round(time.Millisecond)
			if _, ok := o.TimestampCounts[ts]; !ok {
				o.TimestampCounts[ts] = 0
			}
			o.TimestampCounts[ts] += 1
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
			input.ClickEventQueue.PushBack(event)

			numTotal := 0
			rageClick := model.RageClickEvent{
				TotalClicks: 5,
			}
			for element := input.ClickEventQueue.Front(); element != nil; element = element.Next() {
				el := element.Value.(*parse.ReplayEvent)
				if el == event {
					continue
				}
				var prev *parse.MouseInteractionEventData
				err = json.Unmarshal(el.Data, &prev)
				if err != nil {
					o.Error = err
					return o
				}
				first := math.Pow(*mouseInteractionEventData.X-*prev.X, 2)
				second := math.Pow(*mouseInteractionEventData.Y-*prev.Y, 2)
				if math.Sqrt(first+second) <= 32 {
					numTotal += 1
					if !o.CurrentlyInRageClickSet && rageClick.StartTimestamp.IsZero() {
						rageClick.StartTimestamp = el.Timestamp
					}
				}
			}
			if numTotal >= 5 {
				if o.CurrentlyInRageClickSet {
					o.RageClickSets[len(o.RageClickSets)-1].TotalClicks += 1
					o.RageClickSets[len(o.RageClickSets)-1].EndTimestamp = event.Timestamp
				} else {
					o.CurrentlyInRageClickSet = true
					rageClick.EndTimestamp = event.Timestamp
					rageClick.TotalClicks = numTotal
					o.RageClickSets = append(o.RageClickSets, &rageClick)
				}
			} else if o.CurrentlyInRageClickSet {
				o.CurrentlyInRageClickSet = false
			}
		} else if event.Type == parse.Custom {
			ts := event.Timestamp.Round(time.Millisecond)
			if _, ok := o.TimestampCounts[ts]; !ok {
				o.TimestampCounts[ts] = 0
			}
			o.TimestampCounts[ts] += 1
		}
	}
	return o
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
				AND NOT processed
				AND NOT excluded;
			`, lookbackPeriod, lockPeriod).Scan(&count).Error; err != nil {
			log.Error(e.Wrap(err, "error getting count of sessions to process"))
			continue
		}
		hlog.Histogram("processSessionsCount", float64(count), nil, 1)
	}
}
