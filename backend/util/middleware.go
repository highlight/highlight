package util

import (
	"net/http"

	"github.com/highlight-run/highlight-go"
)

func HighlightMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := highlight.InterceptRequest(r)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
