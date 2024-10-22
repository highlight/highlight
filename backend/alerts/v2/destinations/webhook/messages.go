package webhookV2

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/hashicorp/go-retryablehttp"
	destinationsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/routing"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func SendAlerts(ctx context.Context, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	switch alertInput.Alert.ProductType {
	case modelInputs.ProductTypeSessions:
		sendSessionAlert(ctx, alertInput, destinations)
	case modelInputs.ProductTypeErrors:
		sendErrorAlert(ctx, alertInput, destinations)
	case modelInputs.ProductTypeLogs:
		sendLogAlert(ctx, alertInput, destinations)
	case modelInputs.ProductTypeTraces:
		sendTraceAlert(ctx, alertInput, destinations)
	case modelInputs.ProductTypeMetrics:
		sendMetricAlert(ctx, alertInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":          alertInput.Alert.ID,
				"alertProductType": alertInput.Alert.ProductType,
			}).Error("invalid product type")
	}
}

type SessionAlertPayload struct {
	Event      string
	AlertName  string
	Query      string
	SecureID   string
	Identifier string
	SessionURL string
}

func sendSessionAlert(ctx context.Context, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := ""
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	messagePayload := SessionAlertPayload{
		Event:      model.AlertType.SESSIONS,
		AlertName:  alertInput.Alert.Name,
		Query:      query,
		SecureID:   alertInput.SessionInput.SecureID,
		Identifier: alertInput.SessionInput.Identifier,
		SessionURL: alertInput.SessionInput.SessionLink,
	}

	sendAlerts(ctx, messagePayload, destinations)
}

type ErrorAlertPayload struct {
	Event           string
	AlertName       string
	Query           string
	ErrorCount      int64
	ErrorTitle      string
	SessionSecureID string
	SessionURL      string
	SessionExcluded bool
	UserIdentifier  string
	ErrorURL        string
	ErrorResolveURL string
	ErrorIgnoreURL  string
	ErrorSnoozeURL  string
}

func sendErrorAlert(ctx context.Context, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := ""
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	messagePayload := ErrorAlertPayload{
		Event:           model.AlertType.ERRORS,
		AlertName:       alertInput.Alert.Name,
		Query:           query,
		ErrorCount:      int64(alertInput.AlertValue),
		ErrorTitle:      alertInput.ErrorInput.Event,
		SessionSecureID: alertInput.ErrorInput.SessionSecureID,
		SessionURL:      alertInput.ErrorInput.SessionLink,
		SessionExcluded: alertInput.ErrorInput.SessionExcluded,
		UserIdentifier:  alertInput.ErrorInput.SessionIdentifier,
		ErrorURL:        alertInput.ErrorInput.ErrorLink,
		ErrorResolveURL: routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", "resolved"),
		ErrorIgnoreURL:  routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", "ignored"),
		ErrorSnoozeURL:  routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", "snooze"),
	}

	sendAlerts(ctx, messagePayload, destinations)
}

type LogAlertPayload struct {
	Event          string
	AlertName      string
	Query          string
	Count          float64
	StartDate      time.Time
	EndDate        time.Time
	Function       modelInputs.MetricAggregator
	FunctionColumn string
	Threshold      float64
	BelowThreshold bool
	LogsURL        string
}

func sendLogAlert(ctx context.Context, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := ""
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	functionColumn := ""
	if alertInput.Alert.FunctionColumn != nil {
		functionColumn = *alertInput.Alert.FunctionColumn
	}

	messagePayload := LogAlertPayload{
		Event:          model.AlertType.LOGS,
		AlertName:      alertInput.Alert.Name,
		Query:          query,
		Count:          alertInput.AlertValue,
		StartDate:      alertInput.LogInput.StartDate,
		EndDate:        alertInput.LogInput.EndDate,
		Function:       alertInput.Alert.FunctionType,
		FunctionColumn: functionColumn,
		Threshold:      *alertInput.Alert.ThresholdValue,
		BelowThreshold: *alertInput.Alert.BelowThreshold,
		LogsURL:        alertInput.LogInput.LogsLink,
	}

	sendAlerts(ctx, messagePayload, destinations)
}

type TraceAlertPayload struct {
	Event          string
	AlertName      string
	Query          string
	Count          float64
	StartDate      time.Time
	EndDate        time.Time
	Function       modelInputs.MetricAggregator
	FunctionColumn string
	Threshold      float64
	BelowThreshold bool
	TracesURL      string
}

