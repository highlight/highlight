package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"

	log "github.com/sirupsen/logrus"
)

const SessionsMaxRowsPostgres = 500

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	log.WithContext(ctx).Info("set up clients")

	kafkaDataSyncProducer := kafka_queue.New(ctx,
		kafka_queue.GetTopic(kafka_queue.GetTopicOptions{Type: kafka_queue.TopicTypeDataSync}),
		kafka_queue.Producer, &kafka_queue.ConfigOverride{Async: pointy.Bool(true)})

	redisClient := redis.NewClient()

	publicResolver := &public.Resolver{
		DB:            db,
		DataSyncQueue: kafkaDataSyncProducer,
		Store:         store.NewStore(db, redisClient, nil, nil, kafkaDataSyncProducer, nil),
	}

	var sessionIds []int
	if err := db.Raw(`
		SELECT id
		FROM sessions
		WHERE created_at >= now() - interval '5 days'
	`).Scan(&sessionIds).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	log.WithContext(ctx).Infof("got %d sessions", sessionIds)

	sessionIdChunks := lo.Chunk(lo.Uniq(sessionIds), SessionsMaxRowsPostgres)
	if len(sessionIdChunks) > 0 {
		for idx, chunk := range sessionIdChunks {
			log.WithContext(ctx).Infof("running chunk %d of %d", idx+1, len(sessionIdChunks))

			sessionObjs := []*model.Session{}
			if err := db.Model(&model.Session{}).Where("id in ?", chunk).Find(&sessionObjs).Error; err != nil {
				log.WithContext(ctx).Fatal(err)
			}

			for _, session := range sessionObjs {
				if err := publicResolver.IndexSessionClickhouse(ctx, session); err != nil {
					log.WithContext(ctx).Fatal(err)
				}
			}
		}
	}
}
