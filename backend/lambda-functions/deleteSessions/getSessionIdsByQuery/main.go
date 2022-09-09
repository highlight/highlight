package main

import (
	"context"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/smithy-go/ptr"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/pkg/errors"
)

func init() {
}

func LambdaHandler(ctx context.Context, event utils.QuerySessionsInput) (utils.BatchIdResponse, error) {
	response := utils.BatchIdResponse{}
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		return response, errors.Wrap(err, "error setting up DB")
	}

	opensearchClient, err := opensearch.NewOpensearchClient()
	if err != nil {
		return response, errors.Wrap(err, "error creating opensearch client")
	}

	taskId := uuid.New().String()
	lastId := 0
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
			return response, err
		}

		if len(results) == 0 {
			break
		}

		for _, r := range results {
			toDelete = append(toDelete, model.DeleteSessionsTask{
				SessionID: r.ID,
				TaskID:    taskId,
				BatchID:   batchId,
			})
		}

		if err := db.Create(toDelete).Error; err != nil {
			return response, errors.Wrap(err, "error saving DeleteSessionsTasks")
		}
	}

	return response, nil
}

func main() {
	lambda.Start(LambdaHandler)
}
