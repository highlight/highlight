package stacktraces

import (
	"context"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"regexp"
	"strings"

	"github.com/go-sourcemap/sourcemap"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModel "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/storage"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
)

const ERROR_CONTEXT_LINES = 5
const ERROR_CONTEXT_MAX_LENGTH = 1000
const ERROR_STACK_MAX_FRAME_COUNT = 32
const ERROR_STACK_MAX_FIELD_SIZE = 1000
const SOURCE_MAP_MAX_FILE_SIZE = 128e6

type fetcher interface {
	fetchFile(context.Context, string) ([]byte, error)
}

func init() {
	if util.IsTestEnv() {
		fetch = DiskFetcher{}
	} else if util.IsDevEnv() {
		customTransport := http.DefaultTransport.(*http.Transport).Clone()
		customTransport.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
		client := &http.Client{Transport: customTransport}
		fetch = NetworkFetcher{client: client}
	} else {
		fetch = NetworkFetcher{}
	}
}

var fetch fetcher

type DiskFetcher struct{}

func (n DiskFetcher) fetchFile(_ context.Context, href string) ([]byte, error) {
	inputBytes, err := os.ReadFile(href)
	if err != nil {
		return nil, e.Wrap(err, "error fetching file from disk")
	}
	return inputBytes, nil
}

type NetworkFetcher struct {
	client *http.Client
}

func (n NetworkFetcher) fetchFile(ctx context.Context, href string) ([]byte, error) {
	// check if source is a URL
	_, err := url.ParseRequestURI(href)
	if err != nil {
		return nil, err
	}
	// get minified file
	if n.client == nil {
		n.client = http.DefaultClient
	}
	res, err := n.client.Get(href)
	if err != nil {
		return nil, e.Wrap(err, "error getting source file")
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.WithContext(ctx).Errorf("failed to close network reader %+v", err)
		}
	}(res.Body)
	if res.StatusCode != http.StatusOK {
		return nil, e.New("status code not OK")
	}

	// unpack file into slice
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, e.Wrap(err, "error reading response body")
	}

	return bodyBytes, nil
}

func limitMaxSize(value *string) *string {
	if value == nil {
		return nil
	}

	if len(*value) <= ERROR_STACK_MAX_FIELD_SIZE {
		return value
	}

	return pointy.String(strings.Repeat((*value)[:ERROR_STACK_MAX_FIELD_SIZE], 1))
}

/*
* EnhanceStackTrace makes no DB changes
* It loops through the stack trace, for each :
* fetches the sourcemap from remote
* maps the error info into slice
 */
func EnhanceStackTrace(ctx context.Context, input []*publicModel.StackFrameInput, projectId int, version *string, storageClient storage.Client) ([]*privateModel.ErrorTrace, error) {
	if input == nil {
		return nil, e.New("stack trace input cannot be nil")
	}

	var mappedStackTrace []*privateModel.ErrorTrace
	for idx, stackFrame := range input {
		if idx >= ERROR_STACK_MAX_FRAME_COUNT {
			break
		}
		if stackFrame == nil || (stackFrame.FileName == nil || len(*stackFrame.FileName) < 1 || stackFrame.LineNumber == nil || stackFrame.ColumnNumber == nil) {
			continue
		}
		mappedStackFrame, err, errMetadata := processStackFrame(ctx, projectId, version, *stackFrame, storageClient)
		if err != nil {
			if util.IsDevOrTestEnv() {
				log.WithContext(ctx).Error(err)
			}
			mappedStackFrame = &privateModel.ErrorTrace{
				FileName:                   limitMaxSize(stackFrame.FileName),
				LineNumber:                 stackFrame.LineNumber,
				FunctionName:               limitMaxSize(stackFrame.FunctionName),
				ColumnNumber:               stackFrame.ColumnNumber,
				Error:                      pointy.String(err.Error()),
				SourceMappingErrorMetadata: &errMetadata,
			}
		}
		if mappedStackFrame != nil {
			mappedStackTrace = append(mappedStackTrace, mappedStackFrame)
		}
	}
	return mappedStackTrace, nil
}

