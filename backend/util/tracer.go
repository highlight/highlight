package util

import (
	"context"
	"sync"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/k0kubun/pp"
	"github.com/vektah/gqlparser/v2/ast"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

type (
	Tracer struct {
	}

	TracingExtension struct {
		mu         sync.Mutex
		Version    int           `json:"version"`
		StartTime  time.Time     `json:"startTime"`
		EndTime    time.Time     `json:"endTime"`
		Duration   time.Duration `json:"duration"`
		Parsing    Span          `json:"parsing"`
		Validation Span          `json:"validation"`
		Execution  struct {
			Resolvers []*ResolverExecution `json:"resolvers"`
		} `json:"execution"`
	}

	Span struct {
		StartOffset time.Duration `json:"startOffset"`
		Duration    time.Duration `json:"duration"`
	}

	ResolverExecution struct {
		Path        ast.Path      `json:"path"`
		ParentType  string        `json:"parentType"`
		FieldName   string        `json:"fieldName"`
		ReturnType  string        `json:"returnType"`
		StartOffset time.Duration `json:"startOffset"`
		Duration    time.Duration `json:"duration"`
	}
)

var _ interface {
	graphql.HandlerExtension
	graphql.ResponseInterceptor
	graphql.FieldInterceptor
} = Tracer{}

func (Tracer) ExtensionName() string {
	return "HighlightTracer"
}

func (Tracer) Validate(graphql.ExecutableSchema) error {
	return nil
}

func (Tracer) InterceptField(ctx context.Context, next graphql.Resolver) (interface{}, error) {
	td, ok := graphql.GetExtension(ctx, "tracing").(*TracingExtension)
	if !ok {
		return next(ctx)
	}

	start := graphql.Now()

	defer func() {
		end := graphql.Now()

		rc := graphql.GetOperationContext(ctx)
		fc := graphql.GetFieldContext(ctx)
		// Expand resolver values for a field into a ResolverExecution.
		resolver := &ResolverExecution{
			Path:        fc.Path(),
			ParentType:  fc.Object,
			FieldName:   fc.Field.Name,
			ReturnType:  fc.Field.Definition.Type.String(),
			StartOffset: start.Sub(rc.Stats.OperationStart),
			Duration:    end.Sub(start),
		}

		// Apppend the resolver for every field on the 'tracing' extension.
		td.mu.Lock()
		td.Execution.Resolvers = append(td.Execution.Resolvers, resolver)
		td.mu.Unlock()
	}()

	return next(ctx)
}

func (Tracer) InterceptResponse(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {
	rc := graphql.GetOperationContext(ctx)

	start := rc.Stats.OperationStart

	// NOTE: This gets called for the first time at the highest level. Creates the 'tracing' value, calls the next handler
	// and returns the response.
	span := tracer.StartSpan("graphql.operation", tracer.ResourceName(rc.Operation.Name))
	defer span.Finish()

	td := &TracingExtension{
		Version:   1,
		StartTime: start,
		Parsing: Span{
			StartOffset: rc.Stats.Parsing.Start.Sub(start),
			Duration:    rc.Stats.Parsing.End.Sub(rc.Stats.Parsing.Start),
		},

		Validation: Span{
			StartOffset: rc.Stats.Validation.Start.Sub(start),
			Duration:    rc.Stats.Validation.End.Sub(rc.Stats.Validation.Start),
		},
	}
	pp.Printf("started trace for: %v\n", rc.Operation.Name)

	graphql.RegisterExtension(ctx, "tracing", td)
	resp := next(ctx)

	end := graphql.Now()
	td.EndTime = end
	td.Duration = end.Sub(start)
	span.SetTag("duration", td.Duration)

	return resp
}
