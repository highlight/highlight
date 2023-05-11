package main

import (
	"context"
	"os"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
)

func main() {
	ctx := context.TODO()
	log.WithContext(ctx).Info("setting up db")
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	sqlDB, err := db.DB()

	if err != nil {
		log.WithContext(ctx).Fatalf("error getting raw db: %+v", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.WithContext(ctx).Fatalf("error pinging db: %+v", err)
	}

	opensearchClient, err := opensearch.NewOpensearchClient(nil)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating opensearch client: %v", err)
	}

	r := public.Resolver{
		DB:         db,
		OpenSearch: opensearchClient,
	}
	log.WithContext(ctx).Infof("starting query")

	// find all distinct session ids from model.SessionComment
	var sessionIDs []int
	if err := r.DB.Debug().
		Model(&model.Session{}).
		Where("excluded is false and created_at > ?", time.Now().Add(-4*time.Hour).UTC()).
		Pluck("id", &sessionIDs).
		Error; err != nil {
		log.WithContext(ctx).Fatalf("error getting sessions: %+v", err)
	}

	log.WithContext(ctx).Infof("found %d distinct session ids", len(sessionIDs))
	log.WithContext(ctx).Infof("starting an opensearch update")

	for _, sessionID := range sessionIDs {
		if err := r.OpenSearch.Update(
			opensearch.IndexSessions,
			sessionID,
			map[string]interface{}{"Excluded": false},
		); err != nil {
			log.WithContext(ctx).Fatalf("error updating session %d: %+v", sessionID, err)
		}
	}
	if err := r.OpenSearch.Close(); err != nil {
		log.WithContext(ctx).WithError(err).Fatal("failed to close opensearch")
	}
}
