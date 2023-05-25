package worker

import (
	"context"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/store"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type AutoResolver struct {
	store *store.Store
	db    *gorm.DB
}

func NewAutoResolver(store *store.Store, db *gorm.DB) *AutoResolver {
	return &AutoResolver{
		store: store,
		db:    db,
	}
}

func (autoResolver *AutoResolver) AutoResolveStaleErrors(ctx context.Context) {
	projectFilterSettings := autoResolver.store.FindProjectsWithAutoResolveSetting(ctx)

	for _, projectFilterSettings := range projectFilterSettings {
		log.WithContext(ctx).WithFields(
			log.Fields{"project_id": projectFilterSettings.ProjectID}).Info("Finding stale errors for project")
		interval := projectFilterSettings.AutoResolveStaleErrorsDayInterval

		project, err := autoResolver.store.GetProject(ctx, projectFilterSettings.ProjectID)
		if err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"project_id": projectFilterSettings.ProjectID}).Error(err)
			continue
		}

		err = autoResolver.resolveStaleErrorsForProject(ctx, project, interval)

		if err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"project_id": projectFilterSettings.ProjectID}).Error(err)
			continue
		}
	}
}

func (autoResolver *AutoResolver) resolveStaleErrorsForProject(ctx context.Context, project model.Project, interval int) error {
	var errorGroups []model.ErrorGroup

	db := autoResolver.db

	err := db.Debug().
		Table("error_groups").
		Select("DISTINCT(error_groups.id), error_groups.project_id").
		Joins("INNER JOIN error_objects ON error_groups.id = error_objects.error_group_id").
		Where("error_groups.state = ?", privateModel.ErrorStateOpen).
		Where("error_groups.project_id = ?", project.ID).
		Where("error_objects.created_at < ?", time.Now().AddDate(0, 0, -interval)).
		Find(&errorGroups).
		Error

	if err != nil {
		return err
	}

	for _, errorGroup := range errorGroups {
		log.WithContext(ctx).WithFields(
			log.Fields{
				"project_id":     project.ID,
				"error_group_id": errorGroup.ID,
			}).Info("Autoresolving error group")

		_, err := autoResolver.store.UpdateErrorGroupStateBySystem(ctx, store.UpdateErrorGroupParams{
			ID:    errorGroup.ID,
			State: privateModel.ErrorStateResolved,
		})

		if err != nil {
			return err
		}
	}

	return nil
}
