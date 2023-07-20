package store

import (
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/stretchr/testify/assert"
)

func TestFindOrCreateService(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		project := model.Project{}
		store.db.Create(&project)

		service, err := store.FindOrCreateService(project, "public-graph")
		assert.NoError(t, err)

		assert.NotNil(t, service.ID)

		foundService, err := store.FindOrCreateService(project, "public-graph")
		assert.NoError(t, err)
		assert.Equal(t, service.ID, foundService.ID)
	})
}
