package worker

import (
	"testing"
	"time"

	"github.com/go-test/deep"
	parse "github.com/jay-khatri/highlight/backend/event-parse"
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
		got := CalculateSessionLength(tt.firstEvents, tt.lastEvents)
		if diff := deep.Equal(tt.wantDifference, got); diff != nil {
			t.Errorf("[%v]: %v", i, diff)
		}
	}
}
