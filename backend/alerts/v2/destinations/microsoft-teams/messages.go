package microsoftteamsV2

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	microsoft_teams "github.com/highlight-run/highlight/backend/alerts/integrations/microsoft-teams"
	destinationsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations"
	microsoftteamsV2_templates "github.com/highlight-run/highlight/backend/alerts/v2/destinations/microsoft-teams/templates"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/routing"
)

func SendAlerts(ctx context.Context, microsoftTeamsTenantId *string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	if microsoftTeamsTenantId == nil {
		log.WithContext(ctx).Error("microsoft teams access token is nil")
		return
	}

	switch alertInput.Alert.ProductType {
	case modelInputs.ProductTypeSessions:
		sendSessionAlert(ctx, *microsoftTeamsTenantId, alertInput, destinations)
	case modelInputs.ProductTypeErrors:
		sendErrorAlert(ctx, *microsoftTeamsTenantId, alertInput, destinations)
	case modelInputs.ProductTypeLogs:
		sendLogAlert(ctx, *microsoftTeamsTenantId, alertInput, destinations)
	case modelInputs.ProductTypeTraces:
		sendTraceAlert(ctx, *microsoftTeamsTenantId, alertInput, destinations)
	case modelInputs.ProductTypeMetrics:
		sendMetricAlert(ctx, *microsoftTeamsTenantId, alertInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":          alertInput.Alert.ID,
				"alertProductType": alertInput.Alert.ProductType,
			}).Error("invalid product type")
	}
}

func sendSessionAlert(ctx context.Context, microsoftTeamsTenantId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	sessionUserIdentifier := alertInput.SessionInput.Identifier
	if sessionUserIdentifier == "" {
		sessionUserIdentifier = "*unidentified* user"
	}

	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	messagePayload := microsoftteamsV2_templates.SessionAlertPayload{
		AlertName:        alertInput.Alert.Name,
		Query:            query,
		SecureID:         alertInput.SessionInput.SecureID,
		Identifier:       sessionUserIdentifier,
		SessionURL:       alertInput.SessionInput.SessionLink,
		MoreSessionsLink: alertInput.SessionInput.MoreSessionsLink,
	}

	deliverAlerts(ctx, microsoftTeamsTenantId, microsoftteamsV2_templates.SessionAlertMessageTemplate, messagePayload, destinations)
}

func sendErrorAlert(ctx context.Context, microsoftTeamsTenantId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	locationName := alertInput.ErrorInput.ProjectName
	if alertInput.ErrorInput.ServiceName != "" {
		locationName = alertInput.ErrorInput.ServiceName + " - " + locationName
	}

	errorEvent := alertInput.ErrorInput.Event
	if len(errorEvent) > 250 {
		errorEvent = errorEvent[:250] + "..."
	}

	var sessionLinkText string
	if alertInput.ErrorInput.SessionExcluded {
		if alertInput.ErrorInput.SessionIdentifier == "" {
			sessionLinkText = "No recorded session"
		} else {
			sessionLinkText = fmt.Sprintf("No recorded session (%s)", alertInput.ErrorInput.SessionIdentifier)
		}
	} else {
		sessionUserIdentifier := alertInput.ErrorInput.SessionIdentifier
		if sessionUserIdentifier == "" {
			sessionUserIdentifier = "_unidentified_ user"
		}

		sessionLinkText = fmt.Sprintf(
			"[#%s (%s)](%s)",
			alertInput.ErrorInput.SessionSecureID,
			sessionUserIdentifier,
			alertInput.ErrorInput.SessionLink,
		)
	}

	messagePayload := microsoftteamsV2_templates.ErrorAlertPayload{
		ErrorCount:      int(alertInput.AlertValue),
		Location:        locationName,
		ErrorLink:       alertInput.ErrorInput.ErrorLink,
		Event:           errorEvent,
		SessionLinkText: sessionLinkText,
		ResolveLink:     routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", "resolved"),
		IgnoreLink:      routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", "ignored"),
		SnoozeLink:      routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", "snooze"),
	}

	deliverAlerts(ctx, microsoftTeamsTenantId, microsoftteamsV2_templates.ErrorAlertMessageTemplate, messagePayload, destinations)
}

