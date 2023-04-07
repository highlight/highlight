package highlight

// This schema/arch is taken from: https://github.com/99designs/gqlgen/blob/master/graphql/handler/apollotracing/tracer.go

import (
	"context"
	"fmt"
	"github.com/99designs/gqlgen/graphql"
	"github.com/pkg/errors"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
)

type GraphqlTracer interface {
	graphql.HandlerExtension
	graphql.ResponseInterceptor
	graphql.FieldInterceptor
	WithRequestFieldLogging() GraphqlTracer
}

type Tracer struct {
	graphName           string
	requestFieldLogging bool
}

func NewGraphqlTracer(graphName string) GraphqlTracer {
	return Tracer{graphName: graphName}
}

// WithRequestFieldLogging configures the tracer to log each graphql operation.
func (t Tracer) WithRequestFieldLogging() GraphqlTracer {
	t.requestFieldLogging = true
	return t
}

func (t Tracer) ExtensionName() string {
	return "HighlightTracer"
}

func (t Tracer) Validate(graphql.ExecutableSchema) error {
	return nil
}

// InterceptField instruments timing of individual fields resolved.
func (t Tracer) InterceptField(ctx context.Context, next graphql.Resolver) (interface{}, error) {
	// if we don't have a highlight session in the context, no point trying to
	// instrument since we won't be able to store the metric
	if _, _, err := validateRequest(ctx); err != nil {
		return next(ctx)
	}

	fc := graphql.GetFieldContext(ctx)
	name := fmt.Sprintf("operation.field.%s", fc.Field.Name)

	span, ctx := StartTrace(ctx, name)
	start := graphql.Now()
	res, err := next(ctx)
	end := graphql.Now()
	RecordSpanError(
		span, err,
		attribute.String(SourceAttribute, "InterceptField"),
		semconv.GraphqlOperationNameKey.String(name),
	)
	EndTrace(span)

	RecordMetric(ctx, name+".duration", end.Sub(start).Seconds())
	return res, err
}

// InterceptResponse instruments timing, payload size, and error information
// of the response handler. The metric is grouped by the corresponding operation name.
func (t Tracer) InterceptResponse(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {
	// if we don't have a highlight session in the context, no point trying to
	// instrument since we won't be able to store the metric
	if _, _, err := validateRequest(ctx); err != nil {
		return next(ctx)
	}

	var oc *graphql.OperationContext
	if graphql.HasOperationContext(ctx) {
		oc = graphql.GetOperationContext(ctx)
	}
	opName := "undefined"
	name := fmt.Sprintf("graphql.operation.%s", opName)
	if oc != nil {
		opName = oc.OperationName
		RecordMetric(ctx, name+".size", float64(len(oc.RawQuery)))
	}

	span, ctx := StartTrace(ctx, name)
	start := graphql.Now()
	resp := next(ctx)
	end := graphql.Now()
	t.log(ctx, span, resp.Errors)
	EndTrace(span)

	RecordMetric(ctx, name+".duration", end.Sub(start).Seconds())
	if resp.Errors != nil {
		RecordMetric(ctx, name+".errorsCount", float64(len(resp.Errors)))
	}
	return resp
}

func (t Tracer) log(ctx context.Context, span trace.Span, errs gqlerror.List) {
	if !t.requestFieldLogging {
		return
	}
	var oc *graphql.OperationContext
	if graphql.HasOperationContext(ctx) {
		oc = graphql.GetOperationContext(ctx)
	}
	err := errs.Error()
	lvl := "trace"
	if err != "" {
		lvl = "error"
	}
	attrs := []attribute.KeyValue{
		attribute.String("graphql.graph", t.graphName),
		attribute.String(LogSeverityAttribute, lvl),
	}
	if oc != nil {
		attrs = append(attrs,
			semconv.GraphqlOperationNameKey.String(oc.OperationName),
			semconv.GraphqlDocumentKey.String(oc.RawQuery),
		)
		if oc.Operation != nil {
			attrs = append(attrs,
				attribute.String(LogMessageAttribute, fmt.Sprintf("graphql.operation.%s", oc.Operation.Name)),
				semconv.GraphqlOperationTypeKey.String(string(oc.Operation.Operation)),
			)
		}
	}
	if err != "" {
		attrs = append(attrs, attribute.String("graphql.error", err))
	}
	span.AddEvent(LogEvent, trace.WithAttributes(attrs...))
	if err != "" {
		RecordSpanError(span, errs, attrs...)
	}
}

func GraphQLRecoverFunc() graphql.RecoverFunc {
	return func(ctx context.Context, err interface{}) error {
		var ok bool
		var e error
		if e, ok = err.(error); !ok {
			e = errors.Errorf("panic {error: %+v}", err)
		}
		RecordError(ctx, e, attribute.String(SourceAttribute, "GraphQLRecoverFunc"))
		return e
	}
}
