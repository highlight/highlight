package filtering

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/stretchr/testify/assert"
	_ "gorm.io/driver/postgres"
)

func TestUpdateProjectFilterSettings(t *testing.T) {
	repo := setupFilteringRepository()

	util.RunTestWithDBWipe(t, "UpdateProjectFilterSettings", repo.db, func(t *testing.T) {
		project := model.Project{}
		repo.db.Create(&project)

		updatedSettings, err := repo.UpdateProjectFilterSettings(project, model.ProjectFilterSettings{
			FilterSessionsWithoutError: true,
		})
		assert.NoError(t, err)

		assert.True(t, updatedSettings.FilterSessionsWithoutError)
	})
}

func TestFindProjectsWithAutoResolveSetting(t *testing.T) {
	repo := setupFilteringRepository()

	util.RunTestWithDBWipe(t, "FindProjectsWithAutoResolveSetting", repo.db, func(t *testing.T) {
		project1 := model.Project{}
		repo.db.Create(&project1)

		project2 := model.Project{}
		repo.db.Create(&project2)

		_, err := repo.GetProjectFilterSettings(project1)
		assert.NoError(t, err)
		_, err = repo.UpdateProjectFilterSettings(project1, model.ProjectFilterSettings{})
		assert.NoError(t, err)

		_, err = repo.GetProjectFilterSettings(project2)
		assert.NoError(t, err)
		projectWithAutoResolveSetting, err := repo.UpdateProjectFilterSettings(project1, model.ProjectFilterSettings{
			AutoResolveStaleErrorsDayInterval: 1,
		})
		assert.NoError(t, err)

		projectFilterSettings := repo.findProjectsWithAutoResolveSetting(context.TODO())

		assert.Len(t, projectFilterSettings, 1)
		assert.Equal(t, projectFilterSettings[0].ID, projectWithAutoResolveSetting.ID)
	})
}
