package parse

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/go-test/deep"
)

func TestEventsFromString(t *testing.T) {
	tables := []struct {
		input      string
		wantEvents *ReplayEvents
	}{
		{
			`
			{
				"events": [{
					"data": {"test": 5},
					"timestamp": 0,
					"type": 4
				}]
			}
			`,
			&ReplayEvents{Events: []*ReplayEvent{
				{
					Timestamp: time.Date(1970, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
					Type:      Meta,
					Data:      json.RawMessage(`{"test": 5}`),
				},
			}},
		},
		{
			`
			{
				"events": [{
					"timestamp": 0,
					"type": 2
				}]
			}
			`,
			&ReplayEvents{Events: []*ReplayEvent{
				{
					Timestamp: time.Date(1970, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
					Type:      FullSnapshot,
				},
			}},
		},
	}
	for _, tt := range tables {
		gotEvents, err := EventsFromString(tt.input)
		if err != nil {
			t.Errorf("error converting: %v", err)
			continue
		}
		got := *gotEvents
		want := *tt.wantEvents
		if diff := deep.Equal(got, want); diff != nil {
			t.Error(diff)
		}
	}
}

func TestInjectStyleSheets(t *testing.T) {
	tables := []struct {
		input string
		want  string
	}{
		{
			`
			{
				"node": {
					"childNodes": [
						{
							"data": {"test": 5},
							"timestamp": 0,
							"type": 4
						},
						{
							"href": "https://app.highlight.run/public.css",
							"rel": "stylesheet"
						}
					]
				}
			}
			`,
			`
			{
				"node": {
					"childNodes": [
						{
							"data": {"test": 5},
							"timestamp": 0,
							"type": 4
						},
						{
							"_cssText": ".highlight {
									color: black;
								}"
						}
					]
				}
			}
			`,
		},
	}
	r := strings.NewReplacer("\n", "", "\t", "", " ", "")
	for i, tt := range tables {
		gotRaw, err := InjectStylsheets(json.RawMessage(tt.input))
		if err != nil {
			t.Errorf("[%v]: %v", i, err)
			continue
		}
		got := r.Replace(string(gotRaw))
		want := r.Replace(tt.want)
		if got != want {
			t.Errorf("[%v]: \n got \n%v \n want \n%v", i, got, want)
		}
	}
}
