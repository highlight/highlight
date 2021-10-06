package worker

import (
	"context"
	"io"
	"math/rand"
	"os"
	"runtime"
	"strconv"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pkg/errors"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/payload"
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

func (w *Worker) pushToObjectStorageAndWipe(ctx context.Context, s *model.Session, migrationState *string, eventsFile *os.File, resourcesFile *os.File, messagesFile *os.File) error {
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{MigrationState: migrationState},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}
	sessionPayloadSize, err := w.S3Client.PushFileToS3(ctx, s.ID, s.ProjectID, eventsFile, storage.S3SessionsPayloadBucketName, storage.SessionContents)
	// If this is unsucessful, return early (we treat this session as if it is stored in psql).
	if err != nil {
		return errors.Wrap(err, "error pushing session payload to s3")
	}

	resourcePayloadSize, err := w.S3Client.PushFileToS3(ctx, s.ID, s.ProjectID, resourcesFile, storage.S3SessionsPayloadBucketName, storage.NetworkResources)
	if err != nil {
		return errors.Wrap(err, "error pushing network payload to s3")
	}

	messagePayloadSize, err := w.S3Client.PushFileToS3(ctx, s.ID, s.ProjectID, messagesFile, storage.S3SessionsPayloadBucketName, storage.ConsoleMessages)
	if err != nil {
		return errors.Wrap(err, "error pushing network payload to s3")
	}

	var totalPayloadSize int64
	if sessionPayloadSize != nil {
		totalPayloadSize += *sessionPayloadSize
	}
	if resourcePayloadSize != nil {
		totalPayloadSize += *resourcePayloadSize
	}
	if messagePayloadSize != nil {
		totalPayloadSize += *messagePayloadSize
	}

	// Mark this session as stored in S3.
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{ObjectStorageEnabled: &model.T, PayloadSize: &totalPayloadSize},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to storage enabled")
	}

	// Delete all the events_objects in the DB.
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

func (w *Worker) scanSessionPayload(ctx context.Context, s *model.Session, eventsFile *os.File, resourcesFile *os.File, messagesFile *os.File) (*payload.PayloadManager, error) {
	manager := payload.NewPayloadManager(eventsFile, resourcesFile, messagesFile)

	// Fetch/write events.
	eventRows, err := w.Resolver.DB.Model(&model.EventsObject{}).Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").Rows()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving events objects")
	}
	var numberOfRows int64 = 0
	eventsWriter := manager.Events.Writer()
	for eventRows.Next() {
		eventObject := model.EventsObject{}
		err := w.Resolver.DB.ScanRows(eventRows, &eventObject)
		if err != nil {
			return nil, errors.Wrap(err, "error scanning event row")
		}
		if err := eventsWriter.Write(&eventObject); err != nil {
			return nil, errors.Wrap(err, "error writing event row")
		}
		numberOfRows += 1
	}
	manager.Events.Length = numberOfRows

	// Fetch/write resources.
	resourcesRows, err := w.Resolver.DB.Model(&model.ResourcesObject{}).Where(&model.ResourcesObject{SessionID: s.ID}).Order("created_at asc").Rows()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving resources objects")
	}
	resourceWriter := manager.Resources.Writer()
	numberOfRows = 0
	for resourcesRows.Next() {
		resourcesObject := model.ResourcesObject{}
		err := w.Resolver.DB.ScanRows(resourcesRows, &resourcesObject)
		if err != nil {
			return nil, errors.Wrap(err, "error scanning resource row")
		}
		if err := resourceWriter.Write(&resourcesObject); err != nil {
			return nil, errors.Wrap(err, "error writing resource row")
		}
		numberOfRows += 1
	}
	manager.Resources.Length = numberOfRows

	// Fetch/write messages.
	messageRows, err := w.Resolver.DB.Model(&model.MessagesObject{}).Where(&model.MessagesObject{SessionID: s.ID}).Order("created_at asc").Rows()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving messages objects")
	}

	numberOfRows = 0
	messagesWriter := manager.Messages.Writer()
	for messageRows.Next() {
		messageObject := model.MessagesObject{}
		if err := w.Resolver.DB.ScanRows(messageRows, &messageObject); err != nil {
			return nil, errors.Wrap(err, "error scanning message row")
		}
		if err := messagesWriter.Write(&messageObject); err != nil {
			return nil, errors.Wrap(err, "error writing messages object")
		}
		numberOfRows += 1
	}
	manager.Messages.Length = numberOfRows

	// Measure payload sizes.
	eventInfo, err := eventsFile.Stat()
	if err != nil {
		return nil, errors.Wrap(err, "error getting event file info")
	}
	hlog.Histogram("worker.processSession.eventPayloadSize", float64(eventInfo.Size()), nil, 1) //nolint

	resourceInfo, err := resourcesFile.Stat()
	if err != nil {
		return nil, errors.Wrap(err, "error getting resource file info")
	}
	hlog.Histogram("worker.processSession.resourcePayloadSize", float64(resourceInfo.Size()), nil, 1) //nolint

	messagesInfo, err := messagesFile.Stat()
	if err != nil {
		return nil, errors.Wrap(err, "error getting message file info")
	}
	hlog.Histogram("worker.processSession.messagePayloadSize", float64(messagesInfo.Size()), nil, 1) //nolint

	return manager, nil
}

