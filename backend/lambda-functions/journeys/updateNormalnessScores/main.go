package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/highlight-run/highlight/backend/lambda-functions/journeys/handlers"
)

var h handlers.Handlers

func init() {
	h = handlers.NewHandlers()
}

func main() {
	lambda.Start(h.UpdateNormalnessScores)
}
