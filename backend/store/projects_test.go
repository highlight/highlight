package store

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/stretchr/testify/assert"
)

func TestGetProject(t *testing.T) {
	ctx := context.Background()

	defer teardown(t)

	_, err := store.GetProject(ctx, 1)
	assert.Error(t, err)

	project := model.Project{}
	store.DB.Create(&project)

	foundProject, err := store.GetProject(ctx, project.ID)
	assert.NoError(t, err)
	assert.Equal(t, project.ID, foundProject.ID)
}
