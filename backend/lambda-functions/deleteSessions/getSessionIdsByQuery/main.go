package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/handlers"
	H "github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
)

var h handlers.Handlers

func init() {
	h = handlers.NewHandlers()
}

func main() {
	H.SetProjectID("1jdkoe52")
	H.Start()
	defer H.Stop()
	hlog.Init()
	lambda.Start(h.GetSessionIdsByQuery)
}
