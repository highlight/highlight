package worker

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/pkg/errors"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm/clause"

	dd "github.com/highlight-run/highlight/backend/datadog"

	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	mgraph "github.com/highlight-run/highlight/backend/private-graph/graph"
	"github.com/highlight-run/highlight/backend/util"
)

// Worker is a job runner that parses sessions
const MIN_INACTIVE_DURATION = 10

type Worker struct {
	Resolver *mgraph.Resolver
	S3Client *storage.StorageClient
}

func (w *Worker) pushToObjectStorageAndWipe(ctx context.Context, s *model.Session, migrationState *string, events []model.EventsObject, payloadStringSize int) error {
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{MigrationState: migrationState},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}
	fmt.Printf("starting push for: %v \n", s.ID)
	sessionPayloadSize, err := w.S3Client.PushSessionsToS3(s.ID, s.OrganizationID, events)
	// If this is unsucessful, return early (we treat this session as if it is stored in psql).
	if err != nil {
		return errors.Wrap(err, "error pushing session payload to s3")
	}

	resourcesObject := []*model.ResourcesObject{}
	if res := w.Resolver.DB.Order("created_at desc").Where(&model.ResourcesObject{SessionID: s.ID}).Find(&resourcesObject); res.Error != nil {
		return errors.Wrap(res.Error, "error reading from resources")
	}
	for _, ee := range resourcesObject {
		payloadStringSize += len(ee.Resources)
	}
	dd.StatsD.Histogram("worker.processSession.payloadStringSize", float64(payloadStringSize), nil, 1) //nolint
	resourcePayloadSize, err := w.S3Client.PushResourcesToS3(s.ID, s.OrganizationID, resourcesObject)
	if err != nil {
		return errors.Wrap(err, "error pushing network payload to s3")
	}

	messagesObj := []*model.MessagesObject{}
	if res := w.Resolver.DB.Order("created_at desc").Where(&model.MessagesObject{SessionID: s.ID}).Find(&messagesObj); res.Error != nil {
		return errors.Wrap(res.Error, "error reading from messages")
	}
	for _, mm := range messagesObj {
		payloadStringSize += len(mm.Messages)
	}
	dd.StatsD.Histogram("worker.processSession.payloadStringSize", float64(payloadStringSize), nil, 1) //nolint
	messagePayloadSize, err := w.S3Client.PushMessagesToS3(s.ID, s.OrganizationID, messagesObj)
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

	dd.StatsD.Histogram("worker.pushToObjectStorageAndWipe.payloadSize", float64(totalPayloadSize), nil, 1) //nolint

	// Delete all the events_objects in the DB.
	if len(events) > 0 {
		if err := w.Resolver.DB.Unscoped().Delete(&events).Error; err != nil {
			return errors.Wrapf(err, "error deleting all event records with length: %v", len(events))
		}
	}
	if len(resourcesObject) > 0 {
		if err := w.Resolver.DB.Unscoped().Delete(&resourcesObject).Error; err != nil {
			return errors.Wrapf(err, "error deleting all network resource records with length %v", len(resourcesObject))
		}
	}
	if len(messagesObj) > 0 {
		if err := w.Resolver.DB.Unscoped().Delete(&messagesObj).Error; err != nil {
			return errors.Wrapf(err, "error deleting all messages with length %v", len(messagesObj))
		}
	}
	fmt.Println("parsed: ", s.ID)
	return nil
}

