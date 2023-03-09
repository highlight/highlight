package alerts

import (
	"net/url"
	"strings"

	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/highlight-run/highlight/backend/alerts/integrations/discord"
	"github.com/highlight-run/highlight/backend/model"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type SendErrorAlertEvent struct {
	Session     *model.Session
	ErrorAlert  *model.ErrorAlert
	ErrorGroup  *model.ErrorGroup
	ErrorObject *model.ErrorObject
	Workspace   *model.Workspace
	ErrorCount  int64
	VisitedURL  string
}

func SendErrorAlert(event SendErrorAlertEvent) error {
	errorTitle := event.ErrorGroup.Event
	if len(event.ErrorGroup.Event) > 50 {
		errorTitle = event.ErrorGroup.Event[:50] + "..."
	}

	errorAlertPayload := integrations.ErrorAlertPayload{
		ErrorCount:      event.ErrorCount,
		ErrorTitle:      errorTitle,
		UserIdentifier:  event.Session.Identifier,
		ErrorURL:        getErrorURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorResolveURL: getErrorResolveURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorIgnoreURL:  getErrorIgnoreURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorSnoozeURL:  getErrorSnoozeURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		SessionURL:      getSessionURL(event.ErrorAlert.ProjectID, event.Session),
		VisitedURL:      event.VisitedURL,
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := event.ErrorAlert.DiscordChannelsToNotify
	for _, channel := range channels {
		err = bot.SendErrorAlert(channel.ID, errorAlertPayload)

		if err != nil {
			return err
		}
	}

	return nil
}

func getUserPropertiesAndAvatar(sessionUserProperties map[string]string) (map[string]string, *string) {
	var avatarURL *string
	userProperties := make(map[string]string)

	caser := cases.Title(language.AmericanEnglish)

	for key, value := range sessionUserProperties {
		if key == "" {
			continue
		}
		if value == "" {
			value = "_empty_"
		}

		key = caser.String(strings.ToLower(key))

		if key == "Avatar" {
			_, err := url.ParseRequestURI(value)
			if err == nil {
				valueCopy := strings.Clone(value)
				avatarURL = &valueCopy
				continue
			}
		}

		userProperties[key] = value
	}
	return userProperties, avatarURL
}

type SendNewUserAlertEvent struct {
	Session      *model.Session
	SessionAlert *model.SessionAlert
	Workspace    *model.Workspace
}

func SendNewUserAlert(event SendNewUserAlertEvent) error {
	sessionUserProperties, err := event.Session.GetUserProperties()
	if err != nil {
		return err
	}

	userProperties, avatarUrl := getUserPropertiesAndAvatar(sessionUserProperties)

	payload := integrations.NewUserAlertPayload{
		SessionURL:     getSessionURL(event.SessionAlert.ProjectID, event.Session),
		UserIdentifier: event.Session.Identifier,
		UserProperties: userProperties,
		AvatarURL:      avatarUrl,
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := event.SessionAlert.DiscordChannelsToNotify
	for _, channel := range channels {
		err = bot.SendNewUserAlert(channel.ID, payload)

		if err != nil {
			return err
		}
	}

	return nil
}

type SendNewSessionAlertEvent struct {
	Session      *model.Session
	SessionAlert *model.SessionAlert
	Workspace    *model.Workspace
	VisitedURL   *string
}

func SendNewSessionAlert(event SendNewSessionAlertEvent) error {
	var sessionUserProperties map[string]string
	var err error

	if event.Session.UserProperties != "" {
		sessionUserProperties, err = event.Session.GetUserProperties()

		if err != nil {
			return err
		}
	}

	userProperties, avatarUrl := getUserPropertiesAndAvatar(sessionUserProperties)

	payload := integrations.NewSessionAlertPayload{
		SessionURL:     getSessionURL(event.SessionAlert.ProjectID, event.Session),
		UserIdentifier: event.Session.Identifier,
		UserProperties: userProperties,
		AvatarURL:      avatarUrl,
		VisitedURL:     event.VisitedURL,
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := event.SessionAlert.DiscordChannelsToNotify

	for _, channel := range channels {
		err = bot.SendNewSessionAlert(channel.ID, payload)

		if err != nil {
			return err
		}
	}

	return nil
}

type TrackPropertiesAlertEvent struct {
	Session       *model.Session
	SessionAlert  *model.SessionAlert
	Workspace     *model.Workspace
	MatchedFields []*model.Field
	RelatedFields []*model.Field
}

func SendTrackPropertiesAlert(event TrackPropertiesAlertEvent) error {
	// format matched properties
	mappedMatchedProperties := []integrations.Property{}
	mappedRelatedProperties := []integrations.Property{}

	for _, field := range event.MatchedFields {
		mappedMatchedProperties = append(mappedMatchedProperties, integrations.Property{
			Key:   field.Name,
			Value: field.Value,
		})
	}
	for _, field := range event.RelatedFields {
		mappedRelatedProperties = append(mappedRelatedProperties, integrations.Property{
			Key:   field.Name,
			Value: field.Value,
		})
	}

	payload := integrations.TrackPropertiesAlertPayload{
		UserIdentifier:    event.Session.Identifier,
		MatchedProperties: mappedMatchedProperties,
		RelatedProperties: mappedRelatedProperties,
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := event.SessionAlert.DiscordChannelsToNotify

	for _, channel := range channels {
		err = bot.SendTrackPropertiesAlert(channel.ID, payload)

		if err != nil {
			return err
		}
	}

	return nil
}

type UserPropertiesAlertEvent struct {
	Session       *model.Session
	SessionAlert  *model.SessionAlert
	Workspace     *model.Workspace
	MatchedFields []*model.Field
}

func SendUserPropertiesAlert(event UserPropertiesAlertEvent) error {
	mappedProperties := []integrations.Property{}

	for _, field := range event.MatchedFields {
		mappedProperties = append(mappedProperties, integrations.Property{
			Key:   field.Name,
			Value: field.Value,
		})
	}

	payload := integrations.UserPropertiesAlertPayload{
		UserIdentifier:    event.Session.Identifier,
		SessionURL:        getSessionURL(event.Session.ProjectID, event.Session),
		MatchedProperties: mappedProperties,
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := event.SessionAlert.DiscordChannelsToNotify

	for _, channel := range channels {
		err = bot.SendUserPropertiesAlert(channel.ID, payload)

		if err != nil {
			return err
		}
	}

	return nil
}

type SessionFeedbackAlertEvent struct {
	Session        *model.Session
	SessionAlert   *model.SessionAlert
	Workspace      *model.Workspace
	SessionComment *model.SessionComment
	UserName       *string
	UserEmail      *string
}

func SendSessionFeedbackAlert(event SessionFeedbackAlertEvent) error {
	identifier := "Someone"
	if event.UserName != nil {
		identifier = *event.UserName
	} else if event.UserEmail != nil {
		identifier = *event.UserEmail
	}

	payload := integrations.SessionFeedbackAlertPayload{
		UserIdentifier:    identifier,
		SessionCommentURL: getSessionCommentURL(event.SessionAlert.ProjectID, event.Session, event.SessionComment),
		CommentText:       event.SessionComment.Text,
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := event.SessionAlert.DiscordChannelsToNotify

	for _, channel := range channels {
		err = bot.SendSessionFeedbackAlert(channel.ID, payload)

		if err != nil {
			return err
		}
	}

	return nil
}

type RageClicksAlertEvent struct {
	Session         *model.Session
	SessionAlert    *model.SessionAlert
	Workspace       *model.Workspace
	RageClicksCount int64
}

func SendRageClicksAlert(event RageClicksAlertEvent) error {
	payload := integrations.RageClicksAlertPayload{
		RageClicksCount: event.RageClicksCount,
		SessionURL:      getSessionURL(event.SessionAlert.ProjectID, event.Session),
		UserIdentifier:  event.Session.Identifier,
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := event.SessionAlert.DiscordChannelsToNotify

	for _, channel := range channels {
		err = bot.SendRageClicksAlert(channel.ID, payload)

		if err != nil {
			return err
		}
	}

	return nil
}

type MetricMonitorAlertEvent struct {
	MetricMonitor *model.MetricMonitor
	Workspace     *model.Workspace
	UnitsFormat   string
	DiffOverValue string
	Value         string
	Threshold     string
}

func SendMetricMonitorAlert(event MetricMonitorAlertEvent) error {
	payload := integrations.MetricMonitorAlertPayload{
		MetricToMonitor: event.MetricMonitor.MetricToMonitor,
		MonitorURL:      getMonitorURL(event.MetricMonitor),
		UnitsFormat:     event.UnitsFormat,
		DiffOverValue:   event.DiffOverValue,
		Value:           event.Value,
		Threshold:       event.Value,
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := event.MetricMonitor.DiscordChannelsToNotify

	for _, channel := range channels {
		err = bot.SendMetricMonitorAlert(channel.ID, payload)

		if err != nil {
			return err
		}
	}

	return nil
}

func isWorkspaceIntegratedWithDiscord(workspace model.Workspace) bool {
	return workspace.DiscordGuildId != nil
}
