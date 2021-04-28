package worker

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	parse "github.com/highlight-run/highlight/backend/event-parse"
	mgraph "github.com/highlight-run/highlight/backend/private-graph/graph"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

// Worker is a job runner that parses sessions
type Worker struct {
	Resolver *mgraph.Resolver
	S3Client *storage.StorageClient
}

func (w *Worker) processSession(ctx context.Context, s *model.Session) error {
	// Set the session as processed; if any is error thrown after this, the session gets ignored.
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{Processed: &model.T},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	// load all events
	events := []model.EventsObject{}
	if err := w.Resolver.DB.Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").Find(&events).Error; err != nil {
		return errors.Wrap(err, "retrieving events")
	}
	// Delete the session if there's no events.
	if len(events) == 0 {
		if err := w.Resolver.DB.Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete session with no events")
		}
		return nil
	}

	firstEventsParsed, err := parse.EventsFromString(events[0].Events)
	if err != nil {
		return errors.Wrap(err, "error parsing events")
	}
	lastEventsParsed, err := parse.EventsFromString(events[len(events)-1].Events)
	if err != nil {
		return errors.Wrap(err, "error parsing events")
	}

	// Calculate total session length and write the length to the session.
	diff := CalculateSessionLength(firstEventsParsed, lastEventsParsed)
	length := diff.Milliseconds()

	// Delete the session if the length of the session is 0.
	// 1. Nothing happened in the session
	// 2. A web crawler visited the page and produced no events
	if length == 0 {
		if err := w.Resolver.DB.Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete session with no events")
		}
		return nil
	}

	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		model.Session{
			// We are setting Viewed to false so sessions the user viewed while they were live will be reset.
			Viewed:    &model.F,
			Processed: &model.T,
			Length:    length,
		},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	// Upload to s3 for every even session on our org.
	if s.OrganizationID == 1 && os.Getenv("ENABLE_OBJECT_STORAGE") == "true" {
		sessionPayloadSize, err := w.S3Client.PushSessionsToS3(s.ID, s.OrganizationID, events)
		// If this is unsucessful, return early (we treat this session as if it is stored in psql).
		if err != nil {
			return errors.Wrap(err, "error pushing session payload to s3")
		}

		resourcesObject := []*model.ResourcesObject{}
		if res := w.Resolver.DB.Order("created_at desc").Where(&model.ResourcesObject{SessionID: s.ID}).Find(&resourcesObject); res.Error != nil {
			return errors.Wrap(res.Error, "error reading from resources")
		}
		resourcePayloadSize, err := w.S3Client.PushResourcesToS3(s.ID, s.OrganizationID, resourcesObject)
		if err != nil {
			return errors.Wrap(err, "error pushing network payload to s3")
		}

		messagesObj := []*model.MessagesObject{}
		if res := w.Resolver.DB.Order("created_at desc").Where(&model.MessagesObject{SessionID: s.ID}).Find(&messagesObj); res.Error != nil {
			return errors.Wrap(res.Error, "error reading from messages")
		}
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
		// Delete all the events_objects in the DB.
		if err := w.Resolver.DB.Unscoped().Delete(&events).Error; err != nil {
			return errors.Wrap(err, "error deleting all event records")
		}
		if err := w.Resolver.DB.Unscoped().Delete(&resourcesObject).Error; err != nil {
			return errors.Wrap(err, "error deleting all event records")
		}
		if err := w.Resolver.DB.Unscoped().Delete(&messagesObj).Error; err != nil {
			return errors.Wrap(err, "error deleting all event records")
		}
		fmt.Println("parsed: ", s.ID)

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
		sessionsSpan.Finish()
		for _, session := range sessions {
			span, ctx := tracer.StartSpanFromContext(ctx, "worker.processSession", tracer.ResourceName(strconv.Itoa(session.ID)))
			if err := w.processSession(ctx, session); err != nil {
				log.Errorf("error processing session: %v", err)
				tracer.WithError(e.Wrapf(err, "error processing session: %v", session.ID))
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
	if len(fe) <= 0 || len(le) <= 0 {
		return d
	}
	start := first.Events[0].Timestamp
	end := last.Events[len(last.Events)-1].Timestamp
	d = end.Sub(start)
	return d
}
