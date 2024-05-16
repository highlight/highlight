package util

// This schema/arch is taken from: https://github.com/99designs/gqlgen/blob/master/graphql/handler/apollotracing/tracer.go

import (
	"context"
	"time"

	"github.com/99designs/gqlgen/graphql"
	log "github.com/sirupsen/logrus"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
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
	return next(ctx)
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
	resp := next(ctx)
	fields := log.Fields{
		"duration":                              time.Since(start).Seconds(),
		"graph":                                 t.serverType,
		string(semconv.GraphqlOperationNameKey): opName,
	}
	if resp != nil && len(resp.Errors) > 0 {
		fields["errors"] = resp.Errors
	}
	log.WithContext(ctx).
		WithFields(fields).
		Infof("%s graphql request", t.serverType)
	return resp
}
