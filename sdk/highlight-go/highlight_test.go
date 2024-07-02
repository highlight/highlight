package highlight

import (
	"context"
	"fmt"
	"net/http/httptest"
	"testing"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"

	"github.com/huandu/go-assert"
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

func TestOtelHeaderRequestPropagation(t *testing.T) {
	propagator := propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
	otel.SetTextMapPropagator(propagator)

	customTraceID, _ := trace.TraceIDFromHex("0123456789abcdef0123456789abcdef")
	spanID, _ := trace.SpanIDFromHex("0123456789abcdef")
	spanContext := trace.NewSpanContext(trace.SpanContextConfig{
		TraceID: customTraceID,
		SpanID:  spanID,
		Remote:  true,
	})
	ctx := trace.ContextWithSpanContext(context.Background(), spanContext)

	tracer := otel.Tracer("test")
	ctx, span := tracer.Start(ctx, "test-span")
	defer span.End()

	req := httptest.NewRequest("GET", "http://example.com", nil)
	req.Header.Set("X-Highlight-Request", "123/456")
	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))

	newCtx := InterceptRequest(req)

	assert.Equal(t, trace.SpanFromContext(newCtx).SpanContext().TraceID(), customTraceID)
	assert.Equal(t, newCtx.Value(ContextKeys.SessionSecureID), nil)
	assert.Equal(t, newCtx.Value(ContextKeys.RequestID), nil)
}

func TestInterceptHighlightHeaderRequestPropagation(t *testing.T) {
	req := httptest.NewRequest("GET", "http://example.com", nil)
	req.Header.Set("X-Highlight-Request", "123/456")

	newCtx := InterceptRequest(req)

	assert.Equal(t, newCtx.Value(ContextKeys.SessionSecureID), "123")
	assert.Equal(t, newCtx.Value(ContextKeys.RequestID), "456")
}
