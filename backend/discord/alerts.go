package discord

import (
	"github.com/bwmarrin/discordgo"
	"github.com/highlight-run/highlight/backend/model"
)

func SendDiscordAlert(message string, metric *model.MetricMonitor, workspace *model.Workspace) error {
	_, err := discordgo.New("Bot " + *workspace.DiscordAccessToken)
	if err != nil {
		return err
	}

	return nil
}
