package store

import (
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/integrations"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"

	"gorm.io/gorm"
)

type Store struct {
	db                 *gorm.DB
	redis              *redis.Client
	integrationsClient *integrations.Client
	storageClient      storage.Client
	dataSyncQueue      kafka_queue.MessageQueue
	clickhouseClient   *clickhouse.Client
}

func NewStore(db *gorm.DB, redis *redis.Client, integrationsClient *integrations.Client, storageClient storage.Client, dataSyncQueue kafka_queue.MessageQueue, clickhouseClient *clickhouse.Client) *Store {
	return &Store{
		db:                 db,
		redis:              redis,
		integrationsClient: integrationsClient,
		storageClient:      storageClient,
		dataSyncQueue:      dataSyncQueue,
		clickhouseClient:   clickhouseClient,
	}
}
