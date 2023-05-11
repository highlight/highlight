package discord

import (
	"errors"
	"os"

	"github.com/bwmarrin/discordgo"
)

type Bot struct {
	Session *discordgo.Session
	GuildID string
}

func NewDiscordBot(guildId string) (*Bot, error) {
	var (
		ok               bool
		DiscordBotSecret string
	)
	if DiscordBotSecret, ok = os.LookupEnv("DISCORD_BOT_SECRET"); !ok || DiscordBotSecret == "" {
		return nil, errors.New("DISCORD_BOT_SECRET not set")
	}

	session, err := discordgo.New("Bot " + DiscordBotSecret)

	if err != nil {
		return nil, errors.Join(err, errors.New("error creating Discord session"))
	}

	return &Bot{
		Session: session,
		GuildID: guildId,
	}, nil
}
