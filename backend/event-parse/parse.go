package parse

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/pkg/errors"
)

type EventType int

const (
	DomContentLoaded EventType = iota
	Load
	FullSnapshot
	IncrementalSnapshot
	Meta
	Custom
)

// ReplayEvent represents a single event that represents a change on the DOM.
type ReplayEvent struct {
	Timestamp time.Time
	Type      EventType       `json:"type"`
	Data      json.RawMessage `json:"data"`
}

// ReplayEvents is a set of ReplayEvent(s).
type ReplayEvents struct {
	Events []*ReplayEvent `json:"events"`
}

func (r *ReplayEvent) UnmarshalJSON(b []byte) error {
	aux := struct {
		Timestamp float64         `json:"timestamp"`
		Type      EventType       `json:"type"`
		Data      json.RawMessage `json:"data"`
	}{}
	if err := json.Unmarshal(b, &aux); err != nil {
		return errors.Wrap(err, "error with custom unmarshal of events")
	}
	r.Data = aux.Data
	r.Type = aux.Type
	r.Timestamp = javascriptToGolangTime(aux.Timestamp)
	return nil
}

// EventsFromString parses a json string in the form {events: [ev1, ev2, ...]}.
func EventsFromString(eventsString string) (*ReplayEvents, error) {
	events := &ReplayEvents{}
	err := json.Unmarshal([]byte(eventsString), &events)
	if err != nil {
		return nil, fmt.Errorf("error parsing events '%v' into ReplayEvents: %v", eventsString, err)
	}
	if len(events.Events) < 1 {
		return nil, errors.New("empty events")
	}
	return events, nil
}

func javascriptToGolangTime(t float64) time.Time {
	tInt := int64(t)
	return time.Unix(tInt/1000, (tInt%1000)*1000*1000).UTC()
}
