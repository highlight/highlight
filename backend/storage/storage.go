package storage

import (
	"bytes"
	"context"
	"crypto/x509"
	"encoding/gob"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
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
	S3SourceMapBucketNameNew       = os.Getenv("AWS_S3_SOURCE_MAP_BUCKET_NAME_NEW")
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
	NetworkResources           PayloadType = "network-resources"
	ConsoleMessages            PayloadType = "console-messages"
	SessionContentsCompressed  PayloadType = "session-contents-compressed"
	NetworkResourcesCompressed PayloadType = "network-resources-compressed"
	ConsoleMessagesCompressed  PayloadType = "console-messages-compressed"
	TimelineIndicatorEvents    PayloadType = "timeline-indicator-events"
)

// StoredPayloadTypes configures what payloads are uploaded with this config.
var StoredPayloadTypes = map[payload.FileType]PayloadType{
	payload.EventsCompressed:        SessionContentsCompressed,
	payload.ResourcesCompressed:     NetworkResourcesCompressed,
	payload.MessagesCompressed:      ConsoleMessagesCompressed,
	payload.TimelineIndicatorEvents: TimelineIndicatorEvents,
}

func GetChunkedPayloadType(offset int) PayloadType {
	return SessionContentsCompressed + PayloadType(fmt.Sprintf("-%04d", offset))
}

type Client interface {
	GetAssetURL(ctx context.Context, projectId string, hashVal string) (string, error)
	GetDirectDownloadURL(ctx context.Context, projectId int, sessionId int, payloadType PayloadType, chunkId *int) (*string, error)
	GetRawData(ctx context.Context, sessionId, projectId int, payloadType model.RawPayloadType) (map[int]string, error)
	GetSourceMapUploadUrl(ctx context.Context, key string) (string, error)
	GetSourcemapFiles(ctx context.Context, projectId int, version *string) ([]s3Types.Object, error)
	GetSourcemapVersions(ctx context.Context, projectId int) ([]s3Types.CommonPrefix, error)
	PushCompressedFile(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType) (*int64, error)
	PushFiles(ctx context.Context, sessionId, projectId int, payloadManager *payload.PayloadManager) (int64, error)
	PushRawEvents(ctx context.Context, sessionId, projectId int, payloadType model.RawPayloadType, events []redis.Z) error
	PushSourceMapFile(ctx context.Context, projectId int, version *string, fileName string, fileBytes []byte) (*int64, error)
	ReadMessages(ctx context.Context, sessionId int, projectId int) ([]interface{}, error)
	ReadResources(ctx context.Context, sessionId int, projectId int) ([]interface{}, error)
	ReadSourceMapFile(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error)
	ReadTimelineIndicatorEvents(ctx context.Context, sessionId int, projectId int) ([]*model.TimelineIndicatorEvent, error)
	UploadAsset(ctx context.Context, uuid string, contentType string, reader io.Reader) error
}

type FilesystemClient struct {
	fsRoot string
}

func (f *FilesystemClient) GetDirectDownloadURL(_ context.Context, projectId int, sessionId int, payloadType PayloadType, chunkId *int) (*string, error) {
	key := fmt.Sprintf("/direct/%d/%d/%v", sessionId, projectId, payloadType)
	if chunkId != nil {
		key = fmt.Sprintf("%s-%04d", key, *chunkId)
	}

	return &key, nil
}

