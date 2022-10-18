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

func (bot *DiscordBot) SendErrorAlert(channelId string, payload alertintegrations.ErrorAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Session",
		Value:  payload.SessionURL,
		Inline: true,
	})

	if payload.VisitedURL != "" {
		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Visited URL",
			Value:  payload.VisitedURL,
			Inline: true,
		})
	}

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "User",
		Value:  payload.UserIdentifier,
		Inline: true,
	})

	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight Error Alert: %d Recent Occurrences", payload.ErrorCount),
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:   "rich",
				Title:  payload.ErrorTitle,
				URL:    payload.ErrorURL,
				Fields: fields,
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

func (bot *DiscordBot) SendTrackPropertiesAlert(channelId string, payload alertintegrations.TrackPropertiesAlertPayload) error {
	matchedEmbed := &discordgo.MessageEmbed{
		Type:  "rich",
		Title: "Matched Track Properties",
	}

	matchedFields := []*discordgo.MessageEmbedField{}
	for _, field := range payload.MatchedFields {
		matchedFields = append(matchedFields, &discordgo.MessageEmbedField{
			Name:   field.Key,
			Value:  field.Value,
			Inline: true,
		})
	}
	matchedEmbed.Fields = matchedFields

	relatedEmbed := &discordgo.MessageEmbed{
		Type:  "rich",
		Title: "Related Track Properties",
	}
	relatedFields := []*discordgo.MessageEmbedField{}
	for _, field := range payload.RelatedFields {
		relatedFields = append(matchedFields, &discordgo.MessageEmbedField{
			Name:   field.Key,
			Value:  field.Value,
			Inline: true,
		})
	}
	relatedEmbed.Fields = relatedFields

	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight Track Properties Alert: %s", payload.UserIdentifier),
		Embeds:  append([]*discordgo.MessageEmbed{}, matchedEmbed, relatedEmbed),
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *DiscordBot) SendUserPropertiesAlert(channelId string, payload alertintegrations.UserPropertiesAlertPayload) error {
	return nil
}

func (bot *DiscordBot) SendSessionFeedbackAlert(channelId string, payload alertintegrations.SessionFeedbackAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}
	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Session",
		Value:  payload.SessionCommentURL,
		Inline: true,
	})
	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Comment",
		Value:  payload.CommentText,
		Inline: true,
	})

	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight Feedback Alert: %s", payload.UserIdentifier),
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:   "rich",
				Fields: fields,
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *DiscordBot) SendRageClicksAlert(channelId string, payload alertintegrations.RageClicksAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Session",
		Value:  payload.SessionURL,
		Inline: true,
	})

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "User",
		Value:  payload.UserIdentifier,
		Inline: true,
	})

	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight Rage Clicks Alert: %d Recent Occurrences", payload.RageClicksCount),
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:   "rich",
				Fields: fields,
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *DiscordBot) SendMetricMonitorAlert(channelId string, payload alertintegrations.MetricMonitorAlertPayload) error {
	return nil
}
