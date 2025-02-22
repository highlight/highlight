package main

import (
	lambdafunctions "github.com/highlight-run/highlight/backend/lambda-functions"
	"github.com/highlight-run/highlight/backend/lambda-functions/metering/handlers"

	"github.com/aws/aws-lambda-go/lambda"

	"github.com/highlight/highlight/sdk/highlight-go"
)

var h handlers.Handlers

func init() {
	h = handlers.NewHandlers()
}

func main() {
	lambdafunctions.Monitor("lambda-functions--metering-awsMarketplaceListener")
	lambda.StartWithOptions(
		h.HandleAWSMarketplaceSQS,
		lambda.WithEnableSIGTERM(highlight.Stop),
	)
}
