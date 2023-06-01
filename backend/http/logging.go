package http

import (
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	model2 "github.com/highlight-run/highlight/backend/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	log "github.com/sirupsen/logrus"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const (
	LogDrainProjectHeader = "x-highlight-project"
	LogDrainServiceHeader = "x-highlight-service"
)

func HandleFirehoseLog(w http.ResponseWriter, r *http.Request) {
	requestBody := r.Body
	if r.Header.Get("content-encoding") == "gzip" {
		gz, err := gzip.NewReader(r.Body)
		if err != nil {
			log.WithContext(r.Context()).WithError(err).Error("invalid http firehose gzip")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		requestBody = gz
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

		gz, err := gzip.NewReader(strings.NewReader(string(data)))
		if err != nil {
			log.WithContext(r.Context()).WithError(err).WithField("data", data).Error("invalid http firehose record data gzip")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		msg, err := io.ReadAll(gz)
		if err != nil {
			log.WithContext(r.Context()).WithError(err).WithField("data", data).Error("invalid http firehose record data reading gzip")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
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
		if err := json.Unmarshal(msg, &cloudwatchPayload); err != nil {
			log.WithContext(r.Context()).WithError(err).Error("invalid http firehose record json")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		for _, event := range cloudwatchPayload.LogEvents {
			hl := hlog.Log{
				Message:   event.Message,
				Timestamp: time.UnixMilli(event.Timestamp).Format("2006-01-02T15:04:05.000Z"),
				Level:     "info",
				// TODO(vkorolik)
				Attributes: nil,
			}
			if err := hlog.SubmitHTTPLog(r.Context(), projectID, hl); err != nil {
				log.WithContext(r.Context()).WithError(err).Error("failed to submit log")
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
		}
	}

	w.Header().Add("content-type", "application/json")
	js, _ := json.Marshal(struct {
		RequestId string
		Timestamp int64
	}{
		RequestId: lg.RequestId,
		Timestamp: time.Now().UnixMilli(),
	})
	_, _ = w.Write(js)
}

func HandleJSONLog(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http logs body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var lg hlog.Log
	lg.Attributes = make(map[string]string)
	if err := json.Unmarshal(body, &lg); err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http logs json")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var lgAttrs map[string]interface{}
	if err := json.Unmarshal(body, &lgAttrs); err != nil {
		log.WithContext(r.Context()).WithError(err).Error("invalid http logs json")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	for k, v := range lgAttrs {
		switch typed := v.(type) {
		case string:
			lg.Attributes[k] = typed
		case int64:
			lg.Attributes[k] = strconv.FormatInt(typed, 10)
		case float64:
			lg.Attributes[k] = strconv.FormatFloat(typed, 'E', -1, 64)
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
	if err := hlog.SubmitHTTPLog(r.Context(), projectID, lg); err != nil {
		log.WithContext(r.Context()).WithError(err).Error("failed to submit log")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func Listen(r *chi.Mux) {
	r.Route("/v1", func(r chi.Router) {
		r.Use(highlightChi.Middleware)
		r.HandleFunc("/logs/json", HandleJSONLog)
		r.HandleFunc("/logs/firehose", HandleFirehoseLog)
	})
}
