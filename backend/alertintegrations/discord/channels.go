package discord

import (
	"fmt"
	"net/url"

	"github.com/bwmarrin/discordgo"
	"github.com/highlight-run/highlight/backend/alertintegrations"
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

func (bot *DiscordBot) PostErrorAlert(channelId string, payload alertintegrations.ErrorAlertPayload) error {
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

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
	return err
}

func (bot *DiscordBot) SendNewUserAlert(channelId string, payload alertintegrations.NewUserAlertPayload) error {
	var thumbnail *discordgo.MessageEmbedThumbnail
	userFields := []*discordgo.MessageEmbedField{}

	for key, value := range payload.UserProperties {
		if key == "" {
			continue
		}
		if value == "" {
			value = "_empty_"
		}

		if key == "Avatar" {
			_, err := url.ParseRequestURI(value)
			if err != nil {
				thumbnail = &discordgo.MessageEmbedThumbnail{
					URL: value,
				}
			}
		}

		userFields = append(userFields, &discordgo.MessageEmbedField{
			Name:  key,
			Value: value,
		})
	}

	messageSend := discordgo.MessageSend{
		Content: "Highlight New User Alert",
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:      "rich",
				Title:     "View Session",
				URL:       payload.SessionURL,
				Fields:    userFields,
				Thumbnail: thumbnail,
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
	return err
}
