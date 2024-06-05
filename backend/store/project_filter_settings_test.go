package store

import (
	"context"
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/stretchr/testify/assert"
	_ "gorm.io/driver/postgres"
)

func TestGetProjectFilterSettings(t *testing.T) {
	ctx := context.TODO()
	defer teardown(t)

	workspace := model.Workspace{}
	store.DB.Create(&workspace)

	project := model.Project{WorkspaceID: workspace.ID}
	store.DB.Create(&project)

	originalSettings, err := store.GetProjectFilterSettings(ctx, project.ID)
	assert.NoError(t, err)
	assert.NotNil(t, originalSettings.ID)

	settings, err := store.GetProjectFilterSettings(ctx, project.ID)
	assert.NoError(t, err)
	assert.Equal(t, settings.ID, originalSettings.ID)
}

func TestUpdateProjectFilterSettings(t *testing.T) {
	ctx := context.TODO()
	defer teardown(t)

	workspace := model.Workspace{}
	store.DB.Create(&workspace)

	settings := model.AllWorkspaceSettings{WorkspaceID: workspace.ID}
	store.DB.Create(&settings)

	project := model.Project{WorkspaceID: workspace.ID}
	store.DB.Create(&project)

	originalSettings, err := store.UpdateProjectFilterSettings(ctx, project.ID, UpdateProjectFilterSettingsParams{
		FilterSessionsWithoutError: ptr.Bool(true),
	})
	assert.NoError(t, err)
	assert.True(t, originalSettings.FilterSessionsWithoutError)
	assert.Equal(t, originalSettings.ProjectID, project.ID)

	updatedSettings, err := store.UpdateProjectFilterSettings(ctx, project.ID, UpdateProjectFilterSettingsParams{
		FilterSessionsWithoutError: ptr.Bool(false),
	})
	assert.NoError(t, err)
	assert.False(t, updatedSettings.FilterSessionsWithoutError)
	assert.Equal(t, updatedSettings.ProjectID, project.ID)
	assert.Equal(t, originalSettings.ID, updatedSettings.ID)

}

func TestFindProjectsWithAutoResolveSetting(t *testing.T) {
	ctx := context.TODO()
	defer teardown(t)

	workspace := model.Workspace{}
	store.DB.Create(&workspace)

	settings := model.AllWorkspaceSettings{WorkspaceID: workspace.ID}
	store.DB.Create(&settings)

	project1 := model.Project{WorkspaceID: workspace.ID}
	store.DB.Create(&project1)

	project2 := model.Project{WorkspaceID: workspace.ID}
	store.DB.Create(&project2)

	_, err := store.GetProjectFilterSettings(ctx, project1.ID)
	assert.NoError(t, err)
	_, err = store.UpdateProjectFilterSettings(ctx, project1.ID, UpdateProjectFilterSettingsParams{})
	assert.NoError(t, err)

	_, err = store.GetProjectFilterSettings(ctx, project2.ID)
	assert.NoError(t, err)
	projectWithAutoResolveSetting, err := store.UpdateProjectFilterSettings(ctx, project1.ID, UpdateProjectFilterSettingsParams{
		AutoResolveStaleErrorsDayInterval: ptr.Int(1),
	})
	assert.NoError(t, err)

	projectFilterSettings, _ := store.FindProjectsWithAutoResolveSetting(ctx)

	assert.Len(t, projectFilterSettings, 1)
	assert.Equal(t, projectFilterSettings[0].ID, projectWithAutoResolveSetting.ID)
}