func (w *Worker) scanSessionPayload(ctx context.Context, s *model.Session) (*int64, error) {
	var totalPayloadSize int64 = 0
	sessionIdString := "./tmp/" + strconv.FormatInt(int64(s.ID), 10)

	// events file
	eventsFile, err := os.Create(sessionIdString + ".events.txt")
	if err != nil {
		return nil, errors.Wrap(err, "error creating events file")
	}
	defer eventsFile.Close()
	defer os.Remove(eventsFile.Name())
	eventRows, err := w.Resolver.DB.Model(&model.EventsObject{}).Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").Rows()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving events objects")
	}
	eventsWriter := csv.NewWriter(eventsFile)
	defer eventsWriter.Flush()
	for eventRows.Next() {
		eventObject := model.EventsObject{}
		err := w.Resolver.DB.ScanRows(eventRows, &eventObject)
		if err != nil {
			return nil, errors.Wrap(err, "error scanning event row")
		}
		eventBytes, err := json.Marshal(eventObject)
		if err != nil {
			return nil, errors.Wrap(err, "error marshaling event row")
		}
		// TODO: need to handle new lines in the csv.
		if err := eventsWriter.Write([]string{string(eventBytes)}); err != nil {
			return nil, errors.Wrap(err, "error writing event row")
		}
	}
	eventInfo, err := eventsFile.Stat()
	if err != nil {
		return nil, errors.Wrap(err, "error getting event file info")
	}
	totalPayloadSize += eventInfo.Size()

	// resources file
	resourcesFile, err := os.Create(sessionIdString + ".resources.txt")
	if err != nil {
		return nil, errors.Wrap(err, "error creating resources file")
	}
	defer resourcesFile.Close()
	defer os.Remove(resourcesFile.Name())
	resourcesRows, err := w.Resolver.DB.Model(&model.ResourcesObject{}).Where(&model.ResourcesObject{SessionID: s.ID}).Order("created_at asc").Rows()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving resources objects")
	}
	resourceWriter := csv.NewWriter(resourcesFile)
	defer resourceWriter.Flush()
	for resourcesRows.Next() {
		resourcesObject := model.ResourcesObject{}
		err := w.Resolver.DB.ScanRows(resourcesRows, &resourcesObject)
		if err != nil {
			return nil, errors.Wrap(err, "error scanning resource row")
		}
		resourceBytes, err := json.Marshal(resourcesObject)
		if err != nil {
			return nil, errors.Wrap(err, "error marshaling resource row")
		}
		// TODO: need to handle new lines in the csv.
		if err := resourceWriter.Write([]string{string(resourceBytes)}); err != nil {
			return nil, errors.Wrap(err, "error writing resource row")
		}
	}
	resourceInfo, err := resourcesFile.Stat()
	if err != nil {
		return nil, errors.Wrap(err, "error getting resource file info")
	}
	totalPayloadSize += resourceInfo.Size()

	// messages file
	messagesFile, err := os.Create(sessionIdString + ".messages.txt")
	if err != nil {
		return nil, errors.Wrap(err, "error creating messages file")
	}
	defer messagesFile.Close()
	defer os.Remove(messagesFile.Name())
	messageRows, err := w.Resolver.DB.Model(&model.MessagesObject{}).Where(&model.MessagesObject{SessionID: s.ID}).Order("created_at asc").Rows()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving messages objects")
	}
	writer := csv.NewWriter(messagesFile)
	defer writer.Flush()
	for messageRows.Next() {
		messageObject := model.MessagesObject{}
		err := w.Resolver.DB.ScanRows(resourcesRows, &messageObject)
		if err != nil {
			return nil, errors.Wrap(err, "error scanning message row")
		}
		messageBytes, err := json.Marshal(messageObject)
		if err != nil {
			return nil, errors.Wrap(err, "error marshaling message row")
		}
		// TODO: need to handle new lines in the csv.
		if err := writer.Write([]string{string(messageBytes)}); err != nil {
			return nil, errors.Wrap(err, "error writing message row")
		}
	}

	messagesInfo, err := messagesFile.Stat()
	if err != nil {
		return nil, errors.Wrap(err, "error getting message file info")
	}
	totalPayloadSize += messagesInfo.Size()

	return &totalPayloadSize, nil
}

