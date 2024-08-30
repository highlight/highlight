package slackV2

import (
	"context"
	"encoding/json"
	"fmt"
	"runtime"
	"strings"

	destinationsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/routing"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

var GREEN_ALERT = "#2eb886"  // sessions
var RED_ALERT = "#961e13"    // errors
var YELLOW_ALERT = "#f2c94c" // logs
var ORANGE_ALERT = "#f2994a" // traces
var BLUE_ALERT = "#1e40af"   // metrics

var ERROR_STACKTRACE_FILE_NAME_LENGTH_LIMIT = 75

func SendAlerts(ctx context.Context, slackAccessToken *string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	if slackAccessToken == nil {
		log.WithContext(ctx).Error("slack access token is nil")
		return
	}

	switch alertInput.Alert.ProductType {
	case modelInputs.ProductTypeSessions:
		sendSessionAlert(ctx, *slackAccessToken, alertInput, destinations)
	case modelInputs.ProductTypeErrors:
		sendErrorAlert(ctx, *slackAccessToken, alertInput, destinations)
	case modelInputs.ProductTypeLogs:
		sendLogAlert(ctx, *slackAccessToken, alertInput, destinations)
	case modelInputs.ProductTypeTraces:
		sendTraceAlert(ctx, *slackAccessToken, alertInput, destinations)
	case modelInputs.ProductTypeMetrics:
		sendMetricAlert(ctx, *slackAccessToken, alertInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":          alertInput.Alert.ID,
				"alertProductType": alertInput.Alert.ProductType,
			}).Error("invalid product type")
	}
}

func sendSessionAlert(ctx context.Context, slackAccessToken string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	previewText := fmt.Sprintf("%s fired!", alertInput.Alert.Name)

	// HEADER
	var headerBlockSet []slack.Block
	headerText := fmt.Sprintf("*%s* fired!", alertInput.Alert.Name)
	headerBlock := slack.NewTextBlockObject(slack.MarkdownType, headerText, false, false)
	headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

	// BODY
	var bodyBlockSet []slack.Block

	// query
	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	queryText := fmt.Sprintf("Session found that matches query: *%s*", query)

	queryBlock := slack.NewTextBlockObject(slack.MarkdownType, queryText, false, false)
	bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(queryBlock, nil, nil))

	// session
	sessionString := fmt.Sprintf("*Session* <%s|#%s>", alertInput.SessionInput.SessionLink, alertInput.SessionInput.SecureID)

	sessionBlock := slack.NewTextBlockObject(slack.MarkdownType, sessionString, false, false)
	bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(sessionBlock, nil, nil))

	// user identifier
	sessionUserIdentifier := alertInput.SessionInput.Identifier
	if sessionUserIdentifier == "" {
		sessionUserIdentifier = "_unidentified_ user"
	}

	identifierBlock := slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*User Identifier*: %s", sessionUserIdentifier), false, false)
	bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(identifierBlock, nil, nil))

	// action buttons
	var actionBlocks []slack.BlockElement
	sessionButton := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			"View Session",
			false,
			false,
		),
	)
	sessionButton.URL = alertInput.SessionInput.SessionLink
	actionBlocks = append(actionBlocks, sessionButton)

	moreSessionsButton := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			"View More Sessions",
			false,
			false,
		),
	)
	moreSessionsButton.URL = alertInput.SessionInput.MoreSessionsLink
	actionBlocks = append(actionBlocks, moreSessionsButton)

	bodyBlockSet = append(bodyBlockSet, slack.NewActionBlock("", actionBlocks...))

	attachment := &slack.Attachment{
		Color:  GREEN_ALERT,
		Blocks: slack.Blocks{BlockSet: bodyBlockSet},
	}

	deliverAlerts(ctx, slackAccessToken, destinations, previewText, headerBlockSet, attachment)
}