func (f *FilesystemClient) GetRawData(ctx context.Context, sessionId, projectId int, payloadType model.RawPayloadType) (map[int]string, error) {
	prefix := fmt.Sprintf("%s/raw-events/%d/%d", f.fsRoot, sessionId, projectId)
	dir, err := os.ReadDir(prefix)
	if err != nil {
		return nil, errors.Wrap(err, "error listing objects in fs")
	}
	objects := lo.Filter(lo.Map(dir, func(t os.DirEntry, i int) string {
		return t.Name()
	}), func(s string, i int) bool {
		return strings.HasPrefix(s, string(payloadType))
	})

	results := make([][]redis.Z, len(objects))
	var errs = make(chan error, len(objects))
	var wg sync.WaitGroup
	for idx, object := range objects {
		wg.Add(1)
		go func(o string) {
			defer wg.Done()
			var result []redis.Z
			buf, err := f.readFSBytes(ctx, fmt.Sprintf("%s/%s", prefix, o))
			if err != nil {
				errs <- errors.Wrap(err, "error retrieving object from fs")
				return
			}

			decoder := gob.NewDecoder(buf)
			if err := decoder.Decode(&result); err != nil {
				errs <- errors.Wrap(err, "error decoding gob")
				return
			}

			results[idx] = result
		}(object)
	}

	wg.Wait()
	select {
	case err := <-errs:
		return nil, errors.Wrap(err, "error in task retrieving object from fs")
	default:
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

func (f *FilesystemClient) GetSourceMapUploadUrl(ctx context.Context, key string) (string, error) {
	//TODO implement me
	panic("implement me")
}

func (f *FilesystemClient) GetSourcemapFiles(ctx context.Context, projectId int, version *string) ([]s3Types.Object, error) {
	//TODO implement me
	panic("implement me")
}

func (f *FilesystemClient) GetSourcemapVersions(ctx context.Context, projectId int) ([]s3Types.CommonPrefix, error) {
	//TODO implement me
	panic("implement me")
}

func (f *FilesystemClient) PushCompressedFile(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType) (*int64, error) {
	key := fmt.Sprintf("%s/%d/%d/%v", f.fsRoot, sessionId, projectId, payloadType)
	size, err := f.writeFSBytes(ctx, key, file)
	return &size, err
}

func (f *FilesystemClient) PushFiles(ctx context.Context, sessionId, projectId int, payloadManager *payload.PayloadManager) (int64, error) {
	var totalSize int64
	for fileType, payloadType := range StoredPayloadTypes {
		file := payloadManager.GetFile(fileType)
		_, err := file.Seek(0, io.SeekStart)
		if err != nil {
			return 0, errors.Wrap(err, "error seeking to beginning of file")
		}
		size, err := f.PushCompressedFile(ctx, sessionId, projectId, file, payloadType)

		if err != nil {
			return 0, errors.Wrapf(err, "error pushing %s payload to s3", string(payloadType))
		}

		if size != nil {
			totalSize += *size
		}
	}

	return totalSize, nil
}

func (f *FilesystemClient) PushRawEvents(ctx context.Context, sessionId, projectId int, payloadType model.RawPayloadType, events []redis.Z) error {
	buf := new(bytes.Buffer)
	encoder := gob.NewEncoder(buf)
	if err := encoder.Encode(events); err != nil {
		return errors.Wrap(err, "error encoding gob")
	}

	key := fmt.Sprintf("%s/raw-events/%d/%d/%v-%s", f.fsRoot, sessionId, projectId, payloadType, uuid.New().String())
	_, err := f.writeFSBytes(ctx, key, buf)
	return err
}

func (f *FilesystemClient) PushSourceMapFile(ctx context.Context, projectId int, version *string, fileName string, fileBytes []byte) (*int64, error) {
	buf := new(bytes.Buffer)
	_, err := buf.Read(fileBytes)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from memory buffer")
	}
	if n, err := f.writeFSBytes(ctx, fmt.Sprintf("%s/%d/%s/%s", f.fsRoot, projectId, *version, fileName), buf); err != nil {
		return pointy.Int64(0), err
	} else {
		return &n, nil
	}
}

func (f *FilesystemClient) ReadMessages(ctx context.Context, sessionId int, projectId int) ([]interface{}, error) {
	var messages []interface{}
	err := f.readCompressed(ctx, sessionId, projectId, ConsoleMessagesCompressed, &messages)
	if err != nil {
		return nil, err
	}
	return messages, nil
}

func (f *FilesystemClient) ReadTimelineIndicatorEvents(ctx context.Context, sessionId int, projectId int) ([]*model.TimelineIndicatorEvent, error) {
	var events []*model.TimelineIndicatorEvent
	err := f.readCompressed(ctx, sessionId, projectId, TimelineIndicatorEvents, &events)
	if err != nil {
		return nil, err
	}
	return events, nil
}

func (f *FilesystemClient) ReadResources(ctx context.Context, sessionId int, projectId int) ([]interface{}, error) {
	var resources []interface{}
	err := f.readCompressed(ctx, sessionId, projectId, NetworkResourcesCompressed, &resources)
	if err != nil {
		return nil, err
	}
	return resources, nil
}

func (f *FilesystemClient) readCompressed(ctx context.Context, sessionId int, projectId int, t PayloadType, results interface{}) error {
	buf, err := f.readFSBytes(ctx, fmt.Sprintf("%s/%v/%v/%v", f.fsRoot, sessionId, projectId, t))
	if err != nil {
		return err
	}
	buf, err = decompress(buf)
	if err != nil {
		return errors.Wrap(err, "error decompressing compressed buffer from fs")
	}

	if err := json.Unmarshal(buf.Bytes(), results); err != nil {
		return errors.Wrap(err, "error decoding data")
	}
	return nil
}

func (f *FilesystemClient) ReadSourceMapFile(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error) {
	if b, err := f.readFSBytes(ctx, fmt.Sprintf("%s/%d/%s/%s", f.fsRoot, projectId, *version, fileName)); err == nil {
		return b.Bytes(), nil
	} else {
		return nil, err
	}
}

func (f *FilesystemClient) GetAssetURL(_ context.Context, projectId string, hashVal string) (string, error) {
	return fmt.Sprintf("/assets/%s/%s", projectId, hashVal), nil
}

func (f *FilesystemClient) UploadAsset(ctx context.Context, uuid, _ string, reader io.Reader) error {
	_, err := f.writeFSBytes(ctx, fmt.Sprintf("%s/assets/%s", f.fsRoot, uuid), reader)
	return err
}

func (f *FilesystemClient) readFSBytes(ctx context.Context, key string) (*bytes.Buffer, error) {
	file, err := os.Open(key)
	if err != nil {
		return nil, errors.Wrap(err, "error opening fs file")
	}

	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			log.WithContext(ctx).Error(err)
		}
	}(file)

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(file)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from fs buffer")
	}
	return buf, nil
}
func (f *FilesystemClient) writeFSBytes(ctx context.Context, fp string, data io.Reader) (int64, error) {
	parts := strings.Split(fp, "/")
	err := os.MkdirAll(strings.Join(parts[0:len(parts)-1], "/"), 0750)
	if err != nil {
		return 0, err
	}
	fo, err := os.Create(fp)
	if err != nil {
		return 0, err
	}
	defer func() {
		if err := fo.Close(); err != nil {
			log.WithContext(ctx).Error(err)
		}
	}()

	n, err := io.Copy(fo, data)
	if err != nil {
		return 0, err
	}
	err = fo.Sync()
	return n, err
}