func sendLogAlert(ctx context.Context, microsoftTeamsTenantId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	var alertText string
	var countText string

	threholdRelation := "above"
	if *alertInput.Alert.BelowThreshold {
		threholdRelation = "below"
	}

	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	if alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCount || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinct || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinctKey {
		alertText = fmt.Sprintf(
			"Log count for query **%s** was %s the threshold.",
			query,
			threholdRelation,
		)
		countText = fmt.Sprintf(
			"*Count*: %d | *Threshold*: %d",
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Log %s for query **%s** was %s the threshold.",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
		)
		countText = fmt.Sprintf(
			"*%s*: %f | *Threshold*: %f",
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	messagePayload := microsoftteamsV2_templates.LogAlertPayload{
		AlertName: alertInput.Alert.Name,
		AlertText: alertText,
		CountText: countText,
		LogsLink:  alertInput.LogInput.LogsLink,
	}

	deliverAlerts(ctx, microsoftTeamsTenantId, microsoftteamsV2_templates.LogAlertMessageTemplate, messagePayload, destinations)
}

func sendTraceAlert(ctx context.Context, microsoftTeamsTenantId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	var alertText string
	var countText string

	threholdRelation := "above"
	if *alertInput.Alert.BelowThreshold {
		threholdRelation = "below"
	}

	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	if alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCount || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinct || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinctKey {
		alertText = fmt.Sprintf(
			"Trace count for query **%s** was %s the threshold.",
			query,
			threholdRelation,
		)
		countText = fmt.Sprintf(
			"*Count*: %d | *Threshold*: %d",
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Trace %s for query **%s** was %s the threshold.",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
		)
		countText = fmt.Sprintf(
			"*%s*: %f | *Threshold*: %f",
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	messagePayload := microsoftteamsV2_templates.TraceAlertPayload{
		AlertName:  alertInput.Alert.Name,
		AlertText:  alertText,
		CountText:  countText,
		TracesLink: alertInput.TraceInput.TracesLink,
	}

	deliverAlerts(ctx, microsoftTeamsTenantId, microsoftteamsV2_templates.TraceAlertMessageTemplate, messagePayload, destinations)
}

func sendMetricAlert(ctx context.Context, microsoftTeamsTenantId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	var alertText string
	var countText string

	threholdRelation := "above"
	if *alertInput.Alert.BelowThreshold {
		threholdRelation = "below"
	}

	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	if alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCount || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinct || alertInput.Alert.FunctionType == modelInputs.MetricAggregatorCountDistinctKey {
		alertText = fmt.Sprintf(
			"Metric count for query **%s** was %s the threshold.",
			query,
			threholdRelation,
		)
		countText = fmt.Sprintf(
			"*Count*: %d | *Threshold*: %d",
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Metric %s for query **%s** was %s the threshold.",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
		)
		countText = fmt.Sprintf(
			"*%s*: %f | *Threshold*: %f",
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	messagePayload := microsoftteamsV2_templates.MetricAlertPayload{
		AlertName:   alertInput.Alert.Name,
		AlertText:   alertText,
		CountText:   countText,
		MetricsLink: alertInput.MetricInput.DashboardLink,
	}

	deliverAlerts(ctx, microsoftTeamsTenantId, microsoftteamsV2_templates.MetricAlertMessageTemplate, messagePayload, destinations)
}

func SendNotifications(ctx context.Context, microsoftTeamsTenantId *string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	if microsoftTeamsTenantId == nil {
		log.WithContext(ctx).Error("microsoft teams access token is nil")
		return
	}

	switch notificationInput.NotificationType {
	case destinationsV2.NotificationTypeAlertCreated:
		sendAlertCreatedNotification(ctx, *microsoftTeamsTenantId, notificationInput, destinations)
	case destinationsV2.NotificationTypeAlertUpdated:
		sendAlertUpdatedNotification(ctx, *microsoftTeamsTenantId, notificationInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"destinationType":  "discord",
				"notificationType": notificationInput.NotificationType,
			}).Error("Invalid notification type")
	}
}

func sendAlertCreatedNotification(ctx context.Context, microsoftTeamsTenantId string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	frontendURL := env.Config.FrontendUri
	alertURL := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)

	messagePayload := microsoftteamsV2_templates.AlertUpsertPayload{
		AlertName:   notificationInput.AlertUpsertInput.Alert.Name,
		AlertUrl:    alertURL,
		AdminName:   *name,
		AlertAction: "created",
	}

	deliverAlerts(ctx, microsoftTeamsTenantId, microsoftteamsV2_templates.AlertUpsertMessageTemplate, messagePayload, destinations)
}

func sendAlertUpdatedNotification(ctx context.Context, microsoftTeamsTenantId string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	frontendURL := env.Config.FrontendUri
	alertURL := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)

	messagePayload := microsoftteamsV2_templates.AlertUpsertPayload{
		AlertName:   notificationInput.AlertUpsertInput.Alert.Name,
		AlertUrl:    alertURL,
		AdminName:   *name,
		AlertAction: "updated",
	}

	deliverAlerts(ctx, microsoftTeamsTenantId, microsoftteamsV2_templates.AlertUpsertMessageTemplate, messagePayload, destinations)
}

func deliverAlerts(ctx context.Context, microsoftTeamsTenantId string, messageTemplate []byte, messagePayload interface{}, destinations []model.AlertDestination) {
	bot, err := microsoft_teams.NewMicrosoftTeamsBot(microsoftTeamsTenantId)
	if err != nil {
		log.WithContext(ctx).Error(errors.Wrap(err, "couldn't create new microsoft teams bot"))
		return
	}

	for _, destination := range destinations {
		go func(channelId string) {
			err := bot.SendMessageWithAdaptiveCard(channelId, messageTemplate, messagePayload)
			if err != nil {
				log.WithContext(ctx).Error(errors.Wrap(err, "couldn't send microsoft teams alert"))
			}
		}(destination.TypeID)

	}
}
