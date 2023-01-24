package otel

import (
	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
)

const OTELPort = "4318"

// HandleTokenRequest will process a request for oauth /token command per the RFC spec.
func Handle(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	log.Infof("otel %s", body)
}

func Listen() {
	r := chi.NewMux()
	r.HandleFunc("/", Handle)
	log.Fatal(http.ListenAndServe(":"+OTELPort, r))
}
