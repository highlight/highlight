package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	lambdafunctions "github.com/highlight-run/highlight/backend/lambda-functions"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/handlers"
	"github.com/highlight/highlight/sdk/highlight-go"
)

var h handlers.Handlers

func init() {
	h = handlers.NewHandlers()
}

func main() {
	lambdafunctions.Monitor("lambda-functions--deleteSessions-getSessionIdsByQuery")
	lambda.StartWithOptions(
		h.GetSessionIdsByQuery,
		lambda.WithEnableSIGTERM(highlight.Stop),
	)
}
