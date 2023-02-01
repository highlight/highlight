package main

import (
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	log "github.com/sirupsen/logrus"
	"os"
	"time"
)

func main() {
	k := kafkaqueue.New(os.Getenv("KAFKA_TOPIC"), kafkaqueue.Consumer)
	err := k.Rewind(24 * 7 * time.Hour)
	if err != nil {
		log.Error(err)
	}
}
