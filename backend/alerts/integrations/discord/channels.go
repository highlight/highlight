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

func newMessageEmbed() *discordgo.MessageEmbed {
	return &discordgo.MessageEmbed{
		Color: 0x6c37f4,
	}

}

func (bot *DiscordBot) SendErrorAlert(channelId string, payload integrations.ErrorAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}

	if payload.VisitedURL != "" {
		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Visited URL",
			Value:  payload.VisitedURL,
			Inline: false,
		})
	}

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Error",
		Value:  payload.ErrorTitle,
		Inline: true,
	})

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Error count",
		Value:  strconv.FormatInt(payload.ErrorCount, 10),
		Inline: true,
	})

	embed := newMessageEmbed()
	embed.Title = "Highlight Error Alert"
	embed.Description = payload.UserIdentifier
	embed.Fields = fields

	messageSend := discordgo.MessageSend{
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
					discordgo.Button{
						Label:    "View Error",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.ErrorURL,
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
	fields := []*discordgo.MessageEmbedField{}
	for key, value := range payload.UserProperties {
		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   key,
			Value:  value,
			Inline: true,
		})
	}

	embed := newMessageEmbed()
	embed.Title = "Highlight New User Alert"
	embed.Description = payload.UserIdentifier
	embed.Fields = fields

	if payload.AvatarURL != nil {
		embed.Thumbnail = &discordgo.MessageEmbedThumbnail{
			URL: *payload.AvatarURL,
		}
	}

	messageSend := discordgo.MessageSend{
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
	fields := []*discordgo.MessageEmbedField{}

	if payload.VisitedURL != nil && *payload.VisitedURL != "" {
		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Visited URL",
			Value:  *payload.VisitedURL,
			Inline: false,
		})
	}

	for key, value := range payload.UserProperties {
		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   key,
			Value:  value,
			Inline: true,
		})
	}

	embed := newMessageEmbed()
	embed.Title = "Highlight New Session Alert"
	embed.Description = payload.UserIdentifier
	embed.Fields = fields

	if payload.AvatarURL != nil {
		embed.Thumbnail = &discordgo.MessageEmbedThumbnail{
			URL: *payload.AvatarURL,
		}
	}

	messageSend := discordgo.MessageSend{
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
	mainEmbed := newMessageEmbed()
	mainEmbed.Title = "Highlight Track Properties Alert"
	mainEmbed.Description = payload.UserIdentifier

	matchedFields := []*discordgo.MessageEmbedField{}
	for _, field := range payload.MatchedProperties {
		matchedFields = append(matchedFields, &discordgo.MessageEmbedField{
			Name:   field.Key,
			Value:  field.Value,
			Inline: true,
		})
	}

	matchedEmbed := newMessageEmbed()
	matchedEmbed.Title = "Matched Track Properties"
	matchedEmbed.Fields = matchedFields

	relatedFields := []*discordgo.MessageEmbedField{}
	for _, field := range payload.RelatedProperties {
		relatedFields = append(matchedFields, &discordgo.MessageEmbedField{
			Name:   field.Key,
			Value:  field.Value,
			Inline: true,
		})
	}

	embeds := append([]*discordgo.MessageEmbed{}, mainEmbed, matchedEmbed)

	if len(relatedFields) > 0 {
		relatedEmbed := newMessageEmbed()
		relatedEmbed.Title = "Related Track Properties"
		relatedEmbed.Fields = relatedFields

		embeds = append(embeds, relatedEmbed)
	}

	messageSend := discordgo.MessageSend{
		Embeds: embeds,
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *DiscordBot) SendUserPropertiesAlert(channelId string, payload integrations.UserPropertiesAlertPayload) error {
	mainEmbed := newMessageEmbed()
	mainEmbed.Title = "Highlight User Properties Alert"
	mainEmbed.Description = payload.UserIdentifier

	matchedFields := []*discordgo.MessageEmbedField{}
	for _, field := range payload.MatchedProperties {
		matchedFields = append(matchedFields, &discordgo.MessageEmbedField{
			Name:   field.Key,
			Value:  field.Value,
			Inline: true,
		})
	}

	matchedEmbed := newMessageEmbed()
	matchedEmbed.Title = "Matched User Properties"
	matchedEmbed.Fields = matchedFields

	messageSend := discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{
			mainEmbed, matchedEmbed,
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
		Name:   "Comment",
		Value:  payload.CommentText,
		Inline: true,
	})

	embed := newMessageEmbed()
	embed.Title = "Highlight Feedback Alert"
	embed.Description = payload.UserIdentifier
	embed.Fields = fields

	messageSend := discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{
			embed,
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

	embed := newMessageEmbed()
	embed.Title = "Highlight Rage Clicks Alert"
	embed.Description = payload.UserIdentifier
	embed.Fields = fields

	messageSend := discordgo.MessageSend{
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

	embed := newMessageEmbed()
	embed.Title = "Highlight Metric Monitor Alert"
	embed.Description = fmt.Sprintf("*%s* is currently %s %s over the threshold.", payload.MetricToMonitor, payload.DiffOverValue, payload.UnitsFormat)
	embed.Fields = fields

	messageSend := discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{
			embed,
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
