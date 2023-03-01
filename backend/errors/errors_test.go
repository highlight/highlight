package errors

import (
	"context"
	"testing"

	"github.com/go-test/deep"
	modelInput "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModelInput "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
)

type Testcase struct {
	stackFrameInput    []*publicModelInput.StackFrameInput
	expectedStackTrace []modelInput.ErrorTrace
	fetcher            fetcher
	version            string
	err                error
}

var proper = Testcase{
	stackFrameInput: []*publicModelInput.StackFrameInput{
		{
			FileName:     util.MakeStringPointer("./test-files/lodash.min.js?400"),
			LineNumber:   util.MakeIntPointer(1),
			ColumnNumber: util.MakeIntPointer(813),
		},
		{
			FileName:     util.MakeStringPointer("./test-files/lodash.min.js?ts=123&foo=bar"),
			LineNumber:   util.MakeIntPointer(1),
			ColumnNumber: util.MakeIntPointer(799),
		},
		{
			FileName:     util.MakeStringPointer("./test-files/vendors.js"),
			LineNumber:   util.MakeIntPointer(1),
			ColumnNumber: util.MakeIntPointer(422367),
		},
	},
	expectedStackTrace: []modelInput.ErrorTrace{
		{
			FileName:     util.MakeStringPointer("lodash.js"),
			LineNumber:   util.MakeIntPointer(634),
			ColumnNumber: util.MakeIntPointer(4),
			FunctionName: util.MakeStringPointer(""),
		},
		{
			FileName:     util.MakeStringPointer("lodash.js"),
			LineNumber:   util.MakeIntPointer(633),
			ColumnNumber: util.MakeIntPointer(11),
			FunctionName: util.MakeStringPointer("arrayIncludesWith"),
		},
		{
			FileName:     util.MakeStringPointer("pages/Buttons/Buttons.tsx"),
			LineNumber:   util.MakeIntPointer(13),
			ColumnNumber: util.MakeIntPointer(30),
			LineContent:  util.MakeStringPointer("                        throw new Error('errors page');\n"),
			FunctionName: util.MakeStringPointer(""),
			LinesBefore:  util.MakeStringPointer("        <div className={styles.buttonBody}>\n            <div>\n                <button\n                    className={commonStyles.submitButton}\n                    onClick={() => {\n"),
			LinesAfter:   util.MakeStringPointer("                    }}\n                >\n                    Throw an Error\n                </button>\n                <button\n"),
		},
	},
	fetcher: DiskFetcher{},
	err:     e.New(""),
}