func sendErrorAlert(ctx context.Context, slackAccessToken string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	// HEADER
	var headerBlockSet []slack.Block

	previewText := fmt.Sprintf("Error Alert: %s", alertInput.ErrorInput.Event)
	headerBlock := slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Error Alert: %d Recent Occurrences*", int(alertInput.AlertValue)), false, false)
	headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

	// BODY
	var bodyBlockSet []slack.Block

	// location
	locationName := alertInput.ErrorInput.ProjectName
	if alertInput.ErrorInput.ServiceName != "" {
		locationName = alertInput.ErrorInput.ServiceName + " - " + locationName
	}

	// event
	errorEvent := alertInput.ErrorInput.Event
	if len(errorEvent) > 250 {
		errorEvent = errorEvent[:250] + "..."
	}

	// session
	var sessionString string
	if alertInput.ErrorInput.SessionExcluded {
		if alertInput.ErrorInput.SessionIdentifier == "" {
			sessionString = "*Session* No recorded session"
		} else {
			sessionString = fmt.Sprintf("*Session* No recorded session (%s)", alertInput.ErrorInput.SessionIdentifier)
		}
	} else {
		sessionUserIdentifier := alertInput.ErrorInput.SessionIdentifier
		if sessionUserIdentifier == "" {
			sessionUserIdentifier = "_unidentified_ user"
		}

		sessionText := fmt.Sprintf("#%s (%s)", alertInput.ErrorInput.SessionSecureID, sessionUserIdentifier)
		sessionString = fmt.Sprintf("*Session* <%s|%s>", alertInput.ErrorInput.SessionLink, sessionText)
	}

	eventBlock := slack.NewTextBlockObject(
		slack.MarkdownType,
		fmt.Sprintf("*<%s|Error event in %s>*\n```%s```\n%s", alertInput.ErrorInput.ErrorLink, locationName, errorEvent, sessionString),
		false,
		false,
	)
	bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(eventBlock, nil, nil))

	// action buttons
	var actionBlocks []slack.BlockElement
	caser := cases.Title(language.AmericanEnglish)
	for _, action := range modelInputs.AllErrorState {
		if alertInput.ErrorInput.State == action {
			continue
		}

		titleStr := string(action)
		if action == modelInputs.ErrorStateIgnored || action == modelInputs.ErrorStateResolved {
			titleStr = titleStr[:len(titleStr)-1]
		}
		button := slack.NewButtonBlockElement(
			"",
			"click",
			slack.NewTextBlockObject(
				slack.PlainTextType,
				caser.String(strings.ToLower(titleStr)),
				false,
				false,
			),
		)
		button.URL = routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", strings.ToLower(string(action)))
		actionBlocks = append(actionBlocks, button)
	}

	snoozeButton := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			"Snooze",
			false,
			false,
		),
	)
	snoozeButton.URL = routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", "snooze")
	actionBlocks = append(actionBlocks, snoozeButton)

	bodyBlockSet = append(bodyBlockSet, slack.NewActionBlock("", actionBlocks...))

	// stack trace
	var stackTrace []*modelInputs.ErrorTrace
	var stackTraceBlock *slack.TextBlockObject

	if err := json.Unmarshal([]byte(alertInput.ErrorInput.Stacktrace), &stackTrace); err == nil {
		firstTrace := stackTrace[0]

		var fileLocation string
		if firstTrace.LineNumber != nil {
			fileLocation = fmt.Sprintf("%s:%d", *firstTrace.FileName, *firstTrace.LineNumber)
		} else if firstTrace.FileName != nil {
			fileLocation = *firstTrace.FileName
		} else {
			fileLocation = "File unknown"
		}

		if len(fileLocation) > ERROR_STACKTRACE_FILE_NAME_LENGTH_LIMIT {
			cutoffIndex := len(fileLocation) - ERROR_STACKTRACE_FILE_NAME_LENGTH_LIMIT
			substringIndex := strings.Index(fileLocation[cutoffIndex:], "/")
			if substringIndex > -1 {
				finalCutoffIndex := cutoffIndex + substringIndex
				fileLocation = "..." + fileLocation[finalCutoffIndex:]
			}
		}

		stackTraceBlock = slack.NewTextBlockObject(slack.PlainTextType, fileLocation, false, false)
	}

	if stackTraceBlock != nil {
		highlightLogo := *slack.NewImageBlockElement("https://beta.highlight.io/logo192.png", "Highlight logo")
		bodyBlockSet = append(bodyBlockSet, slack.NewContextBlock("", highlightLogo, stackTraceBlock))
	}

	attachment := &slack.Attachment{
		Color:  RED_ALERT,
		Blocks: slack.Blocks{BlockSet: bodyBlockSet},
	}

	deliverAlerts(ctx, slackAccessToken, destinations, previewText, headerBlockSet, attachment)
}

