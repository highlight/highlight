package filtering

import (
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	"github.com/stretchr/testify/assert"
	_ "gorm.io/driver/postgres"
)

func TestUpdateProjectFilterSettings(t *testing.T) {
	repo := setupFilteringRepository()

	util.RunTestWithDBWipe(t, "UpdateProjectFilterSettings", repo.db, func(t *testing.T) {
		project := model.Project{}
		if err := repo.db.Create(&project).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting project"))
		}

		updatedSettings, err := repo.UpdateProjectFilterSettings(project, model.ProjectFilterSettings{
			FilterSessionsWithoutError: true,
		})
		assert.NoError(t, err)

		assert.True(t, updatedSettings.FilterSessionsWithoutError)
	})
}
