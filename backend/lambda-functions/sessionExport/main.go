package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	"os"

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
		highlight.WithServiceVersion(os.Getenv("REACT_APP_COMMIT_SHA")),
	)
	defer highlight.Stop()
	hlog.Init()

	h := handlers.NewHandlers()
	input := utils.SaveSessionExportInput{
		SessionID:    311983171,
		Type:         model.SessionExportFormatMP4,
		URL:          "https://highlight-session-render.s3.us-east-2.amazonaws.com/1/311983171.mp4",
		TargetEmails: []string{"vadim@highlight.io"},
	}
	ctx := context.Background()

	export, err := h.SaveSessionExport(ctx, &input)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	if err := h.SendEmail(ctx, export); err != nil {
		log.WithContext(ctx).Fatal(err)
	}
}
