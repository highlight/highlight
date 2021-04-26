package storage

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go/aws/session"

	"log"
	"strings"
)

type StorageClient struct {
	S3Client *s3.Client
}

func NewStorageClient() (*StorageClient, error) {
	// Get the first page of results for ListObjectsV2 for a bucket
	// cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-west-2"))
	// if err != nil {
	// 	return nil, e.Wrap(err, "error laoding default config")
	// }
	// // Create an Amazon S3 service client
	// client := s3.NewFromConfig(cfg)
	sess, err := session.NewSession(&aws.Config{
		Region: *aws.String("us-west-2"),
	})
	if err != nil {
		return err
	}
	svc := s3.New(sess)
	return &StorageClient{
		S3Client: svc,
	}, nil
}

func (s *StorageClient) PushToS3(sessionId int, organizationId int, events []string) error {
	body := strings.NewReader(fmt.Sprintf("%v", events))

	_, err := s.S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String("highlight-session-s3-test"), Key: aws.String(fmt.Sprintf("%v/%v", organizationId, sessionId)), Body: body,
	})
	if err != nil {
		log.Fatal(err)
		return err
	}
	fmt.Printf("Pushed %v/%v to S3", organizationId, sessionId)
	return nil
}
