package discord

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/highlight-run/highlight/backend/alerts/integrations"
)

func newMessageEmbed() *discordgo.MessageEmbed {
	return &discordgo.MessageEmbed{
		Color: 0x6c37f4,
	}
}

func (bot *Bot) SendErrorAlert(channelId string, payload integrations.ErrorAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}

	if payload.VisitedURL != "" {
		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Visited URL",
			Value:  payload.VisitedURL,
			Inline: false,
		})
	}

	errorTitle := payload.ErrorTitle
	if len(errorTitle) > 50 {
		errorTitle = errorTitle[:50] + "..."
	}
	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Error",
		Value:  errorTitle,
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

	sessionLabel := "View Session"
	if payload.SessionExcluded {
		sessionLabel = "No recorded session"
	}

	messageSend := discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{
			embed,
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    sessionLabel,
						Style:    discordgo.LinkButton,
						Disabled: payload.SessionExcluded,
						URL:      payload.SessionURL,
					},
					discordgo.Button{
						Label:    "View Error",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.ErrorURL,
					},
				},
			},
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
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
						URL:      payload.ErrorIgnoreURL,
					},
					discordgo.Button{
						Label:    "Snooze Error",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.ErrorSnoozeURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)
	return err
}

func (bot *Bot) SendNewUserAlert(channelId string, payload integrations.NewUserAlertPayload) error {
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

func (bot *Bot) SendNewSessionAlert(channelId string, payload integrations.NewSessionAlertPayload) error {
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

func (bot *Bot) SendTrackPropertiesAlert(channelId string, payload integrations.TrackPropertiesAlertPayload) error {
	matchedValue := []string{}
	for _, field := range payload.MatchedProperties {
		matchedValue = append(matchedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
	}

	fields := append([]*discordgo.MessageEmbedField{}, &discordgo.MessageEmbedField{
		Name:   "Matched Track Properties",
		Value:  strings.Join(matchedValue, "\n"),
		Inline: false,
	})

	if len(payload.RelatedProperties) > 0 {
		relatedValue := []string{}
		for _, field := range payload.RelatedProperties {
			relatedValue = append(relatedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
		}

		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Related Track Properties",
			Value:  strings.Join(relatedValue, "\n"),
			Inline: false,
		})
	}

	embed := newMessageEmbed()
	embed.Title = "Highlight Track Properties Alert"
	embed.Description = payload.UserIdentifier
	embed.Fields = fields

	messageSend := discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{
			embed,
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}

func (bot *Bot) SendUserPropertiesAlert(channelId string, payload integrations.UserPropertiesAlertPayload) error {
	matchedValue := []string{}
	for _, field := range payload.MatchedProperties {
		matchedValue = append(matchedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
	}

	fields := append([]*discordgo.MessageEmbedField{}, &discordgo.MessageEmbedField{
		Name:   "Matched User Properties",
		Value:  strings.Join(matchedValue, "\n"),
		Inline: false,
	})

	embed := newMessageEmbed()
	embed.Title = "Highlight User Properties Alert"
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

func (bot *Bot) SendErrorFeedbackAlert(channelId string, payload integrations.ErrorFeedbackAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}
	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Comment",
		Value:  payload.CommentText,
		Inline: true,
	})

	embed := newMessageEmbed()
	embed.Title = "Highlight Error Feedback Alert"
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

func (bot *Bot) SendRageClicksAlert(channelId string, payload integrations.RageClicksAlertPayload) error {
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

func (bot *Bot) SendMetricMonitorAlert(channelId string, payload integrations.MetricMonitorAlertPayload) error {
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

func (bot *Bot) SendLogAlert(channelId string, payload integrations.LogAlertPayload) error {
	fields := []*discordgo.MessageEmbedField{}

	if payload.Query != "" {
		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Query",
			Value:  payload.Query,
			Inline: true,
		})
	}

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Count",
		Value:  strconv.Itoa(payload.Count),
		Inline: true,
	})

	fields = append(fields, &discordgo.MessageEmbedField{
		Name:   "Threshold",
		Value:  strconv.Itoa(payload.Threshold),
		Inline: true,
	})

	aboveStr := "above"
	if payload.BelowThreshold {
		aboveStr = "below"
	}

	embed := newMessageEmbed()
	embed.Title = "Highlight Log Alert"
	embed.Description = fmt.Sprintf("*%s* is currently %s the threshold.", payload.Name, aboveStr)
	embed.Fields = fields

	messageSend := discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{
			embed,
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "View Logs",
						Style:    discordgo.LinkButton,
						Disabled: false,
						URL:      payload.AlertURL,
					},
				},
			},
		},
	}

	_, err := bot.Session.ChannelMessageSendComplex(channelId, &messageSend)

	return err
}
