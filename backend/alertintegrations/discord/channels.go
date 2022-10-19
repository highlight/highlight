package discord

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
	"github.com/highlight-run/highlight/backend/alerts"
)

func filterChannels(channels []*discordgo.Channel) []*discordgo.Channel {
	ret := []*discordgo.Channel{}

	for _, channel := range channels {
		// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
		if channel.Type == discordgo.ChannelTypeGuildText {
			ret = append(ret, channel)
		}

	}

	return ret
}

func (bot *DiscordBot) GetChannels() ([]*discordgo.Channel, error) {
	channels, err := bot.Session.GuildChannels(bot.GuildID)

	if err != nil {
		return nil, err
	}

	return filterChannels(channels), nil
}

func (bot *DiscordBot) PostErrorMessage(channelId string, payload alerts.ErrorAlertPayload) (*discordgo.Message, error) {
	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight Error Alert: %d Recent Occurrences", payload.ErrorsCount),
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:  "rich",
				Title: "Error Title",
				URL:   payload.URL,
				Fields: []*discordgo.MessageEmbedField{
					{
						Name:  "User",
						Value: payload.UserIdentifier,
					},
				},
			},
		},
	}

	return bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
}
