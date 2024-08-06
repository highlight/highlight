package handlers

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/env"

	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"

	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	storage "github.com/highlight-run/highlight/backend/storage"
	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"gorm.io/gorm"
)

type Handlers interface {
	DeleteSessionBatchFromClickhouse(context.Context, utils.BatchIdResponse) (*utils.BatchIdResponse, error)
	DeleteSessionBatchFromPostgres(context.Context, utils.BatchIdResponse) (*utils.BatchIdResponse, error)
	DeleteSessionBatchFromObjectStorage(context.Context, utils.BatchIdResponse) (*utils.BatchIdResponse, error)
	GetSessionIdsByQuery(context.Context, utils.QuerySessionsInput) ([]utils.BatchIdResponse, error)
	SendEmail(context.Context, utils.QuerySessionsInput) error
}

type handlers struct {
	db               *gorm.DB
	clickhouseClient *clickhouse.Client
	sendgridClient   *sendgrid.Client
	storageClient    storage.Client
}

func InitHandlers(db *gorm.DB, clickhouseClient *clickhouse.Client, sendgridClient *sendgrid.Client, storageClient storage.Client) *handlers {
	return &handlers{
		db:               db,
		clickhouseClient: clickhouseClient,
		sendgridClient:   sendgridClient,
		storageClient:    storageClient,
	}
}

func NewHandlers() *handlers {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error setting up DB"))
	}

	clickhouseClient, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error creating clickhouse client"))
	}

	s3Client, err := storage.NewS3Client(ctx)
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error creating s3 storage client"))
	}

	sendgridClient := sendgrid.NewSendClient(env.Config.SendgridKey)

	return InitHandlers(db, clickhouseClient, sendgridClient, s3Client)
}

func (h *handlers) DeleteSessionBatchFromClickhouse(ctx context.Context, event utils.BatchIdResponse) (*utils.BatchIdResponse, error) {
	sessionIds, err := utils.GetSessionIdsInBatch(h.db, event.TaskId, event.BatchId)
	if err != nil {
		return nil, errors.Wrap(err, "error getting session ids to delete")
	}

	if !event.DryRun {
		if err := h.clickhouseClient.DeleteSessions(ctx, event.ProjectId, sessionIds); err != nil {
			return nil, errors.Wrap(err, "error creating bulk delete request")
		}
	}

	return &event, nil
}

func (h *handlers) DeleteSessionBatchFromPostgres(ctx context.Context, event utils.BatchIdResponse) (*utils.BatchIdResponse, error) {
	if !event.DryRun {
		if err := h.db.Exec(`
			DELETE FROM session_fields
			WHERE session_id IN (
				SELECT session_id 
				FROM delete_sessions_tasks
				WHERE task_id = ?
				AND batch_id = ?
			)
		`, event.TaskId, event.BatchId).Error; err != nil {
			return nil, errors.Wrap(err, "error deleting session fields")
		}

		if err := h.db.Exec(`
			DELETE FROM sessions
			WHERE id IN (
				SELECT session_id 
				FROM delete_sessions_tasks
				WHERE task_id = ?
				AND batch_id = ?
			)
		`, event.TaskId, event.BatchId).Error; err != nil {
			return nil, errors.Wrap(err, "error deleting sessions")
		}
	}

	return &event, nil
}

func (h *handlers) DeleteSessionBatchFromObjectStorage(ctx context.Context, event utils.BatchIdResponse) (*utils.BatchIdResponse, error) {
	sessionIds, err := utils.GetSessionIdsInBatch(h.db, event.TaskId, event.BatchId)
	if err != nil {
		return nil, errors.Wrap(err, "error getting session ids to delete")
	}

	for _, sessionId := range sessionIds {
		if !event.DryRun {
			if err := h.storageClient.DeleteSessionData(ctx, event.ProjectId, sessionId); err != nil {
				return nil, err
			}
		}
	}

	return &event, nil
}

