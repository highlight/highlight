package redis

import (
	"context"
	"github.com/go-redis/cache/v9"
	log "github.com/sirupsen/logrus"
	"time"
)

type Config struct {
	BypassCache bool
	IgnoreError bool
	StoreNil    bool
}

type Option func(cfg *Config)

func WithBypassCache(bypass bool) Option {
	return func(cfg *Config) {
		cfg.BypassCache = bypass
	}
}

func WithIgnoreError(ignoreError bool) Option {
	return func(cfg *Config) {
		cfg.IgnoreError = ignoreError
	}
}

func WithStoreNil(storeNil bool) Option {
	return func(cfg *Config) {
		cfg.StoreNil = storeNil
	}
}

// CachedEval will return the value at cacheKey if it exists.
// If it does not exist or is nil, CachedEval calls `fn()` to evaluate the result, and stores it at the cache key.
func CachedEval[T any](ctx context.Context, redis *Client, cacheKey string, lockTimeout, cacheExpiration time.Duration, fn func() (*T, error), opts ...Option) (value *T, err error) {
	var cfg Config
	for _, opt := range opts {
		opt(&cfg)
	}
	if cfg.BypassCache {
		return fn()
	}
	// tests can pass `nil` here to bypass the cache
	if redis == nil {
		return fn()
	}
	if err = redis.Cache.Get(ctx, cacheKey, &value); err != nil {
		// if we do not have a cache hit, take a lock to avoid running fn() more than once
		if mutex, err := redis.AcquireLock(ctx, cacheKey+"-lock", lockTimeout); err == nil {
			defer func() {
				if _, err := mutex.Unlock(); err != nil {
					log.WithContext(ctx).WithError(err).Error("failed to release lock")
				}
			}()
		}
		if value, err = fn(); (!cfg.StoreNil && value == nil) || (!cfg.IgnoreError && err != nil) {
			return
		}
		if setError := redis.Cache.Set(&cache.Item{
			Ctx:   ctx,
			Key:   cacheKey,
			Value: &value,
			TTL:   cacheExpiration,
		}); setError != nil {
			return nil, setError
		}
	}

	return
}
