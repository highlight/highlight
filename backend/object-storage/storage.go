package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/highlight-run/highlight/backend/util"
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

func (s *StorageClient) PushFileToS3(ctx context.Context, sessionId, projectId int, file *os.File, bucket string, payloadType PayloadType) (*int64, error) {
	_, err := file.Seek(0, io.SeekStart)
	if err != nil {
		return nil, errors.Wrap(err, "error seeking to beginning of file")
	}
	key := s.bucketKey(sessionId, projectId, payloadType)
	_, err = s.S3Client.PutObject(ctx, &s3.PutObjectInput{Bucket: &bucket,
		Key: key, Body: file})
	if err != nil {
		return nil, err
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

func (s *StorageClient) ReadSessionsFromS3(sessionId int, projectId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3SessionsPayloadBucketName),
		Key: s.bucketKey(sessionId, projectId, SessionContents)})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	type events struct {
		Events []interface{}
	}
	eventsSlice := strings.Split(buf.String(), "\n\n\n")
	var retEvents []interface{}
	for _, e := range eventsSlice {
		if e == "" {
			continue
		}
		var tempEvents events
		if err := json.Unmarshal([]byte(e), &tempEvents); err != nil {
			return nil, fmt.Errorf("error decoding event data: %v", err)
		}
		retEvents = append(retEvents, tempEvents.Events...)
	}
	return retEvents, nil
}

func (s *StorageClient) ReadResourcesFromS3(sessionId int, projectId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3SessionsPayloadBucketName),
		Key: s.bucketKey(sessionId, projectId, NetworkResources)})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	type resources struct {
		Resources []interface{}
	}
	resourcesSlice := strings.Split(buf.String(), "\n\n\n")
	var retResources []interface{}
	for _, e := range resourcesSlice {
		if e == "" {
			continue
		}
		var tempResources resources
		if err := json.Unmarshal([]byte(e), &tempResources); err != nil {
			return nil, fmt.Errorf("error decoding resource data: %v", err)
		}
		retResources = append(retResources, tempResources.Resources...)
	}
	return retResources, nil
}

func (s *StorageClient) ReadMessagesFromS3(sessionId int, projectId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3SessionsPayloadBucketName),
		Key: s.bucketKey(sessionId, projectId, ConsoleMessages)})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	type messages struct {
		Messages []interface{}
	}
	messagesSlice := strings.Split(buf.String(), "\n\n\n")
	var retMessages []interface{}
	for _, e := range messagesSlice {
		if e == "" {
			continue
		}
		var tempResources messages
		if err := json.Unmarshal([]byte(e), &tempResources); err != nil {
			return nil, fmt.Errorf("error decoding message data: %v", err)
		}
		retMessages = append(retMessages, tempResources.Messages...)
	}
	return retMessages, nil
}

func (s *StorageClient) bucketKey(sessionId int, projectId int, key PayloadType) *string {
	if util.IsDevEnv() {
		return aws.String(fmt.Sprintf("dev/%v/%v/%v", projectId, sessionId, string(key)))
	}
	return aws.String(fmt.Sprintf("%v/%v/%v", projectId, sessionId, string(key)))
}

func (s *StorageClient) sourceMapBucketKey(projectId int, version *string, fileName string) *string {
	var key string
	if util.IsDevEnv() {
		key = "dev/"
	}
	if version == nil {
		unversioned := "unversioned"
		version = &unversioned
	}
	key += fmt.Sprintf("%d/%s/%s", projectId, *version, fileName)
	return aws.String(key)
}

func (s *StorageClient) PushSourceMapFileReaderToS3(projectId int, version *string, fileName string, file io.Reader) (*int64, error) {
	key := s.sourceMapBucketKey(projectId, version, fileName)
	_, err := s.S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(S3SourceMapBucketName), Key: key, Body: file,
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

func (s *StorageClient) PushSourceMapFileToS3(projectId int, version *string, fileName string, fileBytes []byte) (*int64, error) {
	body := bytes.NewReader(fileBytes)
	return s.PushSourceMapFileReaderToS3(projectId, version, fileName, body)
}

func (s *StorageClient) ReadSourceMapFileFromS3(projectId int, version *string, fileName string) ([]byte, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: aws.String(S3SourceMapBucketName),
		Key: s.sourceMapBucketKey(projectId, version, fileName)})
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
