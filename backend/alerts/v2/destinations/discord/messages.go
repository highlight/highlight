package discordV2

import (
	"context"
	"fmt"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	"github.com/highlight-run/highlight/backend/alerts/integrations/discord"
	destinationsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/routing"
)

func newMessageEmbed() *discordgo.MessageEmbed {
	return &discordgo.MessageEmbed{
		Color: 0x6c37f4,
	}
}

var GREEN_ALERT = 0x2eb886  // sessions
var RED_ALERT = 0x961e13    // errors
var YELLOW_ALERT = 0xf2c94c // logs
var ORANGE_ALERT = 0xf2994a // traces
var BLUE_ALERT = 0x1e40af   // metrics

var highlightEmoji = discordgo.ComponentEmoji{
	Name:     "highlight",
	ID:       "1094349627953778788",
	Animated: false,
}

func SendAlerts(ctx context.Context, discordGuildId *string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	if discordGuildId == nil {
		log.WithContext(ctx).Error("discord access token is nil")
		return
	}

	switch alertInput.Alert.ProductType {
	case modelInputs.ProductTypeSessions:
		sendSessionAlert(ctx, *discordGuildId, alertInput, destinations)
	case modelInputs.ProductTypeErrors:
		sendErrorAlert(ctx, *discordGuildId, alertInput, destinations)
	case modelInputs.ProductTypeLogs:
		sendLogAlert(ctx, *discordGuildId, alertInput, destinations)
	case modelInputs.ProductTypeTraces:
		sendTraceAlert(ctx, *discordGuildId, alertInput, destinations)
	case modelInputs.ProductTypeMetrics:
		sendMetricAlert(ctx, *discordGuildId, alertInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":          alertInput.Alert.ID,
				"alertProductType": alertInput.Alert.ProductType,
			}).Error("invalid product type")
	}
}

func sendSessionAlert(ctx context.Context, discordGuildId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	embed := newMessageEmbed()
	embed.Color = GREEN_ALERT

	// HEADER
	embed.Title = fmt.Sprintf("%s fired!", alertInput.Alert.Name)

	// BODY
	// description
	query := "[empty query]"
	if alertInput.Alert.Query != nil {
		query = *alertInput.Alert.Query
	}

	embed.Description = fmt.Sprintf("Session found that matches query:\n**%s**", query)

	// fields
	sessionUserIdentifier := alertInput.SessionInput.Identifier
	if sessionUserIdentifier == "" {
		sessionUserIdentifier = "*unidentified* user"
	}

	fields := []*discordgo.MessageEmbedField{
		{
			Name:   "Session",
			Value:  fmt.Sprintf("[#%s](%s)", alertInput.SessionInput.SecureID, alertInput.SessionInput.SessionLink),
			Inline: true,
		},
		{
			Name:   "User Identifier",
			Value:  sessionUserIdentifier,
			Inline: true,
		},
	}

	embed.Fields = fields

	// action buttons
	actionButtons := discordgo.ActionsRow{
		Components: []discordgo.MessageComponent{
			discordgo.Button{
				Emoji:    highlightEmoji,
				Label:    "View Session",
				Style:    discordgo.LinkButton,
				Disabled: false,
				URL:      alertInput.SessionInput.SessionLink,
			},
			discordgo.Button{
				Emoji:    highlightEmoji,
				Label:    "View More Sessions",
				Style:    discordgo.LinkButton,
				Disabled: false,
				URL:      alertInput.SessionInput.MoreSessionsLink,
			},
		},
	}

	messageSend := discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{actionButtons},
	}

	deliverAlerts(ctx, discordGuildId, &messageSend, destinations)
}

