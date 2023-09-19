package main

import (
	"math/rand"

	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightEcho "github.com/highlight/highlight/sdk/highlight-go/middleware/echo"
	e "github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
)

func main() {
	highlight.SetProjectID("1jdkoe52")
	highlight.SetOTLPEndpoint("http://localhost:4318")
	highlight.Start(
		highlight.WithServiceName("go-echo-app"),
		highlight.WithServiceVersion("abc123"),
	)
	defer highlight.Stop()
	hlog.Init()

	app := echo.New()
	app.Use(middleware.Logger())
	app.Use(highlightEcho.Middleware())

	app.GET("/", func(c echo.Context) error {
		logrus.WithContext(c.Request().Context()).Infof("hello from highlight.io")
		if rand.Float64() < 0.2 {
			return e.New("random error from go echo!")
		}
		return c.String(http.StatusOK, "Hello, World!")
	})

	logrus.Fatal(app.Start(":3456"))
}
