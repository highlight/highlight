package email

import (
	"fmt"

	e "github.com/pkg/errors"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
)

var (
	SendAdminInviteEmailTemplateID       = "d-bca4f9a932ef418a923cbd2d90d2790b"
	SendGridCommentEmailTemplateID       = "d-af96adc0bfee455a8eff291f2bc621b0"
	SendGridAlertEmailTemplateID         = "d-efd755d329db413082dbdf1188b6846e"
	SendGridRequestAccessEmailTemplateID = "d-f059960009ba4a9fb5640e98db517eef"
	SessionsDeletedEmailTemplateID       = "d-d9e10ce22c774fc9850dd0b36ccde339"
	DigestEmailTemplateID                = "d-5bb29dabe298425ab9422b74636516bd"
	SendGridOutboundEmail                = "gm@runhighlight.com"
	SessionCommentMentionsAsmId          = 20950
	ErrorCommentMentionsAsmId            = 20994
)

func SendAlertEmail(MailClient *sendgrid.Client, email string, message string, alertType string, alertName string) error {
	to := &mail.Email{Address: email}

	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(SendGridAlertEmailTemplateID)

	p := mail.NewPersonalization()
	p.AddTos(to)
	p.SetDynamicTemplateData("Message", message)
	p.SetDynamicTemplateData("Alert_Type", alertType)
	p.SetDynamicTemplateData("Alert_Name", alertName)
	m.AddPersonalizations(p)

	if resp, sendGridErr := MailClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
		log.Info("🔥", resp, sendGridErr)
		estr := "error sending sendgrid email for alert -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		log.Error("🔥", estr)
		return e.New(estr)
	}
	log.Info("Sending email")
	return nil
}
