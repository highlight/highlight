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
	*FilteringRepository
	*errorgroups.ErrorGroupsRepository
}

func (service *AutoResolverService) AutoResolveStaleErrors(ctx context.Context) {
	staleErrorGroups := service.findStaleErrors(ctx)

	for _, errorGroup := range staleErrorGroups {
		_, err := service.UpdateErrorGroupState(ctx, &errorGroup, privateModel.ErrorStateResolved, nil)
		log.WithContext(ctx).Error(err)
	}
}

func (service *AutoResolverService) findStaleErrors(ctx context.Context) []model.ErrorGroup {
	projectFilterSettings := service.findProjectsWithAutoResolveSetting(ctx)
	staleErrorGroups := []model.ErrorGroup{}

	for _, projectFilterSettings := range projectFilterSettings {
		interval := projectFilterSettings.AutoResolveStaleErrorsDayInterval

		project := &model.Project{}
		if err := service.FilteringRepository.db.Where(&model.Project{
			Model: model.Model{
				ID: projectFilterSettings.ProjectID,
			},
		}).First(&project).Error; err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"project_id": projectFilterSettings.ProjectID}).Error(err)
			continue
		}

		openProjectErrorGroups := []model.ErrorGroup{}
		if err := service.FilteringRepository.db.Where(&model.ErrorGroup{
			State: privateModel.ErrorStateOpen,
		}).Find(&openProjectErrorGroups).Error; err != nil {
			continue
		}

		for _, errorGroup := range openProjectErrorGroups {
			errorObject := &model.ErrorObject{}

			if err := service.FilteringRepository.db.Where(&model.ErrorObject{
				ErrorGroupID: errorGroup.ID,
			}).Last(&errorObject).Error; err != nil {
				continue
			}

			lookbackPeriod := time.Now().Add(time.Duration(-24*interval) * time.Hour)

			if errorObject.CreatedAt.Before(lookbackPeriod) {
				staleErrorGroups = append(staleErrorGroups, errorGroup)
			}
		}
	}

	return staleErrorGroups
}
