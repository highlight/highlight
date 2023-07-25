package store

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/model"
	"time"
)

func (store *Store) GetAllWorkspaceSettings(ctx context.Context, workspaceID int) (*model.AllWorkspaceSettings, error) {
	return cachedEval(ctx, store.redis, fmt.Sprintf("all-workspace-settings-workspace-%d", workspaceID), 250*time.Millisecond, 5*time.Second, func() (*model.AllWorkspaceSettings, error) {
		var workspaceSettings model.AllWorkspaceSettings
		if err := store.db.Where(model.AllWorkspaceSettings{WorkspaceID: workspaceID}).FirstOrCreate(&workspaceSettings).Error; err != nil {
			return nil, err
		}
		return &workspaceSettings, nil
	})
}
