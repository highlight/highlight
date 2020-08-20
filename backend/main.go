package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/jinzhu/gorm"
	"github.com/rs/cors"

	_ "github.com/jinzhu/gorm/dialects/postgres"
	log "github.com/sirupsen/logrus"
)

var DB *gorm.DB

type EventsObject struct {
	gorm.Model
	Events  *string
	VisitID *string
}

// Blindly pushes json Blobs to a database, keyed on the visit-id
func addEvents(w http.ResponseWriter, r *http.Request) {
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
	e := &EventsObject{Events: &bs, VisitID: &vid}
	if res := DB.Create(e); res.Error != nil {
		http.Error(w, "error reading body contents", http.StatusConflict)
		return
	}
	return
}

type EventsStruct struct {
	events map[string][]*json.RawMessage
}

// Gets all of the 'event' blobs, puts them together, and returns it to the frontend.
// Because sessions views don't happen often (compared to writes), we want to do the processing here.
func getEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}
	vid := r.URL.Query().Get("vid")
	if len(vid) == 0 {
		http.Error(w, "Incomplete request.", http.StatusNotFound)
		return
	}
	eventObjs := []*EventsObject{}
	if res := DB.Order("created_at asc").Where(&EventsObject{VisitID: &vid}).Find(&eventObjs); res.Error != nil {
		http.Error(w, "error reading body contents", http.StatusConflict)
		return
	}
	allEvents := make(map[string][]*json.RawMessage)
	for _, eventObj := range eventObjs {
		events := make(map[string][]*json.RawMessage)
		if err := json.Unmarshal([]byte(*eventObj.Events), &events); err != nil {
			http.Error(w, fmt.Sprintf("Error decoding data: %v", err), http.StatusNotFound)
			return
		}
		allEvents["events"] = append(allEvents["events"], events["events"]...)
	}
	j, err := json.Marshal(allEvents)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error remarshaling data: %v", err), http.StatusNotFound)
		return
	}
	w.Write(j)
	return
}

func main() {
	psqlConf := fmt.Sprintf(
		"host=%s port=5432 user=%s dbname=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_DB"),
		os.Getenv("PSQL_PASSWORD"))

	var err error
	DB, err = gorm.Open("postgres", psqlConf)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	DB.AutoMigrate(&EventsObject{})

	mux := http.NewServeMux()
	mux.HandleFunc("/add-events", addEvents)
	mux.HandleFunc("/get-events", getEvents)
	handler := cors.AllowAll().Handler(mux)
	fmt.Println("listening...")
	log.Fatal(http.ListenAndServe("localhost:8082", handler))
}
