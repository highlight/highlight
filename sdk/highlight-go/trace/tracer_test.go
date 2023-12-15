package htrace

import (
	"context"
	"encoding/json"
	"github.com/99designs/gqlgen/graphql"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/stretchr/testify/assert"
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

func BenchmarkOld(b *testing.B) {
	data := map[string]interface{}{"direction": "DESC", "params": map[string]interface{}{"date_range": map[string]interface{}{"end_date": "2023-12-15T00:28:37.564391000-00:00", "start_date": "2023-12-15T00:28:37.522161000-00:00"}, "query": "work happening"}, "project_id": "1"}

	var err error
	var out []byte
	for i := 0; i < b.N; i++ {
		out, err = json.MarshalIndent(data, "", "")
		assert.NoError(b, err)
	}
	b.Log(string(out))
}

func BenchmarkNew(b *testing.B) {
	data := map[string]interface{}{"direction": "DESC", "params": map[string]interface{}{"date_range": map[string]interface{}{"end_date": "2023-12-15T00:28:37.564391000-00:00", "start_date": "2023-12-15T00:28:37.522161000-00:00"}, "query": "work happening"}, "project_id": "1"}

	var out string
	for i := 0; i < b.N; i++ {
		out = serializeVars(data)
	}
	b.Log(out)
}