func (w *Worker) processSession(ctx context.Context, s *model.Session) error {
	size, err := w.scanSessionPayload(ctx, s)
	if err != nil {
		log.Errorf(errors.Wrap(err, "error scanning session payload").Error())
	} else {
		dd.StatsD.Histogram("worker.processSession.scannedSessionPayload", float64(*size), nil, 1) //nolint
		log.Printf("payload size for session '%v' is '%v'\n", s.ID, *size)
	}

	// load all events
	events := []model.EventsObject{}
	if err := w.Resolver.DB.Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").Find(&events).Error; err != nil {
		return errors.Wrap(err, "retrieving events")
	}

	dd.StatsD.Histogram("worker.processSession.numEventsRowsQueried", float64(len(events)), nil, 1) //nolint

	payloadStringBytes := 0
	for _, ee := range events {
		payloadStringBytes += len(ee.Events)
	}
	dd.StatsD.Histogram("worker.processSession.payloadStringSize", float64(payloadStringBytes), nil, 1) //nolint

	// Delete the session if there's no events.
	if len(events) == 0 {
		if err := w.Resolver.DB.Select(clause.Associations).Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete associations for session with no events")
		}
		if err := w.Resolver.DB.Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete session with no events")
		}
		return nil
	}

	firstEventsParsed, err := parse.EventsFromString(events[0].Events)
	if err != nil {
		return errors.Wrap(err, "error parsing first set of events")
	}
	lastEventsParsed, err := parse.EventsFromString(events[len(events)-1].Events)
	if err != nil {
		return errors.Wrap(err, "error parsing last set of events")
	}

	// Calculate total session length and write the length to the session.
	diff := CalculateSessionLength(firstEventsParsed, lastEventsParsed)
	length := diff.Milliseconds()
	activeLength, err := getActiveDuration(events)
	if err != nil {
		return errors.Wrap(err, "error parsing active length")
	}
	activeLengthSec := activeLength.Milliseconds()

	// Delete the session if the length of the session is 0.
	// 1. Nothing happened in the session
	// 2. A web crawler visited the page and produced no events
	if length == 0 {
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
			Length:       length,
			ActiveLength: activeLengthSec,
		},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	// Update session count on dailydb
	currentDate := time.Date(s.CreatedAt.UTC().Year(), s.CreatedAt.UTC().Month(), s.CreatedAt.UTC().Day(), 0, 0, 0, 0, time.UTC)
	dailySession := &model.DailySessionCount{}
	if err := w.Resolver.DB.
		Where(&model.DailySessionCount{
			OrganizationID: s.OrganizationID,
			Date:           &currentDate,
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
	organizationID := s.OrganizationID
	org := &model.Organization{}
	if err := w.Resolver.DB.Where(&model.Organization{Model: model.Model{ID: s.OrganizationID}}).First(&org).Error; err != nil {
		return e.Wrap(err, "error querying org")
	}

	g.Go(func() error {
		// Sending New User Alert
		// if is not new user, return
		if s.FirstTime == nil || !*s.FirstTime {
			return nil
		}
		var sessionAlert model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{OrganizationID: organizationID}}).Where("type IS NULL OR type=?", model.AlertType.NEW_USER).First(&sessionAlert).Error; err != nil {
			return e.Wrapf(err, "[org_id: %d] error fetching new user alert", organizationID)
		}

		// check if session was produced from an excluded environment
		excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
		if err != nil {
			return e.Wrapf(err, "[org_id: %d] error getting excluded environments from new user alert", organizationID)
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
			return e.Wrapf(err, "[org_id: %d] error getting user properties from new user alert", s.OrganizationID)
		}

		// send slack message
		err = sessionAlert.SendSlackAlert(org, s.ID, s.Identifier, nil, nil, nil, userProperties, nil)
		if err != nil {
			return e.Wrapf(err, "[org_id: %d] error sending slack message for new user alert", organizationID)
		}
		return nil
	})

	g.Go(func() error {
		// Sending Track Properties Alert
		var sessionAlert model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{OrganizationID: organizationID}}).Where("type=?", model.AlertType.TRACK_PROPERTIES).First(&sessionAlert).Error; err != nil {
			return e.Wrapf(err, "[org_id: %d] error fetching track properties alert", organizationID)
		}

		// check if session was produced from an excluded environment
		excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
		if err != nil {
			return e.Wrapf(err, "[org_id: %d] error getting excluded environments from track properties alert", organizationID)
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
			Where(&model.Field{OrganizationID: organizationID, Type: "track"}).
			Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", s.ID).
			Where("id IN ?", trackPropertyIds)
		var matchedFields []*model.Field
		if err := stmt.Find(&matchedFields).Error; err != nil {
			return e.Wrap(err, "error querying matched fields by session_id")
		}
		if len(matchedFields) < 1 {
			return nil
		}

		// send slack message
		err = sessionAlert.SendSlackAlert(org, s.ID, s.Identifier, nil, nil, matchedFields, nil, nil)
		if err != nil {
			return e.Wrap(err, "error sending track properties alert slack message")
		}
		return nil
	})

	g.Go(func() error {
		// Sending User Properties Alert
		var sessionAlert model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{OrganizationID: organizationID}}).Where("type=?", model.AlertType.USER_PROPERTIES).First(&sessionAlert).Error; err != nil {
			return e.Wrapf(err, "[org_id: %d] error fetching user properties alert", organizationID)
		}

		// check if session was produced from an excluded environment
		excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
		if err != nil {
			return e.Wrapf(err, "[org_id: %d] error getting excluded environments from user properties alert", organizationID)
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
			Where(&model.Field{OrganizationID: organizationID, Type: "user"}).
			Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", s.ID).
			Where("id IN ?", userPropertyIds)
		var matchedFields []*model.Field
		if err := stmt.Find(&matchedFields).Error; err != nil {
			return e.Wrap(err, "error querying matched fields by session_id")
		}
		if len(matchedFields) < 1 {
			return nil
		}

		// send slack message
		err = sessionAlert.SendSlackAlert(org, s.ID, s.Identifier, nil, nil, matchedFields, nil, nil)
		if err != nil {
			return e.Wrapf(err, "error sending user properties alert slack message")
		}
		return nil
	})

	// Waits for all goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		log.Error(err)
	}

	// Upload to s3 and wipe from the db.
	if os.Getenv("ENABLE_OBJECT_STORAGE") == "true" {
		state := "normal"
		if err := w.pushToObjectStorageAndWipe(ctx, s, &state, events, payloadStringBytes); err != nil {
			log.Errorf("error pushing to object and wiping from db (%v): %v", s.ID, err)
		}
	}
	return nil
}