func sendErrorAlert(ctx context.Context, discordGuildId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	embed := newMessageEmbed()
	embed.Color = RED_ALERT

	// HEADER
	embed.Title = fmt.Sprintf("**Error Alert: %d Recent Occurrences**", int(alertInput.AlertValue))

	// BODY
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
			sessionString = "**Session** No recorded session"
		} else {
			sessionString = fmt.Sprintf("**Session** No recorded session (%s)", alertInput.ErrorInput.SessionIdentifier)
		}
	} else {
		sessionUserIdentifier := alertInput.ErrorInput.SessionIdentifier
		if sessionUserIdentifier == "" {
			sessionUserIdentifier = "*unidentified* user"
		}

		sessionText := fmt.Sprintf("#%s (%s)", alertInput.ErrorInput.SessionSecureID, sessionUserIdentifier)
		sessionString = fmt.Sprintf("**Session** [%s](%s)", sessionText, alertInput.ErrorInput.SessionLink)
	}

	embed.Description = fmt.Sprintf("**[Error event in %s](%s)**\n```%s```\n%s", locationName, alertInput.ErrorInput.ErrorLink, errorEvent, sessionString)

	// action buttons
	actionButtons := discordgo.ActionsRow{Components: []discordgo.MessageComponent{}}
	caser := cases.Title(language.AmericanEnglish)
	for _, action := range modelInputs.AllErrorState {
		if alertInput.ErrorInput.State == action {
			continue
		}

		titleStr := string(action)
		if action == modelInputs.ErrorStateIgnored || action == modelInputs.ErrorStateResolved {
			titleStr = titleStr[:len(titleStr)-1]
		}

		button := discordgo.Button{
			Emoji:    highlightEmoji,
			Label:    caser.String(strings.ToLower(titleStr)),
			Style:    discordgo.LinkButton,
			Disabled: false,
			URL:      routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", strings.ToLower(string(action))),
		}

		actionButtons.Components = append(actionButtons.Components, button)
	}

	snoozeButton := discordgo.Button{
		Emoji:    highlightEmoji,
		Label:    "Snooze",
		Style:    discordgo.LinkButton,
		Disabled: false,
		URL:      routing.AttachQueryParam(ctx, alertInput.ErrorInput.ErrorLink, "action", "snooze"),
	}
	actionButtons.Components = append(actionButtons.Components, snoozeButton)

	messageSend := discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{actionButtons},
	}

	deliverAlerts(ctx, discordGuildId, &messageSend, destinations)
}

func sendLogAlert(ctx context.Context, discordGuildId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	embed := newMessageEmbed()
	embed.Color = YELLOW_ALERT

	// HEADER
	embed.Title = fmt.Sprintf("%s fired!", alertInput.Alert.Name)

	// BODY
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
			"Log count for query **%s** was %s the threshold.\n_Count_: %d | _Threshold_: %d",
			query,
			threholdRelation,
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Log %s for query **%s** was %s the threshold.\n_%s_: %f | _Threshold_: %f",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	embed.Description = alertText

	// action buttons
	actionButtons := discordgo.ActionsRow{
		Components: []discordgo.MessageComponent{
			discordgo.Button{
				Emoji:    highlightEmoji,
				Label:    "View Logs",
				Style:    discordgo.LinkButton,
				Disabled: false,
				URL:      alertInput.LogInput.LogsLink,
			},
		},
	}

	messageSend := discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{actionButtons},
	}

	deliverAlerts(ctx, discordGuildId, &messageSend, destinations)
}

func sendTraceAlert(ctx context.Context, discordGuildId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	embed := newMessageEmbed()
	embed.Color = ORANGE_ALERT

	// HEADER
	embed.Title = fmt.Sprintf("%s fired!", alertInput.Alert.Name)

	// BODY
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
			"Trace count for query **%s** was %s the threshold.\n_Count_: %d | _Threshold_: %d",
			query,
			threholdRelation,
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Trace %s for query **%s** was %s the threshold.\n_%s_: %f | _Threshold_: %f",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	embed.Description = alertText

	// action buttons
	actionButtons := discordgo.ActionsRow{
		Components: []discordgo.MessageComponent{
			discordgo.Button{
				Emoji:    highlightEmoji,
				Label:    "View Traces",
				Style:    discordgo.LinkButton,
				Disabled: false,
				URL:      alertInput.TraceInput.TracesLink,
			},
		},
	}

	messageSend := discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{actionButtons},
	}

	deliverAlerts(ctx, discordGuildId, &messageSend, destinations)
}

