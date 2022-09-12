package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
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
	sessionIds, err := utils.GetSessionIdsInBatch(db, event.TaskId, event.BatchId)
	if err != nil {
		return nil, errors.Wrap(err, "error getting session ids to delete")
	}

	for _, sessionId := range sessionIds {
		prefix := fmt.Sprintf("%d/%d/", event.ProjectId, sessionId)
		options := s3.ListObjectsV2Input{
			Bucket: &storage.S3SessionsPayloadBucketName,
			Prefix: &prefix,
		}
		output, err := s3Client.ListObjectsV2(ctx, &options)
		if err != nil {
			return nil, errors.Wrap(err, "error listing objects in S3")
		}

		for _, object := range output.Contents {
			options := s3.DeleteObjectInput{
				Bucket: &storage.S3SessionsPayloadBucketName,
				Key:    object.Key,
			}
			_, err := s3Client.DeleteObject(ctx, &options)
			if err != nil {
				return nil, errors.Wrap(err, "error listing objects in S3")
			}
		}
	}

	return &event, nil
}

func main() {
	lambda.Start(LambdaHandler)
}
