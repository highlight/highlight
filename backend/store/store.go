package store

import (
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/redis"
	"gorm.io/gorm"
)

type Store struct {
	db         *gorm.DB
	opensearch *opensearch.Client
	redis      *redis.Client
}

func NewStore(db *gorm.DB, opensearch *opensearch.Client, redis *redis.Client) *Store {
	return &Store{
		db:         db,
		opensearch: opensearch,
		redis:      redis,
	}
}
