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
	"time"

	"github.com/openlyinc/pointy"

	"github.com/andybalholm/brotli"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
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
	S3ResourcesBucketName       = os.Getenv("AWS_S3_RESOURCES_BUCKET")
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
	SessionContentsCompressed  PayloadType = "session-contents-compressed"
	NetworkResourcesCompressed PayloadType = "network-resources-compressed"
	ConsoleMessagesCompressed  PayloadType = "console-messages-compressed"
)

// StoredPayloadTypes configures what payloads are uploaded with this config.
var StoredPayloadTypes = map[payload.FileType]PayloadType{
	payload.EventsCompressed:    SessionContentsCompressed,
	payload.ResourcesCompressed: NetworkResourcesCompressed,
	payload.MessagesCompressed:  ConsoleMessagesCompressed,
}

func GetChunkedPayloadType(offset int) PayloadType {
	return SessionContentsCompressed + PayloadType(fmt.Sprintf("-%04d", offset))
}

type StorageClient struct {
	S3Client        *s3.Client
	S3ClientEast2   *s3.Client
	S3PresignClient *s3.PresignClient
	URLSigner       *sign.URLSigner
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

	// Create a separate s3 client for us-east-2
	// Eventually, the us-west-2 s3 client should be deprecated
	cfgEast2, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		return nil, errors.Wrap(err, "error loading default from config")
	}
	// Create Amazon S3 API client using path style addressing.
	clientEast2 := s3.NewFromConfig(cfgEast2, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	return &StorageClient{
		S3Client:        client,
		S3ClientEast2:   clientEast2,
		S3PresignClient: s3.NewPresignClient(clientEast2),
		URLSigner:       getURLSigner(),
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
	_, err := file.Seek(0, io.SeekStart)
	if err != nil {
		return nil, errors.Wrap(err, "error seeking to beginning of file")
	}

	key := s.bucketKey(sessionId, projectId, payloadType)

	options.Bucket = &bucket
	options.Key = key
	options.Body = file
	_, err = s.S3Client.PutObject(ctx, &options)
	if err != nil {
		return nil, err
	}

	headObj := s3.HeadObjectInput{
		Bucket: pointy.String(S3SessionsPayloadBucketName),
		Key:    key,
	}

	result, err := s.S3Client.HeadObject(context.TODO(), &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}

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
	var totalSize int64
	for fileType, payloadType := range StoredPayloadTypes {
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
			return 0, errors.Wrapf(err, "error pushing %s payload to s3", string(payloadType))
		}

		if size != nil {
			totalSize += *size
		}
	}

	return totalSize, nil
}
func (s *StorageClient) decompress(data *bytes.Buffer) (*bytes.Buffer, error) {
	out := &bytes.Buffer{}
	if _, err := io.Copy(out, brotli.NewReader(data)); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *StorageClient) ReadSessionsFromS3(sessionId int, projectId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket:                  pointy.String(S3SessionsPayloadBucketName),
		Key:                     s.bucketKey(sessionId, projectId, SessionContentsCompressed),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}

	buf, err = s.decompress(buf)
	if err != nil {
		return nil, errors.Wrap(err, "error decompressing compressed buffer from s3")
	}

	var events []interface{}
	if err := json.Unmarshal(buf.Bytes(), &events); err != nil {
		return nil, errors.Wrap(err, "error decoding event data")
	}
	return events, nil
}

func (s *StorageClient) ReadResourcesFromS3(sessionId int, projectId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket:                  pointy.String(S3SessionsPayloadBucketName),
		Key:                     s.bucketKey(sessionId, projectId, NetworkResourcesCompressed),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	buf, err = s.decompress(buf)
	if err != nil {
		return nil, errors.Wrap(err, "error decompressing compressed buffer from s3")
	}

	var resources []interface{}
	if err := json.Unmarshal(buf.Bytes(), &resources); err != nil {
		return nil, errors.Wrap(err, "error decoding resource data")
	}
	return resources, nil
}

func (s *StorageClient) ReadMessagesFromS3(sessionId int, projectId int) ([]interface{}, error) {
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket:                  pointy.String(S3SessionsPayloadBucketName),
		Key:                     s.bucketKey(sessionId, projectId, ConsoleMessagesCompressed),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		return nil, errors.Wrap(err, "error getting object from s3")
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	buf, err = s.decompress(buf)
	if err != nil {
		return nil, errors.Wrap(err, "error decompressing compressed buffer from s3")
	}

	var messages []interface{}
	if err := json.Unmarshal(buf.Bytes(), &messages); err != nil {
		return nil, errors.Wrap(err, "error decoding message data")
	}
	return messages, nil
}

func (s *StorageClient) bucketKey(sessionId int, projectId int, key PayloadType) *string {
	if util.IsDevEnv() {
		return pointy.String(fmt.Sprintf("dev/%v/%v/%v", projectId, sessionId, string(key)))
	}
	return pointy.String(fmt.Sprintf("%v/%v/%v", projectId, sessionId, string(key)))
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
	return pointy.String(key)
}

func (s *StorageClient) PushSourceMapFileReaderToS3(projectId int, version *string, fileName string, file io.Reader) (*int64, error) {
	key := s.sourceMapBucketKey(projectId, version, fileName)
	_, err := s.S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: pointy.String(S3SourceMapBucketName), Key: key, Body: file,
	})
	if err != nil {
		return nil, errors.Wrap(err, "error 'put'ing sourcemap file in s3 bucket")
	}
	headObj := s3.HeadObjectInput{
		Bucket: pointy.String(S3SourceMapBucketName),
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
	output, err := s.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: pointy.String(S3SourceMapBucketName),
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

func (s *StorageClient) UploadAsset(uuid string, contentLength int64, contentType string, reader io.Reader) error {
	_, err := s.S3ClientEast2.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        pointy.String(S3ResourcesBucketName),
		Key:           pointy.String(uuid),
		Body:          reader,
		ContentLength: contentLength,
		Metadata: map[string]string{
			"Content-Type": contentType,
		},
	}, s3.WithAPIOptions(
		v4.SwapComputePayloadSHA256ForUnsignedPayloadMiddleware,
	))
	if err != nil {
		return errors.Wrap(err, "error calling PutObject")
	}
	return nil
}

func (s *StorageClient) GetAssetURL(uuid string) (string, error) {
	input := s3.GetObjectInput{
		Bucket: &S3ResourcesBucketName,
		Key:    &uuid,
	}

	resp, err := s.S3PresignClient.PresignGetObject(context.TODO(), &input)
	if err != nil {
		return "", errors.Wrap(err, "error signing s3 asset URL")
	}

	return resp.URL, nil
}
