package otel

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/go-chi/chi"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/collector/pdata/plog/plogotlp"
	"go.opentelemetry.io/collector/pdata/ptrace/ptraceotlp"
)

const HighlightProjectIDAttribute = "highlight_project_id"
const HighlightSessionIDAttribute = "highlight_session_id"
const HighlightRequestIDAttribute = "highlight_request_id"

// Exception based on opentelemetry spec: https://github.com/open-telemetry/opentelemetry-specification/blob/9fa7c656b26647b27e485a6af7e38dc716eba98a/specification/trace/semantic_conventions/exceptions.md#stacktrace-representation
type Exception struct {
	Type       string `json:"exception.type"`
	Message    string `json:"exception.message"`
	Stacktrace string `json:"exception.stacktrace"`
	Escaped    bool   `json:"exception.escaped"`
}

type Handler struct {
	resolver *graph.Resolver
}

func (o *Handler) HandleTrace(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Error(err, "invalid trace body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	gz, err := gzip.NewReader(bytes.NewReader(body))
	if err != nil {
		log.Error(err, "invalid gzip format for trace")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	output, err := io.ReadAll(gz)
	if err != nil {
		log.Error(err, "invalid gzip stream for trace")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req := ptraceotlp.NewExportRequest()
	err = req.UnmarshalProto(output)
	if err != nil {
		log.Error(err, "invalid trace protobuf")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var projectErrors = make(map[string][]*model.BackendErrorObjectInput)
	var traceErrors = make(map[string][]*model.BackendErrorObjectInput)
	spans := req.Traces().ResourceSpans()
	for i := 0; i < spans.Len(); i++ {
		resource := spans.At(i).Resource()
		scopeScans := spans.At(i).ScopeSpans()
		for j := 0; j < scopeScans.Len(); j++ {
			scope := scopeScans.At(j).Scope()
			spans := scopeScans.At(j).Spans()
			for k := 0; k < spans.Len(); k++ {
				span := spans.At(k)
				attrs := span.Attributes().AsRaw()
				tagsBytes, err := json.Marshal(attrs)
				if err != nil {
					log.Errorf("failed to format error attributes %s", tagsBytes)
				}
				var projectID, sessionID string
				if p, ok := attrs[HighlightProjectIDAttribute]; ok {
					projectID = p.(string)
				}
				if s, ok := attrs[HighlightSessionIDAttribute]; ok {
					sessionID = s.(string)
				}
				requestID := attrs[HighlightRequestIDAttribute].(string)
				events := span.Events()
				for l := 0; l < events.Len(); l++ {
					event := events.At(l)
					eventAttributes := event.Attributes().AsRaw()
					excType, hasType := eventAttributes["exception.type"]
					excMessage, hasMessage := eventAttributes["exception.message"]
					if hasType || hasMessage {
						exc := Exception{
							Type:       excType.(string),
							Message:    excMessage.(string),
							Stacktrace: eventAttributes["exception.stacktrace"].(string),
							Escaped:    eventAttributes["exception.escaped"].(string) == "true",
						}
						err := &model.BackendErrorObjectInput{
							SessionSecureID: &sessionID,
							RequestID:       &requestID,
							TraceID:         pointy.String(span.TraceID().String()),
							SpanID:          pointy.String(span.SpanID().String()),
							Event:           exc.Message,
							Type:            excType.(string),
							Source: strings.Join([]string{
								resource.Attributes().AsRaw()["telemetry.sdk.language"].(string),
								resource.Attributes().AsRaw()["service.name"].(string),
								scope.Name(),
							}, "-"),
							StackTrace: exc.Stacktrace,
							Timestamp:  event.Timestamp().AsTime(),
							Payload:    pointy.String(string(tagsBytes)),
						}
						if sessionID != "" {
							if _, ok := traceErrors[sessionID]; !ok {
								traceErrors[sessionID] = []*model.BackendErrorObjectInput{}
							}
							traceErrors[sessionID] = append(traceErrors[sessionID], err)
						} else if projectID != "" {
							if _, ok := projectErrors[projectID]; !ok {
								projectErrors[projectID] = []*model.BackendErrorObjectInput{}
							}
							projectErrors[projectID] = append(projectErrors[projectID], err)
						} else {
							log.Errorf("otel error got no session and no project %+v", *err)
						}
					}
				}
			}
		}
	}

	for sessionID, errors := range traceErrors {
		err = o.resolver.ProducerQueue.Submit(&kafkaqueue.Message{
			Type: kafkaqueue.PushBackendPayload,
			PushBackendPayload: &kafkaqueue.PushBackendPayloadArgs{
				SessionSecureID: &sessionID,
				Errors:          errors,
			}}, sessionID)
		if err != nil {
			log.Error(err, "failed to submit otel session errors to public worker queue")
		}
	}

	for projectID, errors := range projectErrors {
		err = o.resolver.ProducerQueue.Submit(&kafkaqueue.Message{
			Type: kafkaqueue.PushBackendPayload,
			PushBackendPayload: &kafkaqueue.PushBackendPayloadArgs{
				ProjectVerboseID: &projectID,
				Errors:           errors,
			}}, projectID)
		if err != nil {
			log.Error(err, "failed to submit otel project errors to public worker queue")
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (o *Handler) HandleLog(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Error(err, "invalid log body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	gz, err := gzip.NewReader(bytes.NewReader(body))
	if err != nil {
		log.Error(err, "invalid gzip format for log")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	output, err := io.ReadAll(gz)
	if err != nil {
		log.Error(err, "invalid gzip stream for log")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req := plogotlp.NewExportRequest()
	err = req.UnmarshalProto(output)
	if err != nil {
		log.Error(err, "invalid log protobuf")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (o *Handler) Listen(r *chi.Mux) {
	r.Route("/otel/v1", func(r chi.Router) {
		r.HandleFunc("/traces", o.HandleTrace)
		r.HandleFunc("/logs", o.HandleLog)
	})
}

func New(resolver *graph.Resolver) *Handler {
	return &Handler{
		resolver: resolver,
	}
}
