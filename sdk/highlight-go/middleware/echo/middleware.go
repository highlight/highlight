package echo

import (
	"context"
	"strings"

	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/highlight/highlight/sdk/highlight-go/middleware"
	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/otel/attribute"
)

// Middleware is a echo compatible middleware
// use as follows:
//
// import highlightecho "github.com/highlight/highlight/sdk/highlight-go/middleware/echo"
// ...
// r.Use(highlightecho.Middleware())

func Middleware() echo.MiddlewareFunc {
	middleware.CheckStatus()
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()
			highlightReqDetails := c.Request().Header.Get("X-Highlight-Request")
			ids := strings.Split(string(highlightReqDetails), "/")
			if len(ids) >= 2 {
				ctx = context.WithValue(ctx, highlight.ContextKeys.SessionSecureID, ids[0])
				ctx = context.WithValue(ctx, highlight.ContextKeys.RequestID, ids[1])
			}

			span, hCtx := highlight.StartTrace(ctx, "highlight.echo")
			defer highlight.EndTrace(span)
			defer middleware.Recoverer(span, c.Response(), c.Request())

			c.SetRequest(c.Request().WithContext(hCtx))
			err := next(c)

			span.SetAttributes(attribute.String(highlight.SourceAttribute, "GoGinMiddleware"))
			span.SetAttributes(middleware.GetRequestAttributes(c.Request())...)

			if err != nil {
				highlight.RecordSpanError(span, err)
			}

			return err
		}
	}
}
