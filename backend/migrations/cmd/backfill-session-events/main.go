package main

import (
	"context"
	"encoding/json"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/env"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
)

const ProjectID = 33682

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	clickhouseClient, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating clickhouse client: %v", err)
	}

	log.WithContext(ctx).Info("using S3 for object storage")
	storageClient, err := storage.NewS3Client(ctx)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating s3 storage client: %v", err)
	}

	log.WithContext(ctx).Info("set up clients")

	kafkaDataSyncProducer := kafka_queue.New(ctx,
		kafka_queue.GetTopic(kafka_queue.GetTopicOptions{Type: kafka_queue.TopicTypeDataSync}),
		kafka_queue.Producer, &kafka_queue.ConfigOverride{Async: pointy.Bool(true)})

	redisClient := redis.NewClient()

	publicResolver := &public.Resolver{
		Clickhouse:    clickhouseClient,
		DB:            db,
		DataSyncQueue: kafkaDataSyncProducer,
		Store:         store.NewStore(db, redisClient, nil, nil, kafkaDataSyncProducer, clickhouseClient),
	}

	var sessionIds []int
	if err := db.Raw(`
		SELECT id
		FROM sessions
		WHERE project_id = ? and created_at >= now() - interval '5 days' and secure_id = 'D4mVFKz1eNRBChjxGAS2H70efU6C'
	`, ProjectID).Scan(&sessionIds).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	log.WithContext(ctx).Infof("got %d sessions", sessionIds)

	for _, sessionID := range sessionIds {
		eventsFile, err := storageClient.GetDirectDownloadURL(ctx, sessionID, ProjectID, storage.SessionContentsCompressed, nil)
		if err != nil {
			log.WithContext(ctx).Fatal(err)
		}

		resp, err := http.Get(*eventsFile)
		if err != nil {
			log.WithContext(ctx).Fatal(err)
		}

		data, err := io.ReadAll(resp.Body)
		if err != nil {
			log.WithContext(ctx).Fatal(err)
		}

		var events *parse.ReplayEvents
		err = json.Unmarshal(data, events)
		if err != nil {
			log.WithContext(ctx).Fatal(err)
		}

		if err := publicResolver.AddSessionEvents(ctx, sessionID, events); err != nil {
			log.WithContext(ctx).Fatal(err)
		}
	}

	kafkaDataSyncProducer.Stop(ctx)
}
