package http

import (
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"

	model2 "github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
)

const (
	LogDrainProjectQueryParam = "project"
	LogDrainServiceQueryParam = "service"
	LogDrainProjectHeader     = "x-highlight-project"
	LogDrainServiceHeader     = "x-highlight-service"
)

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

		var cloudwatchPayload struct {
			MessageType         string
			Owner               string
			LogGroup            string
			LogStream           string
			SubscriptionFilters []string
			LogEvents           []struct {
				Id        string
				Timestamp int64
				Message   string
			}
		}
		// try to parse the message as a cloudwatch payload
		// if it is not, send it as a raw log message
		if err := json.Unmarshal(msg, &cloudwatchPayload); err != nil {
			hl := hlog.Log{
				Message:   string(msg),
				Timestamp: time.UnixMilli(lg.Timestamp).UTC().Format(hlog.TimestampFormat),
				Level:     "info",
			}
			if err := hlog.SubmitHTTPLog(r.Context(), tracer, projectID, hl); err != nil {
				log.WithContext(r.Context()).WithError(err).Error("failed to submit log")
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
		} else {
			for _, event := range cloudwatchPayload.LogEvents {
				hl := hlog.Log{
					Message:   event.Message,
					Timestamp: time.UnixMilli(event.Timestamp).UTC().Format(hlog.TimestampFormat),
					Level:     "info",
					Attributes: map[string]string{
						string(semconv.ServiceNameKey): "firehose",
						"message_type":                 cloudwatchPayload.MessageType,
						"owner":                        cloudwatchPayload.Owner,
						"log_group":                    cloudwatchPayload.LogGroup,
						"log_stream":                   cloudwatchPayload.LogStream,
					},
				}
				if err := hlog.SubmitHTTPLog(r.Context(), tracer, projectID, hl); err != nil {
					log.WithContext(r.Context()).WithError(err).Error("failed to submit log")
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}
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
		switch pinoLog.Level {
		case 10:
			lg.Level = "trace"
		case 20:
			lg.Level = "debug"
		case 30:
			lg.Level = "info"
		case 40:
			lg.Level = "warn"
		case 50:
			lg.Level = "error"
		case 60:
			lg.Level = "fatal"
		}

		for k, v := range lgAttrs.Logs[idx] {
			// skip the keys that are part of the message
			if has := map[string]bool{"level": true, "time": true, "msg": true}[k]; has {
				continue
			}
			for key, value := range hlog.FormatLogAttributes(r.Context(), k, v) {
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
			for key, value := range hlog.FormatLogAttributes(r.Context(), k, v) {
				lg.Attributes[key] = value
			}
		}

		attributes := make(map[string]string)
		for _, k := range []string{
			LogDrainProjectHeader,
			LogDrainServiceHeader,
		} {
			value := r.Header.Get(k)
			attributes[k] = value
		}
		projectID, err := model2.FromVerboseID(attributes[LogDrainProjectHeader])
		if err != nil {
			log.WithContext(r.Context()).WithError(err).WithField("projectVerboseID", attributes[LogDrainProjectHeader]).Error("failed to parse highlight project id from http logs request")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		lg.Attributes[string(semconv.ServiceNameKey)] = attributes[LogDrainServiceHeader]
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