func sendLogAlert(ctx context.Context, slackAccessToken string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	previewText := fmt.Sprintf("%s fired!", alertInput.Alert.Name)

	// HEADER
	var headerBlockSet []slack.Block
	headerText := fmt.Sprintf("*%s* fired!", alertInput.Alert.Name)
	if alertInput.GroupValue != "" {
		headerText = fmt.Sprintf("*%s* fired for *%s*", alertInput.Alert.Name, alertInput.GroupValue)
	}
	headerBlock := slack.NewTextBlockObject(slack.MarkdownType, headerText, false, false)
	headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

	// BODY
	var bodyBlockSet []slack.Block

	// log data
	var alertText string

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
			"Log count for query *%s* was %s the threshold.\n_Count_: %d | _Threshold_: %d",
			query,
			threholdRelation,
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Log %s for query *%s* was %s the threshold.\n_%s_: %f | _Threshold_: %f",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	logBlock := slack.NewTextBlockObject(slack.MarkdownType, alertText, false, false)
	bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(logBlock, nil, nil))

	// actions
	var actionBlocks []slack.BlockElement
	button := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			"View Logs",
			false,
			false,
		),
	)
	button.URL = alertInput.LogInput.LogsLink
	actionBlocks = append(actionBlocks, button)

	bodyBlockSet = append(bodyBlockSet, slack.NewActionBlock("", actionBlocks...))

	attachment := &slack.Attachment{
		Color:  YELLOW_ALERT,
		Blocks: slack.Blocks{BlockSet: bodyBlockSet},
	}

	deliverAlerts(ctx, slackAccessToken, destinations, previewText, headerBlockSet, attachment)
}

func sendTraceAlert(ctx context.Context, slackAccessToken string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	previewText := fmt.Sprintf("%s fired!", alertInput.Alert.Name)

	// HEADER
	var headerBlockSet []slack.Block
	headerText := fmt.Sprintf("*%s* fired!", alertInput.Alert.Name)
	if alertInput.GroupValue != "" {
		headerText = fmt.Sprintf("*%s* fired for *%s*", alertInput.Alert.Name, alertInput.GroupValue)
	}
	headerBlock := slack.NewTextBlockObject(slack.MarkdownType, headerText, false, false)
	headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

	// BODY
	var bodyBlockSet []slack.Block

	// trace data
	var alertText string

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
			"Trace count for query *%s* was %s the threshold.\n_Count_: %d | _Threshold_: %d",
			query,
			threholdRelation,
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Trace %s for query *%s* was %s the threshold.\n_%s_: %f | _Threshold_: %f",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	traceBlock := slack.NewTextBlockObject(slack.MarkdownType, alertText, false, false)
	bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(traceBlock, nil, nil))

	// actions
	var actionBlocks []slack.BlockElement
	button := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			"View Traces",
			false,
			false,
		),
	)
	button.URL = alertInput.TraceInput.TracesLink
	actionBlocks = append(actionBlocks, button)

	bodyBlockSet = append(bodyBlockSet, slack.NewActionBlock("", actionBlocks...))

	attachment := &slack.Attachment{
		Color:  ORANGE_ALERT,
		Blocks: slack.Blocks{BlockSet: bodyBlockSet},
	}

	deliverAlerts(ctx, slackAccessToken, destinations, previewText, headerBlockSet, attachment)
}

func sendMetricAlert(ctx context.Context, slackAccessToken string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	previewText := fmt.Sprintf("%s fired!", alertInput.Alert.Name)

	// HEADER
	var headerBlockSet []slack.Block
	headerText := fmt.Sprintf("*%s* fired!", alertInput.Alert.Name)
	if alertInput.GroupValue != "" {
		headerText = fmt.Sprintf("*%s* fired for *%s*", alertInput.Alert.Name, alertInput.GroupValue)
	}
	headerBlock := slack.NewTextBlockObject(slack.MarkdownType, headerText, false, false)
	headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

	// BODY
	var bodyBlockSet []slack.Block

	// trace data
	var alertText string

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
			"Metric count for query *%s* was %s the threshold.\n_Count_: %d | _Threshold_: %d",
			query,
			threholdRelation,
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Metric %s for query *%s* was %s the threshold.\n_%s_: %f | _Threshold_: %f",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	metricBlock := slack.NewTextBlockObject(slack.MarkdownType, alertText, false, false)
	bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(metricBlock, nil, nil))

	// actions
	var actionBlocks []slack.BlockElement
	button := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			"View Dashboards",
			false,
			false,
		),
	)
	button.URL = alertInput.MetricInput.DashboardLink
	actionBlocks = append(actionBlocks, button)

	bodyBlockSet = append(bodyBlockSet, slack.NewActionBlock("", actionBlocks...))

	attachment := &slack.Attachment{
		Color:  BLUE_ALERT,
		Blocks: slack.Blocks{BlockSet: bodyBlockSet},
	}

	deliverAlerts(ctx, slackAccessToken, destinations, previewText, headerBlockSet, attachment)
}

