package store

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2/log"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	"gorm.io/gorm/clause"
)

func (store *Store) GetAllWorkspaceSettings(ctx context.Context, workspaceID int) (*model.AllWorkspaceSettings, error) {
	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("all-workspace-settings-workspace-%d", workspaceID), 250*time.Millisecond, time.Minute, func() (*model.AllWorkspaceSettings, error) {
		var workspaceSettings model.AllWorkspaceSettings
		if err := store.DB.WithContext(ctx).Where(model.AllWorkspaceSettings{WorkspaceID: workspaceID}).FirstOrCreate(&workspaceSettings).Error; err != nil {
			return nil, err
		}
		return &workspaceSettings, nil
	})
}

func (store *Store) UpdateAllWorkspaceSettings(ctx context.Context, workspaceID int, workspaceSettingsUpdates map[string]interface{}) (*model.AllWorkspaceSettings, error) {
	workspaceSettings := &model.AllWorkspaceSettings{}

	if err := AssertRecordFound(
		store.DB.
			WithContext(ctx).
			Where(
				&model.AllWorkspaceSettings{WorkspaceID: workspaceID}).
			Model(&workspaceSettings).Clauses(clause.Returning{}).Updates(&workspaceSettingsUpdates)); err != nil {
		return nil, err
	}

	if err := store.Redis.Cache.Delete(ctx, fmt.Sprintf("all-workspace-settings-workspace-%d", workspaceID)); err != nil {
		log.WithContext(ctx).Errorf("Failed to delete cache: %v", err)
	}

	return workspaceSettings, nil
}

func (store *Store) GetAllWorkspaceSettingsByProject(ctx context.Context, projectID int) (*model.AllWorkspaceSettings, error) {
	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("all-workspace-settings-project-%d", projectID), 250*time.Millisecond, time.Minute, func() (*model.AllWorkspaceSettings, error) {
		var workspaceSettings model.AllWorkspaceSettings
		if err := store.DB.WithContext(ctx).Model(&model.AllWorkspaceSettings{}).Joins("INNER JOIN projects ON projects.workspace_id = all_workspace_settings.workspace_id").Where("projects.id = ?", projectID).Take(&workspaceSettings).Error; err != nil {
			return nil, err
		}
		return &workspaceSettings, nil
	})
}
