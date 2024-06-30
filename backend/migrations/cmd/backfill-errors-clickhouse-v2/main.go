package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"gorm.io/gorm"
	"strconv"
	"time"

	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"
)

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	kafkaDataSyncProducer := kafka_queue.New(ctx,
		kafka_queue.GetTopic(kafka_queue.GetTopicOptions{Type: kafka_queue.TopicTypeDataSync}),
		kafka_queue.Producer, &kafka_queue.ConfigOverride{Async: pointy.Bool(true)})

	var errorObjectIds []int
	db.Raw(`
			SELECT id
			FROM error_objects
			WHERE timestamp > now() - interval '3 months'
		`).FindInBatches(&errorObjectIds, 10000, func(tx *gorm.DB, batch int) error {
		log.WithContext(ctx).Infof("%d errorObjectIds", len(errorObjectIds))
		for _, id := range errorObjectIds {
			if err := kafkaDataSyncProducer.Submit(ctx, strconv.Itoa(id), &kafka_queue.Message{Type: kafka_queue.ErrorObjectDataSync, ErrorObjectDataSync: &kafka_queue.ErrorObjectDataSyncArgs{ErrorObjectID: id}}); err != nil {
				log.WithContext(ctx).Fatal(err)
			}
		}
		return nil
	})

	log.WithContext(ctx).Info("waiting")
	time.Sleep(15 * time.Second)
}
