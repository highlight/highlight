package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/pkg/errors"

	"strings"
)

const S3BucketName = "highlight-session-s3-test"

type StorageClient struct {
	S3Client *s3.Client
}

func NewStorageClient() (*StorageClient, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-west-2"))
	if err != nil {
		return nil, errors.Wrap(err, "error loading default from config")
	}
	// Create Amazon S3 API client using path style addressing.
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	return &StorageClient{
		S3Client: client,
	}, nil
}

func (s *StorageClient) PushToS3(sessionId int, organizationId int, re *parse.ReplayEvents) (*int64, error) {
	b, err := json.Marshal(re)
	if err != nil {
		return nil, errors.Wrap(err, "error pushing to s3")
	}
	key := s.bucketKey(sessionId, organizationId)
	body := strings.NewReader(string(b))
	_, err = s.S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(S3BucketName), Key: key, Body: body,
	})
	if err != nil {
		return nil, errors.New("error pushing to s3")
	}
	headObj := s3.HeadObjectInput{
		Bucket: aws.String(S3BucketName),
		Key:    key,
	}
	result, err := s.S3Client.HeadObject(context.TODO(), &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}
	return &result.ContentLength, nil
}

func (s *StorageClient) ReadFromS3(sessionId int, organizationId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3BucketName),
		Key: s.bucketKey(sessionId, organizationId)})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	var allEvents struct {
		Events []interface{}
	}
	if err := json.Unmarshal(buf.Bytes(), &allEvents); err != nil {
		return nil, fmt.Errorf("error decoding event data: %v", err)
	}
	return allEvents.Events, nil
}

func (s *StorageClient) bucketKey(sessionId int, organizationId int) *string {
	return aws.String(fmt.Sprintf("%v/%v", organizationId, sessionId))
}
