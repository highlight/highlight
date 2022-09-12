package main

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
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

func LambdaHandler(ctx context.Context, event utils.BatchIdResponse) (*utils.BatchIdResponse, error) {
	sessionIds, err := utils.GetSessionIdsInBatch(db, event.TaskId, event.BatchId)
	if err != nil {
		return nil, errors.Wrap(err, "error getting session ids to delete")
	}

	for _, sessionId := range sessionIds {
		if err := opensearchClient.Delete(opensearch.IndexSessions, sessionId); err != nil {
			return nil, errors.Wrap(err, "error creating bulk delete request")
		}
	}

	opensearchClient.Close()

	return &event, nil
}

func main() {
	lambda.Start(LambdaHandler)
}
