package storage

import (
	"bytes"
	"context"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/cloudfront/sign"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/highlight-run/highlight/backend/payload"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

var (
	S3SessionsPayloadBucketName = os.Getenv("AWS_S3_BUCKET_NAME")
	S3SourceMapBucketName       = os.Getenv("AWS_S3_SOURCE_MAP_BUCKET_NAME")
	CloudfrontDomain            = os.Getenv("AWS_CLOUDFRONT_DOMAIN")
	CloudfrontPublicKeyID       = os.Getenv("AWS_CLOUDFRONT_PUBLIC_KEY_ID")
	CloudfrontPrivateKey        = os.Getenv("AWS_CLOUDFRONT_PRIVATE_KEY")
)

const (
	MIME_TYPE_JSON          = "application/json"
	CONTENT_ENCODING_BROTLI = "br"
)

type PayloadType string

const (
	SessionContents            PayloadType = "session-contents"
	NetworkResources           PayloadType = "network-resources"
	ConsoleMessages            PayloadType = "console-messages"
	SessionContentsCompressed  PayloadType = "session-contents-compressed"
	NetworkResourcesCompressed PayloadType = "network-resources-compressed"
	ConsoleMessagesCompressed  PayloadType = "console-messages-compressed"
)

func GetChunkedPayloadType(offset int) PayloadType {
	return SessionContentsCompressed + PayloadType(fmt.Sprintf("-%04d", offset))
}

type StorageClient struct {
	S3Client  *s3.Client
	URLSigner *sign.URLSigner
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
		S3Client:  client,
		URLSigner: getURLSigner(),
	}, nil
}

func getURLSigner() *sign.URLSigner {
	if CloudfrontDomain == "" || CloudfrontPrivateKey == "" || CloudfrontPublicKeyID == "" {
		log.Warn("Missing one or more Cloudfront configs, disabling direct download.")
		return nil
	}

	block, _ := pem.Decode([]byte(CloudfrontPrivateKey))
	privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		log.Warn("Error parsing private key, disabling direct download.")
		return nil
	}

	return sign.NewURLSigner(CloudfrontPublicKeyID, privateKey)
}

func (s *StorageClient) pushFileToS3WithOptions(ctx context.Context, sessionId, projectId int, file *os.File, bucket string, payloadType PayloadType, options s3.PutObjectInput) (*int64, error) {
	log.Infof("[%d] pushFileToS3WithOptions", sessionId)
	_, err := file.Seek(0, io.SeekStart)
	if err != nil {
		return nil, errors.Wrap(err, "error seeking to beginning of file")
	}
	log.Infof("[%d] seeked", sessionId)

	key := s.bucketKey(sessionId, projectId, payloadType)
	log.Infof("[%d] generated bucket key", sessionId)

	options.Bucket = &bucket
	options.Key = key
	options.Body = file
	_, err = s.S3Client.PutObject(ctx, &options)
	if err != nil {
		return nil, err
	}

	log.Infof("[%d] put object", sessionId)

	headObj := s3.HeadObjectInput{
		Bucket: aws.String(S3SessionsPayloadBucketName),
		Key:    key,
	}

	result, err := s.S3Client.HeadObject(context.TODO(), &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}
	log.Infof("[%d] head object", sessionId)

	return &result.ContentLength, nil
}

// Push a compressed file to S3, adding the relevant metadata
func (s *StorageClient) PushCompressedFileToS3(ctx context.Context, sessionId, projectId int, file *os.File, bucket string, payloadType PayloadType) (*int64, error) {
	options := s3.PutObjectInput{
		ContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	}
	return s.pushFileToS3WithOptions(ctx, sessionId, projectId, file, bucket, payloadType, options)
}

func (s *StorageClient) PushFileToS3(ctx context.Context, sessionId, projectId int, file *os.File, bucket string, payloadType PayloadType) (*int64, error) {
	return s.pushFileToS3WithOptions(ctx, sessionId, projectId, file, bucket, payloadType, s3.PutObjectInput{})
}

func (s *StorageClient) PushFilesToS3(ctx context.Context, sessionId, projectId int, bucket string, payloadManager *payload.PayloadManager) (int64, error) {
	payloadTypes := map[payload.FileType]PayloadType{
		payload.Events:              SessionContents,
		payload.Resources:           NetworkResources,
		payload.Messages:            ConsoleMessages,
		payload.EventsCompressed:    SessionContentsCompressed,
		payload.ResourcesCompressed: NetworkResourcesCompressed,
		payload.MessagesCompressed:  ConsoleMessagesCompressed,
	}

	var totalSize int64
	for fileType, payloadType := range payloadTypes {
		log.Infof("[%d] pushing %s", sessionId, payloadType)
		var size *int64
		var err error
		if payloadType == SessionContentsCompressed ||
			payloadType == NetworkResourcesCompressed ||
			payloadType == ConsoleMessagesCompressed {
			size, err = s.PushCompressedFileToS3(ctx, sessionId, projectId, payloadManager.GetFile(fileType), bucket, payloadType)
		} else {
			size, err = s.PushFileToS3(ctx, sessionId, projectId, payloadManager.GetFile(fileType), bucket, payloadType)
		}

		if err != nil {
			log.Infof("[%d] error pushing %s", sessionId, payloadType)
			return 0, errors.Wrapf(err, "error pushing %s payload to s3", string(payloadType))
		}

		log.Infof("[%d] success pushing %s", sessionId, payloadType)
		if size != nil {
			totalSize += *size
		}
	}

	return totalSize, nil
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
			return nil, errors.Wrap(err, "error decoding event data")
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
			return nil, errors.Wrap(err, "error decoding resource data")
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
			return nil, errors.Wrap(err, "error decoding message data")
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

func (s *StorageClient) GetDirectDownloadURL(projectId int, sessionId int, payloadType PayloadType, chunkId *int) (*string, error) {
	if s.URLSigner == nil {
		return nil, nil
	}

	key := s.bucketKey(sessionId, projectId, payloadType)
	var unsignedURL string
	if chunkId != nil {
		unsignedURL = fmt.Sprintf("https://%s/%s-%04d", CloudfrontDomain, *key, *chunkId)
	} else {
		unsignedURL = fmt.Sprintf("https://%s/%s", CloudfrontDomain, *key)
	}
	signedURL, err := s.URLSigner.Sign(unsignedURL, time.Now().Add(5*time.Minute))
	if err != nil {
		return nil, errors.Wrap(err, "error signing URL")
	}

	return &signedURL, nil
}
