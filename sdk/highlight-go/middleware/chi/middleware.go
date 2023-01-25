package chi

import (
	"net/http"

	"github.com/highlight-run/highlight-go"
)

// Middleware is a chi compatible middleware
// use as follows:
//
// import highlightchi "github.com/highlight-run/highlight-go/middleware/chi"
// ...
// r.Use(highlightchi.Middleware)
//
func Middleware(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := highlight.InterceptRequest(r)
		r = r.WithContext(ctx)
		highlight.MarkBackendSetup(r.Context())
		next.ServeHTTP(w, r)
	}
	return http.HandlerFunc(fn)
}
