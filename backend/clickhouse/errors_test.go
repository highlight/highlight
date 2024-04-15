package clickhouse

import (
	"github.com/highlight-run/highlight/backend/parser"
	modelInputs "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/openlyinc/pointy"
	"github.com/stretchr/testify/assert"
	"testing"
	"time"
)

func Test_ErrorMatchesQuery(t *testing.T) {
	errorObject := modelInputs.BackendErrorObjectInput{}
	filters := parser.Parse("oops something bad type:console.error os.type:linux resource_name:worker.* service_name:all", BackendErrorObjectInputConfig)
	matches := ErrorMatchesQuery(&errorObject, filters)
	assert.False(t, matches)

	errorObject = modelInputs.BackendErrorObjectInput{
		Event:      "good evening, this is an error where oops something bad happens",
		Type:       "console.error",
		URL:        "https://example.com",
		Source:     "backend",
		StackTrace: "yoo",
		Timestamp:  time.Now(),
		Service: &modelInputs.ServiceInput{
			Name:    "all",
			Version: "asdf",
		},
	}
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.True(t, matches)
}

func Test_ErrorMatchesQuery_v2(t *testing.T) {
	errorObject := modelInputs.BackendErrorObjectInput{}
	filters := parser.Parse("source=bean.js OR foo=bar OR type=console.error", BackendErrorObjectInputConfig)
	matches := ErrorMatchesQuery(&errorObject, filters)
	assert.False(t, matches)
	filters = parser.Parse("source=bean.js OR foo=bar OR swag=console.error", BackendErrorObjectInputConfig)
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.False(t, matches)
	filters = parser.Parse("", BackendErrorObjectInputConfig)
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.True(t, matches)

	errorObject = modelInputs.BackendErrorObjectInput{
		SessionSecureID: pointy.String("sess"),
		RequestID:       pointy.String("abc123"),
		TraceID:         pointy.String("def456"),
		SpanID:          pointy.String("a1b2c3"),
		LogCursor:       pointy.String("foobar"),
		Event:           "yo this is the random error! 123456",
		Type:            "window.onerror",
		URL:             "",
		Source:          "foo.js",
		StackTrace:      "Error: oh no!\n    at Procedure.resolve [as resolver] (webpack-internal:///(api)/./src/server/routers/name.ts:18:19)\n    at Array.<anonymous> (/Users/vkorolik/work/web-test/trpc-nextjs-demo-internal/node_modules/@trpc/server/dist/router-ee876044.cjs.dev.js:101:36)\n",
		Timestamp:       time.Now(),
		Payload:         pointy.String("{\"foo\":\"bar\",\"key\":\"123\"}"),
		Service: &modelInputs.ServiceInput{
			Name:    "my-service",
			Version: "my-service-version",
		},
		Environment: "production",
	}
	filters = parser.Parse(`service_name="not-my-service" visited_url=""`, BackendErrorObjectInputConfig)
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.False(t, matches)

	filters = parser.Parse(`service_name=my-service visited_url=""`, BackendErrorObjectInputConfig)
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.True(t, matches)

	filters = parser.Parse(`(service_name=my-service AND visited_url!="")`, BackendErrorObjectInputConfig)
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.False(t, matches)

	errorObject.URL = "https://localhost:3000/foo/bar/baz"
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.True(t, matches)

	filters = parser.Parse(`(service_name=my-service AND event="random error")`, BackendErrorObjectInputConfig)
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.False(t, matches)

	filters = parser.Parse(`(service_name=my-service AND event="*not a substring*")`, BackendErrorObjectInputConfig)
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.False(t, matches)

	filters = parser.Parse(`(service_name=my-service AND event="*random error*")`, BackendErrorObjectInputConfig)
	matches = ErrorMatchesQuery(&errorObject, filters)
	assert.True(t, matches)
}
