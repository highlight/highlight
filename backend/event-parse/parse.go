package parse

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/lukasbob/srcset"
	"github.com/pkg/errors"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"github.com/tdewolff/parse/css"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

const (
	ScriptPlaceholder = "SCRIPT_PLACEHOLDER"
	ProxyURL          = "https://replay-cors-proxy.highlightrun.workers.dev"
)

var DisallowedTagPrefixes = []string{
	"onchange",
	"onclick",
	"onkey",
	"onload",
	"onmouse",
}

var ResourcesBasePath = os.Getenv("RESOURCES_BASE_PATH")
var PrivateGraphBasePath = os.Getenv("REACT_APP_PRIVATE_GRAPH_URI")

const (
	ErrAssetTooLarge    = "ErrAssetTooLarge"
	ErrAssetSizeUnknown = "ErrAssetSizeUnknown"
	ErrFailedToFetch    = "ErrFailedToFetch"
	MaxAssetSize        = 10 * 1024 * 1e6
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

	if resp.StatusCode < 200 || resp.StatusCode >= 400 {
		return nil, errors.Wrapf(err, "error fetching styles, %s responded %d", href, resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading styles")
	}

	body = replaceRelativePaths(body, href)
	body = append([]byte("/*highlight-inject*/\n"), body...)

	return body, nil
}

func replaceRelativePaths(body []byte, href string) []byte {
	u, err := url.Parse(href)

	if err == nil {
		base := u.Scheme + "://" + u.Host

		return regexp.MustCompile(`url\(['"]\./`).ReplaceAll(body, []byte(fmt.Sprintf("url('%s?url=%s/", ProxyURL, base)))
	} else {
		return body
	}
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

type Snapshot struct {
	data map[string]interface{}
}

func NewSnapshot(inputData json.RawMessage) (*Snapshot, error) {
	s := &Snapshot{}
	if err := s.decode(inputData); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Snapshot) decode(inputData json.RawMessage) error {
	err := json.Unmarshal(inputData, &s.data)
	if err != nil {
		return errors.Wrap(err, "error unmarshaling")
	}
	return nil
}

func (s *Snapshot) Encode() (json.RawMessage, error) {
	b, err := json.Marshal(s.data)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling back to json")
	}
	return b, nil
}

// EscapeJavascript adds a guardrail to prevent javascript from being stored in the recording.
func (s *Snapshot) EscapeJavascript(ctx context.Context) error {
	return escapeJavascript(ctx, s.data)
}

func escapeJavascript(ctx context.Context, root map[string]interface{}) error {
	escapeNodeScriptTags(ctx, root)
	escapeNodeWithJSAttrs(ctx, root)

	for _, v := range root {
		switch typedVal := v.(type) {
		case []interface{}:
			for _, item := range typedVal {
				switch typedItem := item.(type) {
				case map[string]interface{}:
					if err := escapeJavascript(ctx, typedItem); err != nil {
						return err
					}
				}
			}
		case map[string]interface{}:
			if err := escapeJavascript(ctx, typedVal); err != nil {
				return err
			}
		}
	}

	return nil
}

func escapeNodeScriptTags(ctx context.Context, node map[string]interface{}) {
	// Return if this node doesn't have a tagName or attributes
	tagName, tagNameOk := node["tagName"].(string)
	if !tagNameOk || tagName != "script" {
		return
	}

	for _, c := range node["childNodes"].([]interface{}) {
		if child, ok := c.(map[string]interface{}); ok {
			if txt, txtOk := child["textContent"]; txtOk {
				if txt != ScriptPlaceholder {
					child["textContent"] = ScriptPlaceholder
					log.WithContext(ctx).
						WithField("node", node).
						WithField("TextContent", txt).
						Warnf("potential js attack, dropping script tag in session events")
				}
			}
		}
	}
}

func escapeNodeWithJSAttrs(ctx context.Context, node map[string]interface{}) {
	id, idOk := node["id"].(float64)
	tagName, tagNameOk := node["tagName"].(string)

	if !idOk && !tagNameOk {
		return
	}

	if a, attributesOk := node["attributes"].(map[string]interface{}); attributesOk {
		for key, value := range a {
			for _, badPrefix := range DisallowedTagPrefixes {
				if strings.HasPrefix(key, badPrefix) {
					log.WithContext(ctx).
						WithField("node", node).
						WithField("id", id).
						WithField("tagName", tagName).
						WithField("disallowedTagAttribute", key).
						WithField("value", value).
						Warnf("potential js attack, dropping disallowed attribute on session events tag")
					a[key] = ScriptPlaceholder
					break
				}
			}
		}
	}
}

// InjectStylesheets injects custom stylesheets into a given snapshot event.
func (s *Snapshot) InjectStylesheets() error {
	node, ok := s.data["node"].(map[string]interface{})
	if !ok {
		return errors.New("error converting to node")
	}
	childNodes, ok := node["childNodes"].([]interface{})
	if !ok {
		return errors.New("error converting to childNodes")
	}
	var htmlNode map[string]interface{}
	for _, c := range childNodes {
		subNode, ok := c.(map[string]interface{})
		if !ok {
			return errors.New("error converting to childNodes")
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
		return errors.New("error converting to childNodes")
	}
	var headNode map[string]interface{}
	for _, c := range htmlChildNodes {
		subNode, ok := c.(map[string]interface{})
		if !ok {
			return errors.New("error converting to childNodes")
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

// The tag types which can reference static assets in the src attribute
var srcTagNames = map[string]bool{
	"audio":  true,
	"embed":  true,
	"img":    true,
	"input":  true,
	"source": true,
	"track":  true,
	"video":  true,
}

var excludedMediaURLQueryParams = map[string]bool{
	"expires":              true,
	"signature":            true,
	"x-amz-security-token": true,
}

// If a url was already created for this resource in the past day, return that
// Else, fetch the resource, generate a new url for it, and save to S3
func getOrCreateUrls(ctx context.Context, projectId int, originalUrls []string, s storage.Client, db *gorm.DB, redis *redis.Client) (map[string]string, error) {
	// maps a long url to the minimal version of the url. ie https://foo.com/example?key=value&signature=bar -> https://foo.com/example?key=value
	urlMap := make(map[string]string)
	for _, u := range lo.Uniq(originalUrls) {
		parsedUrl, err := url.Parse(u)
		if err != nil {
			urlMap[u] = u
			continue
		}

		var parts []string
		for k, values := range parsedUrl.Query() {
			if excludedMediaURLQueryParams[strings.ToLower(k)] {
				continue
			}
			for _, v := range values {
				parts = append(parts, fmt.Sprintf("%s=%s", k, v))
			}
		}

		parsedUrl.RawQuery = strings.Join(parts, "&")
		parsedUrl.Fragment = ""
		urlMap[u] = parsedUrl.String()
	}

	dateTrunc := time.Now().UTC().Format("2006-01-02")
	var results []model.SavedAsset

	keys := lo.Map(lo.Values(urlMap), func(url string, idx int) []any {
		return []any{
			projectId,
			url,
			dateTrunc,
		}
	})
	if err := db.Where("(project_id, original_url, date) IN ?", keys).Find(&results).Error; err != nil {
		return nil, errors.Wrap(err, "error querying saved assets")
	}

	resultMap := lo.FromEntries(lo.Map(results, func(asset model.SavedAsset, _ int) lo.Entry[string, model.SavedAsset] {
		return lo.Entry[string, model.SavedAsset]{Key: asset.OriginalUrl, Value: asset}
	}))

	var eg errgroup.Group
	assetChan := make(chan struct {
		OriginalURL string
		NewURL      string
	}, len(urlMap))
	lo.ForEach(lo.Entries(urlMap), func(u lo.Entry[string, string], i int) {
		eg.Go(func() error {
			if err := redis.AcquireLock(ctx, u.Value, 3*time.Minute); err != nil {
				log.WithContext(ctx).WithError(err).WithField("url", u.Value).Error("failed to acquire asset lock")
			} else {
				defer func() {
					if err := redis.ReleaseLock(ctx, u.Value); err != nil {
						log.WithContext(ctx).WithError(err).WithField("url", u.Value).Error("failed to release asset lock")
					}
				}()
			}
			var hashVal string
			result, ok := resultMap[u.Value]
			if ok {
				hashVal = result.HashVal
			} else {
				response, err := http.Get(u.Key)
				if err != nil {
					hashVal = ErrFailedToFetch
				} else if response.ContentLength > MaxAssetSize {
					hashVal = ErrAssetTooLarge
				} else {
					dir, err := os.MkdirTemp("", "asset-*")
					if err != nil {
						return errors.Wrap(err, "failed to create temp directory")
					}

					file, err := os.Create(filepath.Join(dir, "asset"))
					if err != nil {
						return errors.Wrap(err, "failed to create asset file")
					}

					defer func(file *os.File) {
						_ = file.Close()
						_ = os.RemoveAll(dir)
					}(file)
					_, err = io.Copy(file, response.Body)
					if err != nil {
						return errors.Wrap(err, "failed to write asset to file")
					}

					_, err = file.Seek(0, io.SeekStart)
					if err != nil {
						return errors.Wrap(err, "failed to seek asset file")
					}

					hasher := sha256.New()
					if _, err := io.Copy(hasher, file); err != nil {
						return errors.Wrap(err, "error hashing response body")
					}

					_, err = file.Seek(0, io.SeekStart)
					if err != nil {
						return errors.Wrap(err, "failed to seek asset file")
					}

					hashVal = base64.StdEncoding.EncodeToString(hasher.Sum(nil))
					hashVal = strings.ReplaceAll(hashVal, "/", "-")
					hashVal = strings.ReplaceAll(hashVal, "+", "_")
					hashVal = strings.ReplaceAll(hashVal, "=", "~")
					contentType := response.Header.Get("Content-Type")
					err = s.UploadAsset(ctx, strconv.Itoa(projectId)+"/"+hashVal, contentType, file)
					if err != nil {
						return errors.Wrap(err, "error uploading asset")
					}
					result = model.SavedAsset{
						ProjectID:   projectId,
						OriginalUrl: u.Value,
						Date:        dateTrunc,
						HashVal:     hashVal,
					}
					if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&result).Error; err != nil {
						return errors.Wrap(err, "error saving asset metadata")
					}
				}
			}

			var newUrl string
			if hashVal == ErrAssetTooLarge || hashVal == ErrAssetSizeUnknown || hashVal == ErrFailedToFetch {
				newUrl = hashVal
			} else {
				newUrl = fmt.Sprintf("%s/assets/%d/%s", PrivateGraphBasePath, projectId, hashVal)
			}
			assetChan <- struct {
				OriginalURL string
				NewURL      string
			}{OriginalURL: u.Key, NewURL: newUrl}
			return nil
		})
	})

	if err := eg.Wait(); err != nil {
		return nil, err
	}
	close(assetChan)

	replacements := map[string]string{}
	for v := range assetChan {
		replacements[v.OriginalURL] = v.NewURL
	}
	return replacements, nil
}

func getUrlsInSrcset(projectId int, srcsetText string, replacements map[string]string) (newText string, urls []string) {
	srcsetReplacements := map[string]string{}
	sourceSet := srcset.Parse(srcsetText)
	for _, source := range sourceSet {
		urls = append(urls, source.URL)
		newUrl, ok := replacements[source.URL]
		if ok {
			srcsetReplacements[source.URL] = newUrl
		}
	}

	newText = srcsetText
	for old, new := range srcsetReplacements {
		newText = strings.ReplaceAll(newText, old, new)
	}

	return
}

func getUrlsInStyle(ctx context.Context, projectId int, styleText string, replacements map[string]string) (newText string, urls []string) {
	styleReplacements := map[string]string{}
	reader := bytes.NewReader([]byte(styleText))
	lexer := css.NewLexer(reader)

lexerLoop:
	for {
		tt, text := lexer.Next()
		switch tt {
		case css.ErrorToken:
			if !errors.Is(lexer.Err(), io.EOF) {
				log.WithContext(ctx).Warnf("error parsing stylesheet data: %s", lexer.Err().Error())
			}

			// Once an error or EOF is reached, exit the loop
			break lexerLoop
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
				log.WithContext(ctx).Warnf("could not unquote url: %s", quoted)
			} else {
				if strings.HasPrefix(url, "#") {
					// SVG path id, skipping
				} else if strings.HasPrefix(url, "blob:") {
					// blob url, skipping
				} else if strings.HasPrefix(url, "data:") {
					// data url, skipping
				} else {
					urls = append(urls, url)
					newUrl, ok := replacements[url]
					if ok {
						// Surround with `url(" ... ")`
						asCss := fmt.Sprintf(`url(%s)`, strconv.Quote(newUrl))
						// Map the old url substring to the new one
						styleReplacements[asString] = asCss
					}
				}
			}
		}
	}

	// Replace every occurrence of the old substrings
	newText = styleText
	for old, new := range styleReplacements {
		newText = strings.ReplaceAll(newText, old, new)
	}

	return
}

func (s *Snapshot) ReplaceAssets(ctx context.Context, projectId int, s3 storage.Client, db *gorm.DB, redis *redis.Client) error {
	urls := getAssetUrlsFromTree(ctx, projectId, s.data, map[string]string{})
	span, _ := tracer.StartSpanFromContext(ctx, "event-parse.parse.ReplaceAssets", tracer.ResourceName("getOrCreateUrls"), tracer.Tag("project_id", projectId))
	span.SetTag("numberOfURLs", len(urls))
	replacements, err := getOrCreateUrls(ctx, projectId, urls, s3, db, redis)
	span.Finish(tracer.WithError(err))
	if err != nil {
		return errors.Wrap(err, "error creating replacement urls")
	}
	getAssetUrlsFromTree(ctx, projectId, s.data, replacements)
	return nil
}

func getAssetUrlsFromTree(ctx context.Context, projectId int, root map[string]interface{}, replacements map[string]string) (urls []string) {
	urls = append(urls, tryGetAssetUrls(ctx, projectId, root, replacements)...)

	for _, v := range root {
		switch typedVal := v.(type) {
		case []interface{}:
			for _, item := range typedVal {
				switch typedItem := item.(type) {
				case map[string]interface{}:
					urls = append(urls, getAssetUrlsFromTree(ctx, projectId, typedItem, replacements)...)
				}
			}
		case map[string]interface{}:
			urls = append(urls, getAssetUrlsFromTree(ctx, projectId, typedVal, replacements)...)
		}
	}

	return
}

func tryGetAssetUrls(ctx context.Context, projectId int, node map[string]interface{}, replacements map[string]string) (urls []string) {
	// If this is a style node with textContent
	if node["isStyle"] == true {
		textContent, textContentOk := node["textContent"].(string)
		if !textContentOk {
			return
		}
		newText, newUrls := getUrlsInStyle(ctx, projectId, textContent, replacements)
		node["textContent"] = newText
		urls = append(urls, newUrls...)
	}

	// If this node has a _cssText attribute
	cssText, cssTextOk := node["_cssText"].(string)
	if cssTextOk {
		newText, newUrls := getUrlsInStyle(ctx, projectId, cssText, replacements)
		node["_cssText"] = newText
		urls = append(urls, newUrls...)
	}

	// Return if this node doesn't have a tagName or attributes
	tagName, tagNameOk := node["tagName"].(string)
	attributes, attributesOk := node["attributes"].(map[string]interface{})
	if !tagNameOk || !attributesOk {
		return urls
	}

	// If this node has a style attribute
	style, styleOk := attributes["style"].(string)
	if styleOk {
		newText, newUrls := getUrlsInStyle(ctx, projectId, style, replacements)
		attributes["style"] = newText
		urls = append(urls, newUrls...)
	}

	// Get the src, data, and srcset attributes (these can all reference static assets)
	src, srcOk := attributes["src"].(string)
	data, dataOk := attributes["data"].(string)
	srcset, srcsetOk := attributes["srcset"].(string)

	// If the tag supports the src attribute
	if srcTagNames[tagName] && srcOk {
		newUrl, ok := replacements[src]
		if ok {
			attributes["src"] = newUrl
		}
		urls = append(urls, src)
	}

	// If the object tag has a data attribute
	if tagName == "object" && dataOk {
		newUrl, ok := replacements[data]
		if ok {
			attributes["data"] = newUrl
		}
		urls = append(urls, data)
	}

	// If the source tag has a srcset attribute
	if tagName == "source" && srcsetOk {
		newText, newUrls := getUrlsInSrcset(projectId, srcset, replacements)
		attributes["srcset"] = newText
		urls = append(urls, newUrls...)
	}

	return
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
