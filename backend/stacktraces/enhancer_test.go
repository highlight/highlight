package stacktraces

import (
	"context"
	"github.com/openlyinc/pointy"
	"github.com/stretchr/testify/assert"
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/go-test/deep"
	modelInput "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModelInput "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/storage"
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
			FileName:     ptr.String("./test-files/lodash.min.js?400"),
			LineNumber:   ptr.Int(1),
			ColumnNumber: ptr.Int(813),
		},
		{
			FileName:     ptr.String("./test-files/lodash.min.js?ts=123&foo=bar"),
			LineNumber:   ptr.Int(1),
			ColumnNumber: ptr.Int(799),
		},
		{
			FileName:     ptr.String("./test-files/vendors.js"),
			LineNumber:   ptr.Int(1),
			ColumnNumber: ptr.Int(422367),
		},
	},
	expectedStackTrace: []modelInput.ErrorTrace{
		{
			FileName:     ptr.String("lodash.js"),
			LineNumber:   ptr.Int(634),
			ColumnNumber: ptr.Int(4),
			FunctionName: ptr.String(""),
		},
		{
			FileName:     ptr.String("lodash.js"),
			LineNumber:   ptr.Int(633),
			ColumnNumber: ptr.Int(11),
			FunctionName: ptr.String("arrayIncludesWith"),
		},
		{
			FileName:     ptr.String("pages/Buttons/Buttons.tsx"),
			LineNumber:   ptr.Int(13),
			ColumnNumber: ptr.Int(30),
			LineContent:  ptr.String("                        throw new Error('errors page');\n"),
			FunctionName: ptr.String(""),
			LinesBefore:  ptr.String("        <div className={styles.buttonBody}>\n            <div>\n                <button\n                    className={commonStyles.submitButton}\n                    onClick={() => {\n"),
			LinesAfter:   ptr.String("                    }}\n                >\n                    Throw an Error\n                </button>\n                <button\n"),
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
					FileName:     ptr.String("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"),
					LineNumber:   ptr.Int(1),
					ColumnNumber: ptr.Int(813),
				},
				{
					FileName:     ptr.String("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"),
					LineNumber:   ptr.Int(1),
					ColumnNumber: ptr.Int(799),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     ptr.String("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"),
					LineNumber:   ptr.Int(634),
					ColumnNumber: ptr.Int(4),
					FunctionName: ptr.String(""),
				},
				{
					FileName:     ptr.String("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"),
					LineNumber:   ptr.Int(633),
					ColumnNumber: ptr.Int(11),
					FunctionName: ptr.String("arrayIncludesWith"),
				},
			},
			fetcher: NetworkFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:no related source map": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     ptr.String("./test-files/foo.js"),
					LineNumber:   ptr.Int(0),
					ColumnNumber: ptr.Int(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     ptr.String("./test-files/foo.js"),
					LineNumber:   ptr.Int(0),
					ColumnNumber: ptr.Int(0),
					Error:        ptr.String("error fetching file: ./test-files/foo.js: error fetching file from disk: open ./test-files/foo.js: no such file or directory"),
					SourceMappingErrorMetadata: &modelInput.SourceMappingError{
						ErrorCode:                 &stackTraceErrorCode,
						StackTraceFileURL:         ptr.String("./test-files/foo.js"),
						MinifiedFetchStrategy:     ptr.String("S3 and URL"),
						ActualMinifiedFetchedPath: ptr.String("./test-files/foo.js"),
					},
				},
			},
			fetcher: DiskFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:file doesn't exist": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     ptr.String("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
					LineNumber:   ptr.Int(0),
					ColumnNumber: ptr.Int(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     ptr.String("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
					LineNumber:   ptr.Int(0),
					ColumnNumber: ptr.Int(0),
					Error:        ptr.String("error fetching file: https://cdnjs.cloudflare.com/ajax/libs/lodash.js: status code not OK"),
					SourceMappingErrorMetadata: &modelInput.SourceMappingError{
						ErrorCode:                 &stackTraceErrorCode,
						StackTraceFileURL:         ptr.String("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
						MinifiedFetchStrategy:     ptr.String("S3 and URL"),
						ActualMinifiedFetchedPath: ptr.String("ajax/libs/lodash.js"),
					},
				},
			},
			fetcher: NetworkFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:filename is not a url": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     ptr.String("/file/local/domain.js"),
					LineNumber:   ptr.Int(0),
					ColumnNumber: ptr.Int(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     ptr.String("/file/local/domain.js"),
					LineNumber:   ptr.Int(0),
					ColumnNumber: ptr.Int(0),
					Error:        ptr.String(`error fetching file: /file/local/domain.js: error getting source file: Get "/file/local/domain.js": unsupported protocol scheme ""`),
					SourceMappingErrorMetadata: &modelInput.SourceMappingError{
						ErrorCode:                 &stackTraceErrorCode,
						StackTraceFileURL:         ptr.String("/file/local/domain.js"),
						MinifiedFetchStrategy:     ptr.String("S3 and URL"),
						ActualMinifiedFetchedPath: ptr.String("file/local/domain.js"),
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
					FileName:     ptr.String("./test-files/main.8344d167.chunk.js"),
					LineNumber:   ptr.Int(1),
					ColumnNumber: ptr.Int(422367),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     ptr.String("pages/Buttons/Buttons.tsx"),
					LineNumber:   ptr.Int(13),
					ColumnNumber: ptr.Int(30),
					FunctionName: ptr.String(""),
					LineContent:  ptr.String("                        throw new Error('errors page');\n"),
					LinesBefore:  ptr.String("        <div className={styles.buttonBody}>\n            <div>\n                <button\n                    className={commonStyles.submitButton}\n                    onClick={() => {\n"),
					LinesAfter:   ptr.String("                    }}\n                >\n                    Throw an Error\n                </button>\n                <button\n"),
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

	fsClient, err := storage.NewFSClient(ctx, "http://localhost:8082/public", "")
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
				for i, errorTrace := range mappedStackTrace {
					diff := deep.Equal(*errorTrace, tc.expectedStackTrace[i])
					if len(diff) > 0 {
						t.Error(e.Errorf("publicModelInput. not equal: %+v", diff))
					}
				}
			})
		}
	}
}

