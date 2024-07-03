package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	log "github.com/sirupsen/logrus"
)

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	redisClient := redis.NewClient()

	var sessionIds []int
	if err := db.Raw(`
		SELECT id
		FROM sessions
		WHERE (processed = false)
			AND (excluded = false)
			AND (payload_updated_at < NOW() - (? * INTERVAL '1 SECOND'))
			AND (lock is null OR lock < NOW() - (? * INTERVAL '1 MINUTE'))
			AND (retry_count < ?)
		`, 60, 30, 5).Find(&sessionIds).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	for _, id := range sessionIds {
		if err := redisClient.AddSessionToProcess(ctx, id, 60); err != nil {
			log.WithContext(ctx).Fatal(err)
		}
	}
}
