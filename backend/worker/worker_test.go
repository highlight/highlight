package worker

import (
	"testing"
	"time"

	"github.com/go-test/deep"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/model"
)

func TestCalculateSessionLength(t *testing.T) {
	tables := map[string]struct {
		firstEvents    *parse.ReplayEvents
		lastEvents     *parse.ReplayEvents
		wantDifference time.Duration
	}{
		"one first event, no duration": {
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						Timestamp: time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					},
				}},
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{},
			},
			time.Duration(0 * time.Hour),
		},
		"two events, active duration": {
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						Timestamp: time.Date(1970, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
					},
				}},
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						Timestamp: time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					},
				},
			},
			time.Duration(1 * time.Hour),
		},
		"one last event, no duration": {
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{},
			},
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						Timestamp: time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					},
				}},
			time.Duration(0 * time.Hour),
		},
		"three events, active duration": {
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						Timestamp: time.Date(1970, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
					},
					{
						Timestamp: time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					},
				}},
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						Timestamp: time.Date(1970, time.Month(1), 1, 3, 0, 0, 0, time.UTC),
					},
					{
						Timestamp: time.Date(1970, time.Month(1), 1, 4, 0, 0, 0, time.UTC),
					},
				}},
			time.Duration(4 * time.Hour),
		},
	}
	for name, tt := range tables {
		t.Run(name, func(t *testing.T) {
			var firstTimestamp time.Time
			var lastTimestamp time.Time
			for _, event := range tt.firstEvents.Events {
				if event != nil {
					if firstTimestamp.IsZero() {
						firstTimestamp = event.Timestamp
					}
					lastTimestamp = event.Timestamp
				}
			}
			for _, event := range tt.lastEvents.Events {
				if event != nil {
					if firstTimestamp.IsZero() {
						firstTimestamp = event.Timestamp
					}
					lastTimestamp = event.Timestamp
				}
			}
			got := CalculateSessionLength(firstTimestamp, lastTimestamp)
			if diff := deep.Equal(tt.wantDifference, got); diff != nil {
				t.Errorf("[session length not equal to expected]: %v", diff)
			}
		})
	}
}

func TestGetActiveDuration(t *testing.T) {
	zeroTime := time.Date(1, 1, 1, 0, 0, 0, 0, time.UTC)
	beginningOfTime := time.Unix(0, 1000000).UTC()
	tables := map[string]struct {
		events             []model.EventsObject
		wantActiveDuration time.Duration
		expectedFirstTS    time.Time
	}{
		"one event": {
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"data": {"test": 5},
						"timestamp": 1,
						"type": 4
					}]
				}
				`}},
			time.Duration(0 * time.Hour),
			zeroTime,
		},
		"no events": {
			[]model.EventsObject{},
			time.Duration(0 * time.Hour),
			zeroTime,
		},
		"two events, active duration": {
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}
				`},
				{
					Events: `
					{
						"events": [{
							"data": {"source": 5},
							"timestamp": 5001,
							"type": 3
						}]
					}
					`}},
			time.Duration(5 * time.Second),
			beginningOfTime,
		},
		"two events, no duration": {
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}`},
				{
					Events: `
					{
						"events": [{
							"data": {"source": 5},
							"timestamp": 20000,
							"type": 3
						}]
					}
					`}},
			time.Duration(0 * time.Second),
			beginningOfTime,
		},
		"multiple events, active duration": {
			[]model.EventsObject{
				{
					Events: `
				{
					"events": [{
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}`},
				{
					Events: `
					{
						"events": [{
							"data": {"test": 5},
							"timestamp": 500,
							"type": 4
						}]
					}`},
				{
					Events: `
					{
						"events": [{
							"data": {"source": 5},
							"timestamp": 1000,
							"type": 3
						}]
					}`},
				{
					Events: `
						{
							"events": [{
								"data": {"source": 5},
								"timestamp": 2001,
								"type": 3
							}]
						}`},
				{
					Events: `
					{
						"events": [{
							"data": {"source": 5},
							"timestamp": 20000,
							"type": 3
						}]
					}
					`}},
			time.Duration(2 * time.Second),
			beginningOfTime,
		},
	}
	for name, tt := range tables {
		t.Run(name, func(t *testing.T) {
			activeDuration := time.Duration(0)
			var (
				firstTimestamp time.Time
				lastTimestamp  time.Time
			)
			for _, event := range tt.events {
				var tempD time.Duration
				tempD, firstTimestamp, lastTimestamp, _ = getActiveDuration(&event, firstTimestamp, lastTimestamp)
				activeDuration += tempD
			}

			if diff := deep.Equal(tt.wantActiveDuration, activeDuration); diff != nil {
				t.Errorf("[active duration not equal to expected]: %v", diff)
			}
			if diff := deep.Equal(tt.expectedFirstTS, firstTimestamp); diff != nil {
				t.Errorf("[expected first timestamp not equal to actual]: %v", diff)
			}
		})
	}
}
