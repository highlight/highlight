package main

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

var db *gorm.DB
var s3Client *s3.Client

func init() {
	var err error
	db, err = model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatal(errors.Wrap(err, "error setting up DB"))
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-west-2"))
	if err != nil {
		log.Fatal(errors.Wrap(err, "error loading default from config"))
	}
	s3Client = s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})
}

func LambdaHandler(ctx context.Context, event utils.BatchIdResponse) (*utils.BatchIdResponse, error) {
	var sessionIds []int
	for id := range sessionIds {

		s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
			Bucket: &storage.S3SessionsPayloadBucketName,
		})

		s3Client.ListObjectsV2()
	}

	// Initialize a session in us-west-2 that the SDK will use to load
	// credentials from the shared credentials file ~/.aws/credentials.
	sess, _ := session.NewSession(&aws.Config{
		Region: aws.String("us-west-2")},
	)

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
