package highlight

import (
	"context"
	"fmt"
	"net/url"
	"reflect"
	"strings"

	"github.com/pkg/errors"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
)

const OTLPDefaultEndpoint = "https://otel.highlight.io:4318"

const ErrorURLAttribute = "URL"

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

const MetricEvent = "metric"
const MetricEventName = "metric.name"
const MetricEventValue = "metric.value"

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
	if strings.HasPrefix(conf.otlpEndpoint, "http://") {
		options = append(options, otlptracehttp.WithEndpoint(conf.otlpEndpoint[7:]), otlptracehttp.WithInsecure())
	} else if strings.HasPrefix(conf.otlpEndpoint, "https://") {
		options = append(options, otlptracehttp.WithEndpoint(conf.otlpEndpoint[8:]))
	} else {
		logger.Errorf("an invalid otlp endpoint was configured %s", conf.otlpEndpoint)
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
		resource.WithAttributes(conf.resourceAttributes...),
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
		attribute.String(ProjectIDAttribute, conf.projectID),
		attribute.String(SessionIDAttribute, sessionID),
		attribute.String(RequestIDAttribute, requestID),
	}
	attrs = append(attrs, tags...)
	span.SetAttributes(attrs...)
	return span, ctx
}

func StartTraceWithoutResourceAttributes(ctx context.Context, name string, tags ...attribute.KeyValue) (trace.Span, context.Context) {
	resourceAttributes := []attribute.KeyValue{
		semconv.ServiceNameKey.String(""),
		semconv.ServiceVersionKey.String(""),
		semconv.ContainerIDKey.String(""),
		semconv.HostNameKey.String(""),
		semconv.OSDescriptionKey.String(""),
		semconv.OSTypeKey.String(""),
		semconv.ProcessExecutableNameKey.String(""),
		semconv.ProcessExecutablePathKey.String(""),
		semconv.ProcessOwnerKey.String(""),
		semconv.ProcessPIDKey.String(""),
		semconv.ProcessRuntimeDescriptionKey.String(""),
		semconv.ProcessRuntimeNameKey.String(""),
		semconv.ProcessRuntimeVersionKey.String(""),
	}

	attrs := append(resourceAttributes, tags...)

	return StartTrace(ctx, name, attrs...)
}

func EndTrace(span trace.Span) {
	span.End(trace.WithStackTrace(true))
}

// RecordMetric is used to record arbitrary metrics in your golang backend.
// Highlight will process these metrics in the context of your session and expose them
// through dashboards. For example, you may want to record the latency of a DB query
// as a metric that you would like to graph and monitor. You'll be able to view the metric
// in the context of the session and network request and recorded it.
func RecordMetric(ctx context.Context, name string, value float64, tags ...attribute.KeyValue) {
	span, _ := StartTrace(ctx, "highlight-ctx", tags...)
	defer EndTrace(span)
	tags = append(tags, attribute.String(MetricEventName, name), attribute.Float64(MetricEventValue, value))
	span.AddEvent(MetricEvent, trace.WithAttributes(tags...))
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

func RecordSpanError(span trace.Span, err error, tags ...attribute.KeyValue) {
	if urlErr, ok := err.(*url.Error); ok {
		span.SetAttributes(attribute.String("Op", urlErr.Op))
		span.SetAttributes(attribute.String(ErrorURLAttribute, urlErr.URL))
	}
	span.SetAttributes(tags...)
	// if this is an error with true stacktrace, then create the event directly since otel doesn't support saving a custom stacktrace
	var stackErr ErrorWithStack
	if errors.As(err, &stackErr) {
		RecordSpanErrorWithStack(span, stackErr)
	} else {
		span.RecordError(err, trace.WithStackTrace(true))
	}
}

func RecordSpanErrorWithStack(span trace.Span, err ErrorWithStack) {
	stackTrace := fmt.Sprintf("%+v", err.StackTrace())
	span.AddEvent(semconv.ExceptionEventName, trace.WithAttributes(
		semconv.ExceptionTypeKey.String(reflect.TypeOf(err).String()),
		semconv.ExceptionMessageKey.String(err.Error()),
		semconv.ExceptionStacktraceKey.String(stackTrace),
	))
}
