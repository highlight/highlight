package alerts

import (
	"encoding/json"

	"github.com/openlyinc/pointy"

	microsoft_teams "github.com/highlight-run/highlight/backend/alerts/integrations/microsoft-teams"
	"github.com/highlight-run/highlight/backend/alerts/integrations/webhook"
	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/alerts/integrations/discord"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func marshalEnvironments(environments []string) (*string, error) {
	envBytes, err := json.Marshal(environments)
	if err != nil {
		return nil, errors.Wrap(err, "error parsing environments")
	}
	envString := string(envBytes)

	return &envString, nil
}

func marshalSlackChannelsToSanitizedSlackChannels(slackChannels []*modelInputs.SanitizedSlackChannelInput) (*string, error) {
	sanitizedChannels := []*modelInputs.SanitizedSlackChannel{}
	// For each of the new slack channels, confirm that they exist in the "IntegratedSlackChannels" string.
	for _, ch := range slackChannels {
		sanitizedChannels = append(sanitizedChannels, &modelInputs.SanitizedSlackChannel{WebhookChannel: ch.WebhookChannelName, WebhookChannelID: ch.WebhookChannelID})
	}
	channelsBytes, err := json.Marshal(sanitizedChannels)
	if err != nil {
		return nil, errors.Wrap(err, "error parsing channels")
	}
	channelsString := string(channelsBytes)

	return &channelsString, nil
}

func marshalAlertEmails(emails []string) (*string, error) {
	emailBytes, err := json.Marshal(emails)
	if err != nil {
		return nil, errors.Wrap(err, "error parsing emails")
	}
	channelsString := string(emailBytes)

	return &channelsString, nil
}

func BuildSessionAlert(project *model.Project, workspace *model.Workspace, admin *model.Admin, input modelInputs.SessionAlertInput) (*model.SessionAlert, error) {

	envString, err := marshalEnvironments(input.Environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := marshalSlackChannelsToSanitizedSlackChannels(input.SlackChannels)
	if err != nil {
		return nil, err
	}

	emailsString, err := marshalAlertEmails(input.Emails)
	if err != nil {
		return nil, err
	}

	userPropertiesBytes, err := json.Marshal(input.UserProperties)
	if err != nil {
		return nil, errors.Wrap(err, "error parsing user properties for user properties alert")
	}
	userPropertiesString := string(userPropertiesBytes)

	excludeRulesString, err := marshalEnvironments(input.ExcludeRules)
	if err != nil {
		return nil, err
	}

	trackPropertiesBytes, err := json.Marshal(input.TrackProperties)
	if err != nil {
		return nil, errors.Wrap(err, "error parsing track properties")
	}
	trackPropertiesString := string(trackPropertiesBytes)

	inputType := string(input.Type)

	defaultArg := input.Default
	if defaultArg == nil {
		defaultArg = pointy.Bool(true)
	}

	return &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            input.ProjectID,
			ExcludedEnvironments: envString,
			CountThreshold:       input.CountThreshold,
			ThresholdWindow:      &input.ThresholdWindow,
			Type:                 &inputType,
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 input.Name,
			LastAdminToEditID:    admin.ID,
			Disabled:             &input.Disabled,
			Default:              *defaultArg,
		},
		UserProperties:  &userPropertiesString,
		TrackProperties: &trackPropertiesString,
		ExcludeRules:    excludeRulesString,
		AlertIntegrations: model.AlertIntegrations{
			DiscordChannelsToNotify:        discord.GQLInputToGo(input.DiscordChannels),
			MicrosoftTeamsChannelsToNotify: microsoft_teams.GQLInputToGo(input.MicrosoftTeamsChannels),
			WebhookDestinations:            webhook.GQLInputToGo(input.WebhookDestinations),
		},
	}, nil
}
