package http

import (
	"encoding/json"
	"github.com/go-chi/chi"
	model2 "github.com/highlight-run/highlight/backend/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	log "github.com/sirupsen/logrus"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"io"
	"net/http"
	"strconv"
)

const (
	LogDrainProjectHeader = "x-highlight-project"
	LogDrainServiceHeader = "x-highlight-service"
)

func HandleLog(w http.ResponseWriter, r *http.Request) {
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
		r.HandleFunc("/logs/json", HandleLog)
	})
}
