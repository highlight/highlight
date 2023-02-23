package highlight

import (
	"context"
	"fmt"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
	"net/url"
	"reflect"
	"strings"
)

const OTLPDefaultEndpoint = "https://otel.highlight.io:4318"

const ErrorURLAttribute = "URL"
const SourceAttributeFrontend = "SubmitFrontendConsoleMessages"

const DeprecatedProjectIDAttribute = "highlight_project_id"
const DeprecatedSessionIDAttribute = "highlight_session_id"
const DeprecatedRequestIDAttribute = "highlight_trace_id"
const DeprecatedSourceAttribute = "Source"
const ProjectIDAttribute = "highlight.project_id"
const SessionIDAttribute = "highlight.session_id"
const RequestIDAttribute = "highlight.trace_id"
const SourceAttribute = "highlight.source"

const LogEvent = "log"
const LogSeverityAttribute = "log.severity"
const LogMessageAttribute = "log.message"

var InternalAttributes = []string{
	DeprecatedProjectIDAttribute,
	DeprecatedSessionIDAttribute,
	DeprecatedRequestIDAttribute,
	DeprecatedSourceAttribute,
	ProjectIDAttribute,
	SessionIDAttribute,
	RequestIDAttribute,
	SourceAttribute,
	LogMessageAttribute,
	LogSeverityAttribute,
}

type OTLP struct {
	tracerProvider *sdktrace.TracerProvider
}

type ErrorWithStack interface {
	Error() string
	StackTrace() errors.StackTrace
}

var (
	tracer = otel.GetTracerProvider().Tracer(
		"github.com/highlight/highlight/sdk/highlight-go",
		trace.WithInstrumentationVersion("v0.1.0"),
		trace.WithSchemaURL(semconv.SchemaURL),
	)
)

func StartOTLP() (*OTLP, error) {
	var options []otlptracehttp.Option
	if strings.HasPrefix(otlpEndpoint, "http://") {
		options = append(options, otlptracehttp.WithEndpoint(otlpEndpoint[7:]), otlptracehttp.WithInsecure())
	} else if strings.HasPrefix(otlpEndpoint, "https://") {
		options = append(options, otlptracehttp.WithEndpoint(otlpEndpoint[8:]))
	} else {
		logger.Errorf("an invalid otlp endpoint was configured %s", otlpEndpoint)
	}
	client := otlptracehttp.NewClient(options...)
	exporter, err := otlptrace.New(context.Background(), client)
	if err != nil {
		return nil, fmt.Errorf("creating OTLP trace exporter: %w", err)
	}
	resources, err := resource.New(context.Background(),
		resource.WithFromEnv(),
		resource.WithHost(),
		resource.WithContainer(),
		resource.WithOS(),
		resource.WithProcess(),
	)
	if err != nil {
		return nil, fmt.Errorf("creating OTLP resource context: %w", err)
	}
	h := &OTLP{
		tracerProvider: sdktrace.NewTracerProvider(
			sdktrace.WithSampler(sdktrace.AlwaysSample()),
			sdktrace.WithBatcher(exporter),
			sdktrace.WithResource(resources),
		),
	}
	otel.SetTracerProvider(h.tracerProvider)
	return h, nil
}

func (o *OTLP) shutdown() {
	err := o.tracerProvider.Shutdown(context.Background())
	if err != nil {
		logger.Error(err)
	}
}

func StartTrace(ctx context.Context, name string, tags ...attribute.KeyValue) (trace.Span, context.Context) {
	sessionID, requestID, _ := validateRequest(ctx)
	ctx, span := tracer.Start(ctx, name)
	attrs := []attribute.KeyValue{
		attribute.String(ProjectIDAttribute, projectID),
		attribute.String(SessionIDAttribute, sessionID),
		attribute.String(RequestIDAttribute, requestID),
	}
	attrs = append(attrs, tags...)
	span.SetAttributes(attrs...)
	return span, ctx
}

func EndTrace(span trace.Span) {
	span.End(trace.WithStackTrace(true))
}

func RecordSpanError(span trace.Span, err error, tags ...attribute.KeyValue) {
	if urlErr, ok := err.(*url.Error); ok {
		span.SetAttributes(attribute.String("Op", urlErr.Op))
		span.SetAttributes(attribute.String(ErrorURLAttribute, urlErr.URL))
	}
	span.SetAttributes(tags...)
	// if this is an error with true stacktrace, then create the event directly since otel doesn't support saving a custom stacktrace
	if stackErr, ok := err.(ErrorWithStack); ok {
		RecordSpanErrorWithStack(span, stackErr)
	} else {
		span.RecordError(err, trace.WithStackTrace(true))
	}
}

// RecordError processes `err` to be recorded as a part of the session or network request.
// Highlight session and trace are inferred from the context.
// If no sessionID is set, then the error is associated with the project without a session context.
func RecordError(ctx context.Context, err error, tags ...attribute.KeyValue) context.Context {
	span, ctx := StartTrace(ctx, "highlight-ctx", tags...)
	defer EndTrace(span)
	RecordSpanError(span, err)
	return ctx
}

func RecordSpanErrorWithStack(span trace.Span, err ErrorWithStack) {
	stackTrace := fmt.Sprintf("%+v", err.StackTrace())
	span.AddEvent(semconv.ExceptionEventName, trace.WithAttributes(
		semconv.ExceptionTypeKey.String(reflect.TypeOf(err).String()),
		semconv.ExceptionMessageKey.String(err.Error()),
		semconv.ExceptionStacktraceKey.String(stackTrace),
	))
}
