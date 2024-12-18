package gin

import (
	"github.com/highlight/highlight/sdk/highlight-go/middleware"
	"go.opentelemetry.io/otel/attribute"
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

		attrs, requestName := middleware.GetRequestAttributes(c.Request)
		span, _ := highlight.StartTrace(c, requestName)
		defer highlight.EndTrace(span)
		defer middleware.Recoverer(span, c.Writer, c.Request)

		c.Next()

		span.SetAttributes(attribute.String(highlight.SourceAttribute, "go.gin"))
		span.SetAttributes(attrs...)
		if len(c.Errors) > 0 {
			highlight.RecordSpanError(span, c.Errors[0])
		}
	}
}
