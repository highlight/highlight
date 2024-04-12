package main

import (
	"context"
	"os"
	"strconv"
	"time"

	"gorm.io/gorm"

	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"
)

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	kafkaDataSyncProducer := kafka_queue.New(ctx,
		kafka_queue.GetTopic(kafka_queue.GetTopicOptions{Type: kafka_queue.TopicTypeDataSync}),
		kafka_queue.Producer, &kafka_queue.ConfigOverride{Async: pointy.Bool(true)})

	var errorObjectIds []int
	db.Raw(`
		SELECT distinct error_group_id
		FROM error_objects
		WHERE created_at > now() - interval '12 months'
		`).FindInBatches(&errorObjectIds, 10000, func(tx *gorm.DB, batch int) error {
		log.WithContext(ctx).Infof("%d errorObjectIds", len(errorObjectIds))
		for _, id := range errorObjectIds {
			if err := kafkaDataSyncProducer.Submit(ctx, strconv.Itoa(id), &kafka_queue.Message{Type: kafka_queue.ErrorGroupDataSync, ErrorGroupDataSync: &kafka_queue.ErrorGroupDataSyncArgs{ErrorGroupID: id}}); err != nil {
				log.WithContext(ctx).Fatal(err)
			}
		}
		return nil
	})

	log.WithContext(ctx).Info("waiting")
	time.Sleep(15 * time.Second)
}
