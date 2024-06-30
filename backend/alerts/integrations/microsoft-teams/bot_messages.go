package microsoft_teams

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"strconv"
	"strings"
	"text/template"

	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/infracloudio/msbotbuilder-go/core/activity"
	"github.com/infracloudio/msbotbuilder-go/schema"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type WelcomeMessageData struct {
	Workspace     *model.Workspace
	Admin         *model.Admin
	Project       *model.Project
	OperationName string
}

type Fact struct {
	Title string `json:"title"`
	Value string `json:"value"`
}

func makeAttachmentHandler(attachments interface{}) activity.HandlerFuncs {
	return activity.HandlerFuncs{
		OnMessageFunc: func(turn *activity.TurnContext) (schema.Activity, error) {
			attachments := []schema.Attachment{
				{
					ContentType: "application/vnd.microsoft.card.adaptive",
					Content:     attachments,
				},
			}
			return turn.SendActivity(activity.MsgOptionAttachments(attachments))
		},
	}
}

func makeMessageHandler(message string) activity.HandlerFuncs {
	return activity.HandlerFuncs{
		OnMessageFunc: func(turn *activity.TurnContext) (schema.Activity, error) {
			return turn.SendActivity(activity.MsgOptionText(message))
		},
	}
}

func MakeAdaptiveCard(templateString []byte, payload interface{}) (map[string]interface{}, error) {
	var output bytes.Buffer

	tmpl := template.Must(template.New("user").Parse(string(templateString)))

	err := tmpl.Execute(&output, payload)
	if err != nil {
		return nil, err
	}

	var adaptiveCard map[string]interface{}

	err = json.Unmarshal(output.Bytes(), &adaptiveCard)
	if err != nil {
		return nil, err
	}
	return adaptiveCard, nil
}

func (bot *MicrosoftTeamsBot) SendMessageWithAdaptiveCard(channelId string, rawTemplate []byte, templateData interface{}) error {
	adaptiveCard, err := MakeAdaptiveCard(rawTemplate, templateData)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}

func SendLogAlertsWelcomeMessage(ctx context.Context, alert *model.LogAlert, input *WelcomeMessageData) error {
	// Return if workspace is not integrated with Teams
	if input.Workspace.MicrosoftTeamsTenantId == nil {
		return nil
	}

	bot, err := NewMicrosoftTeamsBot(*input.Workspace.MicrosoftTeamsTenantId)
	if err != nil {
		return errors.New("microsoft teams bot installation not complete")
	}

	adminName := input.Admin.Name

	if adminName == nil {
		adminName = input.Admin.Email
	}

	description := "Log alerts will now be sent to this channel."

	frontendURL := env.Config.FrontendUri
	alertUrl := fmt.Sprintf("%s/%d/%s/%d", frontendURL, input.Project.Model.ID, "alerts/logs", alert.ID)
	message := fmt.Sprintf("👋 %s has %s the alert \"%s\". %s %s", *adminName, input.OperationName, alert.GetName(), description, alertUrl)

	for _, channel := range alert.MicrosoftTeamsChannelsToNotify {
		handler := makeMessageHandler(message)
		ctx := context.Background()

		err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channel.ID), handler)

		if err != nil {
			log.WithContext(ctx).Error(err)
			return err
		}
	}

	return nil
}

