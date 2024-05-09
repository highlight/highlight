package chi

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/highlight/highlight/sdk/highlight-go/middleware"
	"go.opentelemetry.io/otel/attribute"
	"net/http"
)

// Middleware is a chi compatible middleware
// use as follows:
//
// import highlightchi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
// ...
// r.Use(highlightchi.Middleware)
func Middleware(next http.Handler) http.Handler {
	middleware.CheckStatus()
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := highlight.InterceptRequest(r)
		span, ctx := highlight.StartTrace(ctx, "highlight.chi")
		defer highlight.EndTrace(span)
		defer middleware.Recoverer(span, w, r)

		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)

		span.SetAttributes(attribute.String(highlight.SourceAttribute, "GoChiMiddleware"))
		span.SetAttributes(middleware.GetRequestAttributes(r)...)
	}
	return http.HandlerFunc(fn)
}
