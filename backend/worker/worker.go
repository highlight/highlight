package worker

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/slack-go/slack"

	mgraph "github.com/jay-khatri/fullstory/backend/main-graph/graph"
	rd "github.com/jay-khatri/fullstory/backend/redis"
	log "github.com/sirupsen/logrus"
)

type Worker struct {
	R *mgraph.Resolver
}

func (w *Worker) Start() {
	go func() {
		for range time.Tick(5 * time.Second) {
			twentySecondsAgo := strconv.FormatInt(time.Now().Add(-20*time.Second).Unix(), 10)
			log.Infof("upper bound is: %v \n", twentySecondsAgo)
			by := &redis.ZRangeBy{Min: "-inf", Max: twentySecondsAgo}
			result := rd.Client.ZRangeByScoreWithScores(context.Background(), "sessions", by)
			if err := result.Err(); err != nil {
				log.Errorf("error getting range: %v", err)
				continue
			}
			for _, s := range result.Val() {
				s := s
				go func() {
					// create a context object that can access any resolver method.
					ctx := context.WithValue(context.Background(), "uid", mgraph.WhitelistedUID)
					if err := rd.Client.ZRem(ctx, "sessions", s.Member).Err(); err != nil {
						log.Errorf("error removing member %v: %v", s.Member, err)
						return
					}
					sid, ok := s.Member.(string)
					if !ok {
						log.Errorf("error parsing session id '%v' from redis", sid)
						return
					}
					sessionID, err := strconv.Atoi(sid)
					if !ok {
						log.Errorf("error parsing session id '%v' into int", sessionID)
						return
					}
					log.Infof("evaluating session '%v' with score: %f \n", sessionID, s.Score)
					events, err := w.R.Query().Events(ctx, sessionID)
					if err != nil {
						log.Errorf("error retrieving events: %v", err)
						return
					}
					first, err := ParseEvent(events[0])
					if err != nil {
						log.Errorf("error parsing first event into map: %v", err)
						return
					}
					last, err := ParseEvent(events[len(events)-1])
					if err != nil {
						log.Errorf("error parsing last event into map: %v", err)
						return
					}
					diff := last.Timestamp.Sub(first.Timestamp).Milliseconds()
					if err := w.R.DB.Model(&model.Session{}).Where(
						&model.Session{Model: model.Model{ID: sessionID}},
					).Updates(
						&model.Session{Processed: true, Length: diff},
					).Error; err != nil {
						log.Errorf("error parsing last event into map: %v", err)
						return
					}

					session, err := w.R.Query().Session(ctx, sessionID)
					if err != nil {
						log.Errorf("error retrieving session: %v", err)
						return
					}

					// Send a notification that the session was processed.
					msg := slack.WebhookMessage{Text: fmt.Sprintf("```NEW SESSION \nid: %v\norg_id: %v```", session.ID, session.OrganizationID)}
					err = slack.PostWebhook("https://hooks.slack.com/services/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", &msg)
					if err != nil {
						log.Errorf("error sending slack hook: %v", err)
					}
				}()
			}
		}
	}()
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
