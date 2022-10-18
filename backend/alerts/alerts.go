package alerts

import (
	"net/url"
	"strings"

	"github.com/highlight-run/highlight/backend/alertintegrations"
	"github.com/highlight-run/highlight/backend/alertintegrations/discord"
	"github.com/highlight-run/highlight/backend/model"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type SendErrorAlertEvent struct {
	Session    *model.Session
	ErrorAlert *model.ErrorAlert
	ErrorGroup *model.ErrorGroup
	Workspace  *model.Workspace
	ErrorCount int64
	VisitedURL string
}

func SendErrorAlert(event SendErrorAlertEvent) error {
	errorTitle := event.ErrorGroup.Event
	if len(event.ErrorGroup.Event) > 50 {
		errorTitle = event.ErrorGroup.Event[:50] + "..."
	}

	errorAlertPayload := alertintegrations.ErrorAlertPayload{
		ErrorCount:     event.ErrorCount,
		ErrorTitle:     errorTitle,
		UserIdentifier: event.Session.Identifier,
		ErrorURL:       getErrorsURL(event.ErrorAlert, event.ErrorGroup),
		SessionURL:     getSessionsURL(event.ErrorAlert.ProjectID, event.Session),
		VisitedURL:     event.VisitedURL,
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

	payload := alertintegrations.NewUserAlertPayload{
		SessionURL:     getSessionsURL(event.SessionAlert.ProjectID, event.Session),
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
	sessionUserProperties, err := event.Session.GetUserProperties()
	if err != nil {
		return err
	}

	userProperties, avatarUrl := getUserPropertiesAndAvatar(sessionUserProperties)

	payload := alertintegrations.NewSessionAlertPayload{
		SessionURL:     getSessionsURL(event.SessionAlert.ProjectID, event.Session),
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
	mappedMatchedFields := []alertintegrations.Field{}
	mappedRelatedFields := []alertintegrations.Field{}

	for _, field := range event.MatchedFields {
		mappedMatchedFields = append(mappedMatchedFields, alertintegrations.Field{
			Key:   field.Name,
			Value: field.Value,
		})
	}
	for _, field := range event.RelatedFields {
		mappedRelatedFields = append(mappedRelatedFields, alertintegrations.Field{
			Key:   field.Name,
			Value: field.Value,
		})
	}

	payload := alertintegrations.TrackPropertiesAlertPayload{
		UserIdentifier: event.Session.Identifier,
		MatchedFields:  mappedMatchedFields,
		RelatedFields:  mappedRelatedFields,
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
	SessionAlert *model.SessionAlert
	Workspace    *model.Workspace
}

func SendUserPropertiesAlert(event UserPropertiesAlertEvent) error {
	payload := alertintegrations.UserPropertiesAlertPayload{}

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

	payload := alertintegrations.SessionFeedbackAlertPayload{
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
	payload := alertintegrations.RageClicksAlertPayload{
		RageClicksCount: event.RageClicksCount,
		SessionURL:      getSessionsURL(event.SessionAlert.ProjectID, event.Session),
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
}

func SendMetricMonitorAlert(event MetricMonitorAlertEvent) error {
	payload := alertintegrations.MetricMonitorAlertPayload{}

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
