package filtering

import (
	"context"
	"time"

	"github.com/highlight-run/highlight/backend/errorgroups"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type AutoResolverService struct {
	FilteringRepository
	errorgroups.ErrorGroupsRepository
}

func (service *AutoResolverService) AutoResolveStaleErrors(ctx context.Context) {
	projectFilterSettings := service.findProjectsWithAutoResolveSetting(ctx)

	for _, projectFilterSettings := range projectFilterSettings {
		log.WithContext(ctx).WithFields(
			log.Fields{"project_id": projectFilterSettings.ProjectID}).Info("Finding stale errors for project")
		interval := projectFilterSettings.AutoResolveStaleErrorsDayInterval

		project := model.Project{}
		if err := service.FilteringRepository.db.Where(&model.Project{
			Model: model.Model{
				ID: projectFilterSettings.ProjectID,
			},
		}).First(&project).Error; err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"project_id": projectFilterSettings.ProjectID}).Error(err)
			continue
		}

		err := service.resolveStaleErrorsForProjectInBatches(ctx, project, interval)

		if err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"project_id": projectFilterSettings.ProjectID}).Error(err)
			continue
		}
	}
}

func (service *AutoResolverService) resolveStaleErrorsForProjectInBatches(ctx context.Context, project model.Project, interval int) error {
	var errorGroups []model.ErrorGroup

	db := service.FilteringRepository.db

	subQuery := db.
		Model(model.ErrorObject{}).
		Select("error_group_id").
		Where("created_at >= ?", time.Now().AddDate(0, 0, -interval))

	result := db.Debug().Where(model.ErrorGroup{
		State:     privateModel.ErrorStateOpen,
		ProjectID: project.ID,
	}).
		Where("id NOT IN (?)", subQuery).
		FindInBatches(&errorGroups, 100, func(tx *gorm.DB, batch int) error {
			for _, errorGroup := range errorGroups {
				_, err := service.UpdateErrorGroupStateBySystem(ctx, errorgroups.UpdateErrorGroupParams{
					ID:    errorGroup.ID,
					State: privateModel.ErrorStateResolved,
				})

				if err != nil {
					return err
				}
			}

			return nil
		})

	return result.Error
}
