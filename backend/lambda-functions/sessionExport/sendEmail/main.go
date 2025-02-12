package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	lambdafunctions "github.com/highlight-run/highlight/backend/lambda-functions"
	"github.com/highlight-run/highlight/backend/lambda-functions/sessionExport/handlers"
	"github.com/highlight/highlight/sdk/highlight-go"
)

var h handlers.Handlers

func init() {
	h = handlers.NewHandlers()
}

func main() {
	lambdafunctions.Monitor("lambda-functions--sessionExport-sendEmail")
	lambda.StartWithOptions(
		h.SendEmail,
		lambda.WithEnableSIGTERM(highlight.Stop),
	)
}
