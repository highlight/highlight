package discord

import (
	"fmt"

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
	embed := &discordgo.MessageEmbed{
		Type:  "rich",
		Title: "View Session",
		URL:   payload.SessionURL,
	}

	userFields := []*discordgo.MessageEmbedField{}
	for key, value := range payload.UserProperties {
		userFields = append(userFields, &discordgo.MessageEmbedField{
			Name:   key,
			Value:  value,
			Inline: true,
		})
	}
	embed.Fields = userFields

	if payload.AvatarURL != nil {
		embed.Thumbnail = &discordgo.MessageEmbedThumbnail{
			URL: *payload.AvatarURL,
		}
	}

	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight New User Alert: %s", payload.UserIdentifier),
		Embeds: []*discordgo.MessageEmbed{
			embed,
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
	return err
}

func (bot *DiscordBot) SendNewSessionAlert(channelId string, payload alertintegrations.NewSessionAlertPayload) error {
	embed := &discordgo.MessageEmbed{
		Type:  "rich",
		Title: "View Session",
		URL:   payload.SessionURL,
	}

	userFields := []*discordgo.MessageEmbedField{}

	if payload.VisitedURL != nil && *payload.VisitedURL != "" {
		userFields = append(userFields, &discordgo.MessageEmbedField{
			Name:   "Visited URL",
			Value:  *payload.VisitedURL,
			Inline: true,
		})
	}

	for key, value := range payload.UserProperties {
		userFields = append(userFields, &discordgo.MessageEmbedField{
			Name:   key,
			Value:  value,
			Inline: true,
		})
	}
	embed.Fields = userFields

	if payload.AvatarURL != nil {
		embed.Thumbnail = &discordgo.MessageEmbedThumbnail{
			URL: *payload.AvatarURL,
		}
	}

	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight New User Alert: %s", payload.UserIdentifier),
		Embeds: []*discordgo.MessageEmbed{
			embed,
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
	return err
}