func getFileSourcemap(ctx context.Context, projectId int, version *string, stackTraceFileURL string, storageClient storage.Client, stackTraceError *privateModel.SourceMappingError) (sourceMapURL string, sourceMapFileBytes []byte, err error) {
	pathSubpath := fmt.Sprintf("%s.map", stackTraceFileURL)
	sourcemapFetchStrategy := "S3"
	stackTraceError.SourcemapFetchStrategy = &sourcemapFetchStrategy
	for sourceMapFileBytes == nil {
		sourceMapFileBytes, err = storageClient.ReadSourceMapFile(ctx, projectId, version, pathSubpath)
		if err != nil {
			if pathSubpath == "" {
				// SOURCEMAP_ERROR: could not find source map file in s3
				// (user-facing error message can include all the paths searched)
				stackTraceErrorCode := privateModel.SourceMappingErrorCodeMissingSourceMapFileInS3
				stackTraceError.ErrorCode = &stackTraceErrorCode
				return "", nil, e.Wrapf(err, "failed to match file-scheme sourcemap for js file %s", stackTraceFileURL)
			}
			pathSubpath = strings.Join(strings.Split(pathSubpath, "/")[1:], "/")
		} else {
			sourceMapURL = pathSubpath
			break
		}
	}
	return
}

func getURLSourcemap(ctx context.Context, projectId int, version *string, stackTraceFileURL string, stackTraceFilePath string, stackFileNameIndex int, storageClient storage.Client, stackTraceError *privateModel.SourceMappingError) (string, []byte, error) {
	// try to get file from s3
	minifiedFileBytes, err := storageClient.ReadSourceMapFile(ctx, projectId, version, stackTraceFilePath)
	minifiedFetchStrategy := "S3"
	var stackTraceErrorCode privateModel.SourceMappingErrorCode
	stackTraceError.MinifiedFetchStrategy = &minifiedFetchStrategy
	stackTraceError.ActualMinifiedFetchedPath = &stackTraceFilePath

	if err != nil {
		// if not in s3, get from url and put in s3
		minifiedFileBytes, err = fetch.fetchFile(ctx, stackTraceFileURL)
		minifiedFetchStrategy = "URL"
		stackTraceError.MinifiedFetchStrategy = &minifiedFetchStrategy
		if err != nil {
			// fallback if we can't get the source file at all
			// SOURCEMAP_ERROR: minified file does not exist in S3 and could not be found at the URL
			// (user-facing error message can include the S3 path and URL that was searched)
			stackTraceErrorCode = privateModel.SourceMappingErrorCodeMinifiedFileMissingInS3AndURL
			stackTraceError.ErrorCode = &stackTraceErrorCode
			minifiedFetchStrategy = "S3 and URL"
			stackTraceError.MinifiedFetchStrategy = &minifiedFetchStrategy
			err := e.Wrapf(err, "error fetching file: %v", stackTraceFileURL)
			return "", nil, err
		}
		_, err = storageClient.PushSourceMapFile(ctx, projectId, version, stackTraceFilePath, minifiedFileBytes)
		if err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error pushing file to s3: %v", stackTraceFilePath))
		}
	}
	minifiedFileSize := len(minifiedFileBytes)
	stackTraceError.MinifiedFileSize = &minifiedFileSize
	if minifiedFileSize > SOURCE_MAP_MAX_FILE_SIZE {
		// SOURCEMAP_ERROR: minified file larger than 128MB
		// (user-facing error message  should include actual size)
		stackTraceErrorCode = privateModel.SourceMappingErrorCodeMinifiedFileLarger
		stackTraceError.ErrorCode = &stackTraceErrorCode
		err := e.Errorf("minified source file over %dmb: %v, size: %v", int(SOURCE_MAP_MAX_FILE_SIZE/1e6), stackTraceFileURL, minifiedFileSize)
		return "", nil, err
	}

	sourceMapFileName := string(regexp.MustCompile(`(?m)^//# sourceMappingURL=(.*)$`).Find(minifiedFileBytes))
	if len(sourceMapFileName) < 1 {
		sourceMapFileName = fmt.Sprintf("%s.map", path.Base(stackTraceFileURL))
	} else {
		sourceMapFileName = strings.Replace(sourceMapFileName, "//# sourceMappingURL=", "", 1)
	}

	var sourceMapURL string
	var sourceMapFileBytes []byte
	// process an inlined sourcemap
	if strings.HasPrefix(sourceMapFileName, "data:application/json;base64,") {
		stackTraceError.SourcemapFetchStrategy = pointy.String("Inlined")
		sourceMapURL = sourceMapFileName
		stackTraceError.SourceMapURL = &sourceMapURL
		sourceMapFileName = strings.Replace(sourceMapFileName, "data:application/json;base64,", "", 1)
		sourceMapFileBytes, err = base64.StdEncoding.DecodeString(sourceMapFileName)
		if err != nil {
			stackTraceErrorCode = privateModel.SourceMappingErrorCodeInvalidSourceMapURL
			stackTraceError.ErrorCode = &stackTraceErrorCode
			return "", nil, e.Errorf("error parsing inline source map: %s", err.Error())
		}
	} else {
		// construct sourcemap url from searched file
		sourceMapURL = (stackTraceFileURL)[:stackFileNameIndex] + sourceMapFileName
		// get path from url
		u2, err := url.Parse(sourceMapURL)
		stackTraceError.SourceMapURL = &sourceMapURL
		stackTraceError.ActualSourcemapFetchedPath = &u2.Path
		if err != nil {
			if len(sourceMapURL) > 500 {
				sourceMapURL = sourceMapURL[:500]
			}
			// SOURCEMAP_ERROR: sourceMapURL is not a valid URL
			// (might be good to include the sourceMapURL in the user-facing error message)
			stackTraceErrorCode = privateModel.SourceMappingErrorCodeInvalidSourceMapURL
			stackTraceError.ErrorCode = &stackTraceErrorCode
			err := e.Errorf("error parsing source map url: %s", sourceMapURL)
			return "", nil, err
		}
		sourceMapFilePath := u2.Path
		if len(sourceMapFilePath) > 1 && sourceMapFilePath[0:1] == "/" {
			sourceMapFilePath = sourceMapFilePath[1:]
		}
		stackTraceError.ActualSourcemapFetchedPath = &sourceMapFilePath

		// fetch source map file
		// try to get file from s3
		sourceMapFileBytes, err = storageClient.ReadSourceMapFile(ctx, projectId, version, sourceMapFilePath)
		sourcemapFetchStrategy := "S3"
		stackTraceError.SourcemapFetchStrategy = &sourcemapFetchStrategy
		if err != nil {
			// if not in s3, get from url and put in s3
			sourceMapFileBytes, err = fetch.fetchFile(ctx, sourceMapURL)
			sourcemapFetchStrategy = "URL"
			stackTraceError.SourcemapFetchStrategy = &sourcemapFetchStrategy
			if err != nil {
				// fallback if we can't get the source file at all
				// SOURCEMAP_ERROR: source map file does not exist in S3 and could not be found at the URL
				// (user-facing error message can include the S3 path and URL that was searched)
				stackTraceErrorCode = privateModel.SourceMappingErrorCodeSourcemapFileMissingInS3AndURL
				stackTraceError.ErrorCode = &stackTraceErrorCode
				sourcemapFetchStrategy = "S3 and URL"
				stackTraceError.SourcemapFetchStrategy = &sourcemapFetchStrategy
				err := e.Wrapf(err, "error fetching source map file: %v", sourceMapURL)
				return "", nil, err
			}
			smap, err := sourcemap.Parse(sourceMapURL, sourceMapFileBytes)
			if err != nil || smap == nil {
				// what we expected to be a source map is not. don't store it in s3
				// SOURCEMAP_ERROR: sourcemap library could not parse the source map file
				// (user-facing error message can include sourceMapURL)
				stackTraceErrorCode = privateModel.SourceMappingErrorCodeSourcemapLibraryCouldntParse
				stackTraceError.ErrorCode = &stackTraceErrorCode
				err := e.Wrapf(err, "error parsing fetched source map: %v - %v, %v", sourceMapURL, smap, err)
				return "", nil, err
			}
			_, err = storageClient.PushSourceMapFile(ctx, projectId, version, sourceMapFilePath, sourceMapFileBytes)
			if err != nil {
				log.WithContext(ctx).Error(e.Wrapf(err, "error pushing file to s3: %v", sourceMapFileName))
			}
		}
	}
	return sourceMapURL, sourceMapFileBytes, nil
}

