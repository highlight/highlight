package alerts

import (
	"fmt"
	"os"

	"github.com/highlight-run/highlight/backend/alertintegrations/discord"
	"github.com/highlight-run/highlight/backend/model"
)

func SendErrorAlert(sessionObj *model.Session, errorAlert *model.ErrorAlert, group *model.ErrorGroup, workspace *model.Workspace) error {
	frontendURL := os.Getenv("FRONTEND_URI")

	projectId := errorAlert.ProjectID
	errorGroupId := group.SecureID

	errorUrl := fmt.Sprintf("%s/%d/errors/%s", frontendURL, projectId, errorGroupId)

	errorAlertPayload := ErrorAlertPayload{
		UserIdentifier: sessionObj.Identifier,
		URL:            errorUrl,
	}

	bot, err := discord.NewDiscordBot(*workspace.DiscordGuildId)
	if err != nil {
		return err
	}

	channels := errorAlert.DiscordChannelsToNotify
	for _, channel := range channels {
		bot.PostErrorMessage(channel.ID, errorAlertPayload)
	}
}