func sendMetricAlert(ctx context.Context, discordGuildId string, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	embed := newMessageEmbed()
	embed.Color = BLUE_ALERT

	// HEADER
	embed.Title = fmt.Sprintf("%s fired!", alertInput.Alert.Name)

	// BODY
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
			"Metric count for query **%s** was %s the threshold.\n_Count_: %d | _Threshold_: %d",
			query,
			threholdRelation,
			int(alertInput.AlertValue),
			int(*alertInput.Alert.ThresholdValue),
		)
	} else {
		alertText = fmt.Sprintf(
			"Metric %s for query **%s** was %s the threshold.\n_%s_: %f | _Threshold_: %f",
			alertInput.Alert.FunctionType,
			query,
			threholdRelation,
			alertInput.Alert.FunctionType,
			alertInput.AlertValue,
			*alertInput.Alert.ThresholdValue,
		)
	}

	embed.Description = alertText

	// action buttons
	actionButtons := discordgo.ActionsRow{
		Components: []discordgo.MessageComponent{
			discordgo.Button{
				Emoji:    highlightEmoji,
				Label:    "View Dashboards",
				Style:    discordgo.LinkButton,
				Disabled: false,
				URL:      alertInput.MetricInput.DashboardLink,
			},
		},
	}

	messageSend := discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{actionButtons},
	}

	deliverAlerts(ctx, discordGuildId, &messageSend, destinations)
}

func SendNotifications(ctx context.Context, discordGuildId *string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	if discordGuildId == nil {
		log.WithContext(ctx).Error("discord access token is nil")
		return
	}

	switch notificationInput.NotificationType {
	case destinationsV2.NotificationTypeAlertCreated:
		sendAlertCreatedNotification(ctx, *discordGuildId, notificationInput, destinations)
	case destinationsV2.NotificationTypeAlertUpdated:
		sendAlertUpdatedNotification(ctx, *discordGuildId, notificationInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"destinationType":  "discord",
				"notificationType": notificationInput.NotificationType,
			}).Error("Invalid notification type")
	}
}

func sendAlertCreatedNotification(ctx context.Context, discordGuildId string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	embed := newMessageEmbed()

	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	frontendURL := env.Config.FrontendUri
	alertURL := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)
	alertLink := fmt.Sprintf("[%s](%s)", notificationInput.AlertUpsertInput.Alert.Name, alertURL)

	embed.Title = "👋 Alert created"
	embed.Description = fmt.Sprintf("%s has created the alert \"%s\".", *name, alertLink)

	messageSend := discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{embed},
	}

	deliverAlerts(ctx, discordGuildId, &messageSend, destinations)
}

func sendAlertUpdatedNotification(ctx context.Context, discordGuildId string, notificationInput destinationsV2.NotificationInput, destinations []model.AlertDestination) {
	embed := newMessageEmbed()

	name := notificationInput.AlertUpsertInput.Admin.Name
	if name == nil {
		name = notificationInput.AlertUpsertInput.Admin.Email
	}

	frontendURL := env.Config.FrontendUri
	alertURL := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, notificationInput.AlertUpsertInput.Alert.ProjectID, notificationInput.AlertUpsertInput.Alert.ID)
	alertLink := fmt.Sprintf("[%s](%s)", notificationInput.AlertUpsertInput.Alert.Name, alertURL)

	embed.Title = "👋 Alert updated"
	embed.Description = fmt.Sprintf("%s has updated the alert \"%s\".", *name, alertLink)

	messageSend := discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{embed},
	}

	deliverAlerts(ctx, discordGuildId, &messageSend, destinations)
}

func deliverAlerts(ctx context.Context, discordGuildId string, messageSend *discordgo.MessageSend, destinations []model.AlertDestination) {
	bot, err := discord.NewDiscordBot(discordGuildId)
	if err != nil {
		log.WithContext(ctx).Error(errors.Wrap(err, "couldn't create new discord bot"))
		return
	}

	for _, destination := range destinations {
		go func(channelId string) {
			_, err := bot.Session.ChannelMessageSendComplex(channelId, messageSend)
			if err != nil {
				log.WithContext(ctx).Error(errors.Wrap(err, "couldn't send discord alert"))
			}
		}(destination.TypeID)
	}
}
