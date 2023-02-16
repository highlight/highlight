package main

import (
	"context"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	log "github.com/sirupsen/logrus"
	"time"
)

func main() {
	ctx := context.TODO()
	k := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Batched: false}), kafkaqueue.Consumer)
	err := k.Rewind(ctx, 24*7*time.Hour)
	if err != nil {
		log.WithContext(ctx).Error(err)
	}
}
