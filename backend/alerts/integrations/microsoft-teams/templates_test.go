package microsoft_teams

import (
	"context"
	"testing"

	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/suite"
)

var templatexCtx = context.TODO()

type MicrosoftTeamsTemplatesTestSuite struct {
	suite.Suite
}

func TestMicrosoftTeamsMessageTemplatesTestSuite(t *testing.T) {
	suite.Run(t, new(MicrosoftTeamsChannelsTestSuite))
}

func (suite *MicrosoftTeamsChannelsTestSuite) TestSendErrorAlertTemplate() {
	templateData := ErrorAlertTemplatePayload{
		Title:                      "Test Error Alert",
		Description:                "chilly@mcwilly.com",
		Facts:                      "[]",
		SessionLabel:               "wowee",
		SessionURL:                 "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse%7C%7Ccustom_created_at%2Cbetween_date%2C30%20days",
		ErrorURL:                   "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?page=1",
		ErrorResolveURL:            "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?action=resolved",
		ErrorIgnoreURL:             "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?action=ignore",
		ErrorSnoozeURL:             "https://localhost:3000/1/errors/8y4uezKfrGgvMZNAMt1Z4lpJq2bt?action=snooze",
		ContainerStyle:             "warning",
		DisplayMissingSessionLabel: false,
	}

	_, err := MakeAdaptiveCard(ErrorAlertMessageTemplate, templateData)
	if err != nil {
		log.WithContext(templatexCtx).Error("Failed to send error alert")
		log.WithContext(templatexCtx).Error(err)
	}

	suite.True(err == nil)
}

func (suite *MicrosoftTeamsChannelsTestSuite) TestBasicTemplate() {
	templateData := BasicTemplatePayload{
		Title:       "Test Error Alert",
		Description: "chilly@mcwilly.com",
		Facts:       "[]",
		ActionURL:   "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse%7C%7Ccustom_created_at%2Cbetween_date%2C30%20days",
		ActionTitle: "BOOOM!!!!",
	}

	_, err := MakeAdaptiveCard(BasicMessageTemplate, templateData)
	if err != nil {
		log.WithContext(templatexCtx).Error("Failed to send error alert")
		log.WithContext(templatexCtx).Error(err)
	}

	suite.True(err == nil)
}

func (suite *MicrosoftTeamsChannelsTestSuite) TestNewSessionTemplate() {
	templateData := NewSessionAlertPayload{
		Title:          "Test Error Alert",
		UserIdentifier: "chilly@mcwilly.com",
		Facts:          "[]",
		SessionURL:     "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse%7C%7Ccustom_created_at%2Cbetween_date%2C30%20days",
		AvatarURL:      "https://avatars.githubusercontent.com/u/58678?v=4",
	}

	_, err := MakeAdaptiveCard(NewSessionAlertMessageTemplate, templateData)
	if err != nil {
		log.WithContext(templatexCtx).Error("Failed to send error alert")
		log.WithContext(templatexCtx).Error(err)
	}

	suite.True(err == nil)
}

func (suite *MicrosoftTeamsChannelsTestSuite) TestUserPropertiesTemplate() {
	templateData := map[string]interface{}{
		"Title":       "Tracked User Properties",
		"SessionURL":  "https://localhost:3000/1/sessions/uJgf8EvTHPbwCfnFMcWx3tnjW7sc?page=1&query=and%7C%7Ccustom_processed%2Cis%2Ctrue%2Cfalse%7C%7Ccustom_created_at%2Cbetween_date%2C30%20days",
		"Description": "chilly@mcwilly.com",
		"MatchedUserProperties": map[string]string{
			"Phone":  "867-5309",
			"Editor": "vscode",
		},
		"ActionTitle": "BOOMERANG",
		"ActionURL":   "https://avatars.githubusercontent.com/u/58678?v=4",
	}

	_, err := MakeAdaptiveCard(UserPropertiesTemplate, templateData)
	if err != nil {
		log.WithContext(templatexCtx).Error("Failed to send error alert")
		log.WithContext(templatexCtx).Error(err)
	}

	suite.True(err == nil)
}

func (suite *MicrosoftTeamsChannelsTestSuite) TestTrackedPropertiesTemplate() {
	templateData := map[string]interface{}{
		"Title":       "Tracked User Properties",
		"Description": "chilly@mcwilly.com",
		"MatchedValues": map[string]string{
			"Phone":  "867-5309",
			"Editor": "vscode",
		},
		"RelatedValues": map[string]string{
			"Phone":  "867-5309",
			"Editor": "vscode",
		},
	}

	_, err := MakeAdaptiveCard(TrackPropertiesTemplate, templateData)
	if err != nil {
		log.WithContext(templatexCtx).Error("Failed to send error alert")
		log.WithContext(templatexCtx).Error(err)
	}

	suite.True(err == nil)
}
