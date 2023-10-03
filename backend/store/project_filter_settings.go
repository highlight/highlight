package store

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/redis"
	"time"

	"github.com/highlight-run/highlight/backend/model"
)

func (store *Store) GetProjectFilterSettings(ctx context.Context, projectID int) (*model.ProjectFilterSettings, error) {
	return redis.CachedEval(ctx, store.redis, fmt.Sprintf("project-filter-settings-%d", projectID), 250*time.Millisecond, time.Minute, func() (*model.ProjectFilterSettings, error) {
		var projectFilterSettings model.ProjectFilterSettings
		if err := store.db.Where(&model.ProjectFilterSettings{ProjectID: projectID}).FirstOrCreate(&projectFilterSettings).Error; err != nil {
			return nil, err
		}
		return &projectFilterSettings, nil
	})
}

type UpdateProjectFilterSettingsParams struct {
	AutoResolveStaleErrorsDayInterval *int
	FilterSessionsWithoutError        *bool
}

func (store *Store) UpdateProjectFilterSettings(ctx context.Context, projectID int, updates UpdateProjectFilterSettingsParams) (*model.ProjectFilterSettings, error) {
	projectFilterSettings, err := store.GetProjectFilterSettings(ctx, projectID)

	if err != nil {
		return projectFilterSettings, err
	}

	if updates.AutoResolveStaleErrorsDayInterval != nil {
		projectFilterSettings.AutoResolveStaleErrorsDayInterval = *updates.AutoResolveStaleErrorsDayInterval
	}

	if updates.FilterSessionsWithoutError != nil {
		projectFilterSettings.FilterSessionsWithoutError = *updates.FilterSessionsWithoutError
	}

	result := store.db.Save(&projectFilterSettings)

	return projectFilterSettings, result.Error
}

func (store *Store) FindProjectsWithAutoResolveSetting() ([]*model.ProjectFilterSettings, error) {
	var projectFilterSettings []*model.ProjectFilterSettings
	if err := store.db.Where("auto_resolve_stale_errors_day_interval > ?", 0).Find(&projectFilterSettings).Error; err != nil {
		return nil, err
	}
	return projectFilterSettings, nil
}
