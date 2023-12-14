package htrace

// This schema/arch is taken from: https://github.com/99designs/gqlgen/blob/master/graphql/handler/apollotracing/tracer.go

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/99designs/gqlgen/graphql"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
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
	fc := graphql.GetFieldContext(ctx)
	fieldName := fc.Field.Name
	name := fmt.Sprintf("graphql.field.%s", fieldName)
	span, ctx := highlight.StartTrace(ctx, name)
	span.SetAttributes(
		semconv.ServiceNameKey.String(t.graphName),
		attribute.String("graphql.field.name", fieldName),
		attribute.String("graphql.object.type", fc.Object),
	)
	if b, err := json.MarshalIndent(fc.Args, "", ""); err == nil {
		if bs := string(b); len(bs) < 2048 {
			span.SetAttributes(attribute.String("graphql.field.arguments", bs))
		}
	}
	res, err := next(ctx)
	highlight.RecordSpanError(
		span, err,
		attribute.String(highlight.SourceAttribute, "InterceptField"),
	)
	highlight.EndTrace(span)

	return res, err
}

// InterceptResponse instruments timing, payload size, and error information
// of the response handler. The metric is grouped by the corresponding operation name.
func (t Tracer) InterceptResponse(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {
	var oc *graphql.OperationContext
	if graphql.HasOperationContext(ctx) {
		oc = graphql.GetOperationContext(ctx)
	}
	opName := "undefined"
	variables := ""
	if oc != nil {
		opName = oc.OperationName
		if b, err := json.MarshalIndent(oc.Variables, "", ""); err == nil {
			if bs := string(b); len(bs) < 2048 {
				variables = bs
			}
		}
	}
	name := fmt.Sprintf("graphql.operation.%s", opName)

	span, ctx := highlight.StartTrace(ctx, name)
	span.SetAttributes(
		semconv.ServiceNameKey.String(t.graphName),
		semconv.GraphqlOperationName(opName),
		attribute.String("graphql.operation.variables", variables),
	)
	resp := next(ctx)
	// though there is a resp.Errors, we should not record it because it will
	// be a duplicate of errors on individual fields.
	highlight.EndTrace(span)

	return resp
}

func GraphQLRecoverFunc() graphql.RecoverFunc {
	return func(ctx context.Context, err interface{}) error {
		var ok bool
		var e error
		if e, ok = err.(error); !ok {
			e = errors.Errorf("panic {error: %+v}", err)
		}
		highlight.RecordError(ctx, e, attribute.String(highlight.SourceAttribute, "GraphQLRecoverFunc"))
		return e
	}
}

func GraphQLErrorPresenter(service string) func(ctx context.Context, e error) *gqlerror.Error {
	return func(ctx context.Context, e error) *gqlerror.Error {
		var gqlerr *gqlerror.Error
		switch t := e.(type) {
		case *gqlerror.Error:
			gqlerr = t
			log.WithContext(ctx).WithError(t).WithFields(log.Fields{
				"message":    t.Message,
				"rule":       t.Rule,
				"path":       t.Path,
				"extensions": t.Extensions,
				"locations":  t.Locations,
			}).Errorf("%s graphql request failed", service)
		default:
			gqlerr = gqlerror.Errorf(e.Error())
			log.WithContext(ctx).WithError(e).WithFields(log.Fields{
				"error": e,
				"path":  graphql.GetPath(ctx),
			}).Errorf("%s graphql request failed", service)
		}
		return gqlerr
	}
}
