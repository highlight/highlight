package handlers

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"gorm.io/gorm"
)

type Handlers interface {
	DeleteSessionBatchFromOpenSearch(context.Context, utils.BatchIdResponse) (*utils.BatchIdResponse, error)
	DeleteSessionBatchFromPostgres(context.Context, utils.BatchIdResponse) (*utils.BatchIdResponse, error)
	DeleteSessionBatchFromS3(context.Context, utils.BatchIdResponse) (*utils.BatchIdResponse, error)
	GetSessionIdsByQuery(context.Context, utils.QuerySessionsInput) ([]utils.BatchIdResponse, error)
	SendEmail(context.Context, utils.QuerySessionsInput) error
}

type handlers struct {
	db               *gorm.DB
	clickhouseClient *clickhouse.Client
	s3Client         *s3.Client
	s3ClientEast2    *s3.Client
	sendgridClient   *sendgrid.Client
}

func InitHandlers(db *gorm.DB, clickhouseClient *clickhouse.Client, s3Client *s3.Client, s3ClientEast2 *s3.Client, sendgridClient *sendgrid.Client) *handlers {
	return &handlers{
		db:               db,
		clickhouseClient: clickhouseClient,
		s3Client:         s3Client,
		s3ClientEast2:    s3ClientEast2,
		sendgridClient:   sendgridClient,
	}
}

func NewHandlers() *handlers {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error setting up DB"))
	}

	clickhouseClient, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error creating opensearch client"))
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-west-2"))
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error loading default from config"))
	}
	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	cfgEast2, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error loading default from config"))
	}
	s3ClientEast2 := s3.NewFromConfig(cfgEast2, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	sendgridClient := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))

	return InitHandlers(db, clickhouseClient, s3Client, s3ClientEast2, sendgridClient)
}

func (h *handlers) getSessionClientAndBucket(sessionId int) (*s3.Client, *string) {
	client := h.s3Client
	bucket := pointy.String(storage.S3SessionsPayloadBucketName)
	if storage.UseNewSessionBucket(sessionId) {
		client = h.s3ClientEast2
		bucket = pointy.String(storage.S3SessionsPayloadBucketNameNew)
	}

	return client, bucket
}

func (h *handlers) DeleteSessionBatchFromOpenSearch(ctx context.Context, event utils.BatchIdResponse) (*utils.BatchIdResponse, error) {
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

func (h *handlers) DeleteSessionBatchFromS3(ctx context.Context, event utils.BatchIdResponse) (*utils.BatchIdResponse, error) {
	sessionIds, err := utils.GetSessionIdsInBatch(h.db, event.TaskId, event.BatchId)
	if err != nil {
		return nil, errors.Wrap(err, "error getting session ids to delete")
	}

	for _, sessionId := range sessionIds {
		client, bucket := h.getSessionClientAndBucket(sessionId)

		versionPart := ""
		if storage.UseNewSessionBucket(sessionId) {
			versionPart = "v2/"
		}
		devStr := ""
		if util.IsDevOrTestEnv() {
			devStr = "dev/"
		}

		prefix := fmt.Sprintf("%s%s%d/%d/", versionPart, devStr, event.ProjectId, sessionId)
		options := s3.ListObjectsV2Input{
			Bucket: bucket,
			Prefix: &prefix,
		}
		output, err := client.ListObjectsV2(ctx, &options)
		if err != nil {
			return nil, errors.Wrap(err, "error listing objects in S3")
		}

		for _, object := range output.Contents {
			options := s3.DeleteObjectInput{
				Bucket: bucket,
				Key:    object.Key,
			}
			if !event.DryRun {
				_, err := client.DeleteObject(ctx, &options)
				if err != nil {
					return nil, errors.Wrap(err, "error deleting objects from S3")
				}
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

		ids, _, err := h.clickhouseClient.QuerySessionIds(ctx, nil, event.ProjectId, 10000, event.Query, "CreatedAt DESC, ID DESC", pointy.Int(page), time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC))
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
