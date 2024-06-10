package store

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
)

func (store *Store) GetProject(ctx context.Context, id int) (*model.Project, error) {
	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("project-id-%d", id), 150*time.Millisecond, time.Minute, func() (*model.Project, error) {
		var project model.Project

		err := store.DB.WithContext(ctx).Where(&model.Project{
			Model: model.Model{
				ID: id,
			},
		}).Take(&project).Error

		return &project, err
	})
}