func NewFSClient(ctx context.Context, fsRoot, certPath, keyPath, port string) (*FilesystemClient, error) {
	go func() {
		r := chi.NewMux()
		r.Route("/", func(r chi.Router) {
			r.Get("/assets/{project-id}/{hash-val}", func(w http.ResponseWriter, r *http.Request) {
				projectId := chi.URLParam(r, "project-id")
				hashVal := chi.URLParam(r, "hash-val")
				fp := fmt.Sprintf("%s/assets/%s/%s", fsRoot, projectId, hashVal)
				http.ServeFile(w, r, fp)
			})
			r.Get("/direct/{session-id}/{project-id}/{payload-type}", func(w http.ResponseWriter, r *http.Request) {
				sessionId := chi.URLParam(r, "session-id")
				projectId := chi.URLParam(r, "project-id")
				payloadType := chi.URLParam(r, "payload-type")
				fp := fmt.Sprintf("%s/direct/%s/%s/%v", fsRoot, sessionId, projectId, payloadType)
				http.ServeFile(w, r, fp)
			})
		})
		err := http.ListenAndServeTLS(":"+port, certPath, keyPath, r)
		if err != nil {
			log.WithContext(ctx).Error(err)
		}
	}()
	return &FilesystemClient{
		fsRoot: fsRoot,
	}, nil
}

