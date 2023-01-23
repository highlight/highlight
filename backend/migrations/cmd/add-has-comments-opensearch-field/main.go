package main

import (
	"os"

	log "github.com/sirupsen/logrus"

	"github.com/cheggaaa/pb/v3"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
)

func main() {
	log.Info("setting up db")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error setting up db: %+v", err)
	}

	sqlDB, err := db.DB()

	if err != nil {
		log.Fatalf("error getting raw db: %+v", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("error pinging db: %+v", err)
	}

	opensearchClient, err := opensearch.NewOpensearchClient()
	if err != nil {
		log.Fatalf("error creating opensearch client: %v", err)
	}

	r := public.Resolver{
		DB:         db,
		OpenSearch: opensearchClient,
	}
	log.Infof("starting query")

	// find all distinct session ids from model.SessionComment
	var sessionIDs []int
	if err := r.DB.
		Model(&model.SessionComment{}).
		Distinct("session_id").
		Pluck("session_id", &sessionIDs).
		Error; err != nil {
		log.Fatalf("error getting distinct session ids: %+v", err)
	}

	count := len(sessionIDs)
	log.Infof("found %d distinct session ids, updating", count)
	log.Infof("starting an opensearch update")

	bar := pb.StartNew(count)

	for _, sessionID := range sessionIDs {
		if err := r.OpenSearch.UpdateSynchronous(
			opensearch.IndexSessions,
			sessionID,
			map[string]interface{}{"has_comments": true},
		); err != nil {
			log.Fatalf("error updating session %d: %+v", sessionID, err)
		}
		bar.Increment()
	}
	bar.Finish()
}
