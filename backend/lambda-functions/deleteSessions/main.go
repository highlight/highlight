package main

import (
	"context"
	"log"

	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/handlers"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/util"
)

// Meant for local invocation for testing the lambda handler stack
func main() {
	if !util.IsDevOrTestEnv() {
		return
	}

	h := handlers.NewHandlers()
	input := utils.QuerySessionsInput{
		ProjectId:    1,
		Email:        "zane@highlight.io",
		FirstName:    "Zane",
		Query:        "{\"bool\":{\"must\":[{\"bool\":{\"should\":[{\"term\":{\"processed\":\"true\"}}]}},{\"bool\":{\"should\":[{\"range\":{\"created_at\":{\"gte\":\"2022-07-15T23:00:25.525Z\",\"lte\":\"2022-08-01T23:00:25.525Z\"}}}]}}]}}",
		SessionCount: 256,
		DryRun:       true,
	}
	ctx := context.TODO()
	out, err := h.GetSessionIdsByQuery(ctx, input)
	if err != nil {
		log.Fatal(err)
	}

	if len(out) == 0 {
		log.Fatal("GetSessionIdsByQuery returned an empty list")
	}

	if _, err := h.DeleteSessionBatchFromPostgres(ctx, out[0]); err != nil {
		log.Fatal(err)
	}
	if _, err := h.DeleteSessionBatchFromS3(ctx, out[0]); err != nil {
		log.Fatal(err)
	}
	if _, err := h.DeleteSessionBatchFromOpenSearch(ctx, out[0]); err != nil {
		log.Fatal(err)
	}

	if err := h.SendEmail(ctx, input); err != nil {
		log.Fatal(err)
	}
}