func processStackFrame(ctx context.Context, projectId int, version *string, stackTrace publicModel.StackFrameInput, storageClient storage.Client) (*privateModel.ErrorTrace, error, privateModel.SourceMappingError) {
	stackTraceFileURL := *stackTrace.FileName
	stackTraceLineNumber := *stackTrace.LineNumber
	stackTraceColumnNumber := *stackTrace.ColumnNumber
	var stackTraceError privateModel.SourceMappingError
	var stackTraceErrorCode privateModel.SourceMappingErrorCode

	// get file name index from URL
	stackFileNameIndex := strings.Index(stackTraceFileURL, path.Base(stackTraceFileURL))
	stackTraceError.StackTraceFileURL = &stackTraceFileURL
	if stackFileNameIndex == -1 {
		// SOURCEMAP_ERROR: path.Base returns the last element of a path
		// (e.g. foo.com/bar/example.js would return example.js)
		// This case is likely happening when the path is empty.
		// (might be good to include the stackTraceFileURL in the user-facing error message)
		stackTraceErrorCode = privateModel.SourceMappingErrorCodeFileNameMissingFromSourcePath
		stackTraceError.ErrorCode = &stackTraceErrorCode
		err := e.Errorf("source path doesn't contain file name: %v", stackTraceFileURL)
		return nil, err, stackTraceError
	}

	// get path from url
	u, err := url.Parse(stackTraceFileURL)
	if err != nil {
		// SOURCEMAP_ERROR: stackTraceFileURL is not a valid URL
		// (might be good to include the stackTraceFileURL in the user-facing error message)
		stackTraceErrorCode = privateModel.SourceMappingErrorCodeErrorParsingStackTraceFileURL
		stackTraceError.ErrorCode = &stackTraceErrorCode
		err := e.Wrapf(err, "error parsing stack trace file url: %v", stackTraceFileURL)
		return nil, err, stackTraceError
	}
	stackTraceFilePath := u.Path
	if len(stackTraceFilePath) > 0 && stackTraceFilePath[0:1] == "/" {
		stackTraceFilePath = stackTraceFilePath[1:]
	}
	// remove a query string in the url, eg main.js?foo=bar -> main.js
	queryStringIndex := strings.Index(stackTraceFileURL, "?")
	if queryStringIndex != -1 {
		stackTraceFileURL = stackTraceFileURL[:queryStringIndex]
	}
	var sourceMapURL string
	var sourceMapFileBytes []byte
	if u.Scheme == "file" {
		// if this is an electron file reference, treat it as a path so we can match a subdirectory
		sourceMapURL, sourceMapFileBytes, err = getFileSourcemap(ctx, projectId, version, u.Path, storageClient, &stackTraceError)
		if err != nil {
			return nil, err, stackTraceError
		}
	} else {
		sourceMapURL, sourceMapFileBytes, err = getURLSourcemap(ctx, projectId, version, stackTraceFileURL, stackTraceFilePath, stackFileNameIndex, storageClient, &stackTraceError)
		if err != nil {
			return nil, err, stackTraceError
		}
	}
	sourceMapFileSize := len(sourceMapFileBytes)
	stackTraceError.SourcemapFileSize = &sourceMapFileSize
	if sourceMapFileSize > SOURCE_MAP_MAX_FILE_SIZE {
		// SOURCEMAP_ERROR: source map file larger than our max supported size (128MB)
		// (might be good to include actual size in the user-facing error message)
		stackTraceErrorCode = privateModel.SourceMappingErrorCodeSourceMapFileLarger
		stackTraceError.ErrorCode = &stackTraceErrorCode
		err := e.Errorf("source map file over %dmb: %v, size: %v", int(SOURCE_MAP_MAX_FILE_SIZE/1e6), stackTraceFilePath, sourceMapFileSize)
		return nil, err, stackTraceError
	}
	smap, err := sourcemap.Parse(sourceMapURL, sourceMapFileBytes)
	if err != nil {
		// SOURCEMAP_ERROR: the sourcemap library couldn't parse
		// the source map with the input URL and file content
		// (might be good to include sourceMapURL in the user-facing error message)
		stackTraceErrorCode = privateModel.SourceMappingErrorCodeSourcemapLibraryCouldntParse
		stackTraceError.ErrorCode = &stackTraceErrorCode
		err := e.Wrapf(err, "error parsing source map file -> %v", sourceMapURL)
		return nil, err, stackTraceError
	}

	sourceFileName, fn, line, col, ok := smap.Source(stackTraceLineNumber, stackTraceColumnNumber)
	stackTraceError.MappedLineNumber = &stackTraceLineNumber
	stackTraceError.MappedColumnNumber = &stackTraceColumnNumber
	if !ok {
		// SOURCEMAP_ERROR: the sourcemap library couldn't retrieve the original source
		// with the input line and column number
		// (might be good to include line and column number in the user-facing error message)
		stackTraceErrorCode = privateModel.SourceMappingErrorCodeSourcemapLibraryCouldntRetrieveSource
		stackTraceError.ErrorCode = &stackTraceErrorCode
		err := e.Errorf("error extracting true error info from source map: %v", sourceMapURL)
		return nil, err, stackTraceError
	}

	var lineContentPtr *string
	var linesBeforePtr *string
	var linesAfterPtr *string

	// Get the content +/- ERROR_CONTEXT_LINES around the error line
	content := smap.SourceContent(sourceFileName)
	if content != "" {
		lineIdx := line - 1
		var beforeSb strings.Builder
		var lineSb strings.Builder
		var afterSb strings.Builder
		var curSb *strings.Builder
		if lineIdx > 0 {
			curSb = &beforeSb
		} else if lineIdx == 0 {
			curSb = &lineSb
		} else {
			curSb = &afterSb
		}
		for _, c := range content {
			if lineIdx <= ERROR_CONTEXT_LINES {
				curSb.WriteRune(c)
			}
			if c == '\n' {
				lineIdx -= 1
				if lineIdx < -ERROR_CONTEXT_LINES {
					break
				} else if lineIdx > 0 {
					curSb = &beforeSb
				} else if lineIdx == 0 {
					curSb = &lineSb
				} else {
					curSb = &afterSb
				}
			}
		}

		// If any of the strings are longer than ERROR_CONTEXT_MAX_LENGTH, trim them
		// to avoid excessively long strings, especially for minified files.
		lineContent := lineSb.String()
		if len(lineContent) > ERROR_CONTEXT_MAX_LENGTH {
			lineContent = strings.Repeat(lineContent[:ERROR_CONTEXT_MAX_LENGTH], 1)
		}
		linesBefore := beforeSb.String()
		if len(linesBefore) > ERROR_CONTEXT_MAX_LENGTH {
			linesBefore = strings.Repeat(linesBefore[len(linesBefore)-ERROR_CONTEXT_MAX_LENGTH:], 1)
		}
		linesAfter := afterSb.String()
		if len(linesAfter) > ERROR_CONTEXT_MAX_LENGTH {
			linesAfter = strings.Repeat(linesAfter[:ERROR_CONTEXT_MAX_LENGTH], 1)
		}

		lineContentPtr = &lineContent
		linesBeforePtr = &linesBefore
		linesAfterPtr = &linesAfter
	}

	mappedStackFrame := &privateModel.ErrorTrace{
		FileName:     limitMaxSize(&sourceFileName),
		LineNumber:   &line,
		FunctionName: limitMaxSize(&fn),
		ColumnNumber: &col,
		LineContent:  lineContentPtr,
		LinesBefore:  linesBeforePtr,
		LinesAfter:   linesAfterPtr,
	}
	return mappedStackFrame, nil, stackTraceError
}
