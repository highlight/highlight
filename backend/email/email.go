package email

import (
	"context"
	"crypto/sha256"
	"fmt"
	"os"
	"strconv"
	"time"

	e "github.com/pkg/errors"
	"golang.org/x/text/language"
	"golang.org/x/text/message"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
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
	BillingErrorsUsage80Percent   EmailType = "BillingErrorsUsage80Percent"
	BillingErrorsUsage100Percent  EmailType = "BillingErrorsUsage100Percent"
	BillingLogsUsage80Percent     EmailType = "BillingLogsUsage80Percent"
	BillingLogsUsage100Percent    EmailType = "BillingLogsUsage100Percent"
)

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
	preHash := strconv.Itoa(adminID) + now.Format("2006-01") + os.Getenv("EMAIL_OPT_OUT_SALT")
	h.Write([]byte(preHash))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func GetSubscriptionUrl(adminId int, previous bool) string {
	token := GetOptOutToken(adminId, previous)
	return fmt.Sprintf("%s/subscriptions?admin_id=%d&token=%s", os.Getenv("FRONTEND_URI"), adminId, token)
}

func formatNumber(input int) string {
	p := message.NewPrinter(language.English)
	return p.Sprintf("%d", input)
}

var overageCents = map[string]map[modelInputs.RetentionPeriod]int{
	"session": {
		modelInputs.RetentionPeriodThreeMonths:  750,
		modelInputs.RetentionPeriodSixMonths:    750,
		modelInputs.RetentionPeriodTwelveMonths: 1000,
		modelInputs.RetentionPeriodTwoYears:     1250,
	},
	"error": {
		modelInputs.RetentionPeriodThreeMonths:  20,
		modelInputs.RetentionPeriodSixMonths:    30,
		modelInputs.RetentionPeriodTwelveMonths: 40,
		modelInputs.RetentionPeriodTwoYears:     50,
	},
	"log": {
		modelInputs.RetentionPeriodThreeMonths:  150,
		modelInputs.RetentionPeriodSixMonths:    150,
		modelInputs.RetentionPeriodTwelveMonths: 150,
		modelInputs.RetentionPeriodTwoYears:     150,
	},
}

var overageQuantity = map[string]int{
	"session": 1_000,
	"error":   1_000,
	"log":     1_000_000,
}

func getApproachingLimitMessage(productType string, workspaceId int, retentionPeriod modelInputs.RetentionPeriod) string {
	dollars := float64(overageCents[productType][retentionPeriod]) / 100
	quantityStr := formatNumber(overageQuantity[productType])

	return fmt.Sprintf(`Your %s usage has exceeded 80&#37; of your monthly limit.<br>
		Once this limit is exceeded, extra %ss will be charged at $%.2f per %s %ss.<br>
		If you would like to switch to a plan with a higher limit,
		you can upgrade your subscription <a href="https://app.highlight.io/w/%d/upgrade-plan">here</a>.`,
		productType, productType, dollars, quantityStr, productType, workspaceId)
}

func getExceededLimitMessage(productType string, workspaceId int, retentionPeriod modelInputs.RetentionPeriod) string {
	dollars := float64(overageCents[productType][retentionPeriod]) / 100
	quantityStr := formatNumber(overageQuantity[productType])

	return fmt.Sprintf(`Your %s usage has exceeded your monthly limit - extra %ss are charged at $%.2f per %s %ss.<br>
		If you would like to switch to a plan with a higher limit,
		you can upgrade your subscription <a href="https://app.highlight.io/w/%d/upgrade-plan">here</a>.`,
		productType, productType, dollars, quantityStr, productType, workspaceId)
}

func getBillingNotificationMessage(workspaceId int, retentionPeriod modelInputs.RetentionPeriod, emailType EmailType) string {
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
		return getApproachingLimitMessage("session", workspaceId, retentionPeriod)
	case BillingSessionUsage100Percent:
		return getExceededLimitMessage("session", workspaceId, retentionPeriod)
	case BillingErrorsUsage80Percent:
		return getApproachingLimitMessage("error", workspaceId, retentionPeriod)
	case BillingErrorsUsage100Percent:
		return getExceededLimitMessage("error", workspaceId, retentionPeriod)
	case BillingLogsUsage80Percent:
		return getApproachingLimitMessage("log", workspaceId, retentionPeriod)
	case BillingLogsUsage100Percent:
		return getExceededLimitMessage("log", workspaceId, retentionPeriod)
	default:
		return ""
	}
}

func SendBillingNotificationEmail(ctx context.Context, mailClient *sendgrid.Client, workspaceId int, workspaceName *string, retentionPeriod *modelInputs.RetentionPeriod, emailType EmailType, toEmail string, adminId int) error {
	to := &mail.Email{Address: toEmail}

	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(BillingNotificationTemplateID)

	p := mail.NewPersonalization()
	p.AddTos(to)
	curData := map[string]interface{}{}

	retentionPeriodOrDefault := modelInputs.RetentionPeriodSixMonths
	if retentionPeriod != nil {
		retentionPeriodOrDefault = *retentionPeriod
	}

	curData["message"] = getBillingNotificationMessage(workspaceId, retentionPeriodOrDefault, emailType)
	curData["toEmail"] = toEmail
	curData["workspaceName"] = workspaceName
	curData["unsubscribeUrl"] = GetSubscriptionUrl(adminId, false)

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
