package main

import (
	"context"
	"time"

	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	log "github.com/sirupsen/logrus"
)

func main() {
	ctx := context.TODO()
	k := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeDefault}), kafkaqueue.Consumer, nil)
	err := k.Rewind(ctx, 24*7*time.Hour)
	if err != nil {
		log.WithContext(ctx).Error(err)
	}
}
