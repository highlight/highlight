package filtering

import (
	"github.com/highlight-run/highlight/backend/model"
	"gorm.io/gorm"
)

type ProjectFiltersRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *ProjectFiltersRepository {
	return &ProjectFiltersRepository{
		db: db,
	}
}

func (repo *ProjectFiltersRepository) GetProjectFilters(project *model.Project) *model.ProjectFilterSettings {
	projectFilterSettings := model.ProjectFilterSettings{}
	repo.db.Where(model.ProjectFilterSettings{ProjectID: project.ID}).FirstOrCreate(&projectFilterSettings)

	return &projectFilterSettings
}

func (repo *ProjectFiltersRepository) UpdateProjectFilters(project *model.Project, updates model.ProjectFilterSettings) (*model.ProjectFilterSettings, error) {
	projectFilterSettings := model.ProjectFilterSettings{}

	repo.db.Where(model.ProjectFilterSettings{ProjectID: project.ID}).First(&projectFilterSettings)

	projectFilterSettings.FilterSessionsWithoutError = updates.FilterSessionsWithoutError

	if err := repo.db.Save(projectFilterSettings).Error; err != nil {
		return nil, err
	}

	return &projectFilterSettings, nil

}
