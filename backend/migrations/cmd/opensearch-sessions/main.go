package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/highlight-run/highlight/backend/model"
	osutil "github.com/highlight-run/highlight/backend/opensearch"
	"github.com/opensearch-project/opensearch-go"
	"github.com/opensearch-project/opensearch-go/opensearchutil"

	log "github.com/sirupsen/logrus"
)

func main() {
	log.Info("setting up db")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error setting up db: %+v", err)
	}

	client, err := opensearch.NewClient(opensearch.Config{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // For testing only. Use certificate for validation.
		},
		Addresses: []string{osutil.OpensearchDomain},
		Username:  osutil.OpensearchUsername, // For testing only. Don't store credentials in code.
		Password:  osutil.OpensearchPassword,
	})
	if err != nil {
		log.Fatalf("cannot initialize: %v", err)
	}

	// Create the indexer
	indexer, err := opensearchutil.NewBulkIndexer(opensearchutil.BulkIndexerConfig{
		Client:     client,                      // The OpenSearch client
		Index:      osutil.GetIndex("sessions"), // The default index name
		NumWorkers: 4,                           // The number of worker goroutines (default: number of CPUs)
		FlushBytes: 5e+6,                        // The flush threshold in bytes (default: 5M)
	})
	if err != nil {
		log.Fatalf("Error creating the indexer: %s", err)
	}

	idx := 0
	limit := 2000
	for {
		fmt.Printf("indexing from %v \n", idx)
		sessions := []*model.Session{}
		err = db.Preload("Fields").Limit(limit).Where("id > ?", idx).Order("created_at asc").Find(&sessions).Error
		if err != nil {
			log.Fatalf("error retrieving events object: %+v", err)
		}
		if len(sessions) == 0 {
			break
		}
		for _, s := range sessions {
			if len(s.Fields) > 10000 {
				fmt.Printf("hit max with session id: %v at acount %v", s.ID, len(s.Fields))
				s.Fields = s.Fields[:10000]
			}
			b, err := json.Marshal(s)
			if err != nil {
				log.Fatalf("error scanning 2: %+v", err)
			}
			document := strings.NewReader(string(b))
			docId := strconv.FormatInt(int64(s.ID), 10)
			// Add an item to the indexer
			err = indexer.Add(
				context.Background(),
				opensearchutil.BulkIndexerItem{
					// Action field configures the operation to perform (index, create, delete, update)
					Action: "index",

					// DocumentID is the optional document ID
					DocumentID: docId,

					// Body is an `io.Reader` with the payload
					Body: document,

					// OnSuccess is the optional callback for each successful operation
					OnSuccess: func(
						ctx context.Context,
						item opensearchutil.BulkIndexerItem,
						res opensearchutil.BulkIndexerResponseItem,
					) {
						fmt.Printf("[%d] %s success/%s \n", res.Status, res.Result, item.DocumentID)
					},

					// OnFailure is the optional callback for each failed operation
					OnFailure: func(
						ctx context.Context,
						item opensearchutil.BulkIndexerItem,
						res opensearchutil.BulkIndexerResponseItem, err error,
					) {
						if err != nil {
							log.Fatalf("ERROR: %s \n", err)
						} else {
							log.Fatalf("ERROR: %s: %s \n", res.Error.Type, res.Error.Reason)
						}
					},
				},
			)
			if err != nil {
				log.Fatalf("error adding item to indexer %+v", err)
			}

		}
		idx = sessions[len(sessions)-1].ID
	}

	// Close the indexer channel and flush remaining items
	//
	if err := indexer.Close(context.Background()); err != nil {
		log.Fatalf("Unexpected error: %s", err)
	}

	// Report the indexer statistics
	//
	stats := indexer.Stats()
	if stats.NumFailed > 0 {
		log.Fatalf("Indexed [%d] documents with [%d] errors", stats.NumFlushed, stats.NumFailed)
	} else {
		log.Printf("Successfully indexed [%d] documents", stats.NumFlushed)
	}
}
