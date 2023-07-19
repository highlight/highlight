package store

import (
	"context"
	"fmt"
	"github.com/go-redis/cache/v8"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	log "github.com/sirupsen/logrus"
	"time"
)

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

func (store *Store) GetSessionFromSecureID(ctx context.Context, secureID string) (*model.Session, error) {
	return cachedEval(ctx, store.redis, fmt.Sprintf("session-secure-%s", secureID), 150*time.Millisecond, time.Second, func() (*model.Session, error) {
		var session model.Session
		if err := store.db.Model(&session).Where(&model.Session{SecureID: secureID}).Take(&session).Error; err != nil {
			log.WithContext(ctx).WithError(err).WithField("session_secure_id", secureID).Error("failed to get session by secure id")
			return nil, err
		}
		return &session, nil
	})
}

func (store *Store) GetSession(ctx context.Context, sessionID int) (*model.Session, error) {
	return cachedEval(ctx, store.redis, fmt.Sprintf("session-id-%d", sessionID), 150*time.Millisecond, time.Second, func() (*model.Session, error) {
		var session model.Session
		if err := store.db.Model(&session).Where(&model.Session{Model: model.Model{ID: sessionID}}).Take(&session).Error; err != nil {
			log.WithContext(ctx).WithError(err).WithField("session_id", sessionID).Error("failed to get session by id")
			return nil, err
		}
		return &session, nil
	})
}
