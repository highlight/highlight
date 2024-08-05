package email

import (
	"context"
	"crypto/sha256"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
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
	SessionExportTemplateID              = "d-b359ae6783bd4e3e95d168ffcee4728d"
	SendGridOutboundEmail                = "notifications@notify.highlight.io"
	SessionCommentMentionsAsmId          = 20950
	ErrorCommentMentionsAsmId            = 20994
	frontendUri                          = env.Config.FrontendUri
)

type EmailType string

const (
	BillingHighlightTrial7Days    EmailType = "BillingHighlightTrial7Days"
	BillingHighlightTrialEnded    EmailType = "BillingHighlightTrialEnded"
	BillingStripeTrial7Days       EmailType = "BillingStripeTrial7Days"
	BillingStripeTrial3Days       EmailType = "BillingStripeTrial3Days"
	BillingSessionUsage80Percent  EmailType = "BillingSessionUsage80Percent"
	BillingSessionUsage100Percent EmailType = "BillingSessionUsage100Percent"
	BillingSessionOverage         EmailType = "BillingSessionOverage"
	BillingErrorsUsage80Percent   EmailType = "BillingErrorsUsage80Percent"
	BillingErrorsUsage100Percent  EmailType = "BillingErrorsUsage100Percent"
	BillingErrorsOverage          EmailType = "BillingErrorsOverage"
	BillingLogsUsage80Percent     EmailType = "BillingLogsUsage80Percent"
	BillingLogsUsage100Percent    EmailType = "BillingLogsUsage100Percent"
	BillingLogsOverage            EmailType = "BillingLogsOverage"
	BillingTracesUsage80Percent   EmailType = "BillingTracesUsage80Percent"
	BillingTracesUsage100Percent  EmailType = "BillingTracesUsage100Percent"
	BillingTracesOverage          EmailType = "BillingTracesOverage"
	BillingInvalidPayment         EmailType = "BillingInvalidPayment"
)

var OneTimeBillingNotifications = []EmailType{
	BillingSessionOverage,
	BillingErrorsOverage,
	BillingLogsOverage,
	BillingTracesOverage,
}

func SendReactEmailAlert(ctx context.Context, MailClient *sendgrid.Client, email string, html string, subjectLine string) error {
	to := &mail.Email{Address: email}
	from := mail.NewEmail("Highlight", SendGridOutboundEmail)

	m := mail.NewV3MailInit(from, subjectLine, to, mail.NewContent("text/html", html))

	if resp, sendGridErr := MailClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
		log.WithContext(ctx).Info("🔥", resp, sendGridErr)
		estr := "error sending sendgrid email for alert -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		log.WithContext(ctx).Error("🔥", estr)
		return e.New(estr)
	}
	log.WithContext(ctx).Info("Sending react email")
	return nil
}

func SendAlertEmail(ctx context.Context, MailClient *sendgrid.Client, email string, message string, alertType string, alertName string) error {
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
		log.WithContext(ctx).Info("🔥", resp, sendGridErr)
		estr := "error sending sendgrid email for alert -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		log.WithContext(ctx).Error("🔥", estr)
		return e.New(estr)
	}
	log.WithContext(ctx).Info("Sending email")
	return nil
}

