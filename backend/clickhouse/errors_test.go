package clickhouse

import (
	modelInputs "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	"github.com/stretchr/testify/assert"
	"testing"
	"time"
)

func Test_ErrorMatchesQuery(t *testing.T) {
	errorObject := modelInputs.BackendErrorObjectInput{}
	filters := queryparser.Parse("oops something bad type:console.error os.type:linux resource_name:worker.* service_name:all")
	matches := ErrorMatchesQuery(&errorObject, &filters)
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
	matches = ErrorMatchesQuery(&errorObject, &filters)
	assert.True(t, matches)
}
