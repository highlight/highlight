package parse

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/lukasbob/srcset"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/tdewolff/parse/css"
	"gorm.io/gorm"
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

var ResourcesBasePath = os.Getenv("RESOURCES_BASE_PATH")

type fetcher interface {
	fetchStylesheetData(string) ([]byte, error)
}

type networkFetcher struct{}

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

var fetch fetcher

func init() {
	fetch = networkFetcher{}
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

// InjectStylesheets injects custom stylesheets into a given snapshot event.
func InjectStylesheets(inputData json.RawMessage) (json.RawMessage, error) {
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
	var headNode map[string]interface{}
	for _, c := range htmlChildNodes {
		subNode, ok := c.(map[string]interface{})
		if !ok {
			return nil, errors.New("error converting to childNodes")
		}
		tagName, ok := subNode["tagName"].(string)
		if !ok || tagName != "head" {
			continue
		}
		headNode = subNode
		break
	}
	headChildNodes, ok := headNode["childNodes"].([]interface{})
	if !ok {
		return nil, errors.New("error converting to childNodes")
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
	b, err := json.Marshal(s)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling back to json")
	}
	return json.RawMessage(b), nil
}

var srcTags map[string]bool = map[string]bool{
	"audio":  true,
	"embed":  true,
	"img":    true,
	"input":  true,
	"source": true,
	"track":  true,
	"video":  true,
}

func GetOrCreateUrl(projectId int, originalUrl string, s *storage.StorageClient, db *gorm.DB) (string, error) {
	// project id, original url,
	db.Where()

	response, err := http.Get(originalUrl)
	if err != nil {
		return "", errors.Wrap(err, "error retrieving resource from original url")
	}

	uuid, err := uuid.NewRandom()
	if err != nil {
		return "", errors.Wrap(err, "error generating new UUID")
	}

	uuidStr := uuid.String()

	s.UploadResource(uuidStr, response.Body)

	return fmt.Sprintf("%s/%s, ResourcesBasePath, uuidStr"), nil
}

func ReplaceUrl(styleText string) error {
	reader := bytes.NewReader([]byte(styleText))
	lexer := css.NewLexer(reader)
	for {
		tt, text := lexer.Next()
		doExit := false
		switch tt {
		case css.ErrorToken:
			if !errors.Is(lexer.Err(), io.EOF) {
				log.Warnf("error parsing stylesheet data: %s", lexer.Err().Error())
			}

			doExit = true
			break
		case css.URLToken:
			asString := string(text)
			inner := asString[4 : len(asString)-1]
			noQuote := strings.Trim(inner, "'\"")
			quoted := `"` + noQuote + `"`
			url, err := strconv.Unquote(quoted)
			if err != nil {
				log.Warnf("could not unquote url: %s", quoted)
			} else {
				if strings.HasPrefix(url, "#") {
					// path, skipping
				} else if strings.HasPrefix(url, "blob:") {
					// blob url, skipping
				} else if strings.HasPrefix(url, "data:") {
					// data url, skipping
				} else {
					resp, err := http.Get(url)
					if err != nil {
						return nil, errors.Wrap(err, "error fetching referenced url")
					}

					// ZANETODO: continue from here
					log.Info(resp)
				}
				// see if url is already saved with short enough TTL
				// url + day -> uuid
				// If not, fetch it from the source and save in S3
				// s3 key = uuid
				// newUrl := 1
			}
		}

		if doExit {
			break
		}
	}
}

func ReplaceResourceInNode(node map[string]interface{}) error {
	// 	traverse all nodes
	if node["isStyle"] == true {
		log.Info("sup")
		//     replace(node.textContent)
		// ZANETODO: node["tagName"].(string) might need validation
	} else if srcTags[node["tagName"].(string)] && len(node["src"].(string)) > 0 {

	} else if node["tagName"] == "object" && len(node["data"].(string)) > 0 {
	} else if node["tagName"] == "source" && len(node["srcset"].(string)) > 0 {
		srcset.Parse(node["srcset"].(string))
	}

	childNodes, ok := node["childNodes"].([]map[string]interface{})
	if ok {
		for _, childNode := range childNodes {
			err := ReplaceResourceInNode(childNode)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func ReplaceResourceUrls(data json.RawMessage) (json.RawMessage, error) {
	// fileMap := map[string]string{}
	// if it has _cssText attribute -> attrs["_cssText"]
	// or it has a style attribute -> attrs["style"]
	// or it's a <style> tag -> innerText ???

	return data, nil
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
