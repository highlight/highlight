package store

import (
	"context"
	"fmt"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"

	"github.com/highlight-run/highlight/backend/model"
)

func getKey(projectID int) string {
	return fmt.Sprintf("project-filter-settings-%d", projectID)
}

func (store *Store) GetProjectFilterSettings(ctx context.Context, projectID int, opts ...redis.Option) (*model.ProjectFilterSettings, error) {
	return redis.CachedEval(ctx, store.Redis, getKey(projectID), 250*time.Millisecond, time.Minute, func() (*model.ProjectFilterSettings, error) {
		var projectFilterSettings model.ProjectFilterSettings
		if err := store.DB.WithContext(ctx).Where(&model.ProjectFilterSettings{ProjectID: projectID}).FirstOrCreate(&projectFilterSettings).Error; err != nil {
			return nil, err
		}
		return &projectFilterSettings, nil
	}, opts...)
}

type UpdateProjectFilterSettingsParams struct {
	AutoResolveStaleErrorsDayInterval *int
	FilterSessionsWithoutError        *bool
	Sampling                          *modelInputs.SamplingInput
}

func (store *Store) UpdateProjectFilterSettings(ctx context.Context, projectID int, updates UpdateProjectFilterSettingsParams) (*model.ProjectFilterSettings, error) {
	projectFilterSettings, err := store.GetProjectFilterSettings(ctx, projectID)
	if err != nil {
		return projectFilterSettings, err
	}

	workspaceSettings, err := store.GetAllWorkspaceSettingsByProject(ctx, projectID)
	if err != nil {
		return projectFilterSettings, err
	}

	if updates.AutoResolveStaleErrorsDayInterval != nil {
		projectFilterSettings.AutoResolveStaleErrorsDayInterval = *updates.AutoResolveStaleErrorsDayInterval
	}

	if updates.FilterSessionsWithoutError != nil {
		projectFilterSettings.FilterSessionsWithoutError = *updates.FilterSessionsWithoutError
	}

	if updates.Sampling != nil {
		if workspaceSettings.EnableIngestSampling {
			if updates.Sampling.SessionSamplingRate != nil {
				projectFilterSettings.SessionSamplingRate = *updates.Sampling.SessionSamplingRate
			}
			if updates.Sampling.ErrorSamplingRate != nil {
				projectFilterSettings.ErrorSamplingRate = *updates.Sampling.ErrorSamplingRate
			}
			if updates.Sampling.LogSamplingRate != nil {
				projectFilterSettings.LogSamplingRate = *updates.Sampling.LogSamplingRate
			}
			if updates.Sampling.TraceSamplingRate != nil {
				projectFilterSettings.TraceSamplingRate = *updates.Sampling.TraceSamplingRate
			}
			if updates.Sampling.SessionMinuteRateLimit != nil {
				projectFilterSettings.SessionMinuteRateLimit = updates.Sampling.SessionMinuteRateLimit
			}
			if updates.Sampling.ErrorMinuteRateLimit != nil {
				projectFilterSettings.ErrorMinuteRateLimit = updates.Sampling.ErrorMinuteRateLimit
			}
			if updates.Sampling.LogMinuteRateLimit != nil {
				projectFilterSettings.LogMinuteRateLimit = updates.Sampling.LogMinuteRateLimit
			}
			if updates.Sampling.TraceMinuteRateLimit != nil {
				projectFilterSettings.TraceMinuteRateLimit = updates.Sampling.TraceMinuteRateLimit
			}
		}
		if updates.Sampling.SessionExclusionQuery != nil {
			projectFilterSettings.SessionExclusionQuery = updates.Sampling.SessionExclusionQuery
		}
		if updates.Sampling.ErrorExclusionQuery != nil {
			projectFilterSettings.ErrorExclusionQuery = updates.Sampling.ErrorExclusionQuery
		}
		if updates.Sampling.LogExclusionQuery != nil {
			projectFilterSettings.LogExclusionQuery = updates.Sampling.LogExclusionQuery
		}
		if updates.Sampling.TraceExclusionQuery != nil {
			projectFilterSettings.TraceExclusionQuery = updates.Sampling.TraceExclusionQuery
		}
	}

	result := store.DB.Save(&projectFilterSettings)
	if result.Error != nil {
		return nil, err
	}

	return projectFilterSettings, store.Redis.Del(ctx, getKey(projectID))
}

func (store *Store) FindProjectsWithAutoResolveSetting(ctx context.Context) ([]*model.ProjectFilterSettings, error) {
	var projectFilterSettings []*model.ProjectFilterSettings
	if err := store.DB.WithContext(ctx).Where("auto_resolve_stale_errors_day_interval > ?", 0).Find(&projectFilterSettings).Error; err != nil {
		return nil, err
	}
	return projectFilterSettings, nil
}
