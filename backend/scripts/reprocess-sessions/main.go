package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/redis"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
)

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	r := redis.NewClient()

	var sessionIds []int
	if err := db.Raw(`
		select sessions.id
		from sessions
				 inner join event_chunks ec on sessions.id = session_id
		where sessions.created_at between '2024-05-23 14:09:30' and '2024-05-29 21:00:00'
		  and ec.chunk_index > 0
		  and processed
		  and excluded <> true
		  and active_length > 1000
		  and within_billing_quota
		group by 1;
	`).Find(&sessionIds).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}
	log.WithContext(ctx).Infof("%d sessionIds", len(sessionIds))
	for _, id := range sessionIds {
		if err := r.AddSessionToProcess(ctx, id, 0); err != nil {
			log.WithContext(ctx).Fatal(err)
		}
	}

	log.WithContext(ctx).Info("waiting")
	time.Sleep(5 * time.Second)
}
