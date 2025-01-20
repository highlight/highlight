package gorillamux

import (
	"github.com/highlight/highlight/sdk/highlight-go/middleware"
	"go.opentelemetry.io/otel/attribute"
	"net/http"

	"github.com/highlight/highlight/sdk/highlight-go"
)

// Middleware is a gorilla/mux compatible middleware
// use as follows:
//
// import highlightgorilla "github.com/highlight/highlight/sdk/highlight-go/middleware/gorillamux"
// ...
// r.Use(highlightgorilla.Middleware)
func Middleware(next http.Handler) http.Handler {
	middleware.CheckStatus()
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := highlight.InterceptRequest(r)
		r = r.WithContext(ctx)

		attrs, requestName := middleware.GetRequestAttributes(r)
		span, ctx := highlight.StartTrace(ctx, requestName)
		defer highlight.EndTrace(span)
		defer middleware.Recoverer(span, w, r)

		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)

		span.SetAttributes(attribute.String(highlight.SourceAttribute, "go.gorillamux"))
		span.SetAttributes(attrs...)
	}
	return http.HandlerFunc(fn)
}