func CreateFile(name string) (func(), *os.File, error) {
	file, err := os.Create(name)
	if err != nil {
		return nil, nil, errors.Wrap(err, "error creating file")
	}
	return func() {
		err := file.Close()
		if err != nil {
			log.Error(e.Wrap(err, "failed to close file"))
			return
		}
		err = os.Remove(file.Name())
		if err != nil {
			log.Error(e.Wrap(err, "failed to remove file"))
			return
		}
	}, file, nil
}

func (w *Worker) processSession(ctx context.Context, s *model.Session) error {

	sessionIdString := os.Getenv("SESSION_FILE_PATH_PREFIX") + strconv.FormatInt(int64(s.ID), 10)

	// Create files.
	eventsClose, eventsFile, err := CreateFile(sessionIdString + ".events.txt")
	if err != nil {
		return errors.Wrap(err, "error creating events file")
	}
	defer eventsClose()
	resourcesClose, resourcesFile, err := CreateFile(sessionIdString + ".resources.txt")
	if err != nil {
		return errors.Wrap(err, "error creating events file")
	}
	defer resourcesClose()
	messagesClose, messagesFile, err := CreateFile(sessionIdString + ".messages.txt")
	if err != nil {
		return errors.Wrap(err, "error creating events file")
	}
	defer messagesClose()

	payloadManager, err := w.scanSessionPayload(ctx, s, eventsFile, resourcesFile, messagesFile)
	if err != nil {
		return errors.Wrap(err, "error scanning session payload")
	}

	//Delete the session if there's no events.
	if payloadManager.Events.Length == 0 {
		log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Warn("there are no events for session")
		if err := w.Resolver.DB.Select(clause.Associations).Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete associations for session with no events")
		}
		if err := w.Resolver.DB.Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete session with no events")
		}
		return nil
	}

	// need to reset file pointer to beginning of file for reading
	for _, file := range []*os.File{eventsFile, resourcesFile, messagesFile} {
		_, err = file.Seek(0, io.SeekStart)
		if err != nil {
			log.WithField("file_name", file.Name()).Errorf("error seeking to beginning of file: %v", err)
		}
	}
	activeDuration := time.Duration(0)
	var (
		firstEventTimestamp time.Time
		lastEventTimestamp  time.Time
	)
	p := payload.NewPayloadReadWriter(eventsFile)
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
			var tempDuration time.Duration
			tempDuration, firstEventTimestamp, lastEventTimestamp, err = getActiveDuration(&eventsObject, firstEventTimestamp, lastEventTimestamp)
			if err != nil {
				return e.Wrap(err, "error getting active duration")
			}
			activeDuration += tempDuration
		}
	}

	// Calculate total session length and write the length to the session.
	sessionTotalLength := CalculateSessionLength(firstEventTimestamp, lastEventTimestamp)
	sessionTotalLengthInMilliseconds := sessionTotalLength.Milliseconds()

	// Delete the session if the length of the session is 0.
	// 1. Nothing happened in the session
	// 2. A web crawler visited the page and produced no events
	if activeDuration == 0 {
		log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Warn("active duration is 0 for session, deleting...")
		if err := w.Resolver.DB.Where(&model.EventsObject{SessionID: s.ID}).Delete(&model.EventsObject{}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete events_object for session of length 0ms")
		}
		if err := w.Resolver.DB.Select(clause.Associations).Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete associations for session with length 0")
		}
		if err := w.Resolver.DB.Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete session of length 0ms")
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
		// Sending New User Alert
		// if is not new user, return
		if s.FirstTime == nil || !*s.FirstTime {
			return nil
		}
		var sessionAlert model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID}}).Where("type IS NULL OR type=?", model.AlertType.NEW_USER).First(&sessionAlert).Error; err != nil {
			return e.Wrapf(err, "[project_id: %d] error fetching new user alert", projectID)
		}

		// check if session was produced from an excluded environment
		excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
		if err != nil {
			return e.Wrapf(err, "[project_id: %d] error getting excluded environments from new user alert", projectID)
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

		// get produced user properties from session
		userProperties, err := s.GetUserProperties()
		if err != nil {
			return e.Wrapf(err, "[project_id: %d] error getting user properties from new user alert", s.ProjectID)
		}

		workspace, err := w.Resolver.GetWorkspace(project.WorkspaceID)
		if err != nil {
			return e.Wrapf(err, "[project_id: %d] error querying workspace", s.ProjectID)
		}

		// send Slack message
		err = sessionAlert.SendSlackAlert(&model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: s.SecureID, UserIdentifier: s.Identifier, UserProperties: userProperties})
		if err != nil {
			return e.Wrapf(err, "[project_id: %d] error sending slack message for new user alert", projectID)
		}
		return nil
	})

	g.Go(func() error {
		// Sending Track Properties Alert
		var sessionAlert model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID}}).Where("type=?", model.AlertType.TRACK_PROPERTIES).First(&sessionAlert).Error; err != nil {
			return e.Wrapf(err, "[project_id: %d] error fetching track properties alert", projectID)
		}

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
		err = sessionAlert.SendSlackAlert(&model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: s.SecureID, UserIdentifier: s.Identifier, MatchedFields: matchedFields})
		if err != nil {
			return e.Wrap(err, "error sending track properties alert slack message")
		}
		return nil
	})

	g.Go(func() error {
		// Sending User Properties Alert
		var sessionAlert model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: projectID}}).Where("type=?", model.AlertType.USER_PROPERTIES).First(&sessionAlert).Error; err != nil {
			return e.Wrapf(err, "[project_id: %d] error fetching user properties alert", projectID)
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
		err = sessionAlert.SendSlackAlert(&model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: s.SecureID, UserIdentifier: s.Identifier, MatchedFields: matchedFields})
		if err != nil {
			return e.Wrapf(err, "error sending user properties alert slack message")
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
		if err := w.pushToObjectStorageAndWipe(ctx, s, &state, eventsFile, resourcesFile, messagesFile); err != nil {
			log.WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Error(e.Wrap(err, "error pushing to object and wiping from db"))
		}
	}
	return nil
}

