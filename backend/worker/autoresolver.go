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
			log.Fields{
				"project_id": projectFilterSettings.ProjectID,
				"worker":     "autoresolver",
			}).Info("Finding stale errors for project")
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

	subQuery := db.
		Model(model.ErrorObject{}).
		Select("error_group_id").
		Where("created_at >= ?", time.Now().AddDate(0, 0, -interval))

	err := db.Debug().
		Select("DISTINCT(error_groups.id), error_groups.project_id").
		Where(model.ErrorGroup{
			State:     privateModel.ErrorStateOpen,
			ProjectID: project.ID,
		}).
		Where("id NOT IN (?)", subQuery).
		Find(&errorGroups).Error

	if err != nil {
		return err
	}

	for _, errorGroup := range errorGroups {
		log.WithContext(ctx).WithFields(
			log.Fields{
				"project_id":     project.ID,
				"error_group_id": errorGroup.ID,
				"worker":         "autoresolver",
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
