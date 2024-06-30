package discord

import (
	"errors"
	"github.com/bwmarrin/discordgo"
	"github.com/highlight-run/highlight/backend/env"
)

type Bot struct {
	Session *discordgo.Session
	GuildID string
}

func NewDiscordBot(guildId string) (*Bot, error) {
	if env.Config.DiscordBotSecret == "" {
		return nil, errors.New("DISCORD_BOT_SECRET not set")
	}

	session, err := discordgo.New("Bot " + env.Config.DiscordBotSecret)

	if err != nil {
		return nil, errors.Join(err, errors.New("error creating Discord session"))
	}

	return &Bot{
		Session: session,
		GuildID: guildId,
	}, nil
}
