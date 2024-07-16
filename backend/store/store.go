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
	DB                 *gorm.DB
	Redis              *redis.Client
	IntegrationsClient *integrations.Client
	StorageClient      storage.Client
	DataSyncQueue      kafka_queue.MessageQueue
	ClickhouseClient   *clickhouse.Client
}

func NewStore(db *gorm.DB, redis *redis.Client, integrationsClient *integrations.Client, storageClient storage.Client, dataSyncQueue kafka_queue.MessageQueue, clickhouseClient *clickhouse.Client) *Store {
	return &Store{
		DB:                 db,
		Redis:              redis,
		IntegrationsClient: integrationsClient,
		StorageClient:      storageClient,
		DataSyncQueue:      dataSyncQueue,
		ClickhouseClient:   clickhouseClient,
	}
}
