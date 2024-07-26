package alertsV2

import (
	"context"
	"fmt"
	"net/url"
	"time"

	e "github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"

	destinationsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations"
	discordV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations/discord"
	emailV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations/email"
	microsoftteamsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations/microsoft-teams"
	slackV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations/slack"
	webhookV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations/webhook"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func SendAlerts(ctx context.Context, db *gorm.DB, mailClient *sendgrid.Client, lambdaClient *lambda.Client, alert *model.Alert, alertGroup string, alertGroupValue string, value float64) {
	destinations := []model.AlertDestination{}
	if err := db.WithContext(ctx).Where("alert_id = ?", alert.ID).Find(&destinations).Error; err != nil {
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":          alert.ID,
				"alertProductType": alert.ProductType,
			}).Error(err)
		return
	}

	if len(destinations) == 0 {
		return
	}

	destinationsByType := make(map[modelInputs.AlertDestinationType][]model.AlertDestination)
	for _, destination := range destinations {
		destinationsByType[destination.DestinationType] = append(destinationsByType[destination.DestinationType], destination)
	}

	alertInput := destinationsV2.AlertInput{
		Alert:      alert,
		AlertValue: value,
		Group:      alertGroup,
		GroupValue: alertGroupValue,
	}

	switch alert.ProductType {
	case modelInputs.ProductTypeSessions:
		sessionAlertInput := buildSessionAlertInput(ctx, db, &alertInput)
		if sessionAlertInput == nil {
			return
		}
		alertInput.SessionInput = sessionAlertInput
	case modelInputs.ProductTypeErrors:
		errorAlertInput := buildErrorAlertInput(ctx, db, &alertInput)
		if errorAlertInput == nil {
			return
		}
		alertInput.ErrorInput = errorAlertInput
	case modelInputs.ProductTypeLogs:
		alertInput.LogInput = buildLogAlertInput(ctx, db, &alertInput)
	case modelInputs.ProductTypeTraces:
		alertInput.TraceInput = buildTraceAlertInput(ctx, db, &alertInput)
	case modelInputs.ProductTypeMetrics:
		alertInput.MetricInput = buildMetricAlertInput(ctx, db, &alertInput)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":          alert.ID,
				"alertProductType": alert.ProductType,
				"group":            alertGroup,
				"values":           alertGroupValue,
			}).Error("invalid product type")
	}

	for _, destinations := range destinationsByType {
		switch destinations[0].DestinationType {
		case modelInputs.AlertDestinationTypeSlack:
			// get slack access token
			project := model.Project{}
			if err := db.WithContext(ctx).Model(&model.Project{}).Preload("Workspace").Where(&model.Project{Model: model.Model{ID: alert.ProjectID}}).Take(&project).Error; err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error querying slack access token"))
				continue
			}
			slackV2.SendAlerts(ctx, project.Workspace.SlackAccessToken, &alertInput, destinations)
		case modelInputs.AlertDestinationTypeDiscord:
			project := model.Project{}
			if err := db.WithContext(ctx).Model(&model.Project{}).Preload("Workspace").Where(&model.Project{Model: model.Model{ID: alert.ProjectID}}).Take(&project).Error; err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "error querying discord access token"))
				continue
			}
			discordV2.SendAlerts(ctx, project.Workspace.DiscordGuildId, &alertInput, destinations)
		case modelInputs.AlertDestinationTypeMicrosoftTeams:
			microsoftteamsV2.SendAlerts(ctx, lambdaClient, &alertInput, destinations)
		case modelInputs.AlertDestinationTypeEmail:
			emailV2.SendAlerts(ctx, lambdaClient, &alertInput, destinations)
		case modelInputs.AlertDestinationTypeWebhook:
			webhookV2.SendAlerts(ctx, lambdaClient, &alertInput, destinations)
		default:
			log.WithContext(ctx).WithFields(
				log.Fields{
					"alertID":          alert.ID,
					"alertProductType": alert.ProductType,
					"group":            alertGroup,
					"values":           alertGroupValue,
				}).Error("invalid destination type")
		}
	}
}

func buildSessionAlertInput(ctx context.Context, db *gorm.DB, alertInput *destinationsV2.AlertInput) *destinationsV2.SessionInput {
	sessionSecureID := alertInput.GroupValue

	var session *model.Session
	if err := db.WithContext(ctx).Where("secure_id = ?", sessionSecureID).Take(&session).Error; err != nil {
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":         alertInput.Alert.ID,
				"sessionSecureID": sessionSecureID,
			}).Error(err)
		return nil
	}

	frontendURL := env.Config.FrontendUri
	sessionUrl := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, session.ProjectID, sessionSecureID)

	queryStr := url.QueryEscape(*alertInput.Alert.Query)
	moreSessionsURL := fmt.Sprintf("%s/%d/sessions?query=%s", frontendURL, alertInput.Alert.ProjectID, queryStr)

	return &destinationsV2.SessionInput{
		SecureID:         session.SecureID,
		Identifier:       session.Identifier,
		SessionLink:      sessionUrl,
		MoreSessionsLink: moreSessionsURL,
	}
}