// Start begins the worker's tasks.
func (w *Worker) Start() {
	ctx := context.Background()
	go reportProcessSessionCount(w.Resolver.DB)
	for {
		time.Sleep(1 * time.Second)
		now := time.Now()
		seconds := 30
		if util.IsDevEnv() {
			seconds = 8
		}
		processSessionLimit := 10000
		someSecondsAgo := now.Add(time.Duration(-1*seconds) * time.Second)
		sessions := []*model.Session{}
		sessionsSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.sessionsQuery", tracer.ResourceName("worker.sessionsQuery"))
		if err := w.Resolver.DB.
			Where("(payload_updated_at < ? OR payload_updated_at IS NULL) AND (processed = ?)", someSecondsAgo, false).
			Limit(processSessionLimit).Find(&sessions).Error; err != nil {
			log.Errorf("error querying unparsed, outdated sessions: %v", err)
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

		wp := workerpool.New(160)
		// process 80 sessions at a time.
		for _, session := range sessions {
			session := session
			ctx := ctx
			wp.SubmitRecover(func() {
				span, ctx := tracer.StartSpanFromContext(ctx, "worker.operation", tracer.ResourceName("worker.processSession"))
				log.Infof("beginning to process session: %d", session.ID)
				if err := w.processSession(ctx, session); err != nil {
					log.WithField("session_id", session.ID).Error(e.Wrap(err, "error processing main session"))
					span.Finish(tracer.WithError(e.Wrapf(err, "error processing session: %v", session.ID)))
					return
				}
				hlog.Incr("sessionsProcessed", nil, 1)
				log.Infof("finished processing session: %d", session.ID)
				span.Finish()
			})
		}
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

func getActiveDuration(event *model.EventsObject, firstEventTimestamp time.Time, lastEventTimestamp time.Time) (time.Duration, time.Time, time.Time, error) {
	activeDuration := time.Duration(0)
	// parses the events from EventObject
	allEvents, err := parse.EventsFromString(event.Events)
	if err != nil {
		return time.Duration(0), firstEventTimestamp, lastEventTimestamp, err
	}

	// Iterate through all events and sum up time between interactions
	for _, eventObj := range allEvents.Events {
		if eventObj.Type == 3 {
			if !lastEventTimestamp.IsZero() {
				diff := eventObj.Timestamp.Sub(lastEventTimestamp)
				if diff.Seconds() <= MIN_INACTIVE_DURATION {
					activeDuration += diff
				}
			}
			lastEventTimestamp = eventObj.Timestamp
			if firstEventTimestamp.IsZero() {
				firstEventTimestamp = eventObj.Timestamp
			}
		}
	}
	return activeDuration, firstEventTimestamp, lastEventTimestamp, nil
}

func reportProcessSessionCount(db *gorm.DB) {
	for {
		time.Sleep(5 * time.Second)
		var count int64
		if err := db.Raw(`
			SELECT COUNT(*)
			FROM sessions
			WHERE (
				payload_updated_at < (now() - 8* interval '1 second') 
				OR payload_updated_at IS NULL
			) 
			AND processed=false;
		`).Scan(&count).Error; err != nil {
			log.Error("error getting count of sessions to process")
			continue
		}
		hlog.Histogram("processSessionsCount", float64(count), nil, 1)
	}
}

func collectStack() []byte {
	buf := make([]byte, 64<<10)
	buf = buf[:runtime.Stack(buf, false)]
	return buf
}
