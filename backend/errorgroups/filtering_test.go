package errorgroups

import (
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestIsErrorTraceFilteredForChromeExtension(t *testing.T) {
	project := model.Project{
		FilterChromeExtension: ptr.Bool(false),
	}

	trace := []*privateModel.ErrorTrace{
		{
			FileName:                   ptr.String("chrome-extension://bfnaelmomeimhlpmgjnjophhpkkoljpa/content-script/inpageSol.js"),
			LineNumber:                 nil,
			FunctionName:               nil,
			ColumnNumber:               nil,
			Error:                      nil,
			SourceMappingErrorMetadata: &privateModel.SourceMappingError{},
			LineContent:                nil,
			LinesBefore:                nil,
			LinesAfter:                 nil,
		},
	}

	assert.True(t, IsErrorTraceFiltered(s, project, trace))

	trace = []*privateModel.ErrorTrace{
		{
			FileName:                   ptr.String("/build/backend/private-graph/graph/schema.resolvers.go"),
			LineNumber:                 nil,
			FunctionName:               nil,
			ColumnNumber:               nil,
			Error:                      nil,
			SourceMappingErrorMetadata: &privateModel.SourceMappingError{},
			LineContent:                nil,
			LinesBefore:                nil,
			LinesAfter:                 nil,
		},
	}

	assert.False(t, IsErrorTraceFiltered(s, 1, trace))
}
