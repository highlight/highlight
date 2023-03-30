package gorillamux

import (
	"github.com/highlight/highlight/sdk/highlight-go/middleware"
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
		highlight.MarkBackendSetup(r.Context())
		next.ServeHTTP(w, r)
	}
	return http.HandlerFunc(fn)
}
