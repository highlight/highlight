package main

import (
	"context"
	"os"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessionsV2/handlers"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessionsV2/utils"
	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
)

// Meant for local invocation for testing the lambda handler stack
func main() {
	if !util.IsDevOrTestEnv() {
		return
	}

	highlight.SetProjectID("1jdkoe52")
	highlight.Start(
		highlight.WithServiceName("lambda-functions--deleteSessionsV2"),
		highlight.WithServiceVersion(os.Getenv("REACT_APP_COMMIT_SHA")),
		highlight.WithEnvironment(util.EnvironmentName()),
	)
	defer highlight.Stop()
	hlog.Init()

	h := handlers.NewHandlers()
	start, _ := time.Parse(time.RFC3339, "2022-07-15T23:00:25.525Z")
	end, _ := time.Parse(time.RFC3339, "2023-09-01T23:59:59.999Z")
	input := utils.QuerySessionsInputV2{
		ProjectId: 1,
		Email:     "zane@highlight.io",
		FirstName: "Zane",
		Params: model.QueryInput{
			Query: "processed=true",
			DateRange: &model.DateRangeRequiredInput{
				StartDate: start,
				EndDate:   end,
			},
		},
		SessionCount: 256,
		DryRun:       true,
	}
	ctx := context.TODO()
	out, err := h.GetSessionIdsByQueryV2(ctx, input)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	if len(out) == 0 {
		log.WithContext(ctx).Fatal("GetSessionIdsByQueryV2 returned an empty list")
	}

	if _, err := h.DeleteSessionBatchFromPostgresV2(ctx, out[0]); err != nil {
		log.WithContext(ctx).Fatal(err)
	}
	if _, err := h.DeleteSessionBatchFromS3V2(ctx, out[0]); err != nil {
		log.WithContext(ctx).Fatal(err)
	}
	if _, err := h.DeleteSessionBatchFromOpenSearchV2(ctx, out[0]); err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	if err := h.SendEmailV2(ctx, input); err != nil {
		log.WithContext(ctx).Fatal(err)
	}
}
