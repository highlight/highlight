package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/smithy-go/ptr"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

var sendgridClient *sendgrid.Client

func init() {
	sendgridClient = sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))
}

func LambdaHandler(ctx context.Context, event utils.QuerySessionsInput) error {
	to := &mail.Email{Address: event.Email}

	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", email.SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(email.SendAdminInviteEmailTemplateID)

	p := mail.NewPersonalization()
	p.AddTos(to)
	p.SetDynamicTemplateData("Admin_Invitor", adminName)
	p.SetDynamicTemplateData("Organization_Name", projectOrWorkspaceName)
	p.SetDynamicTemplateData("Invite_Link", inviteLink)

	m.AddPersonalizations(p)
	if resp, sendGridErr := r.MailClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
		estr := "error sending sendgrid email -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		return nil, e.New(estr)
	}
	return &inviteLink, nil

	taskId := uuid.New().String()
	lastId := 0
	responses := []utils.BatchIdResponse{}
	for {
		batchId := uuid.New().String()
		toDelete := []model.DeleteSessionsTask{}

		options := opensearch.SearchOptions{
			MaxResults:    ptr.Int(10000),
			SortField:     ptr.String("id"),
			SortOrder:     ptr.String("asc"),
			IncludeFields: []string{"id"},
		}
		if lastId != 0 {
			options.SearchAfter = []interface{}{lastId}
		}

		results := []model.Session{}
		_, _, err := opensearchClient.Search([]opensearch.Index{opensearch.IndexSessions},
			event.ProjectId, event.Query, options, &results)
		if err != nil {
			return nil, err
		}

		if len(results) == 0 {
			break
		}
		lastId = results[len(results)-1].ID

		for _, r := range results {
			toDelete = append(toDelete, model.DeleteSessionsTask{
				SessionID: r.ID,
				TaskID:    taskId,
				BatchID:   batchId,
			})
		}

		if err := db.Create(&toDelete).Error; err != nil {
			return nil, errors.Wrap(err, "error saving DeleteSessionsTasks")
		}

		responses = append(responses, utils.BatchIdResponse{
			ProjectId: event.ProjectId, TaskId: taskId, BatchId: batchId})
	}

	return responses, nil
}

func main() {
	lambda.Start(LambdaHandler)
}
