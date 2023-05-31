package store

import (
	"context"
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/stretchr/testify/assert"
	_ "gorm.io/driver/postgres"
)

func TestUpdateProjectFilterSettings(t *testing.T) {
	util.RunTestWithDBWipe(t, "UpdateProjectFilterSettings", store.db, func(t *testing.T) {
		project := model.Project{}
		store.db.Create(&project)

		updatedSettings, err := store.UpdateProjectFilterSettings(project, UpdateProjectFilterSettingsParams{
			FilterSessionsWithoutError: ptr.Bool(true),
		})
		assert.NoError(t, err)
		assert.True(t, updatedSettings.FilterSessionsWithoutError)
		assert.Equal(t, updatedSettings.ProjectID, project.ID)

		updatedSettings, err = store.UpdateProjectFilterSettings(project, UpdateProjectFilterSettingsParams{
			FilterSessionsWithoutError: ptr.Bool(false),
		})
		assert.NoError(t, err)
		assert.False(t, updatedSettings.FilterSessionsWithoutError)
		assert.Equal(t, updatedSettings.ProjectID, project.ID)

	})
}

func TestFindProjectsWithAutoResolveSetting(t *testing.T) {
	util.RunTestWithDBWipe(t, "FindProjectsWithAutoResolveSetting", store.db, func(t *testing.T) {
		project1 := model.Project{}
		store.db.Create(&project1)

		project2 := model.Project{}
		store.db.Create(&project2)

		_, err := store.GetProjectFilterSettings(project1)
		assert.NoError(t, err)
		_, err = store.UpdateProjectFilterSettings(project1, UpdateProjectFilterSettingsParams{})
		assert.NoError(t, err)

		_, err = store.GetProjectFilterSettings(project2)
		assert.NoError(t, err)
		projectWithAutoResolveSetting, err := store.UpdateProjectFilterSettings(project1, UpdateProjectFilterSettingsParams{
			AutoResolveStaleErrorsDayInterval: ptr.Int(1),
		})
		assert.NoError(t, err)

		projectFilterSettings := store.FindProjectsWithAutoResolveSetting(context.TODO())

		assert.Len(t, projectFilterSettings, 1)
		assert.Equal(t, projectFilterSettings[0].ID, projectWithAutoResolveSetting.ID)
	})
}
