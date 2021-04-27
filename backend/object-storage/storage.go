package storage

import (
	"context"
	"fmt"

	// "github.com/aws/aws-sdk-go-v2/aws"
	// "github.com/aws/aws-sdk-go-v2/aws/session"
	// "github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pkg/errors"

	"log"
	"strings"
)

type StorageClient struct {
	S3Client *s3.Client
}

func NewStorageClient() (*StorageClient, error) {

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithSharedConfigProfile("profile-name"),
	)
	if err != nil {
		return nil, errors.Wrap(err, "error loading default from config")
	}
	// Create Amazon S3 API client using path style addressing.
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	// sess, err := session.NewSession(&aws.Config{
	// 	Region: aws.String("us-west-2"),
	// })
	// if err != nil {
	// 	return nil, errors.Wrap(err, "error creating aws session")
	// }
	// svc := s3.New(sess)
	return &StorageClient{
		S3Client: client,
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
