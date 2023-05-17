package filtering

import (
	"github.com/highlight-run/highlight/backend/model"
	"gorm.io/gorm"
)

type FilteringRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *FilteringRepository {
	return &FilteringRepository{
		db: db,
	}
}

func (repo *FilteringRepository) GetProjectFilterSettings(project *model.Project) *model.ProjectFilterSettings {
	projectFilterSettings := model.ProjectFilterSettings{}
	repo.db.Where(model.ProjectFilterSettings{ProjectID: project.ID}).FirstOrCreate(&projectFilterSettings)

	return &projectFilterSettings
}

func (repo *FilteringRepository) UpdateProjectFilterSettings(project *model.Project, updates model.ProjectFilterSettings) *model.ProjectFilterSettings {
	projectFilterSettings := model.ProjectFilterSettings{}

	repo.db.Where(model.ProjectFilterSettings{
		ProjectID: project.ID,
	}).Assign(updates).FirstOrCreate(&projectFilterSettings)

	return &projectFilterSettings
}