func (h *handlers) GetSessionIdsByQuery(ctx context.Context, event utils.QuerySessionsInput) ([]utils.BatchIdResponse, error) {
	taskId := uuid.New().String()
	responses := []utils.BatchIdResponse{}
	page := 1
	for {
		batchId := uuid.New().String()
		toDelete := []model.DeleteSessionsTask{}

		ids, _, _, err := h.clickhouseClient.QuerySessionIds(ctx, nil, event.ProjectId, 10000, event.Params, "CreatedAt DESC, ID DESC", pointy.Int(page), time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC))
		if err != nil {
			return nil, err
		}

		if len(ids) == 0 {
			break
		}

		for _, id := range ids {
			toDelete = append(toDelete, model.DeleteSessionsTask{
				SessionID: int(id),
				TaskID:    taskId,
				BatchID:   batchId,
			})
		}

		if err := h.db.Create(&toDelete).Error; err != nil {
			return nil, errors.Wrap(err, "error saving DeleteSessionsTasks")
		}

		responses = append(responses, utils.BatchIdResponse{
			ProjectId: event.ProjectId,
			TaskId:    taskId,
			BatchId:   batchId,
			DryRun:    event.DryRun,
		})

		page += 1
	}

	return responses, nil
}

func (h *handlers) SendEmail(ctx context.Context, event utils.QuerySessionsInput) error {
	to := &mail.Email{Address: event.Email}

	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", email.SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(email.SessionsDeletedEmailTemplateID)

	p := mail.NewPersonalization()
	p.AddTos(to)
	p.SetDynamicTemplateData("First_Name", event.FirstName)
	p.SetDynamicTemplateData("Session_Count", event.SessionCount)

	m.AddPersonalizations(p)
	if resp, sendGridErr := h.sendgridClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
		estr := "error sending sendgrid email -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		return errors.New(estr)
	}

	return nil
}

func (h *handlers) DeleteSessions(ctx context.Context, projectId int, startDate time.Time, endDate time.Time, query string) {
	batches, err := h.GetSessionIdsByQuery(ctx, utils.QuerySessionsInput{
		ProjectId: projectId,
		Params: modelInputs.QueryInput{
			DateRange: &modelInputs.DateRangeRequiredInput{
				StartDate: startDate,
				EndDate:   endDate,
			},
			Query: query,
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

		if _, err := h.DeleteSessionBatchFromPostgres(ctx, batch); err != nil {
			log.WithContext(ctx).Error(err)
			return
		}
		if _, err := h.DeleteSessionBatchFromObjectStorage(ctx, batch); err != nil {
			log.WithContext(ctx).Error(err)
			return
		}
		if _, err := h.DeleteSessionBatchFromClickhouse(ctx, batch); err != nil {
			log.WithContext(ctx).Error(err)
			return
		}

		log.WithContext(ctx).Infof("SessionDeleteJob - finished deleting sessions in batch %s for projectId %d", batch.BatchId, batch.ProjectId)
	}
}

func (h *handlers) ProcessRetentionDeletions(ctx context.Context) {
	retentionEnv := env.Config.SessionRetentionDays
	if retentionEnv == "" {
		log.WithContext(ctx).Info("SESSION_RETENTION_DAYS not set, skipping SessionDeleteJob")
		return
	}
	sessionRetentionDays, err := strconv.Atoi(env.Config.SessionRetentionDays)
	if err != nil {
		log.WithContext(ctx).Error("Error parsing SESSION_RETENTION_DAYS, skipping SessionDeleteJob")
		return
	}
	if sessionRetentionDays <= 0 {
		log.WithContext(ctx).Error("sessionRetentionDays <= 0, skipping SessionDeleteJob")
		return
	}

	var projectIds []int
	if err := h.db.Model(&model.Project{}).Select("id").Find(&projectIds).Error; err != nil {
		log.WithContext(ctx).Error(err)
		return
	}

	now := time.Now()
	endDate := now.AddDate(0, 0, -1*sessionRetentionDays)
	startDate := endDate.AddDate(-10, 0, 0)

	for _, id := range projectIds {
		projectId := id
		// Only delete sessions which have not been viewed to avoid deleting any useful sessions
		// Users can manually remove any others with the "delete sessions" button
		go h.DeleteSessions(ctx, projectId, startDate, endDate, "viewed_by_anyone=false")
	}
}
