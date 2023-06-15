package store

import (
	"github.com/highlight-run/highlight/backend/model"
)

func (store *Store) GetProject(id int) (model.Project, error) {
	var project model.Project

	err := store.db.Where(&model.Project{
		Model: model.Model{
			ID: id,
		},
	}).First(&project).Error

	return project, err
}
