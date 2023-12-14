package htrace

import (
	"context"
	"github.com/99designs/gqlgen/graphql"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/vektah/gqlparser/v2/ast"
	"testing"
)

func TestTracer(t *testing.T) {
	ctx := context.Background()
	ctx = context.WithValue(ctx, highlight.ContextKeys.SessionSecureID, "0")
	ctx = context.WithValue(ctx, highlight.ContextKeys.RequestID, "0")
	ctx = graphql.WithOperationContext(ctx, &graphql.OperationContext{
		Operation:     &ast.OperationDefinition{},
		OperationName: "test-operation",
		RawQuery:      "test-query",
	})
	ctx = graphql.WithFieldContext(ctx, &graphql.FieldContext{
		Field: graphql.CollectedField{
			Field: &ast.Field{Name: "test-field"},
		},
	})
	tr := NewGraphqlTracer("test")
	t.Run("test basic intercept", func(t *testing.T) {
		highlight.Start()
		if res := tr.InterceptResponse(ctx, func(ctx context.Context) *graphql.Response {
			return graphql.ErrorResponse(ctx, "foo error")
		}); res == nil {
			t.Errorf("got invalid response from intercept response")
		}
		if field, err := tr.InterceptField(ctx, func(ctx context.Context) (res interface{}, err error) {
			return &graphql.Response{}, nil
		}); field == nil || err != nil {
			t.Errorf("got invalid response from intercept field")
		}
	})
	highlight.Stop()
}
