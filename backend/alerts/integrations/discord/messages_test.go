package discord

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"testing"

	"github.com/aws/smithy-go/ptr"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/stretchr/testify/suite"
)

var ctx = context.TODO()

type DiscordChannelsTestSuite struct {
	suite.Suite
	ChannelID string
	bot       *Bot
}

func TestDiscordChannelsTestSuite(t *testing.T) {
	t.Skip(`
	  This test only exists for quickly sending Discord messages to a channel. It sends real data to a real channel.
		In order to run this locally, adjust the values below (by setting up Discord locally) and comment this t.Skip line
	`)
	suite.Run(t, new(DiscordChannelsTestSuite))
}

func (suite *DiscordChannelsTestSuite) SetupTest() {
	guildID := "<REPLACE_WITH_GUILD_ID>"
	discordBotSecret := "<REPLACE_WITH_DISCORD_BOT_SECRET>"

	env.Config.DiscordBotSecret = discordBotSecret

	bot, err := NewDiscordBot(guildID)
	if err != nil {
		log.WithContext(ctx).Error("Failed to initialize Bot")
		return
	}

	suite.ChannelID = "<REPLACE_WITH_CHANNEL_ID>"
	suite.bot = bot
}

func (suite *DiscordChannelsTestSuite) TestSendErrorAlert() {
	err := suite.bot.SendErrorAlert(suite.ChannelID, integrations.ErrorAlertPayload{
		ErrorCount:      12,
		ErrorTitle:      "something bad happened",
		SessionSecureID: "uJgf8EvTHPbwCfnFMcWx3tnjW7sc",
		SessionURL:      "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse",
		SessionExcluded: false,
		ErrorURL:        "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?page=1",
		ErrorResolveURL: "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?action=resolved",
		ErrorIgnoreURL:  "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?action=ignore",
		ErrorSnoozeURL:  "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?action=snooze",
		VisitedURL:      "http://google.com",
		UserIdentifier:  "chilly@mcwilly.com",
		FirstTimeAlert:  false,
	})

	if err != nil {
		log.WithContext(ctx).Error("Failed to send error alert")
		log.WithContext(ctx).Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestSendNewUserAlert() {
	err := suite.bot.SendNewUserAlert(suite.ChannelID, integrations.NewUserAlertPayload{
		SessionURL:     "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse",
		UserIdentifier: "chilly@mcwilly.com",
		UserProperties: map[string]string{
			"Phone":  "867-5309",
			"Editor": "vscode",
		},
		AvatarURL: ptr.String("https://avatars.githubusercontent.com/u/58678?v=4"),
	})

	if err != nil {
		fmt.Printf("Failed to send new user alert")
		log.WithContext(ctx).Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestSendNewSessionAlert() {
	err := suite.bot.SendNewSessionAlert(suite.ChannelID, integrations.NewSessionAlertPayload{
		SessionURL:     "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse",
		UserIdentifier: "chilly@mcwilly.com",
		UserProperties: map[string]string{
			"Phone":  "867-5309",
			"Editor": "vscode",
		},
		AvatarURL:  ptr.String("https://avatars.githubusercontent.com/u/58678?v=4"),
		VisitedURL: ptr.String("http://google.com"),
	})

	if err != nil {
		log.WithContext(ctx).Error("Failed to send new session alert")
		log.WithContext(ctx).Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestSendTrackPropertiesAlert() {
	err := suite.bot.SendTrackPropertiesAlert(suite.ChannelID, integrations.TrackPropertiesAlertPayload{
		UserIdentifier: "chilly@mcwilly.com",
		MatchedProperties: []integrations.Property{
			{
				Key:   "Editor",
				Value: "vim",
			},
		},
		RelatedProperties: []integrations.Property{
			{
				Key:   "editor",
				Value: "vim",
			},
		},
	})

	if err != nil {
		log.WithContext(ctx).Error("Failed to send new track properties alert")
		log.WithContext(ctx).Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestSendUserPropertiesAlert() {
	err := suite.bot.SendUserPropertiesAlert(suite.ChannelID, integrations.UserPropertiesAlertPayload{
		SessionURL:     "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse",
		UserIdentifier: "chilly@mcwilly.com",
		MatchedProperties: []integrations.Property{
			{
				Key:   "Editor",
				Value: "vim",
			},
		},
	})

	if err != nil {
		log.WithContext(ctx).Error("Failed to send new user properties alert")
		log.WithContext(ctx).Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestErrorFeedbackAlert() {
	err := suite.bot.SendErrorFeedbackAlert(suite.ChannelID, integrations.ErrorFeedbackAlertPayload{
		SessionCommentURL: "https://localhost:3000/1/sessions/yggihGDgdPlBwpgVFtwuTM9nMvpn?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse&ts=0&commentId=34",
		UserIdentifier:    "chilly@mcwilly.com",
		CommentText:       "Hey, what is up!",
	})

	if err != nil {
		fmt.Printf("Failed to send new error feedback alert")
		log.WithContext(ctx).Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestRageClicksAlert() {
	err := suite.bot.SendRageClicksAlert(suite.ChannelID, integrations.RageClicksAlertPayload{
		RageClicksCount: 100,
		UserIdentifier:  "chilly@mcwilly.com",
		SessionURL:      "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse",
	})

	if err != nil {
		log.WithContext(ctx).Error("Failed to send new session feedback alert")
		log.WithContext(ctx).Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestMetricMonitorAlert() {
	err := suite.bot.SendMetricMonitorAlert(suite.ChannelID, integrations.MetricMonitorAlertPayload{
		MetricToMonitor: "latency",
		MonitorURL:      "https://localhost:3000/1/alerts/monitor/43",
		UnitsFormat:     "ms",
		DiffOverValue:   "171",
		Value:           "1171",
		Threshold:       "1000",
	})

	if err != nil {
		log.WithContext(ctx).Error("Failed to send metric monitor alert")
		log.WithContext(ctx).Error(err)
	}

	suite.True(true)
}
