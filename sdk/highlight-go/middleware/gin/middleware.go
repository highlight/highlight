package gin

import (
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/highlight-run/highlight-go"
)

// Middleware is a gin compatible middleware
// use as follows:
//
// import highlightgin "github.com/highlight-run/highlight-go/middleware/gin"
// ...
// r.Use(highlightgin.Middleware())
//
func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		highlightReqDetails := c.GetHeader("X-Highlight-Request")
		ids := strings.Split(highlightReqDetails, "/")
		if len(ids) < 2 {
			return
		}
		c.Set(string(highlight.ContextKeys.SessionSecureID), ids[0])
		c.Set(string(highlight.ContextKeys.RequestID), ids[1])
		highlight.MarkBackendSetup(c)
	}
}
