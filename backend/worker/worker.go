package worker

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/pkg/errors"
	"github.com/slack-go/slack"

	mgraph "github.com/jay-khatri/fullstory/backend/main-graph/graph"
	log "github.com/sirupsen/logrus"
)

type Worker struct {
	R *mgraph.Resolver
}

func javascriptToGolangTime(t float64) time.Time {
	tInt := int64(t)
	return time.Unix(tInt/1000, (tInt%1000)*1000*1000)
}

func (w *Worker) processSession(s *model.Session) error {
	if err := w.R.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{Processed: true},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}
	firstEvents := &model.EventsObject{}
	if err := w.R.DB.Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").First(firstEvents).Error; err != nil {
		return errors.Wrap(err, "error retrieving first set of events")
	}
	firstEventsParsed, err := ParseEventsObject(firstEvents.Events)
	if err != nil {
		return errors.Wrap(err, "error parsing first set of events")
	}
	lastEvents := &model.EventsObject{}
	if err := w.R.DB.Where(&model.EventsObject{SessionID: s.ID}).Order("created_at desc").First(lastEvents).Error; err != nil {
		return errors.Wrap(err, "error retrieving last set of events")
	}
	lastEventsParsed, err := ParseEventsObject(lastEvents.Events)
	if err != nil {
		return errors.Wrap(err, "error parsing last set of events")
	}
	start := javascriptToGolangTime(firstEventsParsed.Events[0].Timestamp)
	end := javascriptToGolangTime(lastEventsParsed.Events[len(lastEventsParsed.Events)-1].Timestamp)
	diff := end.Sub(start)
	if err := w.R.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{Processed: true, Length: diff.Milliseconds()},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}
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

func (w *Worker) Start() {
	for {
		time.Sleep(1 * time.Second)
		thirtySecondsAgo := time.Now().Add(-30 * time.Second)
		sessions := []*model.Session{}
		if err := w.R.DB.Where("payload_updated_at < ? AND processed = ?", thirtySecondsAgo, false).Find(&sessions).Error; err != nil {
			log.Errorf("error querying unparsed, outdated sessions: %v", err)
			continue
		}
		for _, session := range sessions {
			if err := w.processSession(session); err != nil {
				log.Errorf("error processing sessions: %v", err)
				continue
			}
		}
	}
}

type EventsObject struct {
	Events []*struct {
		Timestamp float64 `json:"timestamp"`
		Type      int     `json:"type"`
	} `json:"events"`
}

func ParseEventsObject(event string) (*EventsObject, error) {
	eventsObj := &EventsObject{}
	err := json.Unmarshal([]byte(event), &eventsObj)
	if err != nil {
		return nil, fmt.Errorf("error parsing event '%v' into map", event)
	}
	if len(eventsObj.Events) < 1 {
		return nil, errors.New("empty events")
	}
	return eventsObj, nil
}
