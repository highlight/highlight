package errors

import (
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
	"regexp"
	"strings"

	"github.com/go-sourcemap/sourcemap"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModel "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
)

const ERROR_CONTEXT_LINES = 5
const ERROR_CONTEXT_MAX_LENGTH = 1000

type fetcher interface {
	fetchFile(string) ([]byte, error)
}

func init() {
	// if util.IsDevEnv() {
	// 	fetch = DiskFetcher{}
	// } else {
	fetch = NetworkFetcher{}
	// }
}

var fetch fetcher

type DiskFetcher struct{}

func (n DiskFetcher) fetchFile(href string) ([]byte, error) {
	inputBytes, err := ioutil.ReadFile(href)
	if err != nil {
		return nil, e.Wrap(err, "error fetching file from disk")
	}
	return inputBytes, nil
}

type NetworkFetcher struct{}

func (n NetworkFetcher) fetchFile(href string) ([]byte, error) {
	// check if source is a URL
	_, err := url.ParseRequestURI(href)
	if err != nil {
		return nil, err
	}
	// get minified file
	res, err := http.Get(href)
	if err != nil {
		return nil, e.Wrap(err, "error getting source file")
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, e.New("status code not OK")
	}

	// unpack file into slice
	bodyBytes, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, e.Wrap(err, "error reading response body")
	}

	return bodyBytes, nil
}

/*
* EnhanceStackTrace makes no DB changes
* It loops through the stack trace, for each :
* fetches the sourcemap from remote
* maps the error info into slice
 */
func EnhanceStackTrace(input []*publicModel.StackFrameInput, projectId int, version *string, storageClient *storage.StorageClient) ([]privateModel.ErrorTrace, error) {
	if input == nil {
		return nil, e.New("stack trace input cannot be nil")
	}

	var mappedStackTrace []privateModel.ErrorTrace
	for _, stackFrame := range input {
		if stackFrame == nil || (stackFrame.FileName == nil || len(*stackFrame.FileName) < 1 || stackFrame.LineNumber == nil || stackFrame.ColumnNumber == nil) {
			continue
		}
		mappedStackFrame, err := processStackFrame(projectId, version, *stackFrame, storageClient)
		if err != nil {
			if !util.IsDevOrTestEnv() {
				log.Error(err)
			}
			mappedStackFrame = &privateModel.ErrorTrace{
				FileName:     stackFrame.FileName,
				LineNumber:   stackFrame.LineNumber,
				FunctionName: stackFrame.FunctionName,
				ColumnNumber: stackFrame.ColumnNumber,
				Error:        pointy.String(err.Error()),
			}
		}
		if mappedStackFrame != nil {
			mappedStackTrace = append(mappedStackTrace, *mappedStackFrame)
		}
	}
	if len(mappedStackTrace) > 1 && (mappedStackTrace[0].FunctionName == nil || *mappedStackTrace[0].FunctionName == "") {
		mappedStackTrace[0].FunctionName = mappedStackTrace[1].FunctionName
	}
	return mappedStackTrace, nil
}

func processStackFrame(projectId int, version *string, stackTrace publicModel.StackFrameInput, storageClient *storage.StorageClient) (*privateModel.ErrorTrace, error) {
	stackTraceFileURL := *stackTrace.FileName
	stackTraceLineNumber := *stackTrace.LineNumber
	stackTraceColumnNumber := *stackTrace.ColumnNumber

	// get file name index from URL
	stackFileNameIndex := strings.Index(stackTraceFileURL, path.Base(stackTraceFileURL))
	if stackFileNameIndex == -1 {
		err := e.Errorf("source path doesn't contain file name: %v", stackTraceFileURL)
		return nil, err
	}

	// get path from url
	u, err := url.Parse(stackTraceFileURL)
	if err != nil {
		err := e.Wrapf(err, "error parsing stack trace file url: %v", stackTraceFileURL)
		return nil, err
	}
	stackTraceFilePath := u.Path
	if len(stackTraceFilePath) > 0 && stackTraceFilePath[0:1] == "/" {
		stackTraceFilePath = stackTraceFilePath[1:]
	}

	// try to get file from s3
	minifiedFileBytes, err := storageClient.ReadSourceMapFileFromS3(projectId, version, stackTraceFilePath)
	if err != nil {
		// if not in s3, get from url and put in s3
		minifiedFileBytes, err = fetch.fetchFile(stackTraceFileURL)
		if err != nil {
			// fallback if we can't get the source file at all
			err := e.Wrapf(err, "error fetching file: %v", stackTraceFileURL)
			return nil, err
		}
		_, err = storageClient.PushSourceMapFileToS3(projectId, version, stackTraceFilePath, minifiedFileBytes)
		if err != nil {
			log.Error(e.Wrapf(err, "error pushing file to s3: %v", stackTraceFilePath))
		}
	}
	if len(minifiedFileBytes) > 5000000 {
		err := e.Errorf("minified source file over 5mb: %v, size: %v", stackTraceFileURL, len(minifiedFileBytes))
		return nil, err
	}

	sourceMapFileName := string(regexp.MustCompile(`//# sourceMappingURL=(.*)`).Find(minifiedFileBytes))
	if len(sourceMapFileName) < 1 {
		err := e.Errorf("file does not contain source map url: %v", stackTraceFileURL)
		return nil, err
	}
	sourceMapFileName = strings.Replace(sourceMapFileName, "//# sourceMappingURL=", "", 1)

	// construct sourcemap url from searched file
	sourceMapURL := (stackTraceFileURL)[:stackFileNameIndex] + sourceMapFileName
	// get path from url
	u2, err := url.Parse(sourceMapURL)
	if err != nil {
		err := e.Wrap(err, "error parsing source map url")
		return nil, err
	}
	sourceMapFilePath := u2.Path
	if sourceMapFilePath[0:1] == "/" {
		sourceMapFilePath = sourceMapFilePath[1:]
	}

	// fetch source map file
	// try to get file from s3
	sourceMapFileBytes, err := storageClient.ReadSourceMapFileFromS3(projectId, version, sourceMapFilePath)
	if err != nil {
		// if not in s3, get from url and put in s3
		sourceMapFileBytes, err = fetch.fetchFile(sourceMapURL)
		if err != nil {
			// fallback if we can't get the source file at all
			err := e.Wrapf(err, "error fetching source map file: %v", sourceMapURL)
			return nil, err
		}
		_, err = storageClient.PushSourceMapFileToS3(projectId, version, sourceMapFilePath, sourceMapFileBytes)
		if err != nil {
			log.Error(e.Wrapf(err, "error pushing file to s3: %v", sourceMapFileName))
		}
	}
	smap, err := sourcemap.Parse(sourceMapURL, sourceMapFileBytes)
	if err != nil {
		err := e.Wrapf(err, "error parsing source map file -> %v", sourceMapURL)
		return nil, err
	}

	sourceFileName, fn, line, col, ok := smap.Source(stackTraceLineNumber, stackTraceColumnNumber)
	if !ok {
		err := e.Errorf("error extracting true error info from source map: %v", sourceMapURL)
		return nil, err
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
		FileName:     &sourceFileName,
		LineNumber:   &line,
		FunctionName: &fn,
		ColumnNumber: &col,
		LineContent:  lineContentPtr,
		LinesBefore:  linesBeforePtr,
		LinesAfter:   linesAfterPtr,
	}
	return mappedStackFrame, nil
}
