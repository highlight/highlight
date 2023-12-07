package main

import (
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/highlight-run/highlight/backend/lambda-functions/journeys/handlers"
	"github.com/highlight-run/highlight/backend/util"
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
		highlight.WithServiceName("lambda-functions--updateNormalnessScores"),
		highlight.WithServiceVersion(os.Getenv("REACT_APP_COMMIT_SHA")),
		highlight.WithEnvironment(util.EnvironmentName()),
	)
	hlog.Init()
	lambda.StartWithOptions(
		h.UpdateNormalnessScores,
		lambda.WithEnableSIGTERM(highlight.Stop),
	)
}
