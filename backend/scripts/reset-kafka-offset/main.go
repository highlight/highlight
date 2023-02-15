package main

import (
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	log "github.com/sirupsen/logrus"
	"time"
)

func main() {
	k := kafkaqueue.New(kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Batched: false}), kafkaqueue.Consumer)
	err := k.Rewind(24 * 7 * time.Hour)
	if err != nil {
		log.WithContext(ctx).Error(err)
	}
}
