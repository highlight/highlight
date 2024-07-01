package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"strconv"
	"time"

	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"
)

const SessionsMaxRowsPostgres = 500

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	kafkaDataSyncProducer := kafka_queue.New(ctx,
		kafka_queue.GetTopic(kafka_queue.GetTopicOptions{Type: kafka_queue.TopicTypeDataSync}),
		kafka_queue.Producer, &kafka_queue.ConfigOverride{Async: pointy.Bool(true)})

	var errorGroupIds []int
	if err := db.Raw(`
			SELECT id
			FROM error_groups
			WHERE updated_at > now() - interval '3 months'
		`).Scan(&errorGroupIds).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}
	log.WithContext(ctx).Infof("%d errorGroupIds", len(errorGroupIds))

	for _, id := range errorGroupIds {
		if err := kafkaDataSyncProducer.Submit(ctx, strconv.Itoa(id), &kafka_queue.Message{Type: kafka_queue.ErrorGroupDataSync, ErrorGroupDataSync: &kafka_queue.ErrorGroupDataSyncArgs{ErrorGroupID: id}}); err != nil {
			log.WithContext(ctx).Fatal(err)
		}
	}

	var errorObjectIds []int
	if err := db.Raw(`
			SELECT id
			FROM error_objects
			WHERE timestamp > now() - interval '3 months'
		`).Scan(&errorObjectIds).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}
	log.WithContext(ctx).Infof("%d errorObjectIds", len(errorObjectIds))

	for _, id := range errorObjectIds {
		if err := kafkaDataSyncProducer.Submit(ctx, strconv.Itoa(id), &kafka_queue.Message{Type: kafka_queue.ErrorObjectDataSync, ErrorObjectDataSync: &kafka_queue.ErrorObjectDataSyncArgs{ErrorObjectID: id}}); err != nil {
			log.WithContext(ctx).Fatal(err)
		}
	}

	log.WithContext(ctx).Info("waiting")
	for {
		time.Sleep(5000)
	}
}
