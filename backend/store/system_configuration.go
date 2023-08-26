package store

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	"time"
)

func (store *Store) GetSystemConfiguration(ctx context.Context) (*model.SystemConfiguration, error) {
	return redis.CachedEval(ctx, store.redis, "system-configuration", 250*time.Millisecond, time.Minute, func() (*model.SystemConfiguration, error) {
		config := model.SystemConfiguration{Active: true}
		if err := store.db.Model(&config).Where(&config).FirstOrCreate(&config).Error; err != nil {
			return nil, err
		}
		return &config, nil
	})
}
