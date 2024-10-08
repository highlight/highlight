package http

import (
	"compress/gzip"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	model2 "github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
	"go.opentelemetry.io/otel/trace"
)

const (
	LogDrainProjectQueryParam = "project"
	LogDrainServiceQueryParam = "service"
	LogDrainProjectHeader     = "x-highlight-project"
	LogDrainServiceHeader     = "x-highlight-service"
)

type PayloadMessage interface {
	GetMessage() string
	GetLevel() string
	GetTimestamp() *time.Time
	SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context
}

type CloudWatchPayloadMessage struct {
	Payload   *CloudWatchPayload `json:",omitempty"`
	Id        string
	Timestamp int64
	Message   string
}

func (p *CloudWatchPayloadMessage) GetMessage() string {
	return p.Message
}

func (p *CloudWatchPayloadMessage) GetLevel() string {
	return model.LogLevelInfo.String()
}

func (p *CloudWatchPayloadMessage) GetTimestamp() *time.Time {
	return ptr.Time(time.UnixMilli(p.Timestamp))
}

func (p *CloudWatchPayloadMessage) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	hl.Attributes = map[string]string{
		string(semconv.ServiceNameKey): "firehose",
		"message_type":                 p.Payload.MessageType,
		"owner":                        p.Payload.Owner,
		"log_group":                    p.Payload.LogGroup,
		"log_stream":                   p.Payload.LogStream,
	}
	return ctx
}

type Payload interface {
	Parse([]byte) bool
	GetMessages() []PayloadMessage
}

type CloudWatchPayload struct {
	MessageType         string
	Owner               string
	LogGroup            string
	LogStream           string
	SubscriptionFilters []string
	LogEvents           []CloudWatchPayloadMessage
}

func (p *CloudWatchPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.LogEvents) > 0
}

func (p *CloudWatchPayload) GetMessages() []PayloadMessage {
	return lo.Map(p.LogEvents, func(msg CloudWatchPayloadMessage, _ int) PayloadMessage {
		msg.Payload = p
		return PayloadMessage(&msg)
	})
}

type FireLensPayload struct {
	Log    string
	Source string
}

func (p *FireLensPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.Log) > 0
}

func (p *FireLensPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *FireLensPayload) GetMessage() string {
	return p.Log
}

func (p *FireLensPayload) GetLevel() string {
	if p.Source == "stderr" {
		return model.LogLevelError.String()
	}
	return model.LogLevelInfo.String()
}

func (p *FireLensPayload) GetTimestamp() *time.Time {
	return nil
}

func (p *FireLensPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	var lgAttrs map[string]interface{}
	if err := json.Unmarshal(msg, &lgAttrs); err != nil {
		log.WithContext(ctx).
			WithError(err).WithField("msg", msg).
			Error("invalid firelens log attributes")
	}
	for k, v := range lgAttrs {
		// skip the keys that are part of the message
		if has := map[string]bool{"log": true, "source": true}[k]; has {
			continue
		}
		for key, value := range hlog.FormatLogAttributes(k, v) {
			hl.Attributes[key] = value
		}
	}
	hl.Attributes[string(semconv.ServiceNameKey)] = hl.Attributes["container_name"]
	return ctx
}

type FireLensFluentBitPayload struct {
	Message   string
	Level     string
	Source    string
	Timestamp string `json:"@timestamp"`
}

func (p *FireLensFluentBitPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.Message) > 0
}

func (p *FireLensFluentBitPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *FireLensFluentBitPayload) GetMessage() string {
	return p.Message
}

func (p *FireLensFluentBitPayload) GetLevel() string {
	return strings.ToLower(p.Level)
}

func (p *FireLensFluentBitPayload) GetTimestamp() *time.Time {
	t, err := time.Parse("2006-01-02T15:04:05-0700", p.Timestamp)
	if err != nil {
		return &t
	}
	return nil
}

