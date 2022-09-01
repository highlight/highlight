package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/opensearch"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	e "github.com/pkg/errors"
	"os"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	log.Info("setting up db")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error setting up db: %+v", err)
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

	var sessions []model.Session
	if err := db.Debug().Model(&model.Session{}).Where("project_id = ?", 762).Where("created_at > ?", "2022-08-10").Where("created_at < ?", "2022-08-24 17:46:00").Where("COALESCE(user_properties, '') != ''").Scan(&sessions).Error; err != nil {
		log.Fatalf("error getting sessions: %v", err)
	}

	for _, session := range sessions {
		userProperties, err := session.GetUserProperties()
		if err != nil {
			log.Error(e.Wrapf(err, "error getting user properties: %d", session.ID))
			continue
		}
		if err := r.AppendProperties(context.Background(), session.ID, userProperties, public.PropertyType.USER); err != nil {
			log.Error(e.Wrapf(err, "error backfilling: session: %d", session.ID))
		}
		log.Infof("updated %d user props %+v", session.ID, userProperties)
	}

	_ = opensearchClient.Close()
}