type S3Client struct {
	S3Client        *s3.Client
	S3ClientEast2   *s3.Client
	S3PresignClient *s3.PresignClient
	URLSigner       *sign.URLSigner
}

func NewS3Client(ctx context.Context) (*S3Client, error) {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion("us-west-2"))
	if err != nil {
		return nil, errors.Wrap(err, "error loading default from config")
	}
	// Create Amazon S3 API client using path style addressing.
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	// Create a separate s3 client for us-east-2
	// Eventually, the us-west-2 s3 client should be deprecated
	cfgEast2, err := config.LoadDefaultConfig(ctx, config.WithRegion(model.AWS_REGION_US_EAST_2))
	if err != nil {
		return nil, errors.Wrap(err, "error loading default from config")
	}
	// Create Amazon S3 API client using path style addressing.
	clientEast2 := s3.NewFromConfig(cfgEast2, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	return &S3Client{
		S3Client:        client,
		S3ClientEast2:   clientEast2,
		S3PresignClient: s3.NewPresignClient(clientEast2),
		URLSigner:       getURLSigner(ctx),
	}, nil
}

func getURLSigner(ctx context.Context) *sign.URLSigner {
	if CloudfrontDomain == "" || CloudfrontPrivateKey == "" || CloudfrontPublicKeyID == "" {
		log.WithContext(ctx).Warn("Missing one or more Cloudfront configs, disabling direct download.")
		return nil
	}

	block, _ := pem.Decode([]byte(CloudfrontPrivateKey))
	privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		log.WithContext(ctx).Warn("Error parsing private key, disabling direct download.")
		return nil
	}

	return sign.NewURLSigner(CloudfrontPublicKeyID, privateKey)
}

func UseNewSessionBucket(sessionId int) bool {
	return sessionId >= 150000000
}

func (s *S3Client) getSessionClientAndBucket(sessionId int) (*s3.Client, *string) {
	client := s.S3Client
	bucket := pointy.String(S3SessionsPayloadBucketName)
	if UseNewSessionBucket(sessionId) {
		client = s.S3ClientEast2
		bucket = pointy.String(S3SessionsPayloadBucketNameNew)
	}

	return client, bucket
}

func (s *S3Client) pushFileToS3WithOptions(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType, options s3.PutObjectInput) (*int64, error) {
	_, err := file.Seek(0, io.SeekStart)
	if err != nil {
		return nil, errors.Wrap(err, "error seeking to beginning of file")
	}

	key := bucketKey(sessionId, projectId, payloadType)
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

	result, err := client.HeadObject(ctx, &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}

	return &result.ContentLength, nil
}

// PushCompressedFile pushes a compressed file to S3, adding the relevant metadata
func (s *S3Client) PushCompressedFile(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType) (*int64, error) {
	options := s3.PutObjectInput{
		ContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	}
	return s.pushFileToS3WithOptions(ctx, sessionId, projectId, file, payloadType, options)
}

