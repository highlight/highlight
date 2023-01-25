package otel

import (
	"github.com/go-chi/chi"
	"github.com/golang/snappy"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/collector/pdata/plog/plogotlp"
	"go.opentelemetry.io/collector/pdata/ptrace/ptraceotlp"
	"io"
	"net/http"
)

const OTELPort = "4319"

func HandleTrace(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	decoded, err := snappy.Decode(nil, body)
	if err != nil {
		log.Error(err, "failed to decompress trace")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req := ptraceotlp.NewExportRequest()
	err = req.UnmarshalJSON(decoded)
	if err != nil {
		log.Error(err, "invalid trace protobuf")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	spans := req.Traces().ResourceSpans()
	for i := 0; i < spans.Len(); i++ {
		scopeScans := spans.At(i).ScopeSpans()
		for j := 0; j < scopeScans.Len(); j++ {
			spans := scopeScans.At(j).Spans()
			for k := 0; k < spans.Len(); k++ {
				span := spans.At(k)
				log.Infof("otel single trace %+v %+v", span.SpanID(), span.TraceID())
			}
		}
	}
}

func HandleLog(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	decoded, err := snappy.Decode(nil, body)
	if err != nil {
		log.Error(err, "failed to decompress log")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req := plogotlp.NewExportRequest()
	err = req.UnmarshalJSON(decoded)
	if err != nil {
		log.Error(err, "invalid log protobuf")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	logs := req.Logs().ResourceLogs()
	for i := 0; i < logs.Len(); i++ {
		scopeLogs := logs.At(i).ScopeLogs()
		for j := 0; j < scopeLogs.Len(); j++ {
			lgs := scopeLogs.At(j).LogRecords()
			for k := 0; k < lgs.Len(); k++ {
				lg := lgs.At(k)
				log.Infof("otel single log %+v", lg.Body())
			}
		}
	}
}

func Listen() {
	r := chi.NewMux()
	r.Route("/v1", func(r chi.Router) {
		r.HandleFunc("/traces", HandleTrace)
		r.HandleFunc("/logs", HandleLog)
	})
	log.Fatal(http.ListenAndServe(":"+OTELPort, r))
}
