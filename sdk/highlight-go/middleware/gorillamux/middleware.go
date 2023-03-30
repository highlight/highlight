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

		span, hCtx := highlight.StartTrace(ctx, "highlight/gorillamux")
		defer highlight.EndTrace(span)

		next.ServeHTTP(w, r)

		highlight.MarkBackendSetup(hCtx)
		span.SetAttributes(attribute.String(highlight.SourceAttribute, "GoChiMiddleware"))
		span.SetAttributes(middleware.GetRequestAttributes(r)...)
	}
	return http.HandlerFunc(fn)
}