func SendNotifications(ctx context.Context, slackAccessToken *string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	if slackAccessToken == nil {
		log.WithContext(ctx).Error("slack access token is nil")
		return
	}

	switch notificationInput.NotificationType {
	case destinationsV2.NotificationTypeAlertCreated:
		sendAlertCreatedNotification(ctx, *slackAccessToken, notificationInput, destinations)
	case destinationsV2.NotificationTypeAlertUpdated:
		sendAlertUpdatedNotification(ctx, *slackAccessToken, notificationInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"destinationType":  "discord",
				"notificationType": notificationInput.NotificationType,
			}).Error("Invalid notification type")
	}
}

func sendAlertCreatedNotification(ctx context.Context, slackAccessToken string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	frontendURL := env.Config.FrontendUri
	alertURL := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)
	alertLink := fmt.Sprintf("<%s|%s>", alertURL, notificationInput.AlertUpsertInput.Alert.Name)

	message := fmt.Sprintf("👋 %s has created the alert \"%s\".", *name, alertLink)

	deliverAlerts(ctx, slackAccessToken, destinations, message, nil, nil)
}

func sendAlertUpdatedNotification(ctx context.Context, slackAccessToken string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	frontendURL := env.Config.FrontendUri
	alertURL := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)
	alertLink := fmt.Sprintf("<%s|%s>", alertURL, notificationInput.AlertUpsertInput.Alert.Name)

	message := fmt.Sprintf("👋 %s has updated the alert \"%s\".", *name, alertLink)

	deliverAlerts(ctx, slackAccessToken, destinations, message, nil, nil)
}

func deliverAlerts(ctx context.Context, slackAccessToken string, destinations []model.AlertDestination, previewText string, headerBlockSet []slack.Block, attachment *slack.Attachment) {
	slackClient := slack.New(slackAccessToken)
	if slackClient == nil {
		log.WithContext(ctx).Error("couldn't send slack alert, slack client isn't setup AND not webhook channel")
		return
	}

	for _, destination := range destinations {
		go func(channelId string, channelName string) {
			defer func() {
				if rec := recover(); rec != nil {
					buf := make([]byte, 64<<10)
					buf = buf[:runtime.Stack(buf, false)]
					log.WithContext(ctx).Errorf("panic: %+v\n%s", rec, buf)
				}
			}()
			if strings.Contains(channelName, "#") {
				_, _, _, err := slackClient.JoinConversation(channelId)
				if err != nil {
					log.WithContext(ctx).Error(errors.Wrap(err, "couldn't join slack channel"))
				}
			}

			var msgBlockOptions slack.MsgOption
			if headerBlockSet != nil {
				msgBlockOptions = slack.MsgOptionBlocks(headerBlockSet...)
			}

			var msgAttachmentOptions slack.MsgOption
			if attachment != nil {
				msgAttachmentOptions = slack.MsgOptionAttachments(*attachment)
			}

			opts := []slack.MsgOption{
				slack.MsgOptionText(previewText, false),
				msgBlockOptions,
				msgAttachmentOptions,
				slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
				slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any media that are in the Slack message.*/
			}

			// get rid of nil opts
			var optsFiltered []slack.MsgOption
			for _, opt := range opts {
				if opt != nil {
					optsFiltered = append(optsFiltered, opt)
				}
			}

			_, _, err := slackClient.PostMessage(channelId, optsFiltered...)
			if err != nil {
				log.WithContext(ctx).Error(errors.Wrap(err, "couldn't send slack alert"))
			}
		}(destination.TypeID, destination.TypeName)
	}
}
