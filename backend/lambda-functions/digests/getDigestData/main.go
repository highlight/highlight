package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/lambda-functions/digests/handlers"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
)

var h handlers.Handlers

func init() {
	h = handlers.NewHandlers()
}

func main() {
	highlight.SetProjectID("1jdkoe52")
	highlight.Start(
		highlight.WithServiceName("lambda-functions--getDigestData"),
		highlight.WithServiceVersion(env.Config.Version),
		highlight.WithEnvironment(env.EnvironmentName()),
	)
	hlog.Init()
	lambda.StartWithOptions(
		h.GetDigestData,
		lambda.WithEnableSIGTERM(highlight.Stop),
	)
}
