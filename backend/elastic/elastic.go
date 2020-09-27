package elastic

import (
	"context"
	"log"
	"os"

	"github.com/k0kubun/pp"
	"github.com/olivere/elastic/v7"
)

var (
	Client             *elastic.Client
	SessionIndexString = "sessions"
	SessionTypeString  = "session"
)

type Session struct {
	Identifier     string `json:"identifier"`
	OrganizationID string `json:"organization_id"`
}

var mapping = map[string]map[string]interface{}{
	"settings": {
		"number_of_shards":   1,
		"number_of_replicas": 0,
	},
	"mappings": {
		"properties": map[string]interface{}{
			"identifier": map[string]interface{}{
				"type": "text",
			},
			"organization_id": map[string]interface{}{
				"type": "keyword",
			},
		},
	},
}

func SetupElastic() {
	ctx := context.Background()
	e, err := elastic.NewClient(elastic.SetURL(os.Getenv("ELASTIC_URI")))
	if err != nil {
		log.Fatalf("error connecting to elastic: %v", err)
	}
	exists, err := e.IndexExists(SessionIndexString).Do(ctx)
	if err != nil {
		log.Fatalf("error checking index: %v", err)
	}
	if !exists {
		createIndex, err := e.CreateIndex(SessionIndexString).BodyJson(mapping).Do(ctx)
		if err != nil {
			log.Fatalf("error creating index: %v", err)
		}
		if !createIndex.Acknowledged {
			log.Fatalf("index creationg not acknowledged: %v", err)
		}
	} else {
		srv := e.PutMapping().Index(SessionIndexString).BodyJson(mapping["mappings"])
		if err := srv.Validate(); err != nil {
			log.Fatalf("error validating mapping: %v", err)
		}
		update, err := srv.Do(ctx)
		if err != nil {
			log.Fatalf("error updating elastic mapping: %v", err)
		}
		pp.Println(update)
	}
	Client = e
}
