package parse

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/pkg/errors"
)

type EventType int
type NodeType int

const (
	DomContentLoaded EventType = iota
	Load
	FullSnapshot
	IncrementalSnapshot
	Meta
	Custom
)

const (
	Document NodeType = iota
	DocumentType
	Element
	Text
	CData
	Comment
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

// InjectStylesheets injects custom stylesheets into a given event.
func InjectStylsheets(inputData json.RawMessage) (json.RawMessage, error) {
	m := make(map[string]interface{})
	err := json.Unmarshal(inputData, &m)
	if err != nil {
		return nil, errors.Wrap(err, "error unmarshaling json")
	}
	node, ok := m["node"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting to node")
	}
	// recursively parse and change the node in place.
	parseEventMap(node)
	m["node"] = node
	b, err := json.Marshal(m)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling back json")
	}
	return json.RawMessage(b), nil
}

func parseEventMap(aMap map[string]interface{}) {
	// If the current map is parseable as a stylesheet obj...
	if err := validateAndFetchStylesheetData(aMap); err == nil {
		return
	}
	for _, val := range aMap {
		switch val.(type) {
		case map[string]interface{}:
			parseEventMap(val.(map[string]interface{}))
		case []interface{}:
			parseEventArray(val.([]interface{}))
		default:
			return
		}
	}
}

func parseEventArray(anArray []interface{}) {
	for _, val := range anArray {
		switch val.(type) {
		case map[string]interface{}:
			parseEventMap(val.(map[string]interface{}))
		case []interface{}:
			parseEventArray(val.([]interface{}))
		default:
			return
		}
	}
}

func validateAndFetchStylesheetData(m map[string]interface{}) error {
	href, ok := m["href"].(string)
	if !ok || !strings.Contains(href, ".css") {
		return errors.New("no proper href field")
	}
	rel, ok := m["rel"].(string)
	if !ok || rel != "stylesheet" {
		return errors.New("no proper rel field")
	}
	resp, err := http.Get(href)
	if err != nil {
		return errors.Wrap(err, "error fetching styles")
	}
	// pp.Printf("about to fetch [href: %v] [rel: %v]\n", href, rel)
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return errors.Wrap(err, "error reading styles")
	}
	if styleString := string(body); len(styleString) > 0 {
		delete(m, "rel")
		delete(m, "href")
		m["_cssText"] = strings.ReplaceAll(styleString, "\n", "")
	}
	return nil
}

func javascriptToGolangTime(t float64) time.Time {
	tInt := int64(t)
	return time.Unix(tInt/1000, (tInt%1000)*1000*1000).UTC()
}
