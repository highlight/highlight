package discord

import (
	"github.com/bwmarrin/discordgo"
	"github.com/pkg/errors"
)

type HighlightBot struct {
	Session *discordgo.Session
	GuildID string
}

func InitBot(guildId string) (*HighlightBot, error) {
	token := "MTAyNDA3OTE4MjAxMzE0OTE4NQ.GRv6g0.brlou2owOlRP-ZLQxZ_JNgI5pLxtqkPGL4t6v0"
	session, err := discordgo.New("Bot " + token)

	if err != nil {
		return nil, errors.Wrap(err, "error creating Discord session")
	}

	return &HighlightBot{
		Session: session,
		GuildID: guildId,
	}, nil
}
