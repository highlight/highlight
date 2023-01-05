package email

import (
	"crypto/sha256"
	"fmt"
	"os"
	"strconv"
	"time"

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
	BillingNotificationTemplateID        = "d-9fa375187c114dc1a5b561e81fbee794"
	SendGridOutboundEmail                = "gm@runhighlight.com"
	SessionCommentMentionsAsmId          = 20950
	ErrorCommentMentionsAsmId            = 20994
)

type EmailType string

const (
	BillingHighlightTrial7Days    EmailType = "BillingHighlightTrial7Days"
	BillingHighlightTrialEnded    EmailType = "BillingHighlightTrialEnded"
	BillingStripeTrial7Days       EmailType = "BillingStripeTrial7Days"
	BillingStripeTrial3Days       EmailType = "BillingStripeTrial3Days"
	BillingSessionUsage80Percent  EmailType = "BillingSessionUsage80Percent"
	BillingSessionUsage100Percent EmailType = "BillingSessionUsage100Percent"
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

func GetOptOutToken(adminID int, previous bool) string {
	now := time.Now()
	if previous {
		now = now.AddDate(0, -1, 0)
	}
	h := sha256.New()
	preHash := strconv.Itoa(adminID) + now.Format("2006-01") + os.Getenv("EMAIL_OPT_OUT_SALT")
	h.Write([]byte(preHash))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func GetSubscriptionUrl(adminId int, previous bool) string {
	token := GetOptOutToken(adminId, previous)
	return fmt.Sprintf("%s/subscriptions?admin_id=%d&token=%s", os.Getenv("FRONTEND_URI"), adminId, token)
}

func getBillingNotificationMessage(workspaceId int, emailType EmailType) string {
	switch emailType {
	case BillingHighlightTrial7Days:
		return fmt.Sprintf(`
			We hope you've been enjoying Highlight!<br>
			Your free trial is ending in 7 days.<br>
			Once it has ended, you will be on the free tier with a limit of 500 sessions per month.<br>
			You can upgrade to a paid subscription <a href="https://app.highlight.io/w/%d/upgrade-plan">here</a>.`, workspaceId)
	case BillingHighlightTrialEnded:
		return fmt.Sprintf(`
			We hope you've been enjoying Highlight!<br>
			Your free trial has ended - you are now on the free tier with a limit of 500 sessions per month.<br>
			You can upgrade to a paid subscription <a href="https://app.highlight.io/w/%d/upgrade-plan">here</a>.`, workspaceId)
	case BillingStripeTrial7Days:
		return fmt.Sprintf(`
			We hope you've been enjoying Highlight!<br>
			Your free trial is ending in 7 days.<br>
			Once the trial has ended, the card on file will be charged for the plan you have selected.<br>
			If you would like to switch to a different plan or cancel your subscription, 
			you can update your billing settings <a href="https://app.highlight.io/w/%d/current-plan">here</a>.`, workspaceId)
	case BillingStripeTrial3Days:
		return fmt.Sprintf(`
			We hope you've been enjoying Highlight!<br>
			Your free trial is ending in 3 days.<br>
			Once the trial has ended, the card on file will be charged for the plan you have selected.<br>
			If you would like to switch to a different plan or cancel your subscription, 
			you can update your billing settings <a href="https://app.highlight.io/w/%d/current-plan">here</a>.`, workspaceId)
	case BillingSessionUsage80Percent:
		return fmt.Sprintf(`
			Your session usage has exceeded 80&#37; of your monthly limit.<br>
			Once this limit is exceeded, extra sessions will be charged at $5 per 1,000 sessions.<br>
			If you would like to switch to a plan with a higher limit,
			you can upgrade your subscription <a href="https://app.highlight.io/w/%d/upgrade-plan">here</a>.`, workspaceId)
	case BillingSessionUsage100Percent:
		return fmt.Sprintf(`
			Your session usage has exceeded your monthly limit - extra sessions are charged at $5 per 1,000 sessions.<br>
			If you would like to switch to a plan with a higher limit,
			you can upgrade your subscription <a href="https://app.highlight.io/w/%d/upgrade-plan">here</a>.`, workspaceId)
	default:
		return ""
	}
}

func SendBillingNotificationEmail(mailClient *sendgrid.Client, emailType EmailType, workspaceId int, workspaceName *string, toEmail string, adminId int) error {
	to := &mail.Email{Address: toEmail}

	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(BillingNotificationTemplateID)

	p := mail.NewPersonalization()
	p.AddTos(to)
	curData := map[string]interface{}{}
	curData["message"] = getBillingNotificationMessage(workspaceId, emailType)
	curData["toEmail"] = toEmail
	curData["workspaceName"] = workspaceName
	curData["unsubscribeUrl"] = GetSubscriptionUrl(adminId, false)

	p.DynamicTemplateData = curData

	m.AddPersonalizations(p)

	log.WithFields(log.Fields{"workspace_id": workspaceId, "to_email": toEmail, "email_type": emailType}).
		Info("BILLING_NOTIFICATION email dry run")

	// if resp, sendGridErr := mailClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
	// 	estr := "error sending sendgrid email -> "
	// 	estr += fmt.Sprintf("resp-code: %v; ", resp)
	// 	if sendGridErr != nil {
	// 		estr += fmt.Sprintf("err: %v", sendGridErr.Error())
	// 	}
	// 	return e.New(estr)
	// }

	return nil
}
