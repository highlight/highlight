package graph

import (
	"bytes"
	"io"
	"net/http"
)

// ForwarderMiddleware creates an HTTP middleware that forwards requests
// to a target URL asynchronously (fire-and-forget) before passing them
// to the next handler. The response is always from the local handler,
// not the forwarded request.
func ForwarderMiddleware(forwarder *Forwarder) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Read the request body
			body, err := io.ReadAll(r.Body)
			if err != nil {
				// If we can't read the body, just pass through to the next handler
				next.ServeHTTP(w, r)
				return
			}

			// Restore the body for the main handler
			r.Body = io.NopCloser(bytes.NewBuffer(body))

			// Forward the request asynchronously
			forwarder.ForwardAsync(r.Context(), r.Method, r.URL.RequestURI(), body, r.Header)

			// Continue to the next handler
			next.ServeHTTP(w, r)
		})
	}
}
