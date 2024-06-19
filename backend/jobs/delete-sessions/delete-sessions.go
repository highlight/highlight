package delete_sessions

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2/log"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/handlers"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/storage"
	"gorm.io/gorm"
)

func processDeletions(ctx context.Context, DB *gorm.DB, deleteHandlers handlers.Handlers, retentionDays int) {
	var projectIds []int
	if err := DB.Model(&model.Project{}).Select("id").Find(&projectIds).Error; err != nil {
		log.WithContext(ctx).Error(err)
		return
	}

	for _, id := range projectIds {
		projectId := id
		go func() {
			now := time.Now()
			endDate := now.AddDate(0, 0, -1*retentionDays)
			startDate := endDate.AddDate(-10, 0, 0)

			batches, err := deleteHandlers.GetSessionIdsByQuery(ctx, utils.QuerySessionsInput{
				ProjectId: projectId,
				Params: privateModel.QueryInput{
					DateRange: &privateModel.DateRangeRequiredInput{
						StartDate: startDate,
						EndDate:   endDate,
					},
				},
			})
			if err != nil {
				log.WithContext(ctx).Error(err)
				return
			}

			if len(batches) == 0 {
				log.WithContext(ctx).Warnf("SessionDeleteJob - no sessions to delete for projectId %d, continuing", projectId)
				return
			}

			log.WithContext(ctx).Infof("SessionDeleteJob - %d batches to delete for projectId %d", len(batches), projectId)

			for _, batch := range batches {
				log.WithContext(ctx).Infof("SessionDeleteJob - deleting sessions in batch %s for projectId %d", batch.BatchId, batch.ProjectId)

				if _, err := deleteHandlers.DeleteSessionBatchFromPostgres(ctx, batch); err != nil {
					log.WithContext(ctx).Error(err)
					return
				}
				if _, err := deleteHandlers.DeleteSessionBatchFromObjectStorage(ctx, batch); err != nil {
					log.WithContext(ctx).Error(err)
					return
				}
				if _, err := deleteHandlers.DeleteSessionBatchFromClickhouse(ctx, batch); err != nil {
					log.WithContext(ctx).Error(err)
					return
				}

				log.WithContext(ctx).Infof("SessionDeleteJob - finished deleting sessions in batch %s for projectId %d", batch.BatchId, batch.ProjectId)
			}
		}()
	}
}

func StartSessionDeleteJob(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, storageClient storage.Client, retentionDays int) {
	log.WithContext(ctx).Info("Starting SessionDeleteJob")
	deleteHandlers := handlers.InitHandlers(DB, ccClient, nil, storageClient)

	processDeletions(ctx, DB, deleteHandlers, retentionDays)
	for range time.Tick(time.Hour * 24) {
		processDeletions(ctx, DB, deleteHandlers, retentionDays)
	}
}
