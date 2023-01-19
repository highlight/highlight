package otel

import (
	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
	"net/http"
)

const OTELPort = "4317"

// HandleTokenRequest will process a request for oauth /token command per the RFC spec.
func Handle(w http.ResponseWriter, r *http.Request) {
	var err error
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}

func Listen() {
	r := chi.NewMux()
	r.HandleFunc("/", Handle)
	log.Fatal(http.ListenAndServe(":"+OTELPort, r))
}
