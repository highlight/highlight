package store

import (
	"github.com/highlight-run/highlight/backend/integrations"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"

	"gorm.io/gorm"
)

type Store struct {
	db                 *gorm.DB
	opensearch         *opensearch.Client
	redis              *redis.Client
	integrationsClient *integrations.Client
	storageClient      storage.Client
	dataSyncQueue      kafka_queue.MessageQueue
}

func NewStore(db *gorm.DB, opensearch *opensearch.Client, redis *redis.Client, integrationsClient *integrations.Client, storageClient storage.Client, dataSyncQueue kafka_queue.MessageQueue) *Store {
	return &Store{
		db:                 db,
		opensearch:         opensearch,
		redis:              redis,
		integrationsClient: integrationsClient,
		storageClient:      storageClient,
		dataSyncQueue:      dataSyncQueue,
	}
}