func GetOptOutToken(adminID int, previous bool) string {
	now := time.Now()
	if previous {
		now = now.AddDate(0, -1, 0)
	}
	h := sha256.New()
	preHash := strconv.Itoa(adminID) + now.Format("2006-01") + env.Config.EmailOptOutSalt
	h.Write([]byte(preHash))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func GetSubscriptionUrl(adminId int, previous bool) string {
	token := GetOptOutToken(adminId, previous)
	return fmt.Sprintf("%s/subscriptions?admin_id=%d&token=%s", env.Config.FrontendUri, adminId, token)
}

func getApproachingLimitMessage(productType string, workspaceId int) string {
	return fmt.Sprintf(`Your %s usage has exceeded 80&#37; of your monthly limit.<br>
		Once this limit is exceeded, extra %s will not be recorded.<br>
		If you would like to increase your billing limit,
		you can upgrade your subscription <a href="%s/w/%d/current-plan">here</a>.`,
		productType, productType, frontendUri, workspaceId)
}

func getExceededLimitMessage(productType string, workspaceId int) string {
	return fmt.Sprintf(`Your %s usage has exceeded your monthly limit - extra %s will not be recorded.<br>
		If you would like to increase your billing limit,
		you can upgrade your subscription <a href="%s/w/%d/current-plan">here</a>.`,
		productType, productType, frontendUri, workspaceId)
}

func getOverageMessage(productType string, workspaceId int) string {
	return fmt.Sprintf(`Your %s usage has exceeded the included amount - extra %s are now incurring a charge.<br>
		If you'd like to check the exact charge for the month,
		please visit the subscription details page <a href="%s/w/%d/current-plan">here</a>.`,
		productType, productType, frontendUri, workspaceId)
}

func getBillingNotificationSubject(emailType EmailType) string {
	switch emailType {
	case BillingHighlightTrial7Days:
		return "Your Highlight trial ends in 7 days"
	case BillingStripeTrial7Days:
		return "Your Highlight trial ends in 7 days"
	case BillingStripeTrial3Days:
		return "Your Highlight trial ends in 3 days"
	case BillingHighlightTrialEnded:
		return "Your Highlight trial has ended"
	case BillingSessionUsage80Percent:
		return "[Highlight] billing limits - 80% of your session usage"
	case BillingSessionUsage100Percent:
		return "[Highlight] billing limits - 100% of your session usage"
	case BillingSessionOverage:
		return "[Highlight] overages charges - sessions over your included amount"
	case BillingErrorsUsage80Percent:
		return "[Highlight] billing limits - 80% of your errors usage"
	case BillingErrorsUsage100Percent:
		return "[Highlight] billing limits - 100% of your errors usage"
	case BillingErrorsOverage:
		return "[Highlight] overages charges - errors over your included amount"
	case BillingLogsUsage80Percent:
		return "[Highlight] billing limits - 80% of your logs usage"
	case BillingLogsUsage100Percent:
		return "[Highlight] billing limits - 100% of your logs usage"
	case BillingLogsOverage:
		return "[Highlight] overages charges - logs over your included amount"
	case BillingTracesUsage80Percent:
		return "[Highlight] billing limits - 80% of your traces usage"
	case BillingTracesUsage100Percent:
		return "[Highlight] billing limits - 100% of your traces usage"
	case BillingTracesOverage:
		return "[Highlight] overages charges - traces over your included amount"
	case BillingInvalidPayment:
		return "[Highlight] invalid billing - issues with your payment method"
	default:
		return "Highlight Billing Notification"
	}
}

func getBillingNotificationMessage(workspaceId int, emailType EmailType) string {
	switch emailType {
	case BillingHighlightTrial7Days:
		return fmt.Sprintf(`
			We hope you've been enjoying Highlight!<br>
			Your free trial is ending in 7 days.<br>
			Once it has ended, you will be on the free tier with monthly limits for sessions, errors, and logs.<br>
			You can upgrade to a paid subscription <a href="%s/w/%d/current-plan">here</a>.`, frontendUri, workspaceId)
	case BillingHighlightTrialEnded:
		return fmt.Sprintf(`
			We hope you've been enjoying Highlight!<br>
			Your free trial has ended - you are now on the free tier with monthly limits for sessions, errors, and logs.<br>
			You can upgrade to a paid subscription <a href="%s/w/%d/current-plan">here</a>.`, frontendUri, workspaceId)
	case BillingStripeTrial7Days:
		return fmt.Sprintf(`
			We hope you've been enjoying Highlight!<br>
			Your free trial is ending in 7 days.<br>
			Once the trial has ended, the card on file will be charged for the plan you have selected.<br>
			If you would like to switch to a different plan or cancel your subscription, 
			you can update your billing settings <a href="%s/w/%d/current-plan">here</a>.`, frontendUri, workspaceId)
	case BillingStripeTrial3Days:
		return fmt.Sprintf(`
			We hope you've been enjoying Highlight!<br>
			Your free trial is ending in 3 days.<br>
			Once the trial has ended, the card on file will be charged for the plan you have selected.<br>
			If you would like to switch to a different plan or cancel your subscription, 
			you can update your billing settings <a href="%s/w/%d/current-plan">here</a>.`, frontendUri, workspaceId)
	case BillingSessionUsage80Percent:
		return getApproachingLimitMessage("sessions", workspaceId)
	case BillingSessionUsage100Percent:
		return getExceededLimitMessage("sessions", workspaceId)
	case BillingSessionOverage:
		return getOverageMessage("sessions", workspaceId)
	case BillingErrorsUsage80Percent:
		return getApproachingLimitMessage("errors", workspaceId)
	case BillingErrorsUsage100Percent:
		return getExceededLimitMessage("errors", workspaceId)
	case BillingErrorsOverage:
		return getOverageMessage("errors", workspaceId)
	case BillingLogsUsage80Percent:
		return getApproachingLimitMessage("logs", workspaceId)
	case BillingLogsUsage100Percent:
		return getExceededLimitMessage("logs", workspaceId)
	case BillingLogsOverage:
		return getOverageMessage("logs", workspaceId)
	case BillingTracesUsage80Percent:
		return getApproachingLimitMessage("traces", workspaceId)
	case BillingTracesUsage100Percent:
		return getExceededLimitMessage("traces", workspaceId)
	case BillingTracesOverage:
		return getOverageMessage("traces", workspaceId)
	case BillingInvalidPayment:
		return fmt.Sprintf(`
			We're having issues validating your payment details!<br>
			The card on file is not valid or 
			we have failed to charge it for the current invoice.<br>
			If the issue isn't resolved in 5 days, we will stop ingesting all data :(<br>
			Please update your payment preferences in Highlight <a href="%s/w/%d/current-plan">here</a>.`, frontendUri, workspaceId)
	default:
		return ""
	}
}

func SendBillingNotificationEmail(ctx context.Context, mailClient *sendgrid.Client, workspaceId int, workspaceName *string, emailType EmailType, toEmail string, adminId int) error {
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
	curData["subject"] = getBillingNotificationSubject(emailType)

	p.DynamicTemplateData = curData

	m.AddPersonalizations(p)

	log.WithContext(ctx).WithFields(log.Fields{"workspace_id": workspaceId, "to_email": toEmail, "email_type": emailType}).
		Info("BILLING_NOTIFICATION email")

	if resp, sendGridErr := mailClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
		estr := "error sending sendgrid email -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		return e.New(estr)
	}

	return nil
}

func SendSessionExportEmail(ctx context.Context, mailClient *sendgrid.Client, sessionSecureId, exportUrl, sessionUser, toEmail string) error {
	to := &mail.Email{Address: toEmail}

	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(SessionExportTemplateID)

	p := mail.NewPersonalization()
	p.AddTos(to)
	curData := map[string]interface{}{}

	curData["toEmail"] = toEmail
	curData["sessionLink"] = exportUrl
	curData["sessionUser"] = sessionUser
	curData["subject"] = "Your highlight.io session export is ready."

	p.DynamicTemplateData = curData

	m.AddPersonalizations(p)

	log.WithContext(ctx).WithFields(log.Fields{"session_secure_id": sessionSecureId, "url": exportUrl, "to_email": toEmail}).Info("session export email")

	if resp, sendGridErr := mailClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
		estr := "error sending sendgrid email -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		return e.New(estr)
	}

	return nil
}
