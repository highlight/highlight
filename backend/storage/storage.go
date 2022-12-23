package storage

import (
	"bytes"
	"context"
	"crypto/x509"
	"encoding/gob"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/openlyinc/pointy"
	"golang.org/x/sync/errgroup"

	"github.com/andybalholm/brotli"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/cloudfront/sign"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3Types "github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/payload"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

var (
	S3SessionsPayloadBucketName    = os.Getenv("AWS_S3_BUCKET_NAME")
	S3SessionsPayloadBucketNameNew = os.Getenv("AWS_S3_BUCKET_NAME_NEW")
	S3SessionsStagingBucketName    = os.Getenv("AWS_S3_STAGING_BUCKET_NAME")
	S3SourceMapBucketName          = os.Getenv("AWS_S3_SOURCE_MAP_BUCKET_NAME")
	S3ResourcesBucketName          = os.Getenv("AWS_S3_RESOURCES_BUCKET")
	CloudfrontDomain               = os.Getenv("AWS_CLOUDFRONT_DOMAIN")
	CloudfrontPublicKeyID          = os.Getenv("AWS_CLOUDFRONT_PUBLIC_KEY_ID")
	CloudfrontPrivateKey           = os.Getenv("AWS_CLOUDFRONT_PRIVATE_KEY")
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
	RawEvents                  PayloadType = "raw-events"
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
	S3Client             *s3.Client
	S3ClientEast2        *s3.Client
	S3PresignClient      *s3.PresignClient
	S3PresignClientWest2 *s3.PresignClient
	URLSigner            *sign.URLSigner
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
	cfgEast2, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(model.AWS_REGION_US_EAST_2))
	if err != nil {
		return nil, errors.Wrap(err, "error loading default from config")
	}
	// Create Amazon S3 API client using path style addressing.
	clientEast2 := s3.NewFromConfig(cfgEast2, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	return &StorageClient{
		S3Client:             client,
		S3ClientEast2:        clientEast2,
		S3PresignClient:      s3.NewPresignClient(clientEast2),
		S3PresignClientWest2: s3.NewPresignClient(client),
		URLSigner:            getURLSigner(),
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

func UseNewSessionBucket(sessionId int) bool {
	return sessionId >= 150000000
}

func (s *StorageClient) getSessionClientAndBucket(sessionId int) (*s3.Client, *string) {
	client := s.S3Client
	bucket := pointy.String(S3SessionsPayloadBucketName)
	if UseNewSessionBucket(sessionId) {
		client = s.S3ClientEast2
		bucket = pointy.String(S3SessionsPayloadBucketNameNew)
	}

	return client, bucket
}

func (s *StorageClient) pushFileToS3WithOptions(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType, options s3.PutObjectInput) (*int64, error) {
	_, err := file.Seek(0, io.SeekStart)
	if err != nil {
		return nil, errors.Wrap(err, "error seeking to beginning of file")
	}

	key := s.bucketKey(sessionId, projectId, payloadType)
	client, bucket := s.getSessionClientAndBucket(sessionId)

	options.Bucket = bucket
	options.Key = key
	options.Body = file
	_, err = client.PutObject(ctx, &options)
	if err != nil {
		return nil, err
	}

	headObj := s3.HeadObjectInput{
		Bucket: bucket,
		Key:    key,
	}

	result, err := client.HeadObject(context.TODO(), &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}

	return &result.ContentLength, nil
}

// Push a compressed file to S3, adding the relevant metadata
func (s *StorageClient) PushCompressedFileToS3(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType) (*int64, error) {
	options := s3.PutObjectInput{
		ContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	}
	return s.pushFileToS3WithOptions(ctx, sessionId, projectId, file, payloadType, options)
}

func (s *StorageClient) PushRawEventsToS3(ctx context.Context, sessionId, projectId int, events []redis.Z) error {
	buf := new(bytes.Buffer)
	encoder := gob.NewEncoder(buf)
	if err := encoder.Encode(events); err != nil {
		return errors.Wrap(err, "error encoding gob")
	}

	// Adding to a separate raw-events folder so these can be expired by prefix with an S3 expiration rule.
	key := "raw-events/" + *s.bucketKey(sessionId, projectId, RawEvents+"-"+PayloadType(uuid.New().String()))

	options := s3.PutObjectInput{
		Bucket: &S3SessionsStagingBucketName,
		Key:    &key,
		Body:   bytes.NewReader(buf.Bytes()),
	}
	_, err := s.S3ClientEast2.PutObject(ctx, &options)
	if err != nil {
		return errors.Wrap(err, "error uploading raw events to S3")
	}

	return nil
}

func (s *StorageClient) GetRawEventsFromS3(ctx context.Context, sessionId, projectId int) (map[int]string, error) {
	// Adding to a separate raw-events folder so these can be expired by prefix with an S3 expiration rule.
	prefix := "raw-events/" + *s.bucketKey(sessionId, projectId, RawEvents)

	options := s3.ListObjectsV2Input{
		Bucket: &S3SessionsStagingBucketName,
		Prefix: &prefix,
	}

	output, err := s.S3ClientEast2.ListObjectsV2(ctx, &options)
	if err != nil {
		return nil, errors.Wrap(err, "error listing objects in S3")
	}

	var g errgroup.Group
	results := make([][]redis.Z, len(output.Contents))
	for idx, object := range output.Contents {
		idx := idx
		object := object
		g.Go(func() error {
			var result []redis.Z
			output, err := s.S3ClientEast2.GetObject(ctx, &s3.GetObjectInput{
				Bucket: &S3SessionsStagingBucketName,
				Key:    object.Key,
			})
			if err != nil {
				return errors.Wrap(err, "error retrieving object from S3")
			}

			buf := new(bytes.Buffer)
			_, err = buf.ReadFrom(output.Body)
			if err != nil {
				return errors.Wrap(err, "error reading from s3 buffer")
			}

			decoder := gob.NewDecoder(buf)
			if err := decoder.Decode(&result); err != nil {
				return errors.Wrap(err, "error decoding gob")
			}

			results[idx] = result
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return nil, errors.Wrap(err, "error in task retrieving object from S3")
	}

	eventRows := map[int]string{}
	for _, zRange := range results {
		for _, z := range zRange {
			intScore := int(z.Score)
			// Beacon events have decimals, skip them
			if z.Score != float64(intScore) {
				continue
			}

			eventRows[intScore] = z.Member.(string)
		}
	}

	return eventRows, nil
}

func (s *StorageClient) PushFileToS3(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType) (*int64, error) {
	return s.pushFileToS3WithOptions(ctx, sessionId, projectId, file, payloadType, s3.PutObjectInput{})
}

func (s *StorageClient) PushFilesToS3(ctx context.Context, sessionId, projectId int, payloadManager *payload.PayloadManager) (int64, error) {
	var totalSize int64
	for fileType, payloadType := range StoredPayloadTypes {
		var size *int64
		var err error
		if payloadType == SessionContentsCompressed ||
			payloadType == NetworkResourcesCompressed ||
			payloadType == ConsoleMessagesCompressed {
			size, err = s.PushCompressedFileToS3(ctx, sessionId, projectId, payloadManager.GetFile(fileType), payloadType)
		} else {
			size, err = s.PushFileToS3(ctx, sessionId, projectId, payloadManager.GetFile(fileType), payloadType)
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
	client, bucket := s.getSessionClientAndBucket(sessionId)

	output, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket:                  bucket,
		Key:                     s.bucketKey(sessionId, projectId, SessionContentsCompressed),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		// compressed file doesn't exist, fall back to reading uncompressed
		return s.ReadUncompressedSessionsFromS3(sessionId, projectId)
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

// ReadUncompressedSessionsFromS3 is deprecated. Serves legacy uncompressed session data from S3.
func (s *StorageClient) ReadUncompressedSessionsFromS3(sessionId int, projectId int) ([]interface{}, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: bucket,
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
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket:                  bucket,
		Key:                     s.bucketKey(sessionId, projectId, NetworkResourcesCompressed),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		// compressed file doesn't exist, fall back to reading uncompressed
		return s.ReadUncompressedResourcesFromS3(sessionId, projectId)
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

// ReadUncompressedResourcesFromS3 is deprecated. Serves legacy uncompressed network data from S3.
func (s *StorageClient) ReadUncompressedResourcesFromS3(sessionId int, projectId int) ([]interface{}, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: bucket,
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
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket:                  bucket,
		Key:                     s.bucketKey(sessionId, projectId, ConsoleMessagesCompressed),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		// compressed file doesn't exist, fall back to reading uncompressed
		return s.ReadUncompressedMessagesFromS3(sessionId, projectId)
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

// ReadUncompressedMessagesFromS3 is deprecated. Serves legacy uncompressed message data from S3.
func (s *StorageClient) ReadUncompressedMessagesFromS3(sessionId int, projectId int) ([]interface{}, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(context.TODO(), &s3.GetObjectInput{Bucket: bucket,
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
	versionPart := ""
	if UseNewSessionBucket(sessionId) {
		versionPart = "v2/"
	}
	if util.IsDevEnv() {
		return pointy.String(fmt.Sprintf("%sdev/%v/%v/%v", versionPart, projectId, sessionId, string(key)))
	}
	return pointy.String(fmt.Sprintf("%s%v/%v/%v", versionPart, projectId, sessionId, string(key)))
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
	signedURL, err := s.URLSigner.Sign(unsignedURL, time.Now().Add(15*time.Minute))
	if err != nil {
		return nil, errors.Wrap(err, "error signing URL")
	}

	return &signedURL, nil
}

func (s *StorageClient) GetSourceMapUploadUrl(key string) (string, error) {
	input := s3.PutObjectInput{
		Bucket: &S3SourceMapBucketName,
		Key:    pointy.String(key),
	}

	resp, err := s.S3PresignClientWest2.PresignPutObject(context.TODO(), &input)
	if err != nil {
		return "", errors.Wrap(err, "error signing s3 asset URL")
	}

	return resp.URL, nil
}

func (s *StorageClient) UploadAsset(uuid string, contentType string, reader io.Reader) error {
	_, err := s.S3ClientEast2.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: pointy.String(S3ResourcesBucketName),
		Key:    pointy.String(uuid),
		Body:   reader,
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

func (s *StorageClient) GetAssetURL(projectId string, hashVal string) (string, error) {
	input := s3.GetObjectInput{
		Bucket: &S3ResourcesBucketName,
		Key:    pointy.String(projectId + "/" + hashVal),
	}

	resp, err := s.S3PresignClient.PresignGetObject(context.TODO(), &input)
	if err != nil {
		return "", errors.Wrap(err, "error signing s3 asset URL")
	}

	return resp.URL, nil
}

func (s *StorageClient) GetSourcemapFilesFromS3(projectId int, version *string) ([]s3Types.Object, error) {
	if version == nil || len(*version) == 0 {
		// If no version is specified we put files in an "unversioned" directory.
		version = pointy.String("unversioned")
	}

	output, err := s.S3Client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: pointy.String(S3SourceMapBucketName),
		Prefix: pointy.String(fmt.Sprintf("%d/%s/", projectId, *version)),
	})

	if err != nil {
		return nil, errors.Wrap(err, "error getting sourcemaps from s3")
	}

	return output.Contents, nil
}

func (s *StorageClient) GetSourcemapVersionsFromS3(projectId int) ([]s3Types.CommonPrefix, error) {
	output, err := s.S3Client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket:    pointy.String(S3SourceMapBucketName),
		Prefix:    pointy.String(fmt.Sprintf("%d/", projectId)),
		Delimiter: pointy.String("/"),
	})

	if err != nil {
		return nil, errors.Wrap(err, "error getting sourcemap app versions from s3")
	}

	return output.CommonPrefixes, nil
}
