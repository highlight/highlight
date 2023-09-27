package util

// This schema/arch is taken from: https://github.com/99designs/gqlgen/blob/master/graphql/handler/apollotracing/tracer.go

import (
	"context"
	"encoding/json"
	"time"

	"github.com/99designs/gqlgen/graphql"
	log "github.com/sirupsen/logrus"
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
	start := time.Now()
	// taken from: https://docs.datadoghq.com/tracing/setup_overview/custom_instrumentation/go/#manually-creating-a-new-span
	fc := graphql.GetFieldContext(ctx)
	fieldSpan, ctx := StartSpanFromContext(ctx, "operation.field", ResourceName(fc.Field.Name))
	fieldSpan.SetAttribute("field.type", fc.Field.Definition.Type.String())
	if b, err := json.MarshalIndent(fc.Args, "", ""); err == nil {
		if bs := string(b); len(bs) <= 1000 {
			fieldSpan.SetAttribute("field.arguments", bs)
		}
	}
	res, err := next(ctx)
	fieldSpan.Finish(err)

	if t.serverType == PrivateGraph {
		fields := log.Fields{
			"duration":        time.Since(start).Seconds(),
			"operation.field": fc.Field.Name,
			"graph":           t.serverType,
		}
		if err != nil {
			fields["error"] = err
		}
		log.WithContext(ctx).
			WithFields(fields).
			Debugf("graphql field")
	}
	return res, err
}

func (t Tracer) InterceptResponse(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {
	start := time.Now()
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
	span, ctx := StartSpanFromContext(ctx, "graphql.operation", ResourceName(opName))
	span.SetAttribute("backend", t.serverType)
	defer span.Finish()
	resp := next(ctx)
	if resp != nil {
		var errs []error
		for _, err := range resp.Errors {
			errs = append(errs, err)
		}
		span.Finish(errs...)
	}
	if t.serverType == PrivateGraph {
		fields := log.Fields{
			"duration":          time.Since(start).Seconds(),
			"graphql.operation": opName,
			"graph":             t.serverType,
		}
		if resp != nil && len(resp.Errors) > 0 {
			fields["errors"] = resp.Errors
		}
		log.WithContext(ctx).
			WithFields(fields).
			Infof("graphql request")
	}
	return resp
}