func TestEnhanceStackTrace(t *testing.T) {
	ctx := context.TODO()
	stackTraceErrorCode := modelInput.SourceMappingErrorCodeMinifiedFileMissingInS3AndURL
	properVersioned := proper
	properVersioned.version = "foo/bar/baz"

	// construct table of sub-tests to run
	tests := map[string]Testcase{
		"test source mapping with proper stack trace":               proper,
		"test source mapping with proper stack trace weird version": properVersioned,
		"test source mapping with proper stack trace with network fetcher": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"),
					LineNumber:   util.MakeIntPointer(1),
					ColumnNumber: util.MakeIntPointer(813),
				},
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"),
					LineNumber:   util.MakeIntPointer(1),
					ColumnNumber: util.MakeIntPointer(799),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"),
					LineNumber:   util.MakeIntPointer(634),
					ColumnNumber: util.MakeIntPointer(4),
					FunctionName: util.MakeStringPointer(""),
				},
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"),
					LineNumber:   util.MakeIntPointer(633),
					ColumnNumber: util.MakeIntPointer(11),
					FunctionName: util.MakeStringPointer("arrayIncludesWith"),
				},
			},
			fetcher: NetworkFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:no related source map": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("./test-files/foo.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("./test-files/foo.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
					Error:        util.MakeStringPointer("error fetching file: ./test-files/foo.js: error fetching file from disk: open ./test-files/foo.js: no such file or directory"),
					SourceMappingErrorMetadata: &modelInput.SourceMappingError{
						ErrorCode:                 &stackTraceErrorCode,
						StackTraceFileURL:         util.MakeStringPointer("./test-files/foo.js"),
						MinifiedFetchStrategy:     util.MakeStringPointer("S3 and URL"),
						ActualMinifiedFetchedPath: util.MakeStringPointer("./test-files/foo.js"),
					},
				},
			},
			fetcher: DiskFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:file doesn't exist": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
					Error:        util.MakeStringPointer("error fetching file: https://cdnjs.cloudflare.com/ajax/libs/lodash.js: status code not OK"),
					SourceMappingErrorMetadata: &modelInput.SourceMappingError{
						ErrorCode:                 &stackTraceErrorCode,
						StackTraceFileURL:         util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
						MinifiedFetchStrategy:     util.MakeStringPointer("S3 and URL"),
						ActualMinifiedFetchedPath: util.MakeStringPointer("ajax/libs/lodash.js"),
					},
				},
			},
			fetcher: NetworkFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:filename is not a url": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("/file/local/domain.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("/file/local/domain.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
					Error:        util.MakeStringPointer(`error fetching file: /file/local/domain.js: error getting source file: Get "/file/local/domain.js": unsupported protocol scheme ""`),
					SourceMappingErrorMetadata: &modelInput.SourceMappingError{
						ErrorCode:                 &stackTraceErrorCode,
						StackTraceFileURL:         util.MakeStringPointer("/file/local/domain.js"),
						MinifiedFetchStrategy:     util.MakeStringPointer("S3 and URL"),
						ActualMinifiedFetchedPath: util.MakeStringPointer("file/local/domain.js"),
					},
				},
			},
			fetcher: NetworkFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:trace is nil": {
			stackFrameInput:    nil,
			expectedStackTrace: nil,
			fetcher:            DiskFetcher{},
			err:                e.New("stack trace input cannot be nil"),
		},
		"test source mapping invalid trace:empty stack frame doesn't update error object": {
			stackFrameInput:    []*publicModelInput.StackFrameInput{},
			expectedStackTrace: nil,
			fetcher:            DiskFetcher{},
			err:                e.New(""),
		},
		"test tsx mapping": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("./test-files/main.8344d167.chunk.js"),
					LineNumber:   util.MakeIntPointer(1),
					ColumnNumber: util.MakeIntPointer(422367),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("pages/Buttons/Buttons.tsx"),
					LineNumber:   util.MakeIntPointer(13),
					ColumnNumber: util.MakeIntPointer(30),
					FunctionName: util.MakeStringPointer(""),
					LineContent:  util.MakeStringPointer("                        throw new Error('errors page');\n"),
					LinesBefore:  util.MakeStringPointer("        <div className={styles.buttonBody}>\n            <div>\n                <button\n                    className={commonStyles.submitButton}\n                    onClick={() => {\n"),
					LinesAfter:   util.MakeStringPointer("                    }}\n                >\n                    Throw an Error\n                </button>\n                <button\n"),
				},
			},
			fetcher: DiskFetcher{},
			err:     e.New(""),
		},
	}

	s3Client, err := storage.NewS3Client(ctx)
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}

	fsClient, err := storage.NewFSClient(ctx, "https://localhost:8082/public", "")
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}

	// run tests
	for _, client := range []storage.Client{s3Client, fsClient} {
		for name, tc := range tests {
			t.Run(name, func(t *testing.T) {
				var v *string
				if tc.version != "" {
					v = &tc.version
				}
				fetch = tc.fetcher
				mappedStackTrace, err := EnhanceStackTrace(ctx, tc.stackFrameInput, 1, v, client)
				if err != nil {
					if err.Error() == tc.err.Error() {
						return
					}
					t.Error(e.Wrap(err, "error setting source map elements"))
				}
				diff := deep.Equal(&mappedStackTrace, &tc.expectedStackTrace)
				if len(diff) > 0 {
					t.Error(e.Errorf("publicModelInput. not equal: %+v", diff))
				}
			})
		}
	}
}
