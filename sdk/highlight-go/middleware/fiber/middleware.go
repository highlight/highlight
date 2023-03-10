package fiber

import (
	"context"
	"github.com/gofiber/fiber/v2"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"strings"
)

// Middleware is a fiber compatible middleware
// use as follows:
//
// import highlightfiber "github.com/highlight/highlight/sdk/highlight-go/middleware/fiber"
// ...
// r.Use(highlightfiber.Middleware())

func Middleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.UserContext()
		highlightReqDetails := c.Request().Header.Peek("X-Highlight-Request")
		ids := strings.Split(string(highlightReqDetails), "/")
		if len(ids) >= 2 {
			ctx = context.WithValue(ctx, highlight.ContextKeys.SessionSecureID, ids[0])
			ctx = context.WithValue(ctx, highlight.ContextKeys.RequestID, ids[1])
		}

		highlight.MarkBackendSetup(ctx)
		span, _ := highlight.StartTrace(ctx, c.OriginalURL())
		c.SetUserContext(ctx)
		err := c.Next()
		highlight.RecordSpanError(
			span, err,
			attribute.String("Source", "GoFiberMiddleware"),
			attribute.String(string(semconv.HTTPURLKey), c.BaseURL()),
			attribute.String(string(semconv.HTTPRouteKey), c.Path()),
			attribute.String(string(semconv.HTTPMethodKey), c.Method()),
			attribute.String(string(semconv.HTTPClientIPKey), c.IP()),
			attribute.Int(string(semconv.HTTPStatusCodeKey), c.Response().StatusCode()),
		)
		highlight.EndTrace(span)
		return err
	}
}
