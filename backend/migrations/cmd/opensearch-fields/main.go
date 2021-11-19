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
		Addresses: []string{"https://search-highlight-search-4enovx2hc5z7gzvk5fwyqdz7pm.us-east-2.es.amazonaws.com"},
		Username:  "highlight", // For testing only. Don't store credentials in code.
		Password:  "",
	})
	if err != nil {
		log.Fatalf("cannot initialize: %v", err)
	}

	// Create the indexer
	indexer, err := opensearchutil.NewBulkIndexer(opensearchutil.BulkIndexerConfig{
		Client:     client,   // The OpenSearch client
		Index:      "fields", // The default index name
		NumWorkers: 4,        // The number of worker goroutines (default: number of CPUs)
		FlushBytes: 5e+6,     // The flush threshold in bytes (default: 5M)
	})
	if err != nil {
		log.Fatalf("Error creating the indexer: %s", err)
	}

	fieldRows, err := db.Model(&model.Field{}).Order("created_at asc").Rows()
	if err != nil {
		log.Fatalf("error retrieving events object: %+v", err)
	}
	count := 0
	for fieldRows.Next() {
		count += 1
		fieldObject := model.Field{}
		err := db.ScanRows(fieldRows, &fieldObject)
		if err != nil {
			log.Fatalf("error scanning 1: %+v", err)
		}
		b, err := json.Marshal(fieldObject)
		if err != nil {
			log.Fatalf("error scanning 2: %+v", err)
		}
		document := strings.NewReader(string(b))
		docId := strconv.FormatInt(int64(fieldObject.ID), 10)
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

	// sqlDB, err := db.DB()
	// if err != nil {
	// 	log.Fatalf("error getting raw db: %+v", err)
	// }
	// log.Info("again")
	// if err := sqlDB.Ping(); err != nil {
	// 	log.Fatalf("error pinging db: %+v", err)
	// }
	// fields := []*model.Field{}
	// res := db.
	// 	Find(&fields)
	// if err := res.Error; err != nil {
	// 	log.Fatal(e.Wrap(err, "error querying field suggestion"))
	// }
	// pp.Println(len(fields))
}
