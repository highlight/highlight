package discord

import (
	"fmt"
	"os"
	"testing"

	"github.com/aws/smithy-go/ptr"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/stretchr/testify/suite"
)

type DiscordChannelsTestSuite struct {
	suite.Suite
	ChannelID string
	bot       *DiscordBot
}

func (suite *DiscordChannelsTestSuite) SetupTest() {
	guildID := "GUILD_ID"
	discordBotSecret := "DISCORD_BOT_SECRET"

	os.Setenv("DISCORD_BOT_SECRET", discordBotSecret)

	bot, err := NewDiscordBot(guildID)
	if err != nil {
		log.Error("Failed to initialize Bot")
		return
	}

	suite.ChannelID = "CHANNEL_ID"
	suite.bot = bot
}

func (suite *DiscordChannelsTestSuite) TestSendErrorAlert() {
	err := suite.bot.SendErrorAlert(suite.ChannelID, integrations.ErrorAlertPayload{
		ErrorCount:      12,
		ErrorTitle:      "something bad happened",
		SessionURL:      "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse%7C%7Ccustom_created_at%2Cbetween_date%2C30%20days",
		ErrorURL:        "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?page=1",
		ErrorResolveURL: "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?action=resolved",
		ErrorIgnoreURL:  "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?action=ignore",
		VisitedURL:      "http://google.com",
		UserIdentifier:  "chilly@mcwilly.com",
	})

	if err != nil {
		fmt.Printf("Failed to send error alert")
		log.Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestSendNewUserAlert() {
	err := suite.bot.SendNewUserAlert(suite.ChannelID, integrations.NewUserAlertPayload{
		SessionURL:     "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse%7C%7Ccustom_created_at%2Cbetween_date%2C30%20days",
		UserIdentifier: "chilly@mcwilly.com",
		UserProperties: map[string]string{
			"Phone":  "867-5309",
			"Editor": "vscode",
		},
		AvatarURL: ptr.String("https://avatars.githubusercontent.com/u/58678?v=4"),
	})

	if err != nil {
		fmt.Printf("Failed to send new user alert")
		log.Error(err)
	}

	suite.True(true)
}

func (suite *DiscordChannelsTestSuite) TestSendNewSessionAlert() {
	err := suite.bot.SendNewSessionAlert(suite.ChannelID, integrations.NewSessionAlertPayload{
		SessionURL:     "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse%7C%7Ccustom_created_at%2Cbetween_date%2C30%20days",
		UserIdentifier: "chilly@mcwilly.com",
		UserProperties: map[string]string{
			"Phone":  "867-5309",
			"Editor": "vscode",
		},
		AvatarURL:  ptr.String("https://avatars.githubusercontent.com/u/58678?v=4"),
		VisitedURL: ptr.String("http://google.com"),
	})

	if err != nil {
		fmt.Printf("Failed to send new session alert")
		log.Error(err)
	}

	suite.True(true)
}

func TestDiscordChannelsTestSuite(t *testing.T) {
	t.Skip("Skipping testing in CI environment")
	suite.Run(t, new(DiscordChannelsTestSuite))
}
