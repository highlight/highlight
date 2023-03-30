package highlight

// This schema/arch is taken from: https://github.com/99designs/gqlgen/blob/master/graphql/handler/apollotracing/tracer.go

import (
	"context"
	"fmt"
	"github.com/99designs/gqlgen/graphql"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

type GraphqlTracer interface {
	graphql.HandlerExtension
	graphql.ResponseInterceptor
	graphql.FieldInterceptor
	WithRequestFieldLogging(enabled bool) GraphqlTracer
}

type Tracer struct {
	graphName           string
	requestFieldLogging bool
}

func NewGraphqlTracer(graphName string) GraphqlTracer {
	return Tracer{graphName: graphName}
}

// WithRequestFieldLogging configures the tracer to log each graphql operation.
func (t Tracer) WithRequestFieldLogging(enabled bool) GraphqlTracer {
	t.requestFieldLogging = enabled
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
	t.logTrace(ctx, fc, res, err)
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

	rc := graphql.GetOperationContext(ctx)
	opName := "undefined"
	if rc != nil && rc.Operation != nil {
		opName = rc.OperationName
	}
	name := fmt.Sprintf("graphql.operation.%s", opName)
	RecordMetric(ctx, name+".size", float64(len(rc.RawQuery)))

	span, ctx := StartTrace(ctx, name)
	start := graphql.Now()
	resp := next(ctx)
	end := graphql.Now()
	EndTrace(span)

	RecordMetric(ctx, name+".duration", end.Sub(start).Seconds())
	if resp.Errors != nil {
		RecordMetric(ctx, name+".errorsCount", float64(len(resp.Errors)))
	}
	return resp
}

func (t Tracer) logTrace(ctx context.Context, fc *graphql.FieldContext, res interface{}, err error) {
	lg := logrus.WithContext(ctx).
		WithField(string(semconv.GraphqlOperationTypeKey), fc.Field.Definition.Type.String()).
		WithField(string(semconv.GraphqlOperationNameKey), fmt.Sprintf("operation.field.%s", fc.Field.Name)).
		WithField(string(semconv.GraphqlDocumentKey), fc.Field.Name).
		WithField("result", res).
		WithField("graphql.graph", t.graphName)

	if err != nil {
		lg.WithError(err).Errorf("graphql field failed %+v: %+v", res, err)
	} else {
		lg.Infof("graphql field ok %+v", res)
	}
}
