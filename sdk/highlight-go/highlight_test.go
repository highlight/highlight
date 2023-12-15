package highlight

import (
	"context"
	"fmt"
	"go.opentelemetry.io/otel/attribute"
	"testing"

	"github.com/pkg/errors"
)

// TestConsumeError tests every case for ConsumeError
func TestConsumeError(t *testing.T) {
	ctx := context.Background()
	ctx = context.WithValue(ctx, ContextKeys.SessionSecureID, "0")
	ctx = context.WithValue(ctx, ContextKeys.RequestID, "0")
	tests := map[string]struct {
		errorInput         error
		contextInput       context.Context
		tags               []attribute.KeyValue
		expectedFlushSize  int
		expectedEvent      string
		expectedStackTrace string
		expectedError      error
	}{
		"test builtin error":                                {expectedFlushSize: 1, contextInput: ctx, errorInput: fmt.Errorf("error here"), expectedEvent: "error here", expectedStackTrace: "error here"},
		"test simple github.com/pkg/errors error":           {expectedFlushSize: 1, contextInput: ctx, errorInput: errors.New("error here"), expectedEvent: "error here", expectedStackTrace: `["github.com/highlight/highlight/sdk/highlight-go.TestConsumeError /Users/cameronbrill/Projects/work/Highlight/highlight-go/highlight_test.go:27","testing.tRunner /usr/local/opt/go/libexec/src/testing/testing.go:1259","runtime.goexit /usr/local/opt/go/libexec/src/runtime/asm_amd64.s:1581"]`},
		"test github.com/pkg/errors error with stack trace": {expectedFlushSize: 1, contextInput: ctx, errorInput: errors.Wrap(errors.New("error here"), "error there"), expectedEvent: "error there: error here", expectedStackTrace: `["github.com/highlight/highlight/sdk/highlight-go.TestConsumeError /Users/cameronbrill/Projects/work/Highlight/highlight-go/highlight_test.go:28","testing.tRunner /usr/local/opt/go/libexec/src/testing/testing.go:1259","runtime.goexit /usr/local/opt/go/libexec/src/runtime/asm_amd64.s:1581"]`},
	}

	for name, input := range tests {
		t.Run(name, func(t *testing.T) {
			Start()
			RecordError(input.contextInput, input.errorInput, input.tags...)
		})
	}
	Stop()
}

// TestConsumeError tests every case for RecordMetric
func TestRecordMetric(t *testing.T) {
	ctx := context.Background()
	ctx = context.WithValue(ctx, ContextKeys.SessionSecureID, "0")
	ctx = context.WithValue(ctx, ContextKeys.RequestID, "0")
	tests := map[string]struct {
		metricInput struct {
			name  string
			value float64
		}
		contextInput      context.Context
		expectedFlushSize int
	}{
		"test": {expectedFlushSize: 1, contextInput: ctx, metricInput: struct {
			name  string
			value float64
		}{name: "myMetric", value: 123.456}},
	}

	for name, input := range tests {
		t.Run(name, func(t *testing.T) {
			Start()
			RecordMetric(input.contextInput, input.metricInput.name, input.metricInput.value)
		})
	}
	Stop()
}
