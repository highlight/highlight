package handlers

import (
	"context"
	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/lambda-functions/sessionExport/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Handlers interface {
	SaveSessionExport(context.Context, *utils.SaveSessionExportInput) (*utils.SendEmailInput, error)
	SendEmail(context.Context, *utils.SendEmailInput) error
}

type handlers struct {
	db             *gorm.DB
	sendgridClient *sendgrid.Client
}

func InitHandlers(db *gorm.DB, sendgridClient *sendgrid.Client) *handlers {
	return &handlers{
		db:             db,
		sendgridClient: sendgridClient,
	}
}

func NewHandlers() *handlers {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error setting up DB"))
	}

	sendgridClient := sendgrid.NewSendClient(env.Config.SendgridKey)

	return InitHandlers(db, sendgridClient)
}

func (h *handlers) SaveSessionExport(ctx context.Context, event *utils.SaveSessionExportInput) (*utils.SendEmailInput, error) {
	export := model.SessionExport{
		SessionID:    event.SessionID,
		Type:         event.Type,
		URL:          event.URL,
		Error:        event.Error,
		TargetEmails: event.TargetEmails,
	}
	tx := h.db.Debug().Model(&export).Where(&model.SessionExport{
		SessionID: event.SessionID,
		Type:      event.Type,
	}).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "session_id"}, {Name: "type"}},
		DoUpdates: clause.AssignmentColumns([]string{"url", "error"}),
	}).Create(&export)
	if tx.Error != nil {
		return nil, tx.Error
	}

	session := model.Session{Model: model.Model{ID: event.SessionID}}
	if err := h.db.Debug().Model(&session).Where(&session).Take(&session).Error; err != nil {
		return nil, err
	}

	user := session.ClientID
	if session.Email != nil {
		user = *session.Email
	}
	return &utils.SendEmailInput{
		ProjectId:       session.ProjectID,
		SessionSecureId: session.SecureID,
		User:            user,
		URL:             event.URL,
		Error:           event.Error,
		TargetEmails:    event.TargetEmails,
	}, nil
}

func (h *handlers) SendEmail(ctx context.Context, event *utils.SendEmailInput) error {
	for _, email := range event.TargetEmails {
		if err := Email.SendSessionExportEmail(ctx, h.sendgridClient, event.SessionSecureId, event.URL, event.User, email); err != nil {
			return err
		}
	}
	return nil
}
