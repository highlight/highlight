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
	projectFilterSettings, err := autoResolver.store.FindProjectsWithAutoResolveSetting(ctx)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to query auto resolve settings")
		return
	}

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

		err = autoResolver.resolveStaleErrorsForProject(ctx, *project, interval)

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
		Where("error_objects.error_group_id = error_groups.id").
		Where("created_at >= ?", time.Now().AddDate(0, 0, -interval)).
		Where(model.ErrorObject{
			ProjectID: project.ID,
		})

	err := db.
		Select("DISTINCT(error_groups.id), error_groups.project_id").
		Where(model.ErrorGroup{
			State:     privateModel.ErrorStateOpen,
			ProjectID: project.ID,
		}).
		Where("NOT EXISTS (?)", subQuery).
		Find(&errorGroups).Error

	if err != nil {
		return err
	}

	for _, errorGroup := range errorGroups {
		logFields := log.Fields{
			"project_id":     project.ID,
			"error_group_id": errorGroup.ID,
			"worker":         "autoresolver",
		}

		log.WithContext(ctx).WithFields(logFields).Info("Autoresolving error group")

		err := autoResolver.store.UpdateErrorGroupStateBySystem(ctx, store.UpdateErrorGroupParams{
			ID:    errorGroup.ID,
			State: privateModel.ErrorStateResolved,
		})

		if err != nil {
			log.WithContext(ctx).WithFields(logFields).Error(err)
			continue
		}

		log.WithContext(ctx).WithFields(logFields).Info("Resolved error group")
	}

	return nil
}