func buildErrorAlertInput(ctx context.Context, db *gorm.DB, alertInput *destinationsV2.AlertInput) *destinationsV2.ErrorInput {
	errorGroupSecureId := alertInput.GroupValue

	var errorGroup *model.ErrorGroup
	if err := db.WithContext(ctx).Where("secure_id = ?", errorGroupSecureId).Take(&errorGroup).Error; err != nil {
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":            alertInput.Alert.ID,
				"errorGroupSecureId": errorGroupSecureId,
			}).Error(err)
		return nil
	}

	var errorObject *model.ErrorObject
	if err := db.WithContext(ctx).Where("error_group_id = ?", errorGroup.ID).Order("created_at desc").First(&errorObject).Error; err != nil {
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":            alertInput.Alert.ID,
				"errorGroupSecureId": errorGroupSecureId,
			}).Error(err)
		return nil
	}

	var project model.Project
	if err := db.WithContext(ctx).Model(&model.Project{}).Where(&model.Project{Model: model.Model{ID: errorGroup.ProjectID}}).Take(&project).Error; err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error querying project"))
		return nil
	}

	sessionSecureID := ""
	sessionIdentifier := ""
	sessionExcluded := true

	if errorObject.SessionID != nil {
		var session *model.Session
		db.WithContext(ctx).Where("id = ?", *errorObject.SessionID).Take(&session)

		if session != nil {
			sessionSecureID = session.SecureID
			sessionIdentifier = session.Identifier
			sessionExcluded = session.Excluded
		}
	}

	frontendURL := env.Config.FrontendUri
	errorURL := fmt.Sprintf("%s/%d/errors/%s/instances/%d", frontendURL, errorGroup.ProjectID, errorGroup.SecureID, errorObject.ID)
	sessionUrl := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, errorGroup.ProjectID, sessionSecureID)

	stacktrace := ""
	if errorObject.MappedStackTrace != nil {
		stacktrace = *errorObject.MappedStackTrace
	} else if errorObject.StackTrace != nil {
		stacktrace = *errorObject.StackTrace
	}

	return &destinationsV2.ErrorInput{
		Event:             errorObject.Event,
		Stacktrace:        stacktrace,
		State:             errorGroup.State,
		ErrorLink:         errorURL,
		ProjectName:       *project.Name,
		ServiceName:       errorObject.ServiceName,
		SessionSecureID:   sessionSecureID,
		SessionIdentifier: sessionIdentifier,
		SessionLink:       sessionUrl,
		SessionExcluded:   sessionExcluded,
	}
}

func buildLogAlertInput(ctx context.Context, db *gorm.DB, alertInput *destinationsV2.AlertInput) *destinationsV2.LogInput {
	frontendURL := env.Config.FrontendUri
	queryStr := url.QueryEscape(*alertInput.Alert.Query)

	end := time.Now().Add(-time.Minute)
	start := end.Add(-time.Duration(*alertInput.Alert.ThresholdWindow) * time.Second)
	startDateStr := url.QueryEscape(start.Format("2006-01-02T15:04:05.000Z"))
	endDateStr := url.QueryEscape(end.Format("2006-01-02T15:04:05.000Z"))

	logsURL := fmt.Sprintf("%s/%d/logs?query=%s&start_date=%s&end_date=%s", frontendURL,
		alertInput.Alert.ProjectID, queryStr, startDateStr, endDateStr)

	return &destinationsV2.LogInput{
		LogsLink: logsURL,
	}
}

func buildTraceAlertInput(ctx context.Context, db *gorm.DB, alertInput *destinationsV2.AlertInput) *destinationsV2.TraceInput {
	frontendURL := env.Config.FrontendUri
	queryStr := url.QueryEscape(*alertInput.Alert.Query)

	end := time.Now().Add(-time.Minute)
	start := end.Add(-time.Duration(*alertInput.Alert.ThresholdWindow) * time.Second)
	startDateStr := url.QueryEscape(start.Format("2006-01-02T15:04:05.000Z"))
	endDateStr := url.QueryEscape(end.Format("2006-01-02T15:04:05.000Z"))

	tracesURL := fmt.Sprintf("%s/%d/traces?query=%s&start_date=%s&end_date=%s", frontendURL,
		alertInput.Alert.ProjectID, queryStr, startDateStr, endDateStr)

	return &destinationsV2.TraceInput{
		TracesLink: tracesURL,
	}
}

func buildMetricAlertInput(ctx context.Context, db *gorm.DB, alertInput *destinationsV2.AlertInput) *destinationsV2.MetricInput {
	return &destinationsV2.MetricInput{
		DashboardLink: fmt.Sprintf("%s/%d/metrics", env.Config.FrontendUri, alertInput.Alert.ProjectID),
	}
}
