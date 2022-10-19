package discord

import (
	"fmt"
	"strconv"

	"github.com/bwmarrin/discordgo"
	"github.com/highlight-run/highlight/backend/alerts/integrations"
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

func (bot *DiscordBot) SendErrorAlert(channelId string, payload integrations.ErrorAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}

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

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Error count",
		Value:  strconv.FormatInt(payload.ErrorCount, 10),
		Inline: true,
	})

	messageSend := discordgo.MessageSend{
		Content: "**Highlight Error Alert**",
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:   "rich",
				Title:  payload.ErrorTitle,
				URL:    payload.ErrorURL,
				Fields: fields,
			},
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "View Session",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.SessionURL,
					},
					discordgo.Button{
						Label:    "Resolve Error",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.ErrorResolveURL,
					},
					discordgo.Button{
						Label:    "Ignore Error",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.ErrorResolveURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
	return err
}

func (bot *DiscordBot) SendNewUserAlert(channelId string, payload integrations.NewUserAlertPayload) error {
	embed := &discordgo.MessageEmbed{
		Type: "rich",
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
		Content: fmt.Sprintf("**Highlight New User Alert: %s**", payload.UserIdentifier),
		Embeds: []*discordgo.MessageEmbed{
			embed,
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "View Session",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.SessionURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
	return err
}

func (bot *DiscordBot) SendNewSessionAlert(channelId string, payload integrations.NewSessionAlertPayload) error {
	embed := &discordgo.MessageEmbed{
		Type: "rich",
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
		Content: fmt.Sprintf("Highlight New Session Alert: %s", payload.UserIdentifier),
		Embeds: []*discordgo.MessageEmbed{
			embed,
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "View Session",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.SessionURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
	return err
}

func (bot *DiscordBot) SendTrackPropertiesAlert(channelId string, payload integrations.TrackPropertiesAlertPayload) error {
	matchedEmbed := &discordgo.MessageEmbed{
		Type:  "rich",
		Title: "Matched Track Properties",
	}

	matchedFields := []*discordgo.MessageEmbedField{}
	for _, field := range payload.MatchedProperties {
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
	for _, field := range payload.RelatedProperties {
		relatedFields = append(matchedFields, &discordgo.MessageEmbedField{
			Name:   field.Key,
			Value:  field.Value,
			Inline: true,
		})
	}
	relatedEmbed.Fields = relatedFields

	embeds := append([]*discordgo.MessageEmbed{}, matchedEmbed)

	if len(relatedEmbed.Fields) > 0 {
		embeds = append(embeds, relatedEmbed)
	}

	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight Track Properties Alert: %s", payload.UserIdentifier),
		Embeds:  embeds,
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *DiscordBot) SendUserPropertiesAlert(channelId string, payload integrations.UserPropertiesAlertPayload) error {
	matchedFields := []*discordgo.MessageEmbedField{}
	for _, field := range payload.MatchedProperties {
		matchedFields = append(matchedFields, &discordgo.MessageEmbedField{
			Name:   field.Key,
			Value:  field.Value,
			Inline: true,
		})
	}

	messageSend := discordgo.MessageSend{
		Content: fmt.Sprintf("Highlight User Properties Alert: %s", payload.UserIdentifier),
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:   "rich",
				Title:  "Matched User Properties",
				Fields: matchedFields,
			},
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "View Session",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.SessionURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *DiscordBot) SendSessionFeedbackAlert(channelId string, payload integrations.SessionFeedbackAlertPayload) error {
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
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "View Comment",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.SessionCommentURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *DiscordBot) SendRageClicksAlert(channelId string, payload integrations.RageClicksAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "User",
		Value:  payload.UserIdentifier,
		Inline: true,
	})

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Rage click count",
		Value:  strconv.FormatInt(payload.RageClicksCount, 10),
		Inline: true,
	})

	messageSend := discordgo.MessageSend{
		Content: "**Highlight Rage Clicks Alert**",
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:   "rich",
				Fields: fields,
			},
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "View Session",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.SessionURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *DiscordBot) SendMetricMonitorAlert(channelId string, payload integrations.MetricMonitorAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Value",
		Value:  fmt.Sprintf("%s %s", payload.Value, payload.UnitsFormat),
		Inline: true,
	})

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Threshold",
		Value:  fmt.Sprintf("%s %s", payload.Threshold, payload.UnitsFormat),
		Inline: true,
	})

	messageSend := discordgo.MessageSend{
		Content: "**Highlight Metric Monitor Alert**",
		Embeds: []*discordgo.MessageEmbed{
			{
				Type:   "rich",
				Fields: fields,
				Title:  fmt.Sprintf("*%s* is currently %s %s over the threshold.", payload.MetricToMonitor, payload.DiffOverValue, payload.UnitsFormat),
			},
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "View Monitor",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.MonitorURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}