func (p *FireLensFluentBitPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	var lgAttrs map[string]interface{}
	if err := json.Unmarshal(msg, &lgAttrs); err != nil {
		log.WithContext(ctx).
			WithError(err).WithField("msg", msg).
			Error("invalid firelens fluentbit log attributes")
	}
	for k, v := range lgAttrs {
		// skip the keys that are part of the message
		if has := map[string]bool{"message": true, "source": true, "level": true, "@timestamp": true}[k]; has {
			continue
		}
		for key, value := range hlog.FormatLogAttributes(k, v) {
			hl.Attributes[key] = value
		}
	}
	hl.Attributes[string(semconv.ServiceNameKey)] = hl.Attributes["container_name"]
	hl.Attributes["source"] = p.Source
	return ctx
}

type FireLensPinoPayload struct {
	Message string `json:"msg"`
	Level   uint8  `json:"level"`
	Service string `json:"name"`
	Time    int64  `json:"time"`
}

func (p *FireLensPinoPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.Message) > 0
}

func (p *FireLensPinoPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *FireLensPinoPayload) GetMessage() string {
	return p.Message
}

func (p *FireLensPinoPayload) GetLevel() string {
	return parsePinoLevel(p.Level)
}

func (p *FireLensPinoPayload) GetTimestamp() *time.Time {
	return ptr.Time(time.UnixMilli(p.Time))
}

func (p *FireLensPinoPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	var lgAttrs map[string]interface{}
	if err := json.Unmarshal(msg, &lgAttrs); err != nil {
		log.WithContext(ctx).
			WithError(err).WithField("msg", msg).
			Error("invalid firelens fluentbit log attributes")
	}
	for k, v := range lgAttrs {
		// skip the keys that are part of the message
		if has := map[string]bool{"level": true, "time": true, "msg": true}[k]; has {
			continue
		}
		for key, value := range hlog.FormatLogAttributes(k, v) {
			hl.Attributes[key] = value
		}
	}
	hl.Attributes[string(semconv.ServiceNameKey)] = hl.Attributes["name"]
	return ctx
}

type JsonPayload struct {
	Message string `json:"msg"`
}

func (p *JsonPayload) Parse(msg []byte) bool {
	p.Message = string(msg)
	return true
}

func (p *JsonPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *JsonPayload) GetMessage() string {
	return p.Message
}

func (p *JsonPayload) GetLevel() string {
	return model.LogLevelInfo.String()
}

func (p *JsonPayload) GetTimestamp() *time.Time {
	return nil
}

func (p *JsonPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	hl.Attributes[string(semconv.ServiceNameKey)] = "firehose"
	return ctx
}

func getBody(r *http.Request) (body io.Reader, err error) {
	body = r.Body
	if r.Header.Get("Content-Encoding") == "gzip" {
		body, err = gzip.NewReader(r.Body)
		if err != nil {
			return
		}
	}
	return
}

func getJSONLogs(r *http.Request) (logs [][]byte, err error) {
	var requestBody io.Reader
	requestBody, err = getBody(r)
	if err != nil {
		return
	}
	body, err := io.ReadAll(requestBody)
	if err != nil {
		return
	}

	if r.Header.Get("Content-Type") != "application/x-ndjson" {
		return [][]byte{body}, nil
	}

	jsons := regexp.MustCompile(`\n+`).Split(string(body), -1)
	for _, j := range jsons {
		if j == "" {
			continue
		}
		logs = append(logs, []byte(j))
	}
	return
}

func getQueryStringParams(r *http.Request) (int, string, error) {
	qs := r.URL.Query()
	projectVerboseID := qs.Get(LogDrainProjectQueryParam)
	if projectVerboseID == "" {
		return 0, "", errors.New("invalid verbose id")
	}
	projectID, err := model2.FromVerboseID(projectVerboseID)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).WithField("projectVerboseID", projectVerboseID).Error("failed to parse highlight project id from http logs request")
		return 0, "", nil
	}
	return projectID, qs.Get(LogDrainServiceQueryParam), nil
}

