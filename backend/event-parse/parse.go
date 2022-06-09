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
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/lukasbob/srcset"
	"github.com/pkg/errors"
	e "github.com/pkg/errors"
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
var PrivateGraphBasePath = os.Getenv("REACT_APP_PRIVATE_GRAPH_URI")

const (
	ErrAssetTooLarge    = "ErrAssetTooLarge"
	ErrAssetSizeUnknown = "ErrAssetSizeUnknown"
	ErrFailedToFetch    = "ErrFailedToFetch"
)

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

// If a url was already created for this resource in the past day, return that
// Else, fetch the resource, generate a new url for it, and save to S3
func GetOrCreateUrl(projectId int, originalUrl string, s *storage.StorageClient, db *gorm.DB) (string, error) {
	dateTrunc := time.Now().UTC().Format("2006-01-02")
	var uuidStr string
	var result model.SavedAsset
	if err := db.Where(&model.SavedAsset{ProjectID: projectId, OriginalUrl: originalUrl, Date: dateTrunc}).
		First(&result).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			uuid, err := uuid.NewRandom()
			if err != nil {
				return "", errors.Wrap(err, "error generating UUID")
			}

			response, err := http.Get(originalUrl)
			if err != nil {
				uuidStr = ErrFailedToFetch
			} else if response.ContentLength == -1 {
				uuidStr = ErrAssetSizeUnknown
			} else if response.ContentLength > 30e6 {
				uuidStr = ErrAssetTooLarge
			} else {
				uuidStr = uuid.String()
				contentType := response.Header.Get("Content-Type")
				err = s.UploadAsset(uuidStr, response.ContentLength, contentType, response.Body)
				if err != nil {
					return "", errors.Wrap(err, "error uploading asset")
				}
			}

			if err := db.Debug().Create(&model.SavedAsset{
				ProjectID: projectId, OriginalUrl: originalUrl, Date: dateTrunc, UUID: uuidStr}).Error; err != nil {
				return "", errors.Wrap(err, "error writing SavedAsset")
			}
		} else {
			return "", errors.Wrap(err, "error querying saved asset")
		}
	} else {
		uuidStr = result.UUID
	}

	var newUrl string
	if uuidStr == ErrAssetTooLarge || uuidStr == ErrAssetSizeUnknown {
		newUrl = originalUrl
	} else {
		newUrl = fmt.Sprintf("%s/assets/%s", PrivateGraphBasePath, uuidStr)
	}

	return newUrl, nil
}

func ReplaceUrlsInSrcset(projectId int, srcsetText string, s *storage.StorageClient, db *gorm.DB) string {
	replacements := map[string]string{}
	sourceSet := srcset.Parse(srcsetText)
	for _, source := range sourceSet {
		newUrl, err := GetOrCreateUrl(projectId, source.URL, s, db)
		if err != nil {
			log.Warn(e.Wrap(err, "error in GetOrCreateUrl"))
		} else {
			replacements[source.URL] = newUrl
		}
	}

	for old, new := range replacements {
		srcsetText = strings.ReplaceAll(srcsetText, old, new)
	}

	return srcsetText
}

func ReplaceUrlsInStyle(projectId int, styleText string, s *storage.StorageClient, db *gorm.DB) string {
	replacements := map[string]string{}
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
					// SVG path id, skipping
				} else if strings.HasPrefix(url, "blob:") {
					// blob url, skipping
				} else if strings.HasPrefix(url, "data:") {
					// data url, skipping
				} else {
					newUrl, err := GetOrCreateUrl(projectId, url, s, db)
					if err != nil {
						log.Warn(e.Wrap(err, "error fetching referenced url, skipping"))
						continue
					}

					asCss := fmt.Sprintf(`url("%s")`, newUrl)
					replacements[asString] = asCss
				}
			}
		}

		if doExit {
			break
		}
	}

	for old, new := range replacements {
		styleText = strings.ReplaceAll(styleText, old, new)
	}

	return styleText
}

func ReplaceResourceInNodes(projectId int, root map[string]interface{}, s *storage.StorageClient, db *gorm.DB) {
	TryReplaceResources(projectId, root, s, db)

	for _, v := range root {
		switch typedVal := v.(type) {
		case []interface{}:
			for _, item := range typedVal {
				switch typedItem := item.(type) {
				case map[string]interface{}:
					ReplaceResourceInNodes(projectId, typedItem, s, db)
				}
			}
			break
		case map[string]interface{}:
			ReplaceResourceInNodes(projectId, typedVal, s, db)
			break
		}
	}
}

func TryReplaceResources(projectId int, node map[string]interface{}, s *storage.StorageClient, db *gorm.DB) {
	// If this is a style node with textContent
	if node["isStyle"] == true {
		textContent, textContentOk := node["textContent"].(string)
		if !textContentOk {
			return
		}
		node["textContent"] = ReplaceUrlsInStyle(projectId, textContent, s, db)
	}

	// If this node has a _cssText attribute
	cssText, cssTextOk := node["_cssText"].(string)
	if cssTextOk {
		node["_cssText"] = ReplaceUrlsInStyle(projectId, cssText, s, db)
	}

	tagName, tagNameOk := node["tagName"].(string)
	attributes, attributesOk := node["attributes"].(map[string]interface{})
	if !tagNameOk || !attributesOk {
		return
	}

	style, styleOk := attributes["style"].(string)
	if styleOk {
		attributes["style"] = ReplaceUrlsInStyle(projectId, style, s, db)
	}

	src, srcOk := attributes["src"].(string)
	data, dataOk := attributes["data"].(string)
	srcset, srcsetOk := attributes["srcset"].(string)

	if srcTags[tagName] && srcOk {
		newUrl, err := GetOrCreateUrl(projectId, src, s, db)
		if err != nil {
			log.Warn(e.Wrap(err, "error in GetOrCreateUrl"))
		} else {
			attributes["src"] = newUrl
		}
	}

	if tagName == "object" && dataOk {
		newUrl, err := GetOrCreateUrl(projectId, data, s, db)
		if err != nil {
			log.Warn(e.Wrap(err, "error in GetOrCreateUrl"))
		} else {
			attributes["data"] = newUrl
		}
	}

	if tagName == "source" && srcsetOk {
		attributes["srcset"] = ReplaceUrlsInSrcset(projectId, srcset, s, db)
	}
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
