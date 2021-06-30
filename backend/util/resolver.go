package util

import (
	privateModelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModelInputs "github.com/highlight-run/highlight/backend/public-graph/graph/model"
)

func CopyStackFrameInputToErrorTrace(s *publicModelInputs.StackFrameInput, err error) privateModelInputs.ErrorTrace {
	errorTrace := privateModelInputs.ErrorTrace{
		FileName:     s.FileName,
		LineNumber:   s.LineNumber,
		FunctionName: s.FunctionName,
		ColumnNumber: s.ColumnNumber,
		Error:        MakeStringPointer(err.Error()),
	}
	return errorTrace
}
