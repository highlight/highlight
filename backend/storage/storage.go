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
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/andybalholm/brotli"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/cloudfront/sign"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3Types "github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"github.com/aws/smithy-go/ptr"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/payload"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	hredis "github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"
	"github.com/rs/cors"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
)

var (
	S3SessionsPayloadBucketNameNew = env.Config.AwsS3BucketName
	S3SessionsStagingBucketName    = env.Config.AwsS3StagingBucketName
	S3SourceMapBucketNameNew       = env.Config.AwsS3SourceMapBucketName
	S3ResourcesBucketName          = env.Config.AwsS3ResourcesBucketName
	S3GithubBucketName             = env.Config.AwsS3GithubBucketName
	CloudfrontDomain               = env.Config.AwsCloudfrontDomain
	CloudfrontPublicKeyID          = env.Config.AwsCloudfrontPublicKeyID
	CloudfrontPrivateKey           = env.Config.AwsCloudfrontPrivateKey
)

const (
	MIME_TYPE_JSON           = "application/json"
	CONTENT_ENCODING_BROTLI  = "br"
	RAW_EVENT_RETENTION_DAYS = 1
)

type PayloadType string

const (
	NetworkResources           PayloadType = "network-resources"
	SessionContentsCompressed  PayloadType = "session-contents-compressed"
	NetworkResourcesCompressed PayloadType = "network-resources-compressed"
	TimelineIndicatorEvents    PayloadType = "timeline-indicator-events"
	WebSocketEventsCompressed  PayloadType = "web-socket-events-compressed"
)

// StoredPayloadTypes configures what payloads are uploaded with this config.
var StoredPayloadTypes = map[payload.FileType]PayloadType{
	payload.EventsCompressed:          SessionContentsCompressed,
	payload.ResourcesCompressed:       NetworkResourcesCompressed,
	payload.TimelineIndicatorEvents:   TimelineIndicatorEvents,
	payload.WebSocketEventsCompressed: WebSocketEventsCompressed,
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
	GetSourcemapVersions(ctx context.Context, projectId int) ([]string, error)
	PushCompressedFile(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType, retentionPeriod privateModel.RetentionPeriod) (*int64, error)
	PushFiles(ctx context.Context, sessionId, projectId int, payloadManager *payload.PayloadManager, retentionPeriod privateModel.RetentionPeriod) (int64, error)
	PushRawEvents(ctx context.Context, sessionId, projectId int, payloadType model.RawPayloadType, events []redis.Z) error
	PushSourceMapFile(ctx context.Context, projectId int, version *string, fileName string, fileBytes []byte) (*int64, error)
	ReadResources(ctx context.Context, sessionId int, projectId int) ([]interface{}, error)
	ReadWebSocketEvents(ctx context.Context, sessionId int, projectId int) ([]interface{}, error)
	readSourceMapFile(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error)
	ReadSourceMapFileCached(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error)
	ReadTimelineIndicatorEvents(ctx context.Context, sessionId int, projectId int) ([]*model.TimelineIndicatorEvent, error)
	UploadAsset(ctx context.Context, uuid string, contentType string, reader io.Reader, retentionPeriod privateModel.RetentionPeriod) error
	ReadGitHubFile(ctx context.Context, repoPath string, fileName string, version string) ([]byte, error)
	PushGitHubFile(ctx context.Context, repoPath string, fileName string, version string, fileBytes []byte) (*int64, error)
	DeleteSessionData(ctx context.Context, projectId int, sessionId int) error
	CleanupRawEvents(ctx context.Context, projectId int) error
}

type FilesystemClient struct {
	origin string
	fsRoot string
	redis  *hredis.Client
}

func (f *FilesystemClient) GetDirectDownloadURL(_ context.Context, projectId int, sessionId int, payloadType PayloadType, chunkId *int) (*string, error) {
	key := fmt.Sprintf("/direct/%d/%d/%v", projectId, sessionId, payloadType)
	if chunkId != nil {
		key = fmt.Sprintf("%s-%04d", key, *chunkId)
	}
	key = fmt.Sprintf("%s%s", f.origin, key)
	return &key, nil
}

