package worker

import (
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

func (w *Worker) processSessions(sessions []*model.Session) error {
	for _, s := range sessions {
		if err := w.R.DB.Model(&model.Session{}).Where(

			&model.Session{Model: model.Model{ID: s.ID}},
		).Updates(
			&model.Session{Processed: true},
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
		err := slack.PostWebhook("https://hooks.slack.com/services/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", &msg)
		if err != nil {
			return errors.Wrap(err, "error sending slack hook")
		}
	}
	return nil
}

func (w *Worker) Start() {
	for {
		time.Sleep(1 * time.Second)
		thirtySecondsAgo := time.Now().Add(-60 * time.Second)
		sessions := []*model.Session{}
		if err := w.R.DB.Where("payload_updated_at < ? AND processed = ?", thirtySecondsAgo, false).Find(&sessions).Error; err != nil {
			log.Errorf("error querying unparsed, outdated sessions: %v", err)
			continue
		}
		if err := w.processSessions(sessions); err != nil {
			log.Errorf("error processing sessions: %v", err)
			continue
		}
	}
}

type Event struct {
	Timestamp time.Time
	Type      int
	Data      map[string]interface{}
}

func ParseEvent(event interface{}) (*Event, error) {
	res := &Event{}
	e, ok := event.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error parsing event '%v' into map", event)
	}
	// convert timestamp
	timeAsFloat, ok := e["timestamp"].(float64)
	if !ok {
		return nil, fmt.Errorf("error parsing timestamp '%v' into int", e["timestamp"])
	}
	// convert data
	data, ok := e["data"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error parsing data '%v' into int", e["data"])
	}
	// convert type
	t, ok := e["type"].(float64)
	if !ok {
		return nil, fmt.Errorf("error parsing data '%v' into int", e["type"])
	}
	i := int64(timeAsFloat)
	// taken from: https://gist.github.com/alextanhongpin/3b6b2ee47665ac9c1c32c805b86380a6
	res.Timestamp = time.Unix(i/1000, (i%1000)*1000*1000)
	res.Data = data
	res.Type = int(t)
	return res, nil
}
