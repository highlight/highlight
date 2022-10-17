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
		err = bot.PostErrorAlert(channel.ID, errorAlertPayload)

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

func isWorkspaceIntegratedWithDiscord(workspace model.Workspace) bool {
	return workspace.DiscordGuildId != nil
}