func TestGetURLSourcemap(t *testing.T) {
	ctx := context.Background()
	fsClient, err := storage.NewFSClient(ctx, "http://localhost:8082/public", "")
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}
	sm := modelInput.SourceMappingError{}
	_, _, err = getURLSourcemap(ctx, 1, nil, "", "", 100, fsClient, &sm)
	if err == nil {
		t.Error("expected an error")
	}
}

func TestEnhanceStackTraceProd(t *testing.T) {
	// local only for troubleshooting stacktrace enhancement
	t.Skip()
	storage.S3SourceMapBucketNameNew = "highlight-source-maps"
	ctx := context.TODO()

	s3Client, err := storage.NewS3Client(ctx)
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}

	fetch = NetworkFetcher{}
	mappedStackTrace, err := EnhanceStackTrace(ctx, []*publicModelInput.StackFrameInput{
		{
			FunctionName: nil,
			FileName:     pointy.String("https://lifeat.io/bundle.js"),
			LineNumber:   pointy.Int(3540),
			ColumnNumber: pointy.Int(5784),
			Source:       pointy.String("    at https://lifeat.io/bundle.js:3540:5784"),
		},
	}, 1703, pointy.String("dev"), s3Client)
	if err != nil {
		t.Fatal(e.Wrap(err, "error enhancing source map"))
	}
	assert.Equal(t, 1, len(mappedStackTrace))
	assert.Equal(t, "normal", *mappedStackTrace[0].FunctionName)
	assert.Equal(t, "    font-size: ${FontSize.normal};\n", *mappedStackTrace[0].LineContent)
}
