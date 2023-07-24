package store

import (
	"context"
	"github.com/go-redis/cache/v8"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/redis"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"time"
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

// cachedEval will return the value at cacheKey if it exists.
// If it does not exist or is nil, cachedEval calls `fn()` to evaluate the result, and stores it at the cache key.
func cachedEval[T any](ctx context.Context, redis *redis.Client, cacheKey string, lockTimeout, cacheExpiration time.Duration, fn func() (*T, error)) (value *T, err error) {
	// wait here to check the cache in case another process is waiting for db query
	if acquired := redis.AcquireLock(ctx, cacheKey, lockTimeout); acquired {
		defer func() {
			if err := redis.ReleaseLock(ctx, cacheKey); err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to release lock")
			}
		}()
	}

	if err = redis.Cache.Get(ctx, cacheKey, &value); err != nil {
		if value, err = fn(); value == nil || err != nil {
			return
		}
		if err = redis.Cache.Set(&cache.Item{
			Ctx:   ctx,
			Key:   cacheKey,
			Value: &value,
			TTL:   cacheExpiration,
		}); err != nil {
			return
		}
	}

	return
}
