package main

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

var db *gorm.DB

func init() {
	var err error
	db, err = model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatal(errors.Wrap(err, "error setting up DB"))
	}
}

func LambdaHandler(ctx context.Context, event utils.BatchIdResponse) (*utils.BatchIdResponse, error) {
	var sessionIds []int
	if err := db.Select("session_id").Where(&model.DeleteSessionsTask{TaskID: event.TaskId, BatchID: event.BatchId}).
		Find(&sessionIds).Error; err != nil {
		return nil, errors.Wrap(err, "error querying session ids to delete")
	}

	if err := db.Raw(`
		DELETE FROM session_fields
		WHERE session_id in (?)
	`, sessionIds).Error; err != nil {
		return nil, errors.Wrap(err, "error deleting session fields")
	}

	if err := db.Raw(`
		DELETE FROM sessions
		WHERE id in (?)
	`, sessionIds).Error; err != nil {
		return nil, errors.Wrap(err, "error deleting sessions")
	}

	return &event, nil
}

func main() {
	lambda.Start(LambdaHandler)
}
