package track

import (
	"io/ioutil"
	"net/http"

	"github.com/jay-khatri/fullstory/backend/database"
)

// Blindly pushes json Blobs to a database, keyed on the visit-id
func AddEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading body contents", http.StatusConflict)
		return
	}
	bs := string(body)
	vid := r.Header.Get("X-Visit-ID")
	e := &database.EventsObject{Events: &bs, VisitID: &vid}
	if res := database.DB.Create(e); res.Error != nil {
		http.Error(w, "error reading body contents", http.StatusConflict)
		return
	}
	return
}