func (f *FilesystemClient) GetRawData(ctx context.Context, sessionId, projectId int, payloadType model.RawPayloadType) (map[int]string, error) {
	prefix := fmt.Sprintf("%s/raw-events/%d/%d", f.fsRoot, projectId, sessionId)
	dir, err := os.ReadDir(prefix)
	if err != nil {
		return make(map[int]string), nil
	}
	objects := lo.Filter(lo.Map(dir, func(t os.DirEntry, i int) string {
		return t.Name()
	}), func(s string, i int) bool {
		return strings.HasPrefix(s, string(payloadType))
	})

	results := make([][]redis.Z, len(objects))
	var errs = make(chan error, len(objects))
	var wg sync.WaitGroup
	for i, o := range objects {
		wg.Add(1)
		go func(idx int, object string) {
			defer wg.Done()
			var result []redis.Z
			buf, err := f.readFSBytes(ctx, fmt.Sprintf("%s/%s", prefix, object))
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
		}(i, o)
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

func (f *FilesystemClient) GetSourceMapUploadUrl(_ context.Context, key string) (string, error) {
	return fmt.Sprintf("%s/sourcemap-upload/%s", f.origin, key), nil
}

func (f *FilesystemClient) GetSourcemapFiles(_ context.Context, projectId int, version *string) ([]s3Types.Object, error) {
	if version == nil || len(*version) == 0 {
		// If no version is specified we put files in an "unversioned" directory.
		version = pointy.String("unversioned")
	}

	dir, err := os.ReadDir(fmt.Sprintf("%s/sourcemaps/%d/%s", f.fsRoot, projectId, *version))
	if err != nil {
		return nil, nil
	}
	return lo.Map(dir, func(t os.DirEntry, i int) s3Types.Object {
		return s3Types.Object{
			Key: pointy.String(t.Name()),
		}
	}), nil
}

func (f *FilesystemClient) GetSourcemapVersions(_ context.Context, projectId int) ([]string, error) {
	dir, err := os.ReadDir(fmt.Sprintf("%s/sourcemaps/%d", f.fsRoot, projectId))
	if err != nil {
		return nil, nil
	}
	return lo.Map(dir, func(t os.DirEntry, i int) string {
		return t.Name()
	}), nil
}

func (f *FilesystemClient) PushCompressedFile(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType, retentionPeriod privateModel.RetentionPeriod) (*int64, error) {
	_, err := file.Seek(0, io.SeekStart)
	if err != nil {
		return nil, errors.Wrap(err, "error seeking to beginning of file")
	}
	key := fmt.Sprintf("%s/%d/%d/%v", f.fsRoot, projectId, sessionId, payloadType)
	size, err := f.writeFSBytes(ctx, key, file)
	return &size, err
}

func (f *FilesystemClient) PushFiles(ctx context.Context, sessionId, projectId int, payloadManager *payload.PayloadManager, retentionPeriod privateModel.RetentionPeriod) (int64, error) {
	var totalSize int64
	for fileType, payloadType := range StoredPayloadTypes {
		file := payloadManager.GetFile(fileType)
		_, err := file.Seek(0, io.SeekStart)
		if err != nil {
			return 0, errors.Wrap(err, "error seeking to beginning of file")
		}
		size, err := f.PushCompressedFile(ctx, sessionId, projectId, file, payloadType, retentionPeriod)

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

	key := fmt.Sprintf("%s/raw-events/%d/%d/%v-%s", f.fsRoot, projectId, sessionId, payloadType, uuid.New().String())
	_, err := f.writeFSBytes(ctx, key, buf)
	return err
}

func (f *FilesystemClient) PushSourceMapFile(ctx context.Context, projectId int, version *string, fileName string, fileBytes []byte) (*int64, error) {
	span, ctx := util.StartSpanFromContext(ctx, "fs.PushSourceMapFile")
	defer span.Finish()

	if version == nil {
		unversioned := "unversioned"
		version = &unversioned
	}

	buf := bytes.NewBuffer(fileBytes)
	if n, err := f.writeFSBytes(ctx, fmt.Sprintf("%s/%d/%s/%s", f.fsRoot, projectId, *version, fileName), buf); err != nil {
		return pointy.Int64(0), err
	} else {
		return &n, nil
	}
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

func (f *FilesystemClient) ReadWebSocketEvents(ctx context.Context, sessionId int, projectId int) ([]interface{}, error) {
	var webSocketEvents []interface{}
	err := f.readCompressed(ctx, sessionId, projectId, WebSocketEventsCompressed, &webSocketEvents)
	if err != nil {
		return nil, err
	}
	return webSocketEvents, nil
}

func (f *FilesystemClient) getSourceMapKey(projectId int, version *string, fileName string) string {
	if version == nil {
		unversioned := "unversioned"
		version = &unversioned
	}
	return fmt.Sprintf("%s/%d/%s/%s", f.fsRoot, projectId, *version, fileName)
}

func (f *FilesystemClient) readSourceMapFile(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error) {
	span, ctx := util.StartSpanFromContext(ctx, "fs.ReadSourceMapFile")
	defer span.Finish()
	key := f.getSourceMapKey(projectId, version, fileName)
	span.SetAttribute("key", key)
	if b, err := f.readFSBytes(ctx, key); err == nil {
		return b.Bytes(), nil
	} else {
		return nil, err
	}
}

func (f *FilesystemClient) ReadSourceMapFileCached(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error) {
	span, ctx := util.StartSpanFromContext(ctx, "fs.ReadSourceMapFileCached")
	defer span.Finish()
	key := f.getSourceMapKey(projectId, version, fileName)
	span.SetAttribute("key", key)
	b, err := hredis.CachedEval(ctx, f.redis, key, time.Second, time.Minute, func() (*[]byte, error) {
		bt, err := f.readSourceMapFile(ctx, projectId, version, fileName)
		return &bt, err
	}, hredis.WithStoreNil(true), hredis.WithIgnoreError(true))

	if b == nil || err != nil {
		return nil, err
	}
	return *b, nil
}

func (f *FilesystemClient) GetAssetURL(_ context.Context, projectId string, hashVal string) (string, error) {
	return fmt.Sprintf("%s/direct/assets/%s/%s", f.origin, projectId, hashVal), nil
}

func (f *FilesystemClient) UploadAsset(ctx context.Context, uuid, _ string, reader io.Reader, retentionPeriod privateModel.RetentionPeriod) error {
	_, err := f.writeFSBytes(ctx, fmt.Sprintf("%s/assets/%s", f.fsRoot, uuid), reader)
	return err
}

func (f *FilesystemClient) readCompressed(ctx context.Context, sessionId int, projectId int, t PayloadType, results interface{}) error {
	key := fmt.Sprintf("%s/%v/%v/%v", f.fsRoot, projectId, sessionId, t)
	if _, err := os.Stat(key); err != nil {
		log.WithContext(ctx).Warnf("file %s does not exist", key)
		return nil
	}

	buf, err := f.readFSBytes(ctx, key)
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

func (f *FilesystemClient) handleUploadSourcemap(ctx context.Context, key string, body io.Reader) error {
	parts := strings.Split(key, "/")
	projectID := parts[0]
	version := parts[1]
	file := parts[2]
	_, err := f.writeFSBytes(ctx, fmt.Sprintf("%s/sourcemaps/%s/%s/%s", f.fsRoot, projectID, version, file), body)
	return err
}

func (f *FilesystemClient) ReadGitHubFile(ctx context.Context, repoPath string, fileName string, version string) ([]byte, error) {
	if b, err := f.readFSBytes(ctx, fmt.Sprintf("%s/%s/%s/%s", f.fsRoot, repoPath, version, fileName)); err == nil {
		return b.Bytes(), nil
	} else {
		return nil, err
	}
}

func (f *FilesystemClient) PushGitHubFile(ctx context.Context, repoPath string, fileName string, version string, fileBytes []byte) (*int64, error) {
	body := bytes.NewReader(fileBytes)
	if n, err := f.writeFSBytes(ctx, fmt.Sprintf("%s/%s/%s/%s", f.fsRoot, repoPath, version, fileName), body); err != nil {
		return pointy.Int64(0), err
	} else {
		return &n, nil
	}
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

func (f *FilesystemClient) SetupHTTPSListener(r chi.Router) {
	r.Use(cors.New(cors.Options{
		AllowCredentials: true,
		AllowedOrigins:   []string{f.origin},
		AllowedHeaders:   []string{"*"},
	}).Handler)

	serveAsset := func(w http.ResponseWriter, r *http.Request) {
		projectId := chi.URLParam(r, "project-id")
		hashVal := chi.URLParam(r, "hash-val")
		fp := fmt.Sprintf("%s/assets/%s/%s", f.fsRoot, projectId, hashVal)
		http.ServeFile(w, r, fp)
	}
	r.Head("/direct/assets/{project-id}/{hash-val}", serveAsset)
	r.Get("/direct/assets/{project-id}/{hash-val}", serveAsset)
	servePayload := func(w http.ResponseWriter, r *http.Request) {
		projectId := chi.URLParam(r, "project-id")
		sessionId := chi.URLParam(r, "session-id")
		payloadType := chi.URLParam(r, "payload-type")
		fp := fmt.Sprintf("%s/%s/%s/%v", f.fsRoot, projectId, sessionId, payloadType)
		stat, err := os.Stat(fp)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		w.Header().Add("Content-Type", MIME_TYPE_JSON)
		w.Header().Add("Content-Encoding", CONTENT_ENCODING_BROTLI)
		w.Header().Add("Content-Length", strconv.FormatInt(stat.Size(), 10))
		http.ServeFile(w, r, fp)
	}
	r.Head("/direct/{project-id}/{session-id}/{payload-type}", servePayload)
	r.Get("/direct/{project-id}/{session-id}/{payload-type}", servePayload)
	r.Put("/sourcemap-upload/{key}", func(w http.ResponseWriter, r *http.Request) {
		key := chi.URLParam(r, "key")
		if err := f.handleUploadSourcemap(r.Context(), key, r.Body); err != nil {
			http.Error(w, fmt.Sprintf("failed to upload sourcemap: %s", err), http.StatusBadRequest)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	})
}

func (f *FilesystemClient) DeleteSessionData(ctx context.Context, projectId int, sessionId int) error {
	if f.fsRoot == "" {
		return errors.New("f.fsRoot cannot be empty")
	}
	if err := os.RemoveAll(fmt.Sprintf("%s/%d/%d", f.fsRoot, projectId, sessionId)); err != nil {
		return err
	}
	if err := os.RemoveAll(fmt.Sprintf("%s/raw-events/%d/%d", f.fsRoot, projectId, sessionId)); err != nil {
		return err
	}
	return nil
}

func (s *S3Client) DeleteSessionData(ctx context.Context, projectId int, sessionId int) error {
	client, bucket := s.getSessionClientAndBucket(sessionId)

	versionPart := "v2/"
	devStr := ""
	if env.IsDevOrTestEnv() {
		devStr = "dev/"
	}

	prefix := fmt.Sprintf("%s%s%d/%d/", versionPart, devStr, projectId, sessionId)
	options := s3.ListObjectsV2Input{
		Bucket: bucket,
		Prefix: &prefix,
	}
	output, err := client.ListObjectsV2(ctx, &options)
	if err != nil {
		return errors.Wrap(err, "error listing objects in S3")
	}

	for _, object := range output.Contents {
		options := s3.DeleteObjectInput{
			Bucket: bucket,
			Key:    object.Key,
		}
		_, err := client.DeleteObject(ctx, &options)
		if err != nil {
			return errors.Wrap(err, "error deleting objects from S3")
		}
	}

	return nil
}

func (f *FilesystemClient) CleanupRawEvents(ctx context.Context, projectId int) error {
	if f.fsRoot == "" {
		return errors.New("f.fsRoot cannot be empty")
	}

	basePath := fmt.Sprintf("%s/raw-events/%d", f.fsRoot, projectId)
	startDate := time.Now().AddDate(0, 0, -1*RAW_EVENT_RETENTION_DAYS)
	entries, err := os.ReadDir(basePath)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		fileInfo, err := entry.Info()
		if err != nil {
			return err
		}
		if fileInfo.ModTime().Before(startDate) {
			os.RemoveAll(path.Join(basePath, entry.Name()))
		}
	}

	return nil
}

func (f *S3Client) CleanupRawEvents(ctx context.Context, projectId int) error {
	return nil
}

func NewFSClient(_ context.Context, origin, fsRoot string) (*FilesystemClient, error) {
	return &FilesystemClient{origin: origin, fsRoot: fsRoot, redis: hredis.NewClient()}, nil
}

type S3Client struct {
	S3ClientEast2   *s3.Client
	S3PresignClient *s3.PresignClient
	URLSigner       *sign.URLSigner
	Redis           *hredis.Client
}

func NewS3Client(ctx context.Context) (*S3Client, error) {
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

	// Create Amazon S3 API client using path style addressing.
	stsClient := sts.NewFromConfig(cfgEast2, func(o *sts.Options) {})
	_, err = stsClient.GetCallerIdentity(ctx, &sts.GetCallerIdentityInput{})
	if err != nil {
		return nil, errors.Wrap(err, "failed to validate aws credentials for storage client")
	}

	return &S3Client{
		S3ClientEast2:   clientEast2,
		S3PresignClient: s3.NewPresignClient(clientEast2),
		URLSigner:       getURLSigner(ctx),
		Redis:           hredis.NewClient(),
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
	client := s.S3ClientEast2
	bucket := pointy.String(S3SessionsPayloadBucketNameNew)

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

	return result.ContentLength, nil
}

// PushCompressedFile pushes a compressed file to S3, adding the relevant metadata
func (s *S3Client) PushCompressedFile(ctx context.Context, sessionId, projectId int, file *os.File, payloadType PayloadType, retentionPeriod privateModel.RetentionPeriod) (*int64, error) {
	options := s3.PutObjectInput{
		ContentType:     ptr.String(MIME_TYPE_JSON),
		ContentEncoding: ptr.String(CONTENT_ENCODING_BROTLI),
		Tagging:         pointy.String(fmt.Sprintf("RetentionPeriod=%s", retentionPeriod)),
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

func (s *S3Client) PushFiles(ctx context.Context, sessionId, projectId int, payloadManager *payload.PayloadManager, retentionPeriod privateModel.RetentionPeriod) (int64, error) {
	var totalSize int64
	for fileType, payloadType := range StoredPayloadTypes {
		size, err := s.PushCompressedFile(ctx, sessionId, projectId, payloadManager.GetFile(fileType), payloadType, retentionPeriod)

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
		ResponseContentType:     ptr.String(MIME_TYPE_JSON),
		ResponseContentEncoding: ptr.String(CONTENT_ENCODING_BROTLI),
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

func (s *S3Client) ReadWebSocketEvents(ctx context.Context, sessionId int, projectId int) ([]interface{}, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)
	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket:                  bucket,
		Key:                     bucketKey(sessionId, projectId, WebSocketEventsCompressed),
		ResponseContentType:     ptr.String(MIME_TYPE_JSON),
		ResponseContentEncoding: ptr.String(CONTENT_ENCODING_BROTLI),
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

	var webSocketEvents []interface{}
	if err := json.Unmarshal(buf.Bytes(), &webSocketEvents); err != nil {
		return nil, errors.Wrap(err, "error decoding web socket event data")
	}
	return webSocketEvents, nil
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

func (s *S3Client) ReadTimelineIndicatorEvents(ctx context.Context, sessionId int, projectId int) ([]*model.TimelineIndicatorEvent, error) {
	client, bucket := s.getSessionClientAndBucket(sessionId)

	var events []*model.TimelineIndicatorEvent
	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket:                  bucket,
		Key:                     bucketKey(sessionId, projectId, TimelineIndicatorEvents),
		ResponseContentType:     ptr.String(MIME_TYPE_JSON),
		ResponseContentEncoding: ptr.String(CONTENT_ENCODING_BROTLI),
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
	if env.IsDevEnv() {
		return pointy.String(fmt.Sprintf("%sdev/%v/%v/%v", versionPart, projectId, sessionId, key))
	}
	return pointy.String(fmt.Sprintf("%s%v/%v/%v", versionPart, projectId, sessionId, key))
}

func (s *S3Client) sourceMapBucketKey(projectId int, version *string, fileName string) *string {
	var key string
	if env.IsDevEnv() {
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
	return result.ContentLength, nil
}

func (s *S3Client) PushSourceMapFile(ctx context.Context, projectId int, version *string, fileName string, fileBytes []byte) (*int64, error) {
	span, ctx := util.StartSpanFromContext(ctx, "s3.PushSourceMapFile")
	defer span.Finish()

	body := bytes.NewReader(fileBytes)
	return s.PushSourceMapFileReaderToS3(ctx, projectId, version, fileName, body)
}

func (s *S3Client) readSourceMapFile(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error) {
	span, ctx := util.StartSpanFromContext(ctx, "s3.ReadSourceMapFile")
	defer span.Finish()
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

func (s *S3Client) ReadSourceMapFileCached(ctx context.Context, projectId int, version *string, fileName string) ([]byte, error) {
	span, ctx := util.StartSpanFromContext(ctx, "s3.ReadSourceMapFileCached")
	defer span.Finish()
	key := s.sourceMapBucketKey(projectId, version, fileName)
	span.SetAttribute("key", key)
	b, err := hredis.CachedEval(ctx, s.Redis, *key, time.Second, time.Minute, func() (*[]byte, error) {
		bt, err := s.readSourceMapFile(ctx, projectId, version, fileName)
		return &bt, err
	}, hredis.WithStoreNil(true), hredis.WithIgnoreError(true))

	if b == nil || err != nil {
		return nil, err
	}
	return *b, nil
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

func (s *S3Client) UploadAsset(ctx context.Context, uuid string, contentType string, reader io.Reader, retentionPeriod privateModel.RetentionPeriod) error {
	_, err := s.S3ClientEast2.PutObject(ctx, &s3.PutObjectInput{
		Bucket: pointy.String(S3ResourcesBucketName),
		Key:    pointy.String(uuid),
		Body:   reader,
		Metadata: map[string]string{
			"Content-Type": contentType,
		},
		ContentType: pointy.String(contentType),
		Tagging:     pointy.String(fmt.Sprintf("RetentionPeriod=%s", retentionPeriod)),
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

func (s *S3Client) GetSourcemapVersions(ctx context.Context, projectId int) ([]string, error) {
	output, err := s.S3ClientEast2.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket:    pointy.String(S3SourceMapBucketNameNew),
		Prefix:    pointy.String(fmt.Sprintf("%d/", projectId)),
		Delimiter: pointy.String("/"),
	})

	if err != nil {
		return nil, errors.Wrap(err, "error getting sourcemap app versions from s3")
	}

	return lo.Map(output.CommonPrefixes, func(t s3Types.CommonPrefix, i int) string {
		return *t.Prefix
	}), nil
}

func (s *S3Client) githubBucketKey(repoPath string, version string, fileName string) *string {
	var key string
	if env.IsDevEnv() {
		key = "dev/"
	}
	key += fmt.Sprintf("%s/%s/%s", repoPath, version, fileName)
	return pointy.String(key)
}

func (s *S3Client) ReadGitHubFile(ctx context.Context, repoPath string, fileName string, version string) ([]byte, error) {
	output, err := s.S3ClientEast2.GetObject(ctx, &s3.GetObjectInput{Bucket: pointy.String(S3GithubBucketName),
		Key: s.githubBucketKey(repoPath, version, fileName)})
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

func (s *S3Client) PushGitHubFileReaderToS3(ctx context.Context, repoPath string, fileName string, version string, file io.Reader) (*int64, error) {
	key := s.githubBucketKey(repoPath, version, fileName)
	_, err := s.S3ClientEast2.PutObject(ctx, &s3.PutObjectInput{
		Bucket: pointy.String(S3GithubBucketName), Key: key, Body: file,
	})
	if err != nil {
		return nil, errors.Wrap(err, "error 'put'ing github file in s3 bucket")
	}
	headObj := s3.HeadObjectInput{
		Bucket: pointy.String(S3SourceMapBucketNameNew),
		Key:    key,
	}
	result, err := s.S3ClientEast2.HeadObject(ctx, &headObj)
	if err != nil {
		return nil, errors.New("error retrieving head object")
	}
	return result.ContentLength, nil
}

func (s *S3Client) PushGitHubFile(ctx context.Context, repoPath string, fileName string, version string, fileBytes []byte) (*int64, error) {
	body := bytes.NewReader(fileBytes)
	return s.PushGitHubFileReaderToS3(ctx, repoPath, fileName, version, body)
}
