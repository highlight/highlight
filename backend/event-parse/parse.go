package parse

import (
	"context"
	"encoding/json"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"strings"
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

type EventSource int

const (
	Mutation EventSource = iota
	MouseMove
	MouseInteraction
	Scroll
	ViewportResize
	Input
	TouchMove
	MediaInteraction
	StyleSheetRule
	CanvasMutation
	Font
	Log
	Drag
)

type MouseInteractions int

const (
	MouseUp MouseInteractions = iota
	MouseDown
	Click
	ContextMenu
	DblClick
	Focus
	Blur
	TouchStart
	TouchMove_Departed
	TouchEnd
	TouchCancel
)

type fetcher interface {
	fetchStylesheetData(string) ([]byte, error)
	storeBinaryResource(string) (string, error)
}

type networkFetcher struct {
	storageClient *storage.StorageClient
}

func (n networkFetcher) fetchStylesheetData(href string) ([]byte, error) {
	resp, err := http.Get(href)
	if err != nil {
		return nil, errors.Wrap(err, "error fetching styles")
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading styles")
	}
	body = append([]byte("/*highlight-inject*/\n"), body...)
	return body, nil
}

func (n networkFetcher) storeBinaryResource(src string) (string, error) {
	// TODO(vkorolik) implement
	_, err = n.storageClient.PushFileToS3(context.Background(), sessionId, projectId, file, storage.S3SessionsPayloadBucketName, storage.BinaryResources)
	if err != nil {
		return "", errors.Wrap(err, "failed to put s3 objects")
	}

	return "", nil
}

var fetch fetcher

func init() {
	storageClient, err := storage.NewStorageClient()
	if err != nil {
		log.Fatal("failed to initialize s3 client")
	}
	fetch = networkFetcher{
		storageClient: storageClient,
	}
}

// ReplayEvent represents a single event that represents a change on the DOM.
type ReplayEvent struct {
	Timestamp    time.Time       `json:"-"`
	Type         EventType       `json:"type"`
	Data         json.RawMessage `json:"data"`
	TimestampRaw float64         `json:"timestamp"`
	SID          float64         `json:"_sid"`
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
		SID       float64         `json:"_sid"`
	}{}
	if err := json.Unmarshal(b, &aux); err != nil {
		return errors.Wrap(err, "error with custom unmarshal of events")
	}
	r.Data = aux.Data
	r.Type = aux.Type
	r.Timestamp = javascriptToGolangTime(aux.Timestamp)
	r.TimestampRaw = aux.Timestamp
	r.SID = aux.SID
	return nil
}

// MouseInteractionEventData represents the data field for click events from the following parent events
type MouseInteractionEventData struct {
	X      *float64           `json:"x"`
	Y      *float64           `json:"y"`
	Source *EventSource       `json:"source"`
	Type   *MouseInteractions `json:"type"`
}

// EventsFromString parses a json string in the form {events: [ev1, ev2, ...]}.
func EventsFromString(eventsString string) (*ReplayEvents, error) {
	events := &ReplayEvents{}
	err := json.Unmarshal([]byte(eventsString), &events)
	if err != nil {
		return nil, errors.Wrapf(err, "error parsing events into ReplayEvents for string '%v'", eventsString)
	}
	return events, nil
}

