package main

import (
	"context"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/smithy-go/ptr"
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

	options := opensearch.SearchOptions{
		MaxResults:    ptr.Int(count),
		SortField:     ptr.String("id"),
		SortOrder:     ptr.String("asc"),
		ReturnCount:   ptr.Bool(true),
		IncludeFields: []string{"id"},
	}

	resultCount, _, err := opensearchClient.Search([]opensearch.Index{opensearch.IndexSessions},
		event.ProjectId, event.query, options, &results)
	if err != nil {
		return nil, err
	}

	return response, nil
}

func main() {
	lambda.Start(LambdaHandler)
}
