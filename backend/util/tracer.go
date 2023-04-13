package util

// This schema/arch is taken from: https://github.com/99designs/gqlgen/blob/master/graphql/handler/apollotracing/tracer.go

import (
	"context"
	"encoding/json"

	"github.com/99designs/gqlgen/graphql"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

type Tracer struct {
	graphql.HandlerExtension
	graphql.ResponseInterceptor
	graphql.FieldInterceptor

	serverType Runtime
}

func NewTracer(backend Runtime) Tracer {
	return Tracer{serverType: backend}
}

func (t Tracer) ExtensionName() string {
	return "HighlightTracer"
}

func (t Tracer) Validate(graphql.ExecutableSchema) error {
	return nil
}

func (t Tracer) InterceptField(ctx context.Context, next graphql.Resolver) (interface{}, error) {
	// taken from: https://docs.datadoghq.com/tracing/setup_overview/custom_instrumentation/go/#manually-creating-a-new-span
	fc := graphql.GetFieldContext(ctx)
	fieldSpan, ctx := tracer.StartSpanFromContext(ctx, "operation.field", tracer.ResourceName(fc.Field.Name))
	fieldSpan.SetTag("field.type", fc.Field.Definition.Type.String())
	if b, err := json.MarshalIndent(fc.Args, "", ""); err == nil {
		if bs := string(b); len(bs) <= 1000 {
			fieldSpan.SetTag("field.arguments", bs)
		}
	}
	start := graphql.Now()
	res, err := next(ctx)
	end := graphql.Now()
	fieldSpan.SetTag("field.duration", end.Sub(start))
	fieldSpan.Finish(tracer.WithError(err))

	return res, err
}

func (t Tracer) InterceptResponse(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {
	var oc *graphql.OperationContext
	if graphql.HasOperationContext(ctx) {
		oc = graphql.GetOperationContext(ctx)
	}
	// NOTE: This gets called for the first time at the highest level. Creates the 'tracing' value, calls the next handler
	// and returns the response.
	opName := "undefined"
	if oc != nil {
		opName = oc.OperationName
	}
	span, ctx := tracer.StartSpanFromContext(ctx, "graphql.operation", tracer.ResourceName(opName))
	span.SetTag("backend", t.serverType)
	defer span.Finish()
	resp := next(ctx)
	if resp.Errors != nil {
		var errs []ddtrace.FinishOption
		for _, err := range resp.Errors {
			errs = append(errs, tracer.WithError(err))
		}
		span.Finish(errs...)
	}
	return resp
}
