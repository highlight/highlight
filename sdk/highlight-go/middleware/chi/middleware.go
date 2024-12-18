package chi

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/highlight/highlight/sdk/highlight-go/middleware"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"net/http"
	"time"
)

func _middleware(next http.Handler, opts ...trace.SpanStartOption) http.Handler {
	middleware.CheckStatus()
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t := time.Now()
		ctx := highlight.InterceptRequest(r)
		attrs, requestName := middleware.GetRequestAttributes(r)
		span, ctx := highlight.StartTraceWithTimestamp(ctx, requestName, t, opts)
		defer highlight.EndTrace(span)
		defer middleware.Recoverer(span, w, r)

		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)

		span.SetAttributes(attribute.String(highlight.SourceAttribute, "go.chi"))
		span.SetAttributes(attrs...)
	})
}

// Middleware is a chi compatible middleware
// use as follows:
//
// import highlightchi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
// ...
// r.Use(highlightchi.Middleware)
func Middleware(next http.Handler) http.Handler {
	return _middleware(next)
}

func UseMiddleware(opts ...trace.SpanStartOption) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return _middleware(next, opts...)
	}
}
