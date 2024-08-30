package stacktraces

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/redis"
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
	projectID          int
	err                error
	fsOnly             bool
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

type mockInvalidNetworkFetcher struct{}

func (n mockInvalidNetworkFetcher) fetchFile(ctx context.Context, href string) ([]byte, error) {
	return []byte("<not valid>"), nil
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
			fetcher: NetworkFetcher{redis: redis.NewClient()},
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
			fetcher: NetworkFetcher{redis: redis.NewClient()},
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
			fetcher: NetworkFetcher{redis: redis.NewClient()},
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
		"test map file resolution mapping": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     ptr.String("/_next/server/app/(route-group-test)/[slug]/page-router-edge-test.js"),
					LineNumber:   ptr.Int(1),
					ColumnNumber: ptr.Int(422367),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     ptr.String("webpack://_N_E/./node_modules/next/dist/compiled/cookie/index.js"),
					LineNumber:   ptr.Int(2),
					ColumnNumber: ptr.Int(0),
					FunctionName: ptr.String(""),
					LineContent:  ptr.String("/*!\n"),
					LinesBefore:  ptr.String("(()=>{\"use strict\";if(typeof __nccwpck_require__!==\"undefined\")__nccwpck_require__.ab=__dirname+\"/\";var e={};(()=>{var r=e;\n"),
					LinesAfter:   ptr.String(" * cookie\n * Copyright(c) 2012-2014 Roman Shtylman\n * Copyright(c) 2015 Douglas Christopher Wilson\n * MIT Licensed\n */r.parse=parse;r.serialize=serialize;var i=decodeURIComponent;var t=encodeURIComponent;var a=/; */;var n=/^[\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+$/;function parse(e,r){if(typeof e!==\"string\"){throw new TypeError(\"argument str must be a string\")}var t={};var n=r||{};var o=e.split(a);var s=n.decode||i;for(var p=0;p<o.length;p++){var f=o[p];var u=f.indexOf(\"=\");if(u<0){continue}var v=f.substr(0,u).trim();var c=f.substr(++u,f.length).trim();if('\"'==c[0]){c=c.slice(1,-1)}if(undefined==t[v]){t[v]=tryDecode(c,s)}}return t}function serialize(e,r,i){var a=i||{};var o=a.encode||t;if(typeof o!==\"function\"){throw new TypeError(\"option encode is invalid\")}if(!n.test(e)){throw new TypeError(\"argument name is invalid\")}var s=o(r);if(s&&!n.test(s)){throw new TypeError(\"argument val is invalid\")}var p=e+\"=\"+s;if(null!=a.maxAge){var f=a.maxAge-0;if(isNaN(f)||!isFinite(f)){throw new TypeError"),
				},
			},
			version:   "version-a1b2c3",
			projectID: 29954,
			fetcher:   DiskFetcher{},
		},
		"test version matching first": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     ptr.String("https://app.highlight.io/main.8344d167.chunk.js"),
					LineNumber:   ptr.Int(1),
					ColumnNumber: ptr.Int(422367),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     ptr.String("https://app.highlight.io/pages/Buttons/Buttons.tsx"),
					LineNumber:   ptr.Int(13),
					ColumnNumber: ptr.Int(30),
					FunctionName: ptr.String(""),
					LineContent:  ptr.String("                        throw new Error('errors page');\n"),
					LinesBefore:  ptr.String("        <div className={styles.buttonBody}>\n            <div>\n                <button\n                    className={commonStyles.submitButton}\n                    onClick={() => {\n"),
					LinesAfter:   ptr.String("                    }}\n                >\n                    Throw an Error\n                </button>\n                <button\n"),
				},
			},
			version:   "version-a1b2c3",
			projectID: 1,
			fetcher:   mockInvalidNetworkFetcher{},
			fsOnly:    true,
		},
		"test reflame": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     ptr.String("https://preview.highlight.io/~r/chunks/X3XZGGFJ.js?~r_rid=G5Qjykm00SuMZ-DTpV_ckUGZvRg"),
					LineNumber:   ptr.Int(1),
					ColumnNumber: ptr.Int(1656),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     ptr.String("/~r/app/~r_top/pages/Buttons/ButtonsHelper.tsx?~r_rid=WK5-8VqUX1-GQ_6VkgQg71ktp4Y"),
					LineNumber:   ptr.Int(25),
					ColumnNumber: ptr.Int(11),
					FunctionName: ptr.String("Error"),
				},
			},
			fetcher: NetworkFetcher{redis: redis.NewClient()},
			err:     e.New(""),
		},
	}

	s3Client, err := storage.NewS3Client(ctx)
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}

	fsClient, err := storage.NewFSClient(ctx, "http://localhost:8082/public", "./test-files")
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}

	// run tests
	redisClient := redis.NewClient()
	for _, client := range []storage.Client{s3Client, fsClient} {
		for name, tc := range tests {
			t.Run(fmt.Sprintf("%s/%v", name, client), func(t *testing.T) {
				if _, ok := client.(*storage.S3Client); ok && tc.fsOnly {
					t.Skip("test case only for file system client, skipping for s3 client")
				}
				_ = redisClient.FlushDB(ctx)
				if tc.projectID == 0 {
					tc.projectID = 1
				} else if client == s3Client {
					t.Skip("skipping project-specific test for s3 client")
				}
				var v *string
				if tc.version != "" {
					v = &tc.version
				}
				fetch = tc.fetcher
				mappedStackTrace, err := EnhanceStackTrace(ctx, tc.stackFrameInput, tc.projectID, v, client)
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

func TestEnhanceBackendNextServerlessTrace(t *testing.T) {
	ctx := context.TODO()

	client, err := storage.NewFSClient(ctx, "http://localhost:8082/public", "./test-files")
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}

	fetch = NetworkFetcher{redis: redis.NewClient()}

	var stackFrameInput []*publicModelInput.StackFrameInput
	err = json.Unmarshal([]byte(`[{"fileName":"/var/task/apps/magicsky/.next/server/app/(route-group-test)/[slug]/page-router-edge-test.js","lineNumber":1,"functionName":"s","columnNumber":3344,"error":"Error: 🎉 SSR Error with use-server: src/app-router/ssr/page.tsx"}]`), &stackFrameInput)
	assert.NoError(t, err)

	mappedStackTrace, err := EnhanceStackTrace(ctx, stackFrameInput, 29954, nil, client)
	if err != nil {
		t.Fatal(e.Wrap(err, "error enhancing source map"))
	}
	assert.Equal(t, 1, len(mappedStackTrace))
	assert.Equal(t, "                    console.log(`got fetch cache entry for ${key}, duration: ${Date.now() - start}ms, size: ${Object.keys(cached).length}, cache-state: ${cacheState} tags: ${tags == null ? void 0 : tags.join(\",\")} softTags: ${softTags == null ? void 0 : softTags.join(\",\")}`);\n", *mappedStackTrace[0].LineContent)
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
	// only works if AWS credentials are set up
	t.Skip()
	storage.S3SourceMapBucketNameNew = "highlight-source-maps"
	ctx := context.TODO()

	s3Client, err := storage.NewS3Client(ctx)
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}

	fetch = NetworkFetcher{redis: redis.NewClient()}
	mappedStackTrace, err := EnhanceStackTrace(ctx, []*publicModelInput.StackFrameInput{
		{
			FunctionName: nil,
			FileName:     pointy.String("https://app.serial.io/assets/index-CvE3e0ij.js"),
			LineNumber:   pointy.Int(2777),
			ColumnNumber: pointy.Int(129781),
			Source:       pointy.String("    at https://app.serial.io/assets/index-CvE3e0ij.js:2777:129781"),
		},
	}, 6849, pointy.String("v1.1.232"), s3Client)
	if err != nil {
		t.Fatal(e.Wrap(err, "error enhancing source map"))
	}
	assert.Equal(t, 1, len(mappedStackTrace))
	assert.Equal(t, "", *mappedStackTrace[0].FunctionName)
	assert.Equal(t, "      console.error(`Supplementary data not found for identifier ${identifier}`);\n", *mappedStackTrace[0].LineContent)
}
