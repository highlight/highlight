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

// The tag types which can reference static assets in the src attribute
var srcTagNames map[string]bool = map[string]bool{
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
func getOrCreateUrl(projectId int, originalUrl string, s *storage.StorageClient, db *gorm.DB) (string, error) {
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

func replaceUrlsInSrcset(projectId int, srcsetText string, s *storage.StorageClient, db *gorm.DB) (string, error) {
	replacements := map[string]string{}
	sourceSet := srcset.Parse(srcsetText)
	for _, source := range sourceSet {
		newUrl, err := getOrCreateUrl(projectId, source.URL, s, db)
		if err != nil {
			return "", e.Wrap(err, "error in GetOrCreateUrl")
		} else {
			replacements[source.URL] = newUrl
		}
	}

	for old, new := range replacements {
		srcsetText = strings.ReplaceAll(srcsetText, old, new)
	}

	return srcsetText, nil
}

func replaceUrlsInStyle(projectId int, styleText string, s *storage.StorageClient, db *gorm.DB) string {
	replacements := map[string]string{}
	reader := bytes.NewReader([]byte(styleText))
	lexer := css.NewLexer(reader)
	for {
		tt, text := lexer.Next()
		switch tt {
		case css.ErrorToken:
			if !errors.Is(lexer.Err(), io.EOF) {
				log.Warnf("error parsing stylesheet data: %s", lexer.Err().Error())
			}

			// Once an error or EOF is reached, exit the loop
			break
		case css.URLToken:
			// Formatted like `url('https://example.com/image.png')`
			asString := string(text)
			// Trim the `url(` and `)`
			inner := asString[4 : len(asString)-1]
			// Strip any outer quotes (' or ")
			noQuote := strings.Trim(inner, "'\"")
			// Replace with double quotes and unquote (to correctly handle escape characters)
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
					newUrl, err := getOrCreateUrl(projectId, url, s, db)
					if err != nil {
						log.Warn(e.Wrap(err, "error fetching referenced url, falling back to the original"))
						continue
					}

					// Surround with `url(" ... ")`
					asCss := fmt.Sprintf(`url(%s)`, strconv.Quote(newUrl))
					// Map the old url substring to the new one
					replacements[asString] = asCss
				}
			}
		}
	}

	// Replace every occurrence of the old substrings
	for old, new := range replacements {
		styleText = strings.ReplaceAll(styleText, old, new)
	}

	return styleText
}

func ReplaceAssetsRecursively(projectId int, root map[string]interface{}, s *storage.StorageClient, db *gorm.DB) {
	tryReplaceAssets(projectId, root, s, db)

	for _, v := range root {
		switch typedVal := v.(type) {
		case []interface{}:
			for _, item := range typedVal {
				switch typedItem := item.(type) {
				case map[string]interface{}:
					ReplaceAssetsRecursively(projectId, typedItem, s, db)
				}
			}
		case map[string]interface{}:
			ReplaceAssetsRecursively(projectId, typedVal, s, db)
		}
	}
}

func tryReplaceAssets(projectId int, node map[string]interface{}, s *storage.StorageClient, db *gorm.DB) {
	// If this is a style node with textContent
	if node["isStyle"] == true {
		textContent, textContentOk := node["textContent"].(string)
		if !textContentOk {
			return
		}
		node["textContent"] = replaceUrlsInStyle(projectId, textContent, s, db)
	}

	// If this node has a _cssText attribute
	cssText, cssTextOk := node["_cssText"].(string)
	if cssTextOk {
		node["_cssText"] = replaceUrlsInStyle(projectId, cssText, s, db)
	}

	// Return if this node doesn't have a tagName or attributes
	tagName, tagNameOk := node["tagName"].(string)
	attributes, attributesOk := node["attributes"].(map[string]interface{})
	if !tagNameOk || !attributesOk {
		return
	}

	// If this node has a style attribute
	style, styleOk := attributes["style"].(string)
	if styleOk {
		attributes["style"] = replaceUrlsInStyle(projectId, style, s, db)
	}

	// Get the src, data, and srcset attributes (these can all reference static assets)
	src, srcOk := attributes["src"].(string)
	data, dataOk := attributes["data"].(string)
	srcset, srcsetOk := attributes["srcset"].(string)

	// If the tag supports the src attribute
	if srcTagNames[tagName] && srcOk {
		newUrl, err := getOrCreateUrl(projectId, src, s, db)
		if err != nil {
			log.Warn(e.Wrap(err, "error in GetOrCreateUrl"))
		} else {
			attributes["src"] = newUrl
		}
	}

	// If the object tag has a data attribute
	if tagName == "object" && dataOk {
		newUrl, err := getOrCreateUrl(projectId, data, s, db)
		if err != nil {
			log.Warn(e.Wrap(err, "error in GetOrCreateUrl"))
		} else {
			attributes["data"] = newUrl
		}
	}

	// If the source tag has a srcset attribute
	if tagName == "source" && srcsetOk {
		newSrcset, err := replaceUrlsInSrcset(projectId, srcset, s, db)
		if err != nil {
			log.Warn(e.Wrap(err, "error in GetOrCreateUrl"))
		} else {
			attributes["srcset"] = newSrcset
		}
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
