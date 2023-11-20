package store

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
)

func (store *Store) GetAllWorkspaceSettings(ctx context.Context, workspaceID int) (*model.AllWorkspaceSettings, error) {
	return redis.CachedEval(ctx, store.redis, fmt.Sprintf("all-workspace-settings-workspace-%d", workspaceID), 250*time.Millisecond, time.Minute, func() (*model.AllWorkspaceSettings, error) {
		var workspaceSettings model.AllWorkspaceSettings
		if err := store.db.WithContext(ctx).Where(model.AllWorkspaceSettings{WorkspaceID: workspaceID}).FirstOrCreate(&workspaceSettings).Error; err != nil {
			return nil, err
		}
		return &workspaceSettings, nil
	})
}

func (store *Store) GetAllWorkspaceSettingsByProject(ctx context.Context, projectID int) (*model.AllWorkspaceSettings, error) {
	return redis.CachedEval(ctx, store.redis, fmt.Sprintf("all-workspace-settings-project-%d", projectID), 250*time.Millisecond, time.Minute, func() (*model.AllWorkspaceSettings, error) {
		var workspaceSettings model.AllWorkspaceSettings
		if err := store.db.WithContext(ctx).Model(&model.AllWorkspaceSettings{}).Joins("INNER JOIN projects ON projects.workspace_id = all_workspace_settings.workspace_id").Where("projects.id = ?", projectID).Take(&workspaceSettings).Error; err != nil {
			return nil, err
		}
		return &workspaceSettings, nil
	})
}