func sendTraceAlert(ctx context.Context, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := ""
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	functionColumn := ""
	if alertInput.Alert.FunctionColumn != nil {
		functionColumn = *alertInput.Alert.FunctionColumn
	}

	messagePayload := TraceAlertPayload{
		Event:          model.AlertType.TRACES,
		AlertName:      alertInput.Alert.Name,
		Query:          query,
		Count:          alertInput.AlertValue,
		StartDate:      alertInput.LogInput.StartDate,
		EndDate:        alertInput.LogInput.EndDate,
		Function:       alertInput.Alert.FunctionType,
		FunctionColumn: functionColumn,
		Threshold:      *alertInput.Alert.ThresholdValue,
		BelowThreshold: *alertInput.Alert.BelowThreshold,
		TracesURL:      alertInput.TraceInput.TracesLink,
	}

	sendAlerts(ctx, messagePayload, destinations)
}

type MetricAlertPayload struct {
	Event          string
	AlertName      string
	Query          string
	Count          float64
	Function       modelInputs.MetricAggregator
	FunctionColumn string
	Threshold      float64
	BelowThreshold bool
	DashboardURL   string
}

func sendMetricAlert(ctx context.Context, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	query := ""
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	functionColumn := ""
	if alertInput.Alert.FunctionColumn != nil {
		functionColumn = *alertInput.Alert.FunctionColumn
	}

	messagePayload := MetricAlertPayload{
		Event:          model.AlertType.TRACES,
		AlertName:      alertInput.Alert.Name,
		Query:          query,
		Count:          alertInput.AlertValue,
		Function:       alertInput.Alert.FunctionType,
		FunctionColumn: functionColumn,
		Threshold:      *alertInput.Alert.ThresholdValue,
		BelowThreshold: *alertInput.Alert.BelowThreshold,
		DashboardURL:   alertInput.MetricInput.DashboardLink,
	}

	sendAlerts(ctx, messagePayload, destinations)
}

func SendNotifications(ctx context.Context, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	switch notificationInput.NotificationType {
	case destinationsV2.NotificationTypeAlertCreated:
		sendAlertCreatedNotification(ctx, notificationInput, destinations)
	case destinationsV2.NotificationTypeAlertUpdated:
		sendAlertUpdatedNotification(ctx, notificationInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"destinationType":  "discord",
				"notificationType": notificationInput.NotificationType,
			}).Error("Invalid notification type")
	}
}

type AlertCreatedPayload struct {
	Event     string
	AlertUrl  string
	AlertName string
	AdminName string
}

func sendAlertCreatedNotification(ctx context.Context, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	frontendURL := env.Config.FrontendUri
	alertURL := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)

	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	messagePayload := AlertCreatedPayload{
		Event:     "ALERT_CREATED",
		AlertUrl:  alertURL,
		AlertName: notificationInput.AlertUpsertInput.Alert.Name,
		AdminName: *name,
	}

	sendAlerts(ctx, messagePayload, destinations)
}

type AlertUpdatedPayload struct {
	Event     string
	AlertUrl  string
	AlertName string
	AdminName string
}

func sendAlertUpdatedNotification(ctx context.Context, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	frontendURL := env.Config.FrontendUri
	alertURL := fmt.Sprintf("%s/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ID)

	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	messagePayload := AlertCreatedPayload{
		Event:     "ALERT_UPDATED",
		AlertUrl:  alertURL,
		AlertName: notificationInput.AlertUpsertInput.Alert.Name,
		AdminName: *name,
	}

	sendAlerts(ctx, messagePayload, destinations)
}

func sendAlerts(ctx context.Context, messagePayload interface{}, destinations []model.AlertDestination) {
	payloadJson, err := json.Marshal(messagePayload)
	if err != nil {
		log.WithContext(ctx).Error(errors.Wrap(err, "couldn't marshal message payload"))
		return
	}

	for _, destination := range destinations {
		go func(webhookUrl string) {
			resp, err := retryablehttp.Post(webhookUrl, "application/json", payloadJson)
			if err != nil {
				log.WithContext(ctx).Error(errors.Wrap(err, "couldn't send to webhook"))
				return
			}

			if resp.StatusCode >= http.StatusOK && resp.StatusCode < http.StatusMultipleChoices {
				logFields := log.Fields{}
				if err := json.Unmarshal(payloadJson, &logFields); err == nil {
					ctx := context.TODO()
					logFields["Destination"] = webhookUrl
					logFields["StatusCode"] = resp.StatusCode
					log.WithContext(ctx).WithFields(logFields).Info("webhook sent successfully")
				}
			} else {
				log.WithContext(ctx).Error(errors.New(fmt.Sprintf("webhook %s received unexpected response code %d", webhookUrl, resp.StatusCode)))
			}
		}(destination.TypeID)
	}
}
