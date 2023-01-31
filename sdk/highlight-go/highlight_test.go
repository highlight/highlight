package highlight

import (
	"context"
	"fmt"
	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/ast"
	"strings"
	"testing"

	"github.com/pkg/errors"
)

// TestConsumeError tests every case for ConsumeError
func TestConsumeError(t *testing.T) {
	requester = mockRequester{}
	ctx := context.Background()
	ctx = context.WithValue(ctx, ContextKeys.SessionSecureID, "0")
	ctx = context.WithValue(ctx, ContextKeys.RequestID, "0")
	tests := map[string]struct {
		errorInput         interface{}
		contextInput       context.Context
		tags               []string
		expectedFlushSize  int
		expectedEvent      string
		expectedStackTrace string
		expectedError      error
	}{
		"test builtin error":                                {expectedFlushSize: 1, contextInput: ctx, errorInput: fmt.Errorf("error here"), expectedEvent: "error here", expectedStackTrace: "error here"},
		"test builtin error with invalid context":           {expectedFlushSize: 0, contextInput: context.Background(), errorInput: fmt.Errorf("error here"), expectedError: fmt.Errorf(consumeErrorSessionIDMissing)},
		"test simple github.com/pkg/errors error":           {expectedFlushSize: 1, contextInput: ctx, errorInput: errors.New("error here"), expectedEvent: "error here", expectedStackTrace: `["github.com/highlight/highlight/sdk/highlight-go.TestConsumeError /Users/cameronbrill/Projects/work/Highlight/highlight-go/highlight_test.go:27","testing.tRunner /usr/local/opt/go/libexec/src/testing/testing.go:1259","runtime.goexit /usr/local/opt/go/libexec/src/runtime/asm_amd64.s:1581"]`},
		"test github.com/pkg/errors error with stack trace": {expectedFlushSize: 1, contextInput: ctx, errorInput: errors.Wrap(errors.New("error here"), "error there"), expectedEvent: "error there: error here", expectedStackTrace: `["github.com/highlight/highlight/sdk/highlight-go.TestConsumeError /Users/cameronbrill/Projects/work/Highlight/highlight-go/highlight_test.go:28","testing.tRunner /usr/local/opt/go/libexec/src/testing/testing.go:1259","runtime.goexit /usr/local/opt/go/libexec/src/runtime/asm_amd64.s:1581"]`},
	}

	for name, input := range tests {
		t.Run(name, func(t *testing.T) {
			Start()
			ConsumeError(input.contextInput, input.errorInput, input.tags...)
			a, _ := flush()
			if len(a) != input.expectedFlushSize {
				t.Errorf("flush returned the wrong number of errors [%v != %v]", len(a), input.expectedFlushSize)
				return
			}
			if len(a) < 1 {
				return
			}
			if string(a[0].Event) != input.expectedEvent {
				t.Errorf("event not equal to expected event: %v != %v", a[0].Event, input.expectedEvent)
			}
			// strings.Contains() is here because the actual stack trace will differ from machine to machine, because file paths are different.
			if string(a[0].StackTrace) != input.expectedStackTrace && !strings.Contains(string(a[0].StackTrace), "highlight_test.go") {
				t.Errorf("stack trace not equal to expected stack trace: %v != %v", a[0].StackTrace, input.expectedStackTrace)
			}
		})
	}
	Stop()
}

// TestConsumeError tests every case for RecordMetric
func TestRecordMetric(t *testing.T) {
	requester = mockRequester{}
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
			_, a := flush()
			if len(a) != input.expectedFlushSize {
				t.Errorf("flush returned the wrong number of metrics [%v != %v]", len(a), input.expectedFlushSize)
				return
			}
			if len(a) < 1 {
				return
			}
			if string(a[0].Name) != input.metricInput.name {
				t.Errorf("name not equal to expected name: %v != %v", a[0].Name, input.metricInput.name)
			}
			if float64(a[0].Value) != input.metricInput.value {
				t.Errorf("name not equal to expected name: %v != %v", a[0].Value, input.metricInput.value)
			}
		})
	}
	Stop()
}

func TestTracer(t *testing.T) {
	ctx := context.Background()
	ctx = context.WithValue(ctx, ContextKeys.SessionSecureID, "0")
	ctx = context.WithValue(ctx, ContextKeys.RequestID, "0")
	ctx = graphql.WithOperationContext(ctx, &graphql.OperationContext{
		Operation:     &ast.OperationDefinition{},
		OperationName: "test-operation",
		RawQuery:      "test-query",
	})
	ctx = graphql.WithFieldContext(ctx, &graphql.FieldContext{
		Field: graphql.CollectedField{
			Field: &ast.Field{Name: "test-field"},
		},
	})
	tr := NewGraphqlTracer("test")
	t.Run("test basic intercept", func(t *testing.T) {
		Start()
		if res := tr.InterceptResponse(ctx, func(ctx context.Context) *graphql.Response {
			return graphql.ErrorResponse(ctx, "foo error")
		}); res == nil {
			t.Errorf("got invalid response from intercept response")
		}
		if field, err := tr.InterceptField(ctx, func(ctx context.Context) (res interface{}, err error) {
			return &graphql.Response{}, nil
		}); field == nil || err != nil {
			t.Errorf("got invalid response from intercept field")
		}

		_, a := flush()
		// size, duration, errorsCount, fields duration
		if len(a) != 4 {
			t.Errorf("flush returned the wrong number of metrics [%v != %v]", len(a), 4)
			return
		}
	})
	Stop()
}
