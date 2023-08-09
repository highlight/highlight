package store

import (
	"context"

	"github.com/highlight-run/highlight/backend/model"
)

func (store *Store) GetProjectFilterSettings(project model.Project) (model.ProjectFilterSettings, error) {
	projectFilterSettings := model.ProjectFilterSettings{}
	result := store.db.Where(model.ProjectFilterSettings{ProjectID: project.ID}).FirstOrCreate(&projectFilterSettings)
	return projectFilterSettings, result.Error
}

type UpdateProjectFilterSettingsParams struct {
	AutoResolveStaleErrorsDayInterval *int
	FilterSessionsWithoutError        *bool
}

func (store *Store) UpdateProjectFilterSettings(project model.Project, updates UpdateProjectFilterSettingsParams) (model.ProjectFilterSettings, error) {
	projectFilterSettings, err := store.GetProjectFilterSettings(project)

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

func (store *Store) FindProjectsWithAutoResolveSetting(ctx context.Context) []model.ProjectFilterSettings {
	projectFilterSettings := []model.ProjectFilterSettings{}
	store.db.Where("auto_resolve_stale_errors_day_interval > ?", 0).Find(&projectFilterSettings)
	return projectFilterSettings
}
