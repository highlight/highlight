package alerts

import (
	"fmt"
	"os"

	"github.com/highlight-run/highlight/backend/alertintegrations"
	"github.com/highlight-run/highlight/backend/alertintegrations/discord"
	"github.com/highlight-run/highlight/backend/model"
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

func SendNewUserAlert(session *model.Session, sessionAlert *model.SessionAlert, workspace *model.Workspace) error {
	frontendURL := os.Getenv("FRONTEND_URI")

	projectId := sessionAlert.ProjectID

	errorUrl := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, projectId, session.Identifier)

	errorAlertPayload := alertintegrations.ErrorAlertPayload{
		UserIdentifier: session.Identifier,
		URL:            errorUrl,
	}

	bot, err := discord.NewDiscordBot(*workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := sessionAlert.DiscordChannelsToNotify
	for _, channel := range channels {
		err = bot.PostErrorAlert(channel.ID, errorAlertPayload)

		if err != nil {
			return err
		}
	}

	return nil
}
