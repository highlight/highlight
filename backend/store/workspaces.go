package store

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/openlyinc/pointy"
)

func (store *Store) GetWorkspace(ctx context.Context, id int) (*model.Workspace, error) {
	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("workspace-id-%d", id), 150*time.Millisecond, time.Minute, func() (*model.Workspace, error) {
		var workspace model.Workspace

		err := store.DB.WithContext(ctx).Preload("Projects").Where(&model.Workspace{
			Model: model.Model{
				ID: id,
			},
		}).Take(&workspace).Error

		return &workspace, err
	})
}

func (store *Store) GetWorkspaceAdminCount(ctx context.Context, id int) (int64, error) {
	value, err := redis.CachedEval(ctx, store.Redis, fmt.Sprintf("workspace-id-%d", id), 150*time.Millisecond, time.Minute, func() (*int64, error) {
		tx := store.DB.WithContext(ctx).Model(&model.Workspace{Model: model.Model{ID: id}}).Association("Admins")
		return pointy.Int64(tx.Count()), tx.Error
	})
	return pointy.Int64Value(value, 0), err
}