// ProcessHTML injects custom stylesheets into a given snapshot event.and processes blob images.
func ProcessHTML(inputData json.RawMessage) (json.RawMessage, error) {
	var s interface{}
	err := json.Unmarshal(inputData, &s)
	if err != nil {
		return nil, errors.Wrap(err, "error unmarshaling")
	}
	n, ok := s.(map[string]interface{})
	if !ok {
		return nil, errors.New("error converting to obj")
	}
	node, ok := n["node"].(map[string]interface{})
	if !ok {
		return nil, errors.New("error converting to node")
	}
	childNodes, ok := node["childNodes"].([]interface{})
	if !ok {
		return nil, errors.New("error converting to childNodes")
	}
	var htmlNode map[string]interface{}
	for _, c := range childNodes {
		subNode, ok := c.(map[string]interface{})
		if !ok {
			return nil, errors.New("error converting to childNodes")
		}
		tagName, ok := subNode["tagName"].(string)
		if !ok || tagName != "html" {
			continue
		}
		htmlNode = subNode
		break
	}
	htmlChildNodes, ok := htmlNode["childNodes"].([]interface{})
	if !ok {
		return nil, errors.New("error converting to childNodes")
	}
	var headNode map[string]interface{} = nil
	var bodyNode map[string]interface{} = nil
	for _, c := range htmlChildNodes {
		if headNode != nil && bodyNode != nil {
			break
		}
		subNode, ok := c.(map[string]interface{})
		if !ok {
			return nil, errors.New("error converting to childNodes")
		}
		tagName, ok := subNode["tagName"].(string)
		if !ok {
			continue
		}
		if tagName == "head" {
			headNode = subNode
		} else if tagName == "body" {
			bodyNode = subNode
		}
	}
	if err = processHTMLHeadStylesheets(headNode); err != nil {
		return nil, err
	}
	if err = processHTMLResources(bodyNode); err != nil {
		return nil, err
	}
	b, err := json.Marshal(s)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling back to json")
	}
	return json.RawMessage(b), nil
}

func processHTMLResources(bodyNode map[string]interface{}) error {
	bodyChildNodes, ok := bodyNode["childNodes"].([]interface{})
	if !ok {
		return errors.New("error converting to childNodes")
	}
	for _, c := range bodyChildNodes {
		subNode, ok := c.(map[string]interface{})
		if !ok {
			continue
		}
		tagName, ok := subNode["tagName"].(string)
		if !ok || tagName != "img" {
			continue
		}
		attrs, ok := subNode["attributes"].(map[string]interface{})
		if !ok {
			continue
		}
		src, ok := attrs["src"].(string)
		if !ok || !strings.Contains(src, "base64") {
			continue
		}
		data, err := fetch.storeBinaryResource(src)
		if err != nil || len(data) <= 0 {
			continue
		}

		attrs["src"] = data
	}
	return nil
}

func processHTMLHeadStylesheets(headNode map[string]interface{}) error {
	headChildNodes, ok := headNode["childNodes"].([]interface{})
	if !ok {
		return errors.New("error converting to childNodes")
	}
	for _, c := range headChildNodes {
		subNode, ok := c.(map[string]interface{})
		if !ok {
			continue
		}
		tagName, ok := subNode["tagName"].(string)
		if !ok || tagName != "link" {
			continue
		}
		attrs, ok := subNode["attributes"].(map[string]interface{})
		if !ok {
			continue
		}
		rel, ok := attrs["rel"].(string)
		if !ok || rel != "stylesheet" {
			continue
		}
		href, ok := attrs["href"].(string)
		if !ok || !strings.Contains(href, "css") {
			continue
		}
		data, err := fetch.fetchStylesheetData(href)
		if err != nil {
			continue
		}
		if len(data) <= 0 {
			continue
		}
		delete(attrs, "rel")
		delete(attrs, "href")

		// The '_cssText' attribute tells @highlight-run/rrweb to create a custom <style/> tag to populate
		// content w/.
		attrs["_cssText"] = string(data)
	}
	return nil
}

func javascriptToGolangTime(t float64) time.Time {
	tInt := int64(t)
	return time.Unix(tInt/1000, (tInt%1000)*1000*1000).UTC()
}

func UnmarshallMouseInteractionEvent(data json.RawMessage) (*MouseInteractionEventData, error) {
	aux := MouseInteractionEventData{}
	err := json.Unmarshal(data, &aux)
	if err != nil {
		return nil, err
	}

	if aux.Source == nil {
		return nil, errors.New("all user interaction events must have a source")
	}
	return &aux, nil
}