func (bot *MicrosoftTeamsBot) SendErrorAlert(channelId string, payload integrations.ErrorAlertPayload) error {
	fields := []*Fact{}

	if payload.VisitedURL != "" {
		fields = append(fields, &Fact{
			Title: "Visited URL",
			Value: payload.VisitedURL,
		})
	}

	errorTitle := payload.ErrorTitle
	if len(errorTitle) > 50 {
		errorTitle = errorTitle[:50] + "..."
	}
	fields = append(fields, &Fact{
		Title: "Error",
		Value: errorTitle,
	})

	fields = append(fields, &Fact{
		Title: "Error count",
		Value: strconv.FormatInt(payload.ErrorCount, 10),
	})

	title := "Highlight Error Alert"
	style := "warning"

	if payload.FirstTimeAlert {
		title = "Highlight Error Alert (New Occurence ❇️)"
		style = "attention"
	}

	sessionLabel := "View Session"
	displayMissingSessionLabel := payload.SessionSecureID == "" || payload.SessionExcluded
	if displayMissingSessionLabel {
		sessionLabel = "No recorded session"
	}

	factsJson, err := json.Marshal(fields)

	if err != nil {
		log.Println("Error sending error alert message")
		return err
	}

	templateData := ErrorAlertTemplatePayload{
		Title:                      title,
		Description:                payload.UserIdentifier,
		Facts:                      string(factsJson),
		SessionLabel:               sessionLabel,
		SessionURL:                 payload.SessionURL,
		ErrorURL:                   payload.ErrorURL,
		ErrorResolveURL:            payload.ErrorResolveURL,
		ErrorIgnoreURL:             payload.ErrorIgnoreURL,
		ErrorSnoozeURL:             payload.ErrorSnoozeURL,
		ContainerStyle:             style,
		DisplayMissingSessionLabel: displayMissingSessionLabel,
	}

	return bot.SendMessageWithAdaptiveCard(channelId, ErrorAlertMessageTemplate, templateData)
}

func (bot *MicrosoftTeamsBot) SendLogAlert(channelId string, payload integrations.LogAlertPayload) error {
	facts := []*Fact{}

	if payload.Query != "" {
		facts = append(facts, &Fact{
			Title: "Query",
			Value: payload.Query,
		})
	}

	facts = append(facts, &Fact{
		Title: "Count",
		Value: strconv.Itoa(payload.Count),
	})

	facts = append(facts, &Fact{
		Title: "Threshold",
		Value: strconv.Itoa(payload.Threshold),
	})

	aboveStr := "above"
	if payload.BelowThreshold {
		aboveStr = "below"
	}

	description := fmt.Sprintf("*%s* is currently %s the threshold.", payload.Name, aboveStr)

	jsonFacts, _ := json.Marshal(facts)

	templateData := BasicTemplatePayload{
		Title:       "Highlight Log Alert",
		Description: description,
		ActionURL:   payload.AlertURL,
		Facts:       string(jsonFacts),
		ActionTitle: "View Logs",
	}

	return bot.SendMessageWithAdaptiveCard(channelId, BasicMessageTemplate, templateData)
}

func (bot *MicrosoftTeamsBot) SendNewSessionAlert(channelId string, payload integrations.NewSessionAlertPayload) error {

	facts := []*Fact{}

	if payload.VisitedURL != nil && *payload.VisitedURL != "" {
		facts = append(facts, &Fact{
			Title: "Visited URL",
			Value: *payload.VisitedURL,
			// Inline: false,
		})
	}

	for key, value := range payload.UserProperties {
		facts = append(facts, &Fact{
			Title: key,
			Value: value,
		})
	}

	jsonFacts, _ := json.Marshal(facts) // no need to handle errors here, we specify the json string - sort of

	newSessionAlertPayload := NewSessionAlertPayload{
		Title:          "Highlight New Session Alert",
		SessionURL:     payload.SessionURL,
		UserIdentifier: payload.UserIdentifier,
		Facts:          string(jsonFacts),
	}

	if payload.AvatarURL != nil && *payload.AvatarURL != "" {
		newSessionAlertPayload.AvatarURL = *payload.AvatarURL
	}

	return bot.SendMessageWithAdaptiveCard(channelId, NewSessionAlertMessageTemplate, newSessionAlertPayload)
}

