package discord

import (
	"os"

	"github.com/bwmarrin/discordgo"
	"github.com/pkg/errors"
)

type HighlightBot struct {
	Session *discordgo.Session
	GuildID string
}

func InitBot(guildId string) (*HighlightBot, error) {
	var (
		ok              bool
		DiscordBotToken string
	)
	if DiscordBotToken, ok = os.LookupEnv("DISCORD_BOT_TOKEN"); !ok || DiscordBotToken == "" {
		return nil, errors.New("DiscordBotTOken not set")
	}

	session, err := discordgo.New("Bot " + DiscordBotToken)

	if err != nil {
		return nil, errors.Wrap(err, "error creating Discord session")
	}

	return &HighlightBot{
		Session: session,
		GuildID: guildId,
	}, nil
}
