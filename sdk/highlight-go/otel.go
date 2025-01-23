package highlight

import (
	"context"
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"github.com/pkg/errors"
	"github.com/samber/lo"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/log"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/propagation"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
	"go.opentelemetry.io/otel/trace"
	"net/url"
	"reflect"
	"strings"
	"sync"
	"time"
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
const EnvironmentAttribute = "environment"

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
	loggerProvider *sdklog.LoggerProvider
	meterProvider  *sdkmetric.MeterProvider
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

func getOTLPOptions(endpoint string) (traceOpts []otlptracehttp.Option, logOpts []otlploghttp.Option, metricOpts []otlpmetrichttp.Option) {
	if strings.HasPrefix(endpoint, "http://") {
		traceOpts = append(traceOpts, otlptracehttp.WithEndpoint(endpoint[7:]), otlptracehttp.WithInsecure())
		logOpts = append(logOpts, otlploghttp.WithEndpoint(endpoint[7:]), otlploghttp.WithInsecure())
		metricOpts = append(metricOpts, otlpmetrichttp.WithEndpoint(endpoint[7:]), otlpmetrichttp.WithInsecure())
	} else if strings.HasPrefix(endpoint, "https://") {
		traceOpts = append(traceOpts, otlptracehttp.WithEndpoint(endpoint[8:]))
		logOpts = append(logOpts, otlploghttp.WithEndpoint(endpoint[8:]))
		metricOpts = append(metricOpts, otlpmetrichttp.WithEndpoint(endpoint[8:]))
	} else {
		logger.Errorf("an invalid otlp endpoint was configured %s", endpoint)
	}
	traceOpts = append(traceOpts, otlptracehttp.WithCompression(otlptracehttp.GzipCompression))
	logOpts = append(logOpts, otlploghttp.WithCompression(otlploghttp.GzipCompression))
	metricOpts = append(metricOpts, otlpmetrichttp.WithCompression(otlpmetrichttp.GzipCompression))
	return
}

func getTraceID(requestID string) trace.TraceID {
	tid, err := trace.TraceIDFromHex(requestID)
	if err != nil {
		data, _ := base64.StdEncoding.DecodeString(requestID)
		hex := fmt.Sprintf("%032x", data)
		tid, _ = trace.TraceIDFromHex(hex)
	}
	return tid
}

func CreateTracerProvider(ctx context.Context, endpoint string, opts ...sdktrace.TracerProviderOption) (*sdktrace.TracerProvider, error) {
	options, _, _ := getOTLPOptions(endpoint)
	client := otlptracehttp.NewClient(options...)
	exporter, err := otlptrace.New(ctx, client)
	if err != nil {
		return nil, fmt.Errorf("creating OTLP trace exporter: %w", err)
	}
	conf.resourceAttributes = append(
		conf.resourceAttributes,
		semconv.TelemetryDistroName("github.com/highlight/highlight/sdk/highlight-go"),
		semconv.TelemetryDistroVersion(Version),
		attribute.String(ProjectIDAttribute, conf.projectID),
	)
	resources, err := resource.New(ctx,
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

func CreateLoggerProvider(ctx context.Context, endpoint string, opts ...sdklog.LoggerProviderOption) (*sdklog.LoggerProvider, error) {
	_, options, _ := getOTLPOptions(endpoint)
	exporter, err := otlploghttp.New(ctx, options...)
	if err != nil {
		return nil, fmt.Errorf("creating OTLP trace exporter: %w", err)
	}
	conf.resourceAttributes = append(
		conf.resourceAttributes,
		semconv.TelemetryDistroName("github.com/highlight/highlight/sdk/highlight-go"),
		semconv.TelemetryDistroVersion(Version),
	)
	resources, err := resource.New(ctx,
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
	opts = append([]sdklog.LoggerProviderOption{
		sdklog.WithProcessor(sdklog.NewBatchProcessor(exporter,
			sdklog.WithExportTimeout(30*time.Second),
			sdklog.WithExportMaxBatchSize(1024*1024),
			sdklog.WithMaxQueueSize(1024*1024),
		)),
		sdklog.WithResource(resources),
	}, opts...)
	return sdklog.NewLoggerProvider(opts...), nil
}

func CreateMeterProvider(ctx context.Context, endpoint string, opts ...sdkmetric.Option) (*sdkmetric.MeterProvider, error) {
	_, _, options := getOTLPOptions(endpoint)
	exporter, err := otlpmetrichttp.New(ctx, options...)
	if err != nil {
		return nil, fmt.Errorf("creating OTLP trace exporter: %w", err)
	}
	conf.resourceAttributes = append(
		conf.resourceAttributes,
		semconv.TelemetryDistroName("github.com/highlight/highlight/sdk/highlight-go"),
		semconv.TelemetryDistroVersion(Version),
	)
	resources, err := resource.New(ctx,
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
	opts = append([]sdkmetric.Option{
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter,
			sdkmetric.WithInterval(5*time.Second),
			sdkmetric.WithTimeout(30*time.Second),
		)),
		sdkmetric.WithResource(resources),
	}, opts...)
	return sdkmetric.NewMeterProvider(opts...), nil
}

// default tracer is a noop tracer
var defaultTracerProvider = otel.GetTracerProvider()
var defaultLoggerProvider *sdklog.LoggerProvider
var defaultMeterProvider = otel.GetMeterProvider()

var defaultTracer = defaultTracerProvider.Tracer(
	"github.com/highlight/highlight/sdk/highlight-go",
	trace.WithInstrumentationVersion(Version),
	trace.WithSchemaURL(semconv.SchemaURL),
)
var defaultLogger log.Logger
var defaultMeter = defaultMeterProvider.Meter(
	"github.com/highlight/highlight/sdk/highlight-go",
	metric.WithInstrumentationVersion(Version),
	metric.WithSchemaURL(semconv.SchemaURL),
)

func StartOTLP() (*OTLP, error) {
	ctx := context.Background()

	tracerProvider, err := CreateTracerProvider(ctx, conf.otlpEndpoint)
	if err != nil {
		return nil, err
	}

	loggerProvider, err := CreateLoggerProvider(ctx, conf.otlpEndpoint)
	if err != nil {
		return nil, err
	}

	meterProvider, err := CreateMeterProvider(ctx, conf.otlpEndpoint)
	if err != nil {
		return nil, err
	}

	propagator := propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
	otel.SetTextMapPropagator(propagator)

	h := &OTLP{tracerProvider: tracerProvider, loggerProvider: loggerProvider, meterProvider: meterProvider}
	defaultTracerProvider = tracerProvider
	defaultLoggerProvider = loggerProvider
	defaultMeterProvider = meterProvider
	otel.SetTracerProvider(h.tracerProvider)
	otel.SetMeterProvider(h.meterProvider)

	defaultTracer = defaultTracerProvider.Tracer(
		"github.com/highlight/highlight/sdk/highlight-go",
		trace.WithInstrumentationVersion(Version),
		trace.WithSchemaURL(semconv.SchemaURL),
	)
	defaultLogger = defaultLoggerProvider.Logger(
		"github.com/highlight/highlight/sdk/highlight-go",
		log.WithInstrumentationVersion(Version),
		log.WithSchemaURL(semconv.SchemaURL),
	)
	defaultMeter = defaultMeterProvider.Meter(
		"github.com/highlight/highlight/sdk/highlight-go",
		metric.WithInstrumentationVersion(Version),
		metric.WithSchemaURL(semconv.SchemaURL),
	)

	return h, nil
}

func (o *OTLP) shutdown() {
	ctx := context.Background()
	err := o.tracerProvider.ForceFlush(ctx)
	if err != nil {
		logger.Error(err)
	}
	err = o.tracerProvider.Shutdown(ctx)
	if err != nil {
		logger.Error(err)
	}
	err = o.loggerProvider.ForceFlush(ctx)
	if err != nil {
		logger.Error(err)
	}
	err = o.loggerProvider.Shutdown(ctx)
	if err != nil {
		logger.Error(err)
	}
	err = o.meterProvider.ForceFlush(ctx)
	if err != nil {
		logger.Error(err)
	}
	err = o.meterProvider.Shutdown(ctx)
	if err != nil {
		logger.Error(err)
	}
}

func StartTraceWithTracer(ctx context.Context, tracer trace.Tracer, name string, t time.Time, opts []trace.SpanStartOption, tags ...attribute.KeyValue) (trace.Span, context.Context) {
	sessionID, requestID, _ := validateRequest(ctx)
	spanCtx := trace.SpanContextFromContext(ctx)
	if requestID != "" {
		// try parse the requestID as hex; fall back to parsing as base64
		tid := getTraceID(requestID)
		spanCtx = spanCtx.WithTraceID(tid)
	}
	opts = append(opts, trace.WithTimestamp(t))
	ctx, span := tracer.Start(trace.ContextWithSpanContext(ctx, spanCtx), name, opts...)
	span.SetAttributes(
		attribute.String(SessionIDAttribute, sessionID),
		attribute.String(RequestIDAttribute, requestID),
	)
	// prioritize values passed in tags for project, session, request ids
	span.SetAttributes(tags...)
	return span, ctx
}

func StartTraceWithTimestamp(ctx context.Context, name string, t time.Time, opts []trace.SpanStartOption, tags ...attribute.KeyValue) (trace.Span, context.Context) {
	return StartTraceWithTracer(ctx, defaultTracer, name, t, opts, tags...)
}

func StartTrace(ctx context.Context, name string, tags ...attribute.KeyValue) (trace.Span, context.Context) {
	return StartTraceWithTimestamp(ctx, name, time.Now(), nil, tags...)
}

func EndTrace(span trace.Span) {
	span.End(trace.WithStackTrace(true))
}

func getMetricContext(ctx context.Context, opts []metric.RecordOption, tags ...attribute.KeyValue) (context.Context, []attribute.KeyValue) {
	sessionID, requestID, _ := validateRequest(ctx)
	spanCtx := trace.SpanContextFromContext(ctx)
	if requestID != "" {
		// try parse the requestID as hex; fall back to parsing as base64
		tid := getTraceID(requestID)
		spanCtx = spanCtx.WithTraceID(tid)
	}
	// prioritize values passed in tags for project, session, request ids
	tags = append([]attribute.KeyValue{
		attribute.String(SessionIDAttribute, sessionID),
		attribute.String(RequestIDAttribute, requestID)},
		tags...,
	)
	return trace.ContextWithSpanContext(ctx, spanCtx), tags
}

var float64GaugesLock = sync.RWMutex{}
var float64Gauges = make(map[string]metric.Float64Gauge, 1000)
var float64HistogramsLock = sync.RWMutex{}
var float64Histograms = make(map[string]metric.Float64Histogram, 1000)
var int64CountersLock = sync.RWMutex{}
var int64Counters = make(map[string]metric.Int64Counter, 1000)

// RecordMetric is used to record arbitrary metrics in your golang backend.
// Highlight will process these metrics in the context of your session and expose them
// through dashboards. For example, you may want to record the latency of a DB query
// as a metric that you would like to graph and monitor. You'll be able to view the metric
// in the context of the session and network request and recorded it.
func RecordMetric(ctx context.Context, name string, value float64, tags ...attribute.KeyValue) {
	var err error
	float64GaugesLock.RLock()
	if g := float64Gauges[name]; g == nil {
		float64GaugesLock.RUnlock()
		float64GaugesLock.Lock()
		float64Gauges[name], err = defaultMeter.Float64Gauge(name)
		float64GaugesLock.Unlock()
		if err != nil {
			fmt.Printf("error creating float64 gauge %s: %v", name, err)
			return
		}
	} else {
		float64GaugesLock.RUnlock()
	}
	metricCtx, tags := getMetricContext(ctx, nil, tags...)
	float64Gauges[name].Record(metricCtx, value, metric.WithAttributes(tags...))
}

func RecordHistogram(ctx context.Context, name string, value float64, tags ...attribute.KeyValue) {
	var err error
	float64HistogramsLock.RLock()
	if h := float64Histograms[name]; h == nil {
		float64HistogramsLock.RUnlock()
		float64HistogramsLock.Lock()
		float64Histograms[name], err = defaultMeter.Float64Histogram(name)
		float64HistogramsLock.Unlock()
		if err != nil {
			fmt.Printf("error creating float64 histogram %s: %v", name, err)
			return
		}
	} else {
		float64HistogramsLock.RUnlock()
	}
	metricCtx, tags := getMetricContext(ctx, nil, tags...)
	float64Histograms[name].Record(metricCtx, value, metric.WithAttributes(tags...))
}

func RecordCount(ctx context.Context, name string, value int64, tags ...attribute.KeyValue) {
	var err error
	int64CountersLock.RLock()
	if c := int64Counters[name]; c == nil {
		int64CountersLock.RUnlock()
		int64CountersLock.Lock()
		int64Counters[name], err = defaultMeter.Int64Counter(name)
		int64CountersLock.Unlock()
		if err != nil {
			fmt.Printf("error creating float64 histogram %s: %v", name, err)
			return
		}
	} else {
		int64CountersLock.RUnlock()
	}
	metricCtx, tags := getMetricContext(ctx, nil, tags...)
	int64Counters[name].Add(metricCtx, value, metric.WithAttributes(tags...))
}

func RecordLogWithLogger(ctx context.Context, lg log.Logger, record log.Record, tags ...log.KeyValue) error {
	sessionID, requestID, _ := validateRequest(ctx)
	spanCtx := trace.SpanContextFromContext(ctx)
	if requestID != "" {
		// try parse the requestID as hex; fall back to parsing as base64
		tid := getTraceID(requestID)
		spanCtx = spanCtx.WithTraceID(tid)
	}
	// prioritize values passed in tags for project, session, request ids
	tags = append([]log.KeyValue{
		log.String(SessionIDAttribute, sessionID),
		log.String(RequestIDAttribute, requestID)},
		tags...,
	)
	record.AddAttributes(tags...)
	lg.Emit(trace.ContextWithSpanContext(ctx, spanCtx), record)
	return nil
}

// RecordLog is used to record arbitrary logs in your golang backend.
// This function is under active development as the OpenTelemetry logging API is still in beta.
func RecordLog(ctx context.Context, record log.Record, tags ...log.KeyValue) error {
	return RecordLogWithLogger(ctx, defaultLogger, record, tags...)
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
