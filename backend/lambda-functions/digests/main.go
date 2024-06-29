package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/lambda-functions/digests/handlers"
	"github.com/highlight-run/highlight/backend/lambda-functions/digests/utils"
)

// Meant for local invocation for testing the lambda handler stack
func main() {
	if !env.IsDevOrTestEnv() {
		return
	}

	h := handlers.NewHandlers()
	input := utils.DigestsInput{
		AsOf:   time.Now().AddDate(0, 0, -7),
		DryRun: false,
	}

	ctx := context.TODO()

	out, err := h.GetProjectIds(ctx, input)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	data, err := h.GetDigestData(ctx, out[0])
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	err = h.SendDigestEmails(ctx, *data)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}
}
