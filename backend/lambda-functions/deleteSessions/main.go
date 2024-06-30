package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/handlers"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
)

// Meant for local invocation for testing the lambda handler stack
func main() {
	if !env.IsDevOrTestEnv() {
		return
	}

	highlight.SetProjectID("1jdkoe52")
	highlight.Start(
		highlight.WithServiceName("lambda-functions--deleteSessions"),
		highlight.WithServiceVersion(env.Config.Version),
		highlight.WithEnvironment(env.EnvironmentName()),
	)
	defer highlight.Stop()
	hlog.Init()

	h := handlers.NewHandlers()
	start, _ := time.Parse(time.RFC3339, "2022-07-15T23:00:25.525Z")
	end, _ := time.Parse(time.RFC3339, "2023-09-01T23:59:59.999Z")
	input := utils.QuerySessionsInput{
		ProjectId: 1,
		Email:     "zane@highlight.io",
		FirstName: "Zane",
		Params: model.QueryInput{
			Query: "completed=true",
			DateRange: &model.DateRangeRequiredInput{
				StartDate: start,
				EndDate:   end,
			},
		},
		SessionCount: 256,
		DryRun:       true,
	}
	ctx := context.TODO()
	out, err := h.GetSessionIdsByQuery(ctx, input)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	if len(out) == 0 {
		log.WithContext(ctx).Fatal("GetSessionIdsByQuery returned an empty list")
	}

	if _, err := h.DeleteSessionBatchFromPostgres(ctx, out[0]); err != nil {
		log.WithContext(ctx).Fatal(err)
	}
	if _, err := h.DeleteSessionBatchFromObjectStorage(ctx, out[0]); err != nil {
		log.WithContext(ctx).Fatal(err)
	}
	if _, err := h.DeleteSessionBatchFromClickhouse(ctx, out[0]); err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	if err := h.SendEmail(ctx, input); err != nil {
		log.WithContext(ctx).Fatal(err)
	}
}
