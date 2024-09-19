package highlight

import (
	"context"
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"net/url"
	"reflect"
	"strings"
	"time"

	"github.com/samber/lo"

	"github.com/pkg/errors"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
	"go.opentelemetry.io/otel/trace"
)

const OTLPDefaultEndpoint = "https://otel.highlight.io:4318"

const ErrorURLAttribute = "URL"

const ProjectIDHeader = "x-highlight-project"
const DeprecatedProjectIDAttribute = "highlight_project_id"
const DeprecatedSessionIDAttribute = "highlight_session_id"
const DeprecatedRequestIDAttribute = "highlight_trace_id"
const DeprecatedSourceAttribute = "Source"
const ProjectIDAttribute = "highlight.project_id"
const SessionIDAttribute = "highlight.session_id"
const RequestIDAttribute = "highlight.trace_id"
const SourceAttribute = "highlight.source"
const TraceTypeAttribute = "highlight.type"
const TraceKeyAttribute = "highlight.key"

const LogEvent = "log"
const LogSeverityAttribute = "log.severity"
const LogMessageAttribute = "log.message"
const LogSeverityDefaultAttribute = "level"
const LogSeverityLegacyAttribute = "severity"
const LogMessageLegacyAttribute = "message"

const MetricEvent = "metric"
const MetricSpanName = "highlight-metric"
const MetricEventName = "metric.name"
const MetricEventValue = "metric.value"

const ErrorSpanName = "highlight.error"
const LogSpanName = "highlight.log"
const LogrusSpanName = "highlight.go.log"

type TraceType string

const TraceTypeNetworkRequest TraceType = "http.request"
const TraceTypeWebSocketRequest TraceType = "http.request.ws"
const TraceTypeFrontendConsole TraceType = "frontend.console"
const TraceTypeHighlightInternal TraceType = "highlight.internal"
const TraceTypePhoneHome TraceType = "highlight.phonehome"

type OTLP struct {
	tracerProvider *sdktrace.TracerProvider
}

type ErrorWithStack interface {
	Error() string
	StackTrace() errors.StackTrace
}

type highlightSampler struct {
	traceIDUpperBounds map[trace.SpanKind]uint64
	description        string
}

func (ts highlightSampler) ShouldSample(p sdktrace.SamplingParameters) sdktrace.SamplingResult {
	psc := trace.SpanContextFromContext(p.ParentContext)
	if psc.IsSampled() {
		return sdktrace.SamplingResult{
			Decision:   sdktrace.RecordAndSample,
			Tracestate: psc.TraceState(),
		}
	}
	x := binary.BigEndian.Uint64(p.TraceID[8:16]) >> 1
	bound, ok := ts.traceIDUpperBounds[p.Kind]
	if !ok {
		bound = ts.traceIDUpperBounds[trace.SpanKindUnspecified]
	}
	if x < bound {
		return sdktrace.SamplingResult{
			Decision:   sdktrace.RecordAndSample,
			Tracestate: psc.TraceState(),
		}
	}
	return sdktrace.SamplingResult{
		Decision:   sdktrace.Drop,
		Tracestate: psc.TraceState(),
	}
}

func (ts highlightSampler) Description() string {
	return ts.description
}

// creates a per-span-kind sampler that samples each kind at a provided fraction.
func getSampler() highlightSampler {
	if len(conf.samplingRateMap) == 0 {
		conf.samplingRateMap = map[trace.SpanKind]float64{
			trace.SpanKindUnspecified: 1.,
		}
	}
	return highlightSampler{
		description: fmt.Sprintf("TraceIDRatioBased{%+v}", conf.samplingRateMap),
		traceIDUpperBounds: lo.MapEntries(conf.samplingRateMap, func(key trace.SpanKind, value float64) (trace.SpanKind, uint64) {
			return key, uint64(value * (1 << 63))
		}),
	}
}