func (s *S3Client) PushRawEvents(ctx context.Context, sessionId, projectId int, payloadType model.RawPayloadType, events []redis.Z) error {
	buf := new(bytes.Buffer)
	encoder := gob.NewEncoder(buf)
	if err := encoder.Encode(events); err != nil {
		return errors.Wrap(err, "error encoding gob")
	}

	// Adding to a separate raw-events folder so these can be expired by prefix with an S3 expiration rule.
	key := "raw-events/" + *bucketKey(sessionId, projectId, string(payloadType)+"-"+uuid.New().String())

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

func (s *S3Client) GetRawData(ctx context.Context, sessionId, projectId int, payloadType model.RawPayloadType) (map[int]string, error) {
	// Adding to a separate raw-events folder so these can be expired by prefix with an S3 expiration rule.
	prefix := "raw-events/" + *bucketKey(sessionId, projectId, payloadType)

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

func (s *S3Client) PushFileToS3(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType) (*int64, error) {
	return s.pushFileToS3WithOptions(ctx, sessionId, projectId, file, payloadType, s3.PutObjectInput{})
}

func (s *S3Client) PushFiles(ctx context.Context, sessionId, projectId int, payloadManager *payload.PayloadManager) (int64, error) {
	var totalSize int64
	for fileType, payloadType := range StoredPayloadTypes {
		size, err := s.PushCompressedFile(ctx, sessionId, projectId, payloadManager.GetFile(fileType), payloadType)

		if err != nil {
			return 0, errors.Wrapf(err, "error pushing %s payload to s3", string(payloadType))
		}

		if size != nil {
			totalSize += *size
		}
	}

	return totalSize, nil
}
func decompress(data *bytes.Buffer) (*bytes.Buffer, error) {
	out := &bytes.Buffer{}
	if _, err := io.Copy(out, brotli.NewReader(data)); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *S3Client) ReadResources(ctx context.Context, sessionId int, projectId int) ([]interface{}, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket:                  bucket,
		Key:                     bucketKey(sessionId, projectId, NetworkResourcesCompressed),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		// compressed file doesn't exist, fall back to reading uncompressed
		return s.ReadUncompressedResourcesFromS3(ctx, sessionId, projectId)
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	buf, err = decompress(buf)
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
func (s *S3Client) ReadUncompressedResourcesFromS3(ctx context.Context, sessionId int, projectId int) ([]interface{}, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(ctx, &s3.GetObjectInput{Bucket: bucket,
		Key: bucketKey(sessionId, projectId, NetworkResources)})
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

func (s *S3Client) ReadMessages(ctx context.Context, sessionId int, projectId int) ([]interface{}, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket:                  bucket,
		Key:                     bucketKey(sessionId, projectId, ConsoleMessagesCompressed),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		// compressed file doesn't exist, fall back to reading uncompressed
		return s.ReadUncompressedMessagesFromS3(ctx, sessionId, projectId)
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}
	buf, err = decompress(buf)
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
func (s *S3Client) ReadUncompressedMessagesFromS3(ctx context.Context, sessionId int, projectId int) ([]interface{}, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(ctx, &s3.GetObjectInput{Bucket: bucket,
		Key: bucketKey(sessionId, projectId, ConsoleMessages)})
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

func (s *S3Client) ReadTimelineIndicatorEvents(ctx context.Context, sessionId int, projectId int) ([]*model.TimelineIndicatorEvent, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)

	var events []*model.TimelineIndicatorEvent
	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket:                  bucket,
		Key:                     bucketKey(sessionId, projectId, TimelineIndicatorEvents),
		ResponseContentType:     util.MakeStringPointer(MIME_TYPE_JSON),
		ResponseContentEncoding: util.MakeStringPointer(CONTENT_ENCODING_BROTLI),
	})
	if err != nil {
		if strings.Contains(err.Error(), "NoSuchKey") {
			return events, nil
		}
		return nil, errors.Wrap(err, "error getting object from s3")
	}

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading from s3 buffer")
	}

	buf, err = decompress(buf)
	if err != nil {
		return nil, errors.Wrap(err, "error decompressing compressed buffer from s3")
	}

	if err := json.Unmarshal(buf.Bytes(), &events); err != nil {
		return nil, errors.Wrap(err, "error decoding event data")
	}
	return events, nil
}

func bucketKey[T ~string](sessionId int, projectId int, key T) *string {
	versionPart := ""
	if UseNewSessionBucket(sessionId) {
		versionPart = "v2/"
	}
	if util.IsDevEnv() {
		return pointy.String(fmt.Sprintf("%sdev/%v/%v/%v", versionPart, projectId, sessionId, key))
	}
	return pointy.String(fmt.Sprintf("%s%v/%v/%v", versionPart, projectId, sessionId, key))
}

func (s *S3Client) sourceMapBucketKey(projectId int, version *string, fileName string) *string {
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

func (s *S3Client) PushSourceMapFileReaderToS3(ctx context.Context, projectId int, version *string, fileName string, file io.Reader) (*int64, error) {
	key := s.sourceMapBucketKey(projectId, version, fileName)
	_, err := s.S3ClientEast2.PutObject(ctx, &s3.PutObjectInput{
		Bucket: pointy.String(S3SourceMapBucketNameNew), Key: key, Body: file,
	})
	if err != nil {
		return nil, errors.Wrap(err, "error 'put'ing sourcemap file in s3 bucket")
	}
	headObj := s3.HeadObjectInput{
		Bucket: pointy.String(S3SourceMapBucketNameNew),
		Key:    key,
	}
	result, err := s.S3ClientEast2.HeadObject(ctx, &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}
	return &result.ContentLength, nil
}

func (s *S3Client) PushSourceMapFile(ctx context.Context, projectId int, version *string, fileName string, fileBytes []byte) (*int64, error) {
	body := bytes.NewReader(fileBytes)
	return s.PushSourceMapFileReaderToS3(ctx, projectId, version, fileName, body)
}

func (s *S3Client) ReadSourceMapFile(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error) {
	output, err := s.S3ClientEast2.GetObject(ctx, &s3.GetObjectInput{Bucket: pointy.String(S3SourceMapBucketNameNew),
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

func (s *S3Client) GetDirectDownloadURL(_ context.Context, projectId int, sessionId int, payloadType PayloadType, chunkId *int) (*string, error) {
	if s.URLSigner == nil {
		return nil, nil
	}

	key := bucketKey(sessionId, projectId, payloadType)
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

func (s *S3Client) GetSourceMapUploadUrl(ctx context.Context, key string) (string, error) {
	input := s3.PutObjectInput{
		Bucket: &S3SourceMapBucketNameNew,
		Key:    pointy.String(key),
	}

	resp, err := s.S3PresignClient.PresignPutObject(ctx, &input)
	if err != nil {
		return "", errors.Wrap(err, "error signing s3 asset URL")
	}

	return resp.URL, nil
}

func (s *S3Client) UploadAsset(ctx context.Context, uuid string, contentType string, reader io.Reader) error {
	_, err := s.S3ClientEast2.PutObject(ctx, &s3.PutObjectInput{
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

func (s *S3Client) GetAssetURL(ctx context.Context, projectId string, hashVal string) (string, error) {
	input := s3.GetObjectInput{
		Bucket: &S3ResourcesBucketName,
		Key:    pointy.String(projectId + "/" + hashVal),
	}

	resp, err := s.S3PresignClient.PresignGetObject(ctx, &input)
	if err != nil {
		return "", errors.Wrap(err, "error signing s3 asset URL")
	}

	return resp.URL, nil
}

func (s *S3Client) GetSourcemapFiles(ctx context.Context, projectId int, version *string) ([]s3Types.Object, error) {
	if version == nil || len(*version) == 0 {
		// If no version is specified we put files in an "unversioned" directory.
		version = pointy.String("unversioned")
	}

	output, err := s.S3ClientEast2.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: pointy.String(S3SourceMapBucketNameNew),
		Prefix: pointy.String(fmt.Sprintf("%d/%s/", projectId, *version)),
	})

	if err != nil {
		return nil, errors.Wrap(err, "error getting sourcemaps from s3")
	}

	return output.Contents, nil
}

func (s *S3Client) GetSourcemapVersions(ctx context.Context, projectId int) ([]s3Types.CommonPrefix, error) {
	output, err := s.S3ClientEast2.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket:    pointy.String(S3SourceMapBucketNameNew),
		Prefix:    pointy.String(fmt.Sprintf("%d/", projectId)),
		Delimiter: pointy.String("/"),
	})

	if err != nil {
		return nil, errors.Wrap(err, "error getting sourcemap app versions from s3")
	}

	return output.CommonPrefixes, nil
}
