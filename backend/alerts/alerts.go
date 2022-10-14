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

func SendErrorAlert(session *model.Session, errorAlert *model.ErrorAlert, group *model.ErrorGroup, workspace *model.Workspace, errorCount int64, visitedUrl *string) error {
	errorTitle := group.Event
	if len(group.Event) > 50 {
		errorTitle = group.Event[:50] + "..."
	}

	errorAlertPayload := alertintegrations.ErrorAlertPayload{
		ErrorCount:     errorCount,
		ErrorTitle:     errorTitle,
		UserIdentifier: session.Identifier,
		ErrorURL:       getErrorsURL(errorAlert, group),
		SessionURL:     getSessionsURL(errorAlert.ProjectID, session),
		VisitedURL:     visitedUrl,
	}

	if !isWorkspaceIntegratedWithDiscord(*workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := errorAlert.DiscordChannelsToNotify
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

func SendNewUserAlert(session *model.Session, sessionAlert *model.SessionAlert, workspace *model.Workspace) error {
	sessionUserProperties, err := session.GetUserProperties()
	if err != nil {
		return err
	}

	userProperties, avatarUrl := getUserPropertiesAndAvatar(sessionUserProperties)

	payload := alertintegrations.NewUserAlertPayload{
		SessionURL:     getSessionsURL(sessionAlert.ProjectID, session),
		UserIdentifier: session.Identifier,
		UserProperties: userProperties,
		AvatarURL:      avatarUrl,
	}

	if !isWorkspaceIntegratedWithDiscord(*workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := sessionAlert.DiscordChannelsToNotify
	for _, channel := range channels {
		err = bot.SendNewUserAlert(channel.ID, payload)

		if err != nil {
			return err
		}
	}

	return nil
}

func SendNewSessionAlert(session *model.Session, sessionAlert *model.SessionAlert, workspace *model.Workspace, visitedUrl *string) error {
	sessionUserProperties, err := session.GetUserProperties()
	if err != nil {
		return err
	}

	userProperties, avatarUrl := getUserPropertiesAndAvatar(sessionUserProperties)

	payload := alertintegrations.NewSessionAlertPayload{
		SessionURL:     getSessionsURL(sessionAlert.ProjectID, session),
		UserIdentifier: session.Identifier,
		UserProperties: userProperties,
		AvatarURL:      avatarUrl,
		VisitedURL:     visitedUrl,
	}

	if !isWorkspaceIntegratedWithDiscord(*workspace) {
		return nil
	}

	bot, err := discord.NewDiscordBot(*workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := sessionAlert.DiscordChannelsToNotify

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
