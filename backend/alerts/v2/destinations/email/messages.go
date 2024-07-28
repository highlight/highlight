package emailV2

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"

	destinationsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations"
	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type EmailData struct {
	SubjectLine  string
	Template     lambda.ReactEmailTemplate
	TemplateData map[string]interface{}
}

func SendAlerts(ctx context.Context, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
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
		SubjectLine: fmt.Sprintf("%s fired!", alertInput.Alert.Name),
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
		SubjectLine: "Error subject line",
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
		SubjectLine: fmt.Sprintf("%s fired!", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateLogsAlert,
		TemplateData: map[string]interface{}{
			"alertLink":      alertInput.AlertLink,
			"alertName":      alertInput.Alert.Name,
			"belowThreshold": alertInput.Alert.BelowThreshold,
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
		SubjectLine: fmt.Sprintf("%s fired!", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateLogsAlert,
		TemplateData: map[string]interface{}{
			"alertLink":      alertInput.AlertLink,
			"alertName":      alertInput.Alert.Name,
			"belowThreshold": alertInput.Alert.BelowThreshold,
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
		SubjectLine: fmt.Sprintf("%s fired!", alertInput.Alert.Name),
		Template:    lambda.ReactEmailTemplateLogsAlert,
		TemplateData: map[string]interface{}{
			"alertLink":      alertInput.AlertLink,
			"alertName":      alertInput.Alert.Name,
			"belowThreshold": alertInput.Alert.BelowThreshold,
			"functionValue":  functionValue,
			"functionName":   functionName, "dashboardsLink": alertInput.MetricInput.DashboardLink,
			"projectName":    alertInput.ProjectName,
			"query":          query,
			"thresholdValue": thresholdValue,
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
