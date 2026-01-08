package graph

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"
)

// Forwarder handles fire-and-forget forwarding of requests to a target URL.
type Forwarder struct {
	client    *http.Client
	targetURL string
}

// NewForwarder creates a new Forwarder with the specified target URL and timeout.
func NewForwarder(targetURL string, timeout time.Duration) *Forwarder {
	return &Forwarder{
		client:    &http.Client{Timeout: timeout},
		targetURL: targetURL,
	}
}

// ForwardAsync forwards the request asynchronously to the target URL.
// This is fire-and-forget: it spawns a goroutine and doesn't block.
// Errors are logged but not returned.
func (f *Forwarder) ForwardAsync(ctx context.Context, method, path string, body []byte, headers http.Header) {
	go func() {
		// Create a new context that isn't tied to the original request
		// This allows the forwarded request to complete even if the original request is done
		forwardCtx, cancel := context.WithTimeout(context.Background(), f.client.Timeout)
		defer cancel()

		targetURL := f.targetURL + path
		req, err := http.NewRequestWithContext(forwardCtx, method, targetURL, bytes.NewBuffer(body))
		if err != nil {
			log.WithContext(ctx).
				WithError(err).
				WithField("path", path).
				Error("forwarder: failed to create request")
			return
		}

		// Copy all headers from the original request
		for key, values := range headers {
			for _, value := range values {
				req.Header.Add(key, value)
			}
		}

		resp, err := f.client.Do(req)
		if err != nil {
			log.WithContext(ctx).
				WithError(err).
				WithField("path", path).
				WithField("method", method).
				Error("forwarder: request failed")
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 400 {
			respBody, _ := io.ReadAll(resp.Body)
			log.WithContext(ctx).
				WithField("status", resp.StatusCode).
				WithField("path", path).
				WithField("method", method).
				WithField("response", string(respBody)).
				Error("forwarder: received error response")
		}
	}()
}
