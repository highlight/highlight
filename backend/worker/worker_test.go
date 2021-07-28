package worker

import (
	"testing"
	"time"

	"github.com/go-test/deep"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/model"
)

func TestCalculateSessionLength(t *testing.T) {
	tables := []struct {
		firstEvents    *parse.ReplayEvents
		lastEvents     *parse.ReplayEvents
		wantDifference time.Duration
	}{
		{
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
		{
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
		{
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
		{
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
				}},
			time.Duration(1 * time.Hour),
		},
		{
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
	for i, tt := range tables {
		got := CalculateSessionLength(tt.firstEvents.Events[0].Timestamp, tt.lastEvents.Events[len(tt.lastEvents.Events)-1].Timestamp)
		if diff := deep.Equal(tt.wantDifference, got); diff != nil {
			t.Errorf("[%v]: %v", i, diff)
		}
	}
}

func TestGetActiveDuration(t *testing.T) {
	tables := []struct {
		events             []model.EventsObject
		wantActiveDuration time.Duration
	}{
		{
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"data": {"test": 5},
						"timestamp": 0,
						"type": 4
					}]
				}
				`}},
			time.Duration(0 * time.Hour),
		},
		{
			[]model.EventsObject{},
			time.Duration(0 * time.Hour),
		},
		{
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"data": {"source": 5},
						"timestamp": 0,
						"type": 3
					}]
				}
				`},
				{
					Events: `
					{
						"events": [{
							"data": {"source": 5},
							"timestamp": 5000,
							"type": 3
						}]
					}
					`}},
			time.Duration(5 * time.Second),
		},
		{
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"data": {"source": 5},
						"timestamp": 0,
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
		},
		{
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"data": {"source": 5},
						"timestamp": 0,
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
								"timestamp": 2000,
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
		},
	}
	for i, tt := range tables {
		activeDuration := time.Duration(0)
		var firstTimestamp time.Time
		var lastTimestamp time.Time
		for _, errrr := range tt.events {
			tempD, _ := getActiveDuration(errrr, &firstTimestamp, &lastTimestamp)
			activeDuration += *tempD
		}

		if diff := deep.Equal(&tt.wantActiveDuration, activeDuration); diff != nil {
			t.Errorf("[%v]: %v", i, diff)
		}
	}
}
