package store

import (
	"context"

	"github.com/highlight-run/highlight/backend/model"
)

func (store *Store) GetProject(ctx context.Context, id int) (model.Project, error) {
	var project model.Project

	err := store.db.Where(&model.Project{
		Model: model.Model{
			ID: id,
		},
	}).First(&project).Error

	return project, err
}
