package store

import (
	"context"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
)

func (store *Store) GetProjectAssetTransform(ctx context.Context, projectID int, scheme string) (*model.ProjectAssetTransform, error) {
	return redis.CachedEval(ctx, store.Redis, "project-asset-transform", 250*time.Millisecond, time.Minute, func() (*model.ProjectAssetTransform, error) {
		config := model.ProjectAssetTransform{ProjectID: projectID, SourceScheme: scheme}
		if err := store.DB.WithContext(ctx).Model(&config).Where(&config).Find(&config).Error; err != nil {
			return nil, err
		}
		return &config, nil
	}, redis.WithStoreNil(true))
}
