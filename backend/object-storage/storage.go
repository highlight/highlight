package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
)

var (
	S3SessionsPayloadBucketName = os.Getenv("AWS_S3_BUCKET_NAME")
	S3SourceMapBucketName       = os.Getenv("AWS_S3_SOURCE_MAP_BUCKET_NAME")
)

type PayloadType string

const (
	SessionContents  PayloadType = "session-contents"
	NetworkResources PayloadType = "network-resources"
	ConsoleMessages  PayloadType = "console-messages"
)

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
func (s *StorageClient) PushSessionsToS3(sessionId int, organizationId int, events []model.EventsObject) (*int64, error) {
	re := &parse.ReplayEvents{
		Events: []*parse.ReplayEvent{},
	}
	for _, event := range events {
		parsed, err := parse.EventsFromString(event.Events)
		if err != nil {
			continue
		}
		re.Events = append(re.Events, parsed.Events...)
	}
	if len(re.Events) == 0 {
		return nil, errors.New("empty set of events")
	}
	b, err := json.Marshal(re)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling ReplayEvents object")
	}
	key := s.bucketKey(sessionId, organizationId, SessionContents)
	body := strings.NewReader(string(b))
	_, err = s.S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(S3SessionsPayloadBucketName), Key: key, Body: body,
	})
	if err != nil {
		return nil, errors.Wrap(err, "error 'put'ing in s3 bucket")
	}
	headObj := s3.HeadObjectInput{
		Bucket: aws.String(S3SessionsPayloadBucketName),
		Key:    key,
	}
	result, err := s.S3Client.HeadObject(context.TODO(), &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}
	return &result.ContentLength, nil
}

func (s *StorageClient) ReadSessionsFromS3(sessionId int, organizationId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3SessionsPayloadBucketName),
		Key: s.bucketKey(sessionId, organizationId, SessionContents)})
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

func (s *StorageClient) PushResourcesToS3(sessionId int, organizationId int, rs []*model.ResourcesObject) (*int64, error) {
	allResources := make(map[string][]interface{})
	for _, resourceObj := range rs {
		subResources := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(resourceObj.Resources), &subResources); err != nil {
			return nil, errors.Wrap(err, "error decoding resource data")
		}
		allResources["resources"] = append(subResources["resources"], allResources["resources"]...)
	}
	b, err := json.Marshal(allResources)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling Resources object")
	}
	key := s.bucketKey(sessionId, organizationId, NetworkResources)
	body := strings.NewReader(string(b))
	_, err = s.S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(S3SessionsPayloadBucketName), Key: key, Body: body,
	})
	if err != nil {
		return nil, errors.Wrap(err, "error 'put'ing in s3 bucket")
	}
	headObj := s3.HeadObjectInput{
		Bucket: aws.String(S3SessionsPayloadBucketName),
		Key:    key,
	}
	result, err := s.S3Client.HeadObject(context.TODO(), &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}
	return &result.ContentLength, nil

}

func (s *StorageClient) ReadResourcesFromS3(sessionId int, organizationId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3SessionsPayloadBucketName),
		Key: s.bucketKey(sessionId, organizationId, NetworkResources)})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	var allResources struct {
		Resources []interface{}
	}
	if err := json.Unmarshal(buf.Bytes(), &allResources); err != nil {
		return nil, fmt.Errorf("error decoding event data: %v", err)
	}
	return allResources.Resources, nil
}

func (s *StorageClient) PushMessagesToS3(sessionId int, organizationId int, messagesObj []*model.MessagesObject) (*int64, error) {
	allEvents := make(map[string][]interface{})
	for _, messageObj := range messagesObj {
		subMessage := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(messageObj.Messages), &subMessage); err != nil {
			return nil, errors.Wrap(err, "error decoding message data")
		}
		allEvents["messages"] = append(subMessage["messages"], allEvents["messages"]...)
	}
	b, err := json.Marshal(allEvents)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling Resources object")
	}
	key := s.bucketKey(sessionId, organizationId, ConsoleMessages)
	body := strings.NewReader(string(b))
	_, err = s.S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(S3SessionsPayloadBucketName), Key: key, Body: body,
	})
	if err != nil {
		return nil, errors.Wrap(err, "error 'put'ing in s3 bucket")
	}
	headObj := s3.HeadObjectInput{
		Bucket: aws.String(S3SessionsPayloadBucketName),
		Key:    key,
	}
	result, err := s.S3Client.HeadObject(context.TODO(), &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}
	return &result.ContentLength, nil
}

func (s *StorageClient) ReadMessagesFromS3(sessionId int, organizationId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3SessionsPayloadBucketName),
		Key: s.bucketKey(sessionId, organizationId, ConsoleMessages)})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	var allMessages struct {
		Messages []interface{}
	}
	if err := json.Unmarshal(buf.Bytes(), &allMessages); err != nil {
		return nil, fmt.Errorf("error decoding event data: %v", err)
	}
	return allMessages.Messages, nil
}

func (s *StorageClient) bucketKey(sessionId int, organizationId int, key PayloadType) *string {
	return aws.String(fmt.Sprintf("%v/%v/%v", organizationId, sessionId, string(key)))
}

func (s *StorageClient) sourceMapBucketKey(organizationId int, fileName string) *string {
	key := fmt.Sprintf("%d/%s", organizationId, fileName)
	if os.Getenv("ENVIRONMENT") == "dev" {
		key = "dev/" + key
	}
	return aws.String(key)
}

func (s *StorageClient) PushSourceMapFileToS3(organizationId int, fileName string, fileBytes []byte) (*int64, error) {
	key := s.sourceMapBucketKey(organizationId, fileName)
	body := bytes.NewReader(fileBytes)
	_, err := s.S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(S3SourceMapBucketName), Key: key, Body: body,
	})
	if err != nil {
		return nil, errors.Wrap(err, "error 'put'ing sourcemap file in s3 bucket")
	}
	headObj := s3.HeadObjectInput{
		Bucket: aws.String(S3SourceMapBucketName),
		Key:    key,
	}
	result, err := s.S3Client.HeadObject(context.TODO(), &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}
	return &result.ContentLength, nil
}

func (s *StorageClient) ReadSourceMapFileFromS3(organizationId int, fileName string) ([]byte, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3SourceMapBucketName),
		Key: s.sourceMapBucketKey(organizationId, fileName)})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	return buf.Bytes(), nil
}
