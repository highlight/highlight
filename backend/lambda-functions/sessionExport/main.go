package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/lambda-functions/sessionExport/handlers"
	"github.com/highlight-run/highlight/backend/lambda-functions/sessionExport/utils"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
)

// Meant for local invocation for testing the lambda handler stack
func main() {
	highlight.SetProjectID("1jdkoe52")
	highlight.Start(
		highlight.WithServiceName("lambda-functions--sessionExport"),
		highlight.WithServiceVersion(env.Config.Version),
		highlight.WithEnvironment(env.EnvironmentName()),
	)
	defer highlight.Stop()
	hlog.Init()

	h := handlers.NewHandlers()
	input := utils.SaveSessionExportInput{
		SessionID:    30000031,
		Type:         model.SessionExportFormatMP4,
		URL:          "https://highlight-session-render.s3.us-east-2.amazonaws.com/1/311983171.mp4",
		Error:        "test",
		TargetEmails: []string{"vadim@highlight.io"},
	}
	ctx := context.Background()

	log.WithContext(ctx).WithField("input", input).Info("locally testing session export")

	export, err := h.SaveSessionExport(ctx, &input)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	if err := h.SendEmail(ctx, export); err != nil {
		log.WithContext(ctx).Fatal(err)
	}
}
