package alerts

import (
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/highlight-run/highlight/backend/alertintegrations"
	"github.com/highlight-run/highlight/backend/alertintegrations/discord"
	"github.com/highlight-run/highlight/backend/model"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

func SendErrorAlert(sessionObj *model.Session, errorAlert *model.ErrorAlert, group *model.ErrorGroup, workspace *model.Workspace) error {
	frontendURL := os.Getenv("FRONTEND_URI")

	projectId := errorAlert.ProjectID
	errorGroupId := group.SecureID

	errorUrl := fmt.Sprintf("%s/%d/errors/%s", frontendURL, projectId, errorGroupId)

	errorAlertPayload := alertintegrations.ErrorAlertPayload{
		UserIdentifier: sessionObj.Identifier,
		URL:            errorUrl,
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
				avatarURL = &value
				continue
			}
		}

		userProperties[key] = value
	}
	return userProperties, avatarURL
}

func SendNewUserAlert(session *model.Session, sessionAlert *model.SessionAlert, workspace *model.Workspace) error {
	frontendURL := os.Getenv("FRONTEND_URI")

	projectId := sessionAlert.ProjectID

	url := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, projectId, session.SecureID)
	sessionUserProperties, err := session.GetUserProperties()
	if err != nil {
		return err
	}

	userProperties, avatarUrl := getUserPropertiesAndAvatar(sessionUserProperties)

	payload := alertintegrations.NewUserAlertPayload{
		SessionURL:     url,
		UserIdentifier: session.Identifier,
		UserProperties: userProperties,
		AvatarURL:      avatarUrl,
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
