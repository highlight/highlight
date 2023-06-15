package store

import (
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/stretchr/testify/assert"
)

func TestGetProject(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		_, err := store.GetProject(1)
		assert.Error(t, err)

		project := model.Project{}
		store.db.Create(&project)

		foundProject, err := store.GetProject(project.ID)
		assert.NoError(t, err)
		assert.Equal(t, project.ID, foundProject.ID)
	})
}