func CreateTracerProvider(endpoint string, opts ...sdktrace.TracerProviderOption) (*sdktrace.TracerProvider, error) {
	var options []otlptracehttp.Option
	if strings.HasPrefix(endpoint, "http://") {
		options = append(options, otlptracehttp.WithEndpoint(endpoint[7:]), otlptracehttp.WithInsecure())
	} else if strings.HasPrefix(endpoint, "https://") {
		options = append(options, otlptracehttp.WithEndpoint(endpoint[8:]))
	} else {
		logger.Errorf("an invalid otlp endpoint was configured %s", endpoint)
	}
	options = append(options, otlptracehttp.WithCompression(otlptracehttp.GzipCompression))
	client := otlptracehttp.NewClient(options...)
	exporter, err := otlptrace.New(context.Background(), client)
	if err != nil {
		return nil, fmt.Errorf("creating OTLP trace exporter: %w", err)
	}
	conf.resourceAttributes = append(
		conf.resourceAttributes,
		semconv.TelemetryDistroName("github.com/highlight/highlight/sdk/highlight-go"),
		semconv.TelemetryDistroVersion(Version),
	)
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
	opts = append([]sdktrace.TracerProviderOption{
		sdktrace.WithSampler(getSampler()),
		sdktrace.WithBatcher(exporter,
			sdktrace.WithBatchTimeout(time.Second),
			sdktrace.WithExportTimeout(30*time.Second),
			sdktrace.WithMaxExportBatchSize(1024*1024),
			sdktrace.WithMaxQueueSize(1024*1024),
		),
		sdktrace.WithResource(resources),
	}, opts...)
	return sdktrace.NewTracerProvider(opts...), nil
}

// default tracer is a noop tracer
var defaultTracerProvider = otel.GetTracerProvider()

func StartOTLP() (*OTLP, error) {
	tracerProvider, err := CreateTracerProvider(conf.otlpEndpoint)
	if err != nil {
		return nil, err
	}

	propagator := propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
	otel.SetTextMapPropagator(propagator)

	h := &OTLP{tracerProvider: tracerProvider}
	defaultTracerProvider = tracerProvider
	otel.SetTracerProvider(h.tracerProvider)
	return h, nil
}

func (o *OTLP) shutdown() {
	err := o.tracerProvider.ForceFlush(context.Background())
	if err != nil {
		logger.Error(err)
	}
	err = o.tracerProvider.Shutdown(context.Background())
	if err != nil {
		logger.Error(err)
	}
}

func StartTraceWithTracer(ctx context.Context, tracer trace.Tracer, name string, t time.Time, opts []trace.SpanStartOption, tags ...attribute.KeyValue) (trace.Span, context.Context) {
	sessionID, requestID, _ := validateRequest(ctx)
	spanCtx := trace.SpanContextFromContext(ctx)
	if requestID != "" {
		data, _ := base64.StdEncoding.DecodeString(requestID)
		hex := fmt.Sprintf("%032x", data)
		tid, _ := trace.TraceIDFromHex(hex)
		spanCtx = spanCtx.WithTraceID(tid)
	}
	opts = append(opts, trace.WithTimestamp(t))
	ctx, span := tracer.Start(trace.ContextWithSpanContext(ctx, spanCtx), name, opts...)
	span.SetAttributes(
		attribute.String(ProjectIDAttribute, conf.projectID),
		attribute.String(SessionIDAttribute, sessionID),
		attribute.String(RequestIDAttribute, requestID),
	)
	// prioritize values passed in tags for project, session, request ids
	span.SetAttributes(tags...)
	return span, ctx
}

func StartTraceWithTimestamp(ctx context.Context, name string, t time.Time, opts []trace.SpanStartOption, tags ...attribute.KeyValue) (trace.Span, context.Context) {
	return StartTraceWithTracer(ctx, defaultTracerProvider.Tracer(
		"github.com/highlight/highlight/sdk/highlight-go",
		trace.WithInstrumentationVersion("v0.1.0"),
		trace.WithSchemaURL(semconv.SchemaURL),
	), name, t, opts, tags...)
}

func StartTrace(ctx context.Context, name string, tags ...attribute.KeyValue) (trace.Span, context.Context) {
	return StartTraceWithTimestamp(ctx, name, time.Now(), nil, tags...)
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
	span, _ := StartTraceWithTimestamp(ctx, MetricSpanName, time.Now(), []trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)}, tags...)
	defer EndTrace(span)
	span.AddEvent(MetricEvent, trace.WithAttributes(attribute.String(MetricEventName, name), attribute.Float64(MetricEventValue, value)))
}

// RecordError processes `err` to be recorded as a part of the session or network request.
// Highlight session and trace are inferred from the context.
// If no sessionID is set, then the error is associated with the project without a session context.
func RecordError(ctx context.Context, err error, tags ...attribute.KeyValue) context.Context {
	span, ctx := StartTraceWithTimestamp(ctx, ErrorSpanName, time.Now(), []trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)}, tags...)
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
