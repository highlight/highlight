package clickhouse

import (
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/parser"
	modelInputs "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func Test_ErrorMatchesQuery(t *testing.T) {
	errorObject := modelInputs.BackendErrorObjectInput{}
	filters := parser.Parse("oops something bad type:console.error os.type:linux resource_name:worker.* service_name:all", ErrorObjectsTableConfig)
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
