package worker

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/k0kubun/pp"
	"github.com/pkg/errors"
	"github.com/slack-go/slack"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	parse "github.com/highlight-run/highlight/backend/event-parse"
	mgraph "github.com/highlight-run/highlight/backend/private-graph/graph"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

// Worker is a job runner that parses sessions
type Worker struct {
	resolver *mgraph.Resolver
	s3Client *storage.StorageClient
}

func NewWorker(r *mgraph.Resolver) (*Worker, error) {
	w := &Worker{resolver: r}
	storage, err := storage.NewStorageClient()
	if err != nil {
		return nil, e.Wrap(err, "error creating storage client for worker")
	}
	w.s3Client = storage
	return w, nil
}

func (w *Worker) processSession(ctx context.Context, s *model.Session) error {
	// Set the session as processed; if any is error thrown after this, the session gets ignored.
	if err := w.resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{Processed: &model.T},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	// load all events
	events := []model.EventsObject{}
	if err := w.resolver.DB.Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").Find(&events).Error; err != nil {
		return errors.Wrap(err, "retrieving events")
	}
	// TODO: this is an empty array
	fmt.Printf("got events %v", events)
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

	// Delete the session if there are no events. This can happen when:
	// 1. Nothing happened in the session
	// 2. A web crawler visited the page and produced no events
	if length == 0 {
		if err := w.resolver.DB.Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete session with no events")
		}
	}

	if err := w.resolver.DB.Model(&model.Session{}).Where(
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

	// Push the session to s3
	eventStrings := []string{}
	for _, event := range events {
		eventStrings = append(eventStrings, event.Events)
	}
	pp.Println("pushing...")
	w.s3Client.PushToS3(s.ID, s.OrganizationID, eventStrings)
	fmt.Printf("%v", eventStrings)
	// Send a notification that the session was processed.
	msg := slack.WebhookMessage{Text: fmt.Sprintf("```NEW SESSION \nid: %v\norg_id: %v\nuser_id: %v\nuser_object: %v\nurl: %v```",
		s.ID,
		s.OrganizationID,
		s.Identifier,
		s.UserObject,
		fmt.Sprintf("https://app.highlight.run/%v/sessions/%v", s.OrganizationID, s.ID))}
	err = slack.PostWebhook("https://hooks.slack.com/services/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", &msg)
	if err != nil {
		return errors.Wrap(err, "error sending slack hook")
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
		thirtySecondsAgo := now.Add(-30 * time.Second)
		sessions := []*model.Session{}
		sessionsSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.sessionsQuery", tracer.ResourceName(now.String()))
		if err := w.resolver.DB.Where("(payload_updated_at < ? OR payload_updated_at IS NULL) AND (processed = ?)", thirtySecondsAgo, false).Find(&sessions).Error; err != nil {
			log.Errorf("error querying unparsed, outdated sessions: %v", err)
			sessionsSpan.Finish()
			continue
		}
		sessionsSpan.Finish()
		pp.Printf("iterate: %v \n", len(sessions))
		for _, session := range sessions {
			span, ctx := tracer.StartSpanFromContext(ctx, "worker.processSession", tracer.ResourceName(strconv.Itoa(session.ID)))
			if err := w.processSession(ctx, session); err != nil {
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
