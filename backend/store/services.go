package store

import (
	"github.com/highlight-run/highlight/backend/model"
)

func (store *Store) FindOrCreateService(project model.Project, name string) (model.Project, error) {
	var service model.Service

	err := store.db.Where(&model.Service{
		ProjectID: project.ID,
		Name:      name,
	}).FirstOrCreate(&service).Error

	return project, err
}