func parsePinoLevel(level uint8) string {
	switch level {
	case 10:
		return "trace"
	case 20:
		return "debug"
	case 30:
		return "info"
	case 40:
		return "warn"
	case 50:
		return "error"
	case 60:
		return "fatal"
	}
	return "info"
}

func HandleFirehoseLog(w http.ResponseWriter, r *http.Request) {
	requestBody, err := getBody(r)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http firehose gzip")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	body, err := io.ReadAll(requestBody)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http firehose body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var lg struct {
		RequestId string
		Timestamp int64
		Records   []struct {
			Data string
		}
	}
	if err := json.Unmarshal(body, &lg); err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http firehose json")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if lg.RequestId == "" {
		lg.RequestId = uuid.New().String()
	}

	attributesMap := struct {
		CommonAttributes struct {
			ProjectID string `json:"x-highlight-project"`
		} `json:"commonAttributes"`
	}{}
	if err := json.Unmarshal([]byte(r.Header.Get("X-Amz-Firehose-Common-Attributes")), &attributesMap); err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http firehose attriutes")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	projectID, err := model2.FromVerboseID(attributesMap.CommonAttributes.ProjectID)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).WithField("projectVerboseID", attributesMap.CommonAttributes.ProjectID).Error("invalid highlight project id from http firehose request")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for _, l := range lg.Records {
		data, err := base64.StdEncoding.DecodeString(l.Data)
		if err != nil {
			log.WithContext(r.Context()).WithError(err).WithField("data", data).Error("invalid base64 firehose record")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var msg []byte
		// try to load data as gzip. if it is not, assume it is not compressed
		gz, err := gzip.NewReader(strings.NewReader(string(data)))
		if err == nil {
			msg, err = io.ReadAll(gz)
			if err != nil {
				log.WithContext(r.Context()).WithError(err).WithField("data", data).Error("invalid http firehose record data reading gzip")
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
		} else {
			msg = data
		}

		for _, payload := range []Payload{&FireLensFluentBitPayload{}, &FireLensPinoPayload{}, &FireLensPayload{}, &CloudWatchPayload{}, &JsonPayload{}} {
			if payload.Parse(msg) {
				for _, p := range payload.GetMessages() {
					t := p.GetTimestamp()
					if t == nil {
						t = ptr.Time(time.UnixMilli(lg.Timestamp))
					}
					hl := hlog.Log{
						Message:    p.GetMessage(),
						Level:      p.GetLevel(),
						Timestamp:  t.UTC().Format(hlog.TimestampFormat),
						Attributes: map[string]string{},
					}
					ctx := p.SetLogAttributes(r.Context(), &hl, msg)
					if err := hlog.SubmitHTTPLog(ctx, tracer, projectID, hl); err != nil {
						log.WithContext(r.Context()).WithError(err).Error("failed to submit log")
						http.Error(w, err.Error(), http.StatusBadRequest)
						return
					}
				}
				break
			}
		}
	}

	w.Header().Add("content-type", "application/json")
	js, _ := json.Marshal(struct {
		RequestId string `json:"requestId"`
		Timestamp int64  `json:"timestamp"`
	}{
		RequestId: lg.RequestId,
		Timestamp: time.Now().UnixMilli(),
	})
	_, _ = w.Write(js)
	w.WriteHeader(http.StatusOK)
}

