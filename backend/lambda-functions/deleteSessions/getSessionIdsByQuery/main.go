package main

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/smithy-go/ptr"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

var db *gorm.DB
var opensearchClient *opensearch.Client

func init() {
	var err error
	db, err = model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatal(errors.Wrap(err, "error setting up DB"))
	}

	opensearchClient, err = opensearch.NewOpensearchClient()
	if err != nil {
		log.Fatal(errors.Wrap(err, "error creating opensearch client"))
	}
}

func LambdaHandler(ctx context.Context, event utils.QuerySessionsInput) ([]utils.BatchIdResponse, error) {
	taskId := uuid.New().String()
	lastId := 0
	responses := []utils.BatchIdResponse{}
	for {
		batchId := uuid.New().String()
		toDelete := []model.DeleteSessionsTask{}

		options := opensearch.SearchOptions{
			MaxResults:    ptr.Int(10000),
			SortField:     ptr.String("id"),
			SortOrder:     ptr.String("asc"),
			IncludeFields: []string{"id"},
		}
		if lastId != 0 {
			options.SearchAfter = []interface{}{lastId}
		}

		results := []model.Session{}
		_, _, err := opensearchClient.Search([]opensearch.Index{opensearch.IndexSessions},
			event.ProjectId, event.Query, options, &results)
		if err != nil {
			return nil, err
		}

		if len(results) == 0 {
			break
		}
		lastId = results[len(results)-1].ID

		for _, r := range results {
			toDelete = append(toDelete, model.DeleteSessionsTask{
				SessionID: r.ID,
				TaskID:    taskId,
				BatchID:   batchId,
			})
		}

		if err := db.Create(&toDelete).Error; err != nil {
			return nil, errors.Wrap(err, "error saving DeleteSessionsTasks")
		}

		responses = append(responses, utils.BatchIdResponse{TaskId: taskId, BatchId: batchId})
	}

	return responses, nil
}

func main() {
	lambda.Start(LambdaHandler)
}
