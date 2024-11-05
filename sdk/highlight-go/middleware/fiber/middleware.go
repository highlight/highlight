package fiber

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/highlight/highlight/sdk/highlight-go/middleware"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
)

// Middleware is a fiber compatible middleware
// use as follows:
//
// import highlightfiber "github.com/highlight/highlight/sdk/highlight-go/middleware/fiber"
// ...
// r.Use(highlightfiber.Middleware())

func Middleware() fiber.Handler {
	middleware.CheckStatus()
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		highlightReqDetails := c.Request().Header.Peek("X-Highlight-Request")
		ids := strings.Split(string(highlightReqDetails), "/")
		if len(ids) >= 2 {
			ctx.SetUserValue(highlight.ContextKeys.SessionSecureID, ids[0])
			ctx.SetUserValue(highlight.ContextKeys.RequestID, ids[1])
		}

		span, hCtx := highlight.StartTrace(ctx, "highlight.fiber")
		defer highlight.EndTrace(span)

		c.SetUserContext(hCtx)
		err := c.Next()

		highlight.RecordSpanError(
			span, err,
			attribute.String(highlight.SourceAttribute, "GoFiberMiddleware"),
			attribute.String(string(semconv.HTTPURLKey), c.OriginalURL()),
			attribute.String(string(semconv.HTTPRouteKey), c.Path()),
			attribute.String(string(semconv.HTTPMethodKey), c.Method()),
			attribute.String(string(semconv.ClientAddressKey), c.IP()),
			attribute.Int(string(semconv.HTTPStatusCodeKey), c.Response().StatusCode()),
		)
		return err
	}
}