// Start begins the worker's tasks.
func (w *Worker) Start() {
	ctx := context.Background()
	for {
		time.Sleep(1 * time.Second)
		workerSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.operation", tracer.ResourceName("worker.unit"))
		workerSpan.SetTag("backend", util.Worker)
		now := time.Now()
		seconds := 30
		if os.Getenv("ENVIRONMENT") == "dev" {
			seconds = 8
		}
		someSecondsAgo := now.Add(time.Duration(-1*seconds) * time.Second)
		sessions := []*model.Session{}
		sessionsSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.sessionsQuery", tracer.ResourceName(now.String()))
		if err := w.Resolver.DB.Where("(payload_updated_at < ? OR payload_updated_at IS NULL) AND (processed = ?)", someSecondsAgo, false).Find(&sessions).Error; err != nil {
			log.Errorf("error querying unparsed, outdated sessions: %v", err)
			sessionsSpan.Finish()
			continue
		}
		// Sends a "count" metric to datadog so that we can see how many sessions are being queried.
		dd.StatsD.Histogram("worker.sessionsQuery.sessionCount", float64(len(sessions)), nil, 1) //nolint
		sessionsSpan.Finish()
		type SessionLog struct {
			SessionID      int
			OrganizationID int
		}
		sessionIds := []SessionLog{}
		for _, session := range sessions {
			sessionIds = append(sessionIds, SessionLog{SessionID: session.ID, OrganizationID: session.OrganizationID})
		}
		if len(sessionIds) > 0 {
			log.Printf("sessions that will be processed: %v \n", sessionIds)
		}

		for _, session := range sessions {
			span, ctx := tracer.StartSpanFromContext(ctx, "worker.processSession", tracer.ResourceName(strconv.Itoa(session.ID)))
			if err := w.processSession(ctx, session); err != nil {
				log.Errorf("error processing main session(%v): %v", session.ID, err)
				tracer.WithError(e.Wrapf(err, "error processing session: %v", session.ID))
				span.Finish()
				continue
			}
			span.Finish()
		}
		workerSpan.Finish()
	}
}

// CalculateSessionLength gets the session length given two sets of ReplayEvents.
func CalculateSessionLength(first *parse.ReplayEvents, last *parse.ReplayEvents) time.Duration {
	d := time.Duration(0)
	fe := first.Events
	le := last.Events
	if len(fe) <= 0 {
		return d
	}
	start := first.Events[0].Timestamp
	end := time.Time{}
	if len(le) <= 0 {
		end = first.Events[len(first.Events)-1].Timestamp
	} else {
		end = last.Events[len(last.Events)-1].Timestamp
	}
	d = end.Sub(start)
	return d
}

func getActiveDuration(events []model.EventsObject) (*time.Duration, error) {
	d := time.Duration(0)
	// unnests the events from EventObjects
	allEvents := []*parse.ReplayEvent{}
	for _, eventObj := range events {
		subEvents, err := parse.EventsFromString(eventObj.Events)
		if err != nil {
			return nil, err
		}
		allEvents = append(allEvents, subEvents.Events...)
	}
	// Iterate through all events and sum up time between interactions
	prevUserEvent := &parse.ReplayEvent{}
	for _, eventObj := range allEvents {
		if eventObj.Type == 3 {
			aux := struct {
				Source float64 `json:"source"`
			}{}
			if err := json.Unmarshal([]byte(eventObj.Data), &aux); err != nil {
				return nil, err
			}
			if aux.Source > 0 && aux.Source <= 5 {
				if prevUserEvent != (&parse.ReplayEvent{}) {
					diff := eventObj.Timestamp.Sub(prevUserEvent.Timestamp)
					if diff.Seconds() <= MIN_INACTIVE_DURATION {
						d += eventObj.Timestamp.Sub(prevUserEvent.Timestamp)
					}
				}
				prevUserEvent = eventObj
			}
		}
	}
	return &d, nil
}
