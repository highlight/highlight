package filtering

import (
	"context"
	"time"

	"github.com/highlight-run/highlight/backend/errorgroups"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	log "github.com/sirupsen/logrus"
)

type AutoResolverService struct {
	FilteringRepository
	errorgroups.ErrorGroupsRepository
}

func (service *AutoResolverService) AutoResolveStaleErrors(ctx context.Context) {
	staleErrorGroups := service.findStaleErrors(ctx)

	for _, errorGroup := range staleErrorGroups {
		log.WithContext(ctx).WithFields(
			log.Fields{"error_group_id": errorGroup.ID}).Info("Auto-resolving stale error group")
		_, err := service.UpdateErrorGroupStateBySystem(ctx, errorgroups.UpdateErrorGroupParams{
			ID:    errorGroup.ID,
			State: privateModel.ErrorStateResolved,
		})
		if err != nil {
			log.WithContext(ctx).Error(err)
		}
	}
}

func (service *AutoResolverService) findStaleErrors(ctx context.Context) []model.ErrorGroup {
	projectFilterSettings := service.findProjectsWithAutoResolveSetting(ctx)
	staleErrorGroups := []model.ErrorGroup{}

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

		staleErrorGroupsForProject, err := service.findStaleErrorsForProject(ctx, project, interval)
		if err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"project_id": projectFilterSettings.ProjectID}).Error(err)
			continue
		} else {
			staleErrorGroups = append(staleErrorGroups, staleErrorGroupsForProject...)
		}
	}

	return staleErrorGroups
}

func (service *AutoResolverService) findStaleErrorsForProject(ctx context.Context, project model.Project, interval int) ([]model.ErrorGroup, error) {
	var errorGroups []model.ErrorGroup

	db := service.FilteringRepository.db

	subQuery := db.
		Model(model.ErrorObject{}).
		Select("error_group_id").
		Where("created_at >= ?", time.Now().AddDate(0, 0, -interval))

	err := db.Debug().
		Where(model.ErrorGroup{
			State:     privateModel.ErrorStateOpen,
			ProjectID: project.ID,
		}).
		Where("id NOT IN (?)", subQuery).
		Find(&errorGroups).Error

	return errorGroups, err
}
