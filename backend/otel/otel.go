package otel

import (
	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
)

const OTELPort = "4319"

func HandleTrace(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	log.Infof("otel trace %s", body)
}

func HandleLog(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	log.Infof("otel log %s", body)
}

func Listen() {
	r := chi.NewMux()
	r.Route("/v1", func(r chi.Router) {
		r.HandleFunc("/traces", HandleTrace)
		r.HandleFunc("/logs", HandleLog)
	})
	log.Fatal(http.ListenAndServe(":"+OTELPort, r))
}
