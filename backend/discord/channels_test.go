package discord

import (
	"reflect"
	"testing"

	"github.com/bwmarrin/discordgo"
)

func TestFilterChannels(t *testing.T) {
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

	if !reflect.DeepEqual(got, want) {
		t.Errorf("got %v want %v", got, want)
	}
}