func (bot *MicrosoftTeamsBot) SendTrackPropertiesAlert(channelId string, payload integrations.TrackPropertiesAlertPayload) error {
	matchedValue := []string{}
	for _, field := range payload.MatchedProperties {
		matchedValue = append(matchedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
	}

	templateData := map[string]interface{}{
		"Title":         "Highlight Track Properties Alert",
		"Description":   payload.UserIdentifier,
		"MatchedValues": matchedValue,
	}

	if len(payload.RelatedProperties) > 0 {
		relatedValue := []string{}
		for _, field := range payload.RelatedProperties {
			relatedValue = append(relatedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
		}

		templateData["RelatedValues"] = strings.Join(relatedValue, "\n")
	}
	return bot.SendMessageWithAdaptiveCard(channelId, TrackPropertiesTemplate, templateData)
}

func (bot *MicrosoftTeamsBot) SendUserPropertiesAlert(channelId string, payload integrations.UserPropertiesAlertPayload) error {
	matchedValue := []string{}
	for _, field := range payload.MatchedProperties {
		matchedValue = append(matchedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
	}

	templateData := map[string]interface{}{
		"Title":                 "Highlight Track Properties Alert",
		"Description":           payload.UserIdentifier,
		"MatchedUserProperties": matchedValue,
		"ActionTitle":           "View Session",
		"ActionURL":             payload.SessionURL,
	}

	return bot.SendMessageWithAdaptiveCard(channelId, UserPropertiesTemplate, templateData)
}

func (bot *MicrosoftTeamsBot) SendNewUserAlert(channelId string, payload integrations.NewUserAlertPayload) error {

	facts := []*Fact{}

	for key, value := range payload.UserProperties {
		facts = append(facts, &Fact{
			Title: key,
			Value: value,
		})
	}

	jsonFacts, _ := json.Marshal(facts) // no need to handle errors here, we specify the json string - sort of

	newSessionAlertPayload := NewSessionAlertPayload{
		Title:          "Highlight New User Alert",
		SessionURL:     payload.SessionURL,
		UserIdentifier: payload.UserIdentifier,
		Facts:          string(jsonFacts),
	}

	if payload.AvatarURL != nil && *payload.AvatarURL != "" {
		newSessionAlertPayload.AvatarURL = *payload.AvatarURL
	}

	return bot.SendMessageWithAdaptiveCard(channelId, NewSessionAlertMessageTemplate, newSessionAlertPayload)
}

func (bot *MicrosoftTeamsBot) SendErrorFeedbackAlert(channelId string, payload integrations.ErrorFeedbackAlertPayload) error {
	facts := []*Fact{
		{
			Title: "Comment",
			Value: payload.CommentText,
		},
	}

	jsonFacts, _ := json.Marshal(facts)

	templateData := BasicTemplatePayload{
		Title:       "Highlight Error Feedback Alert",
		Description: payload.UserIdentifier,
		ActionURL:   payload.SessionCommentURL,
		Facts:       string(jsonFacts),
		ActionTitle: "View Comment",
	}

	return bot.SendMessageWithAdaptiveCard(channelId, BasicMessageTemplate, templateData)
}

func (bot *MicrosoftTeamsBot) SendRageClicksAlert(channelId string, payload integrations.RageClicksAlertPayload) error {
	facts := []*Fact{
		{
			Title: "User",
			Value: payload.UserIdentifier,
		},
		{
			Title: "Rage click count",
			Value: strconv.FormatInt(payload.RageClicksCount, 10),
		},
	}

	jsonFacts, _ := json.Marshal(facts)

	templateData := BasicTemplatePayload{
		Title:       "Highlight Rage Clicks Alert",
		Description: payload.UserIdentifier,
		ActionURL:   payload.SessionURL,
		Facts:       string(jsonFacts),
		ActionTitle: "View Session",
	}

	return bot.SendMessageWithAdaptiveCard(channelId, BasicMessageTemplate, templateData)
}

func (bot *MicrosoftTeamsBot) SendMetricMonitorAlert(channelId string, payload integrations.MetricMonitorAlertPayload) error {
	facts := []*Fact{
		{
			Title: "Value",
			Value: fmt.Sprintf("%s %s", payload.Value, payload.UnitsFormat),
		},
		{
			Title: "Threshold",
			Value: fmt.Sprintf("%s %s", payload.Threshold, payload.UnitsFormat),
		},
	}

	jsonFacts, _ := json.Marshal(facts)

	templateData := BasicTemplatePayload{
		Title:       "Highlight Metric Monitor Alert",
		Description: fmt.Sprintf("*%s* is currently %s %s over the threshold.", payload.MetricToMonitor, payload.DiffOverValue, payload.UnitsFormat),
		ActionURL:   payload.MonitorURL,
		Facts:       string(jsonFacts),
		ActionTitle: "View Monitor",
	}

	return bot.SendMessageWithAdaptiveCard(channelId, BasicMessageTemplate, templateData)
}
