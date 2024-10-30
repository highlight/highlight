package emailV2

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"

	destinationsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations"
	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

type EmailData struct {
	SubjectLine  string
	Template     lambda.ReactEmailTemplate
	TemplateData map[string]interface{}
}

func SendAlerts(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	span, ctx := util.StartSpanFromContext(ctx, "SendAlerts.Email")
	span.SetAttribute("alert_id", alertInput.Alert.ID)
	span.SetAttribute("project_id", alertInput.Alert.ProjectID)
	span.SetAttribute("product_type", alertInput.Alert.ProductType)
	defer span.Finish()

	switch alertInput.Alert.ProductType {
	case modelInputs.ProductTypeSessions:
		sendSessionAlert(ctx, mailClient, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeErrors:
		sendErrorAlert(ctx, mailClient, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeLogs:
		sendLogAlert(ctx, mailClient, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeTraces:
		sendTraceAlert(ctx, mailClient, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeMetrics:
		sendMetricAlert(ctx, mailClient, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeEvents:
		sendEventAlert(ctx, mailClient, lambdaClient, alertInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":          alertInput.Alert.ID,
				"alertProductType": alertInput.Alert.ProductType,
			}).Error("invalid product type")
	}
}

func sendSessionAlert(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	emailData := &EmailData{
		SubjectLine: fmt.Sprintf("%s Alert", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateSessionsAlert,
		TemplateData: map[string]interface{}{
			"alertName":   alertInput.Alert.Name,
			"alertLink":   alertInput.AlertLink,
			"projectName": alertInput.ProjectName,
			"query":       query,
			"secureID":    alertInput.SessionInput.SecureID,
			"sessionLink": alertInput.SessionInput.SessionLink,
			"identifier":  alertInput.SessionInput.Identifier,
		},
	}

	deliverAlerts(ctx, mailClient, lambdaClient, emailData, destinations)
}

func sendErrorAlert(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	emailData := &EmailData{
		SubjectLine: fmt.Sprintf("%s Alert", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateErrorsAlert,
		TemplateData: map[string]interface{}{
			"alertLink":       alertInput.AlertLink,
			"errorCount":      int(alertInput.AlertValue),
			"errorEvent":      alertInput.ErrorInput.Event,
			"errorLink":       alertInput.ErrorInput.ErrorLink,
			"projectName":     alertInput.ProjectName,
			"serviceName":     alertInput.ErrorInput.ServiceName,
			"sessionExcluded": alertInput.ErrorInput.SessionExcluded,
			"sessionLink":     alertInput.ErrorInput.SessionLink,
		},
	}

	deliverAlerts(ctx, mailClient, lambdaClient, emailData, destinations)
}

func sendLogAlert(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	var functionName string
	var functionValue interface{}
	var thresholdValue interface{}
	if alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCount || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinct || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinctKey {
		functionName = "Count"
		functionValue = int(alertInput.AlertValue)
		thresholdValue = int(*alertInput.Alert.ThresholdValue)
	} else {
		functionName = alertInput.Alert.FunctionType.String()
		functionValue = alertInput.AlertValue
		thresholdValue = *alertInput.Alert.ThresholdValue
	}

	emailData := &EmailData{
		SubjectLine: fmt.Sprintf("%s Alert", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateLogsAlert,
		TemplateData: map[string]interface{}{
			"alertLink": alertInput.AlertLink,
			"alertName": alertInput.Alert.Name,
			// TODO(spenny): fix for anomoly alerts
			"belowThreshold": (alertInput.Alert.BelowThreshold != nil && *alertInput.Alert.BelowThreshold) || (alertInput.Alert.ThresholdCondition == modelInputs.ThresholdConditionBelow),
			"functionValue":  functionValue,
			"functionName":   functionName,
			"logsLink":       alertInput.LogInput.LogsLink,
			"projectName":    alertInput.ProjectName,
			"query":          query,
			"thresholdValue": thresholdValue,
		},
	}

	deliverAlerts(ctx, mailClient, lambdaClient, emailData, destinations)
}

func sendTraceAlert(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	var functionName string
	var functionValue interface{}
	var thresholdValue interface{}
	if alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCount || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinct || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinctKey {
		functionName = "Count"
		functionValue = int(alertInput.AlertValue)
		thresholdValue = int(*alertInput.Alert.ThresholdValue)
	} else {
		functionName = alertInput.Alert.FunctionType.String()
		functionValue = alertInput.AlertValue
		thresholdValue = *alertInput.Alert.ThresholdValue
	}

	emailData := &EmailData{
		SubjectLine: fmt.Sprintf("%s Alert", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateTracesAlert,
		TemplateData: map[string]interface{}{
			"alertLink": alertInput.AlertLink,
			"alertName": alertInput.Alert.Name,
			// TODO(spenny): fix for anomoly alerts
			"belowThreshold": (alertInput.Alert.BelowThreshold != nil && *alertInput.Alert.BelowThreshold) || (alertInput.Alert.ThresholdCondition == modelInputs.ThresholdConditionBelow),
			"functionValue":  functionValue,
			"functionName":   functionName,
			"tracesLink":     alertInput.TraceInput.TracesLink,
			"projectName":    alertInput.ProjectName,
			"query":          query,
			"thresholdValue": thresholdValue,
		},
	}

	deliverAlerts(ctx, mailClient, lambdaClient, emailData, destinations)
}

func sendMetricAlert(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	var functionName string
	var functionValue interface{}
	var thresholdValue interface{}
	if alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCount || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinct || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinctKey {
		functionName = "Count"
		functionValue = int(alertInput.AlertValue)
		thresholdValue = int(*alertInput.Alert.ThresholdValue)
	} else {
		functionName = alertInput.Alert.FunctionType.String()
		functionValue = alertInput.AlertValue
		thresholdValue = *alertInput.Alert.ThresholdValue
	}

	emailData := &EmailData{
		SubjectLine: fmt.Sprintf("%s Alert", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateMetricsAlert,
		TemplateData: map[string]interface{}{
			"alertLink": alertInput.AlertLink,
			"alertName": alertInput.Alert.Name,
			// TODO(spenny): fix for anomoly alerts
			"belowThreshold": (alertInput.Alert.BelowThreshold != nil && *alertInput.Alert.BelowThreshold) || (alertInput.Alert.ThresholdCondition == modelInputs.ThresholdConditionBelow),
			"functionValue":  functionValue,
			"functionName":   functionName,
			"dashboardsLink": alertInput.MetricInput.DashboardLink,
			"projectName":    alertInput.ProjectName,
			"query":          query,
			"thresholdValue": thresholdValue,
		},
	}

	deliverAlerts(ctx, mailClient, lambdaClient, emailData, destinations)
}

func sendEventAlert(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	var functionName string
	var functionValue interface{}
	var thresholdValue interface{}
	if alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCount || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinct || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinctKey {
		functionName = "Count"
		functionValue = int(alertInput.AlertValue)
		thresholdValue = int(*alertInput.Alert.ThresholdValue)
	} else {
		functionName = alertInput.Alert.FunctionType.String()
		functionValue = alertInput.AlertValue
		thresholdValue = *alertInput.Alert.ThresholdValue
	}

	emailData := &EmailData{
		SubjectLine: fmt.Sprintf("%s Alert", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateEventsAlert,
		TemplateData: map[string]interface{}{
			"alertLink": alertInput.AlertLink,
			"alertName": alertInput.Alert.Name,
			// TODO(spenny): fix for anomoly alerts
			"belowThreshold": (alertInput.Alert.BelowThreshold != nil && *alertInput.Alert.BelowThreshold) || (alertInput.Alert.ThresholdCondition == modelInputs.ThresholdConditionBelow),
			"functionValue":  functionValue,
			"functionName":   functionName,
			"projectName":    alertInput.ProjectName,
			"query":          query,
			"thresholdValue": thresholdValue,
		},
	}

	deliverAlerts(ctx, mailClient, lambdaClient, emailData, destinations)
}

func SendNotifications(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	switch notificationInput.NotificationType {
	case destinationsV2.NotificationTypeAlertCreated:
		sendAlertCreatedNotification(ctx, mailClient, lambdaClient, notificationInput, destinations)
	case destinationsV2.NotificationTypeAlertUpdated:
		sendAlertUpdatedNotification(ctx, mailClient, lambdaClient, notificationInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"destinationType":  "discord",
				"notificationType": notificationInput.NotificationType,
			}).Error("Invalid notification type")
	}
}

func sendAlertCreatedNotification(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	frontendURL := env.Config.FrontendUri
	alertUrl := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)

	emailData := &EmailData{
		SubjectLine: "New alert created!",
		Template:    lambda.ReactEmailTemplateAlertUpsert,
		TemplateData: map[string]interface{}{
			"adminName":   *name,
			"alertAction": "created",
			"alertLink":   alertUrl,
			"alertName":   notificationInput.AlertUpsertInput.Alert.Name,
		},
	}

	deliverAlerts(ctx, mailClient, lambdaClient, emailData, destinations)
}

func sendAlertUpdatedNotification(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	frontendURL := env.Config.FrontendUri
	alertUrl := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)

	emailData := &EmailData{
		SubjectLine: "Alert updated!",
		Template:    lambda.ReactEmailTemplateAlertUpsert,
		TemplateData: map[string]interface{}{
			"adminName":   *name,
			"alertAction": "updated",
			"alertLink":   alertUrl,
			"alertName":   notificationInput.AlertUpsertInput.Alert.Name,
		},
	}

	deliverAlerts(ctx, mailClient, lambdaClient, emailData, destinations)
}

func deliverAlerts(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, emailTemplate *EmailData, destinations []model.AlertDestination) {
	if mailClient == nil {
		log.WithContext(ctx).Error("mail client is nil")
		return
	}

	if lambdaClient == nil {
		log.WithContext(ctx).Error("lambda client is nil")
		return
	}

	emailHtml, err := lambdaClient.FetchReactEmailHTML(ctx, emailTemplate.Template, emailTemplate.TemplateData)
	if err != nil {
		log.WithContext(ctx).Error(errors.Wrap(err, "error fetching email html"))
		return
	}

	for _, destination := range destinations {
		go func(email string) {
			if err := Email.SendReactEmailAlert(ctx, mailClient, email, emailHtml, emailTemplate.SubjectLine); err != nil {
				log.WithContext(ctx).Error(err)
			}
		}(destination.TypeID)
	}
}
