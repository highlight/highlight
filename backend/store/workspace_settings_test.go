package store

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/stretchr/testify/assert"
	_ "gorm.io/driver/postgres"
)

func TestGetAllWorkspaceSettings(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		s := model.AllWorkspaceSettings{WorkspaceID: 1}
		store.db.Create(&s)

		newSettings, err := store.GetAllWorkspaceSettings(context.Background(), 1)
		assert.NoError(t, err)
		assert.Equal(t, 1, newSettings.WorkspaceID)

		_, err = store.GetAllWorkspaceSettings(context.Background(), 2)
		assert.Error(t, err)
	})
}
