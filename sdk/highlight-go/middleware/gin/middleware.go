package gin

import (
	"github.com/highlight/highlight/sdk/highlight-go/middleware"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/highlight/highlight/sdk/highlight-go"
)

// Middleware is a gin compatible middleware
// use as follows:
//
// import highlightgin "github.com/highlight/highlight/sdk/highlight-go/middleware/gin"
// ...
// r.Use(highlightgin.Middleware())
func Middleware() gin.HandlerFunc {
	middleware.CheckStatus()
	return func(c *gin.Context) {
		highlightReqDetails := c.GetHeader("X-Highlight-Request")
		ids := strings.Split(highlightReqDetails, "/")
		if len(ids) < 2 {
			return
		}
		c.Set(string(highlight.ContextKeys.SessionSecureID), ids[0])
		c.Set(string(highlight.ContextKeys.RequestID), ids[1])

		span, hCtx := highlight.StartTrace(c, "highlight/gin")
		defer highlight.EndTrace(span)

		c.Next()

		highlight.MarkBackendSetup(hCtx)
		span.SetAttributes(
			attribute.String(highlight.SourceAttribute, "GoChiMiddleware"),
			attribute.String(string(semconv.HTTPURLKey), r.URL.String()),
			attribute.String(string(semconv.HTTPRouteKey), r.URL.RequestURI()),
			attribute.String(string(semconv.HTTPMethodKey), r.Method),
			attribute.String(string(semconv.HTTPClientIPKey), middleware.GetIPAddress(r)),
			attribute.Int(string(semconv.HTTPStatusCodeKey), r.Response.StatusCode),
		)
		if len(c.Errors) > 0 {
			highlight.RecordSpanError(span, c.Errors[0])
		}
	}
}
