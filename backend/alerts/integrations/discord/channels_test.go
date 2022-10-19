package discord

import (
	"testing"

	"github.com/bwmarrin/discordgo"
	"github.com/stretchr/testify/assert"
)

func TestFilterChannels(t *testing.T) {
	assert := assert.New(t)

	channel := &discordgo.Channel{
		ID:      "1024085566784032803",
		GuildID: "1024085566784032800",
		Name:    "general",
		Type:    discordgo.ChannelTypeGuildText,
	}

	category := &discordgo.Channel{
		ID:      "1024085566784032803",
		GuildID: "1024085566784032800",
		Name:    "Voice Channels",
		Type:    discordgo.ChannelTypeGuildCategory,
	}

	channels := []*discordgo.Channel{channel, category}

	got := filterChannels(channels)
	want := []*discordgo.Channel{channel}

	assert.Equal(got, want)
}