func HandlePinoLogs(w http.ResponseWriter, r *http.Request, lgJson []byte, logs *hlog.PinoLogs) {
	projectID, serviceName, err := getQueryStringParams(r)
	if err != nil {
		http.Error(w, "no project query string parameter provided", http.StatusBadRequest)
	}

	// parse the logs as a list of maps to get other structured attributes (from the top level)
	var lgAttrs struct {
		Logs []map[string]interface{} `json:"logs"`
	}
	if err := json.Unmarshal(lgJson, &lgAttrs); err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http logs json")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for idx, pinoLog := range logs.Logs {
		var lg hlog.Log
		lg.Attributes = make(map[string]string)
		lg.Attributes[string(semconv.ServiceNameKey)] = serviceName
		lg.Timestamp = time.UnixMilli(pinoLog.Time).UTC().Format(hlog.TimestampFormat)
		lg.Message = pinoLog.Message
		lg.Level = parsePinoLevel(pinoLog.Level)

		for k, v := range lgAttrs.Logs[idx] {
			// skip the keys that are part of the message
			if has := map[string]bool{"level": true, "time": true, "msg": true}[k]; has {
				continue
			}
			for key, value := range hlog.FormatLogAttributes(k, v) {
				lg.Attributes[key] = value
			}
		}

		if err := hlog.SubmitHTTPLog(r.Context(), tracer, projectID, lg); err != nil {
			log.WithContext(r.Context()).WithError(err).Error("failed to submit log")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
}

func HandleJSONLog(w http.ResponseWriter, r *http.Request) {
	logs, err := getJSONLogs(r)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http logs json")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for _, lgJson := range logs {
		var pinoLg hlog.PinoLogs
		if err := json.Unmarshal(lgJson, &pinoLg); err == nil && len(pinoLg.Logs) > 0 {
			HandlePinoLogs(w, r, lgJson, &pinoLg)
			continue
		}

		var lg hlog.Log
		lg.Attributes = make(map[string]string)
		if err := json.Unmarshal(lgJson, &lg); err != nil {
			log.WithContext(r.Context()).WithError(err).Error("invalid http logs json")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var lgAttrs map[string]interface{}
		if err := json.Unmarshal(lgJson, &lgAttrs); err != nil {
			log.WithContext(r.Context()).WithError(err).Error("invalid http logs json")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		for k, v := range lgAttrs {
			// skip the keys that are part of the message
			if has := map[string]bool{"message": true, "timestamp": true, "level": true}[k]; has {
				continue
			}
			for key, value := range hlog.FormatLogAttributes(k, v) {
				lg.Attributes[key] = value
			}
		}

		var projectID int
		var serviceName string

		projectID, serviceName, err = getQueryStringParams(r)
		if err != nil {
			if projectID, err = model2.FromVerboseID(r.Header.Get(LogDrainProjectHeader)); err != nil {
				log.WithContext(r.Context()).WithError(err).WithField("projectVerboseID", r.Header.Get(LogDrainProjectHeader)).Error("failed to parse highlight project id from http logs request")
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if svc := r.Header.Get(LogDrainServiceHeader); svc != "" {
				serviceName = svc
			}
		}

		lg.Attributes[string(semconv.ServiceNameKey)] = serviceName
		if err := hlog.SubmitHTTPLog(r.Context(), tracer, projectID, lg); err != nil {
			log.WithContext(r.Context()).WithError(err).Error("failed to submit log")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func HandleRawLog(w http.ResponseWriter, r *http.Request) {
	projectID, serviceName, err := getQueryStringParams(r)
	if err != nil {
		http.Error(w, "no project query string parameter provided", http.StatusBadRequest)
		return
	}

	requestBody, err := getBody(r)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http firehose gzip")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(requestBody)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http logs body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	lg := hlog.Log{
		Attributes: map[string]string{},
		Message:    string(body),
		Timestamp:  time.Now().UTC().Format(hlog.TimestampFormat),
		Level:      model.LogLevelInfo.String(),
	}

	if serviceName != "" {
		lg.Attributes[string(semconv.ServiceNameKey)] = serviceName
	}
	if err := hlog.SubmitHTTPLog(r.Context(), tracer, projectID, lg); err != nil {
		log.WithContext(r.Context()).WithError(err).Error("failed to submit log")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}

var tracer trace.Tracer

func Listen(r *chi.Mux, t trace.Tracer) {
	tracer = t
	r.Route("/v1", func(r chi.Router) {
		r.Use(highlightChi.Middleware)
		r.HandleFunc("/logs/raw", HandleRawLog)
		r.HandleFunc("/logs/json", HandleJSONLog)
		r.HandleFunc("/logs/firehose", HandleFirehoseLog)
	})
}
