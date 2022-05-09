package email

import (
	"fmt"

	e "github.com/pkg/errors"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
)

var (
	SendAdminInviteEmailTemplateID        = "d-bca4f9a932ef418a923cbd2d90d2790b"
	SendGridSessionCommentEmailTemplateID = "d-6de8f2ba10164000a2b83d9db8e3b2e3"
	SendGridErrorCommentEmailTemplateId   = "d-7929ce90c6514282a57fdaf7af408704"
	SendGridAlertEmailTemplateID          = "d-efd755d329db413082dbdf1188b6846e"
	SendGridRequestAccessEmailTemplateID  = "d-f059960009ba4a9fb5640e98db517eef"
	SendGridOutboundEmail                 = "gm@runhighlight.com"
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
