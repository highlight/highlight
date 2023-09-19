package store

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
)

func (store *Store) GetWorkspace(ctx context.Context, id int) (*model.Workspace, error) {
	return redis.CachedEval(ctx, store.redis, fmt.Sprintf("workspace-id-%d", id), 150*time.Millisecond, time.Minute, func() (*model.Workspace, error) {
		var workspace model.Workspace

		err := store.db.Where(&model.Workspace{
			Model: model.Model{
				ID: id,
			},
		}).Take(&workspace).Error

		return &workspace, err
	})
}
