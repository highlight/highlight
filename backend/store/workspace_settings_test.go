package store

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/stretchr/testify/assert"
	_ "gorm.io/driver/postgres"
)

func TestGetAllWorkspaceSettings(t *testing.T) {
	defer teardown(t)

	s := model.AllWorkspaceSettings{WorkspaceID: 1}
	store.DB.Create(&s)

	newSettings, err := store.GetAllWorkspaceSettings(context.Background(), 1)
	assert.NoError(t, err)
	assert.Equal(t, 1, newSettings.WorkspaceID)

	w2Settings, _ := store.GetAllWorkspaceSettings(context.Background(), 2)
	assert.NoError(t, err)
	assert.Equal(t, 2, w2Settings.WorkspaceID)
}

func BenchmarkStore_GetAllWorkspaceSettings(b *testing.B) {
	s := model.AllWorkspaceSettings{WorkspaceID: 1}
	store.DB.Create(&s)
	for i := 0; i < b.N; i++ {
		_, _ = store.GetAllWorkspaceSettings(context.Background(), 1)
	}
}
