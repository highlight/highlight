package alerts

import (
	"github.com/highlight-run/highlight/backend/alerts/integrations/discord"
	microsoft_teams "github.com/highlight-run/highlight/backend/alerts/integrations/microsoft-teams"
	"github.com/highlight-run/highlight/backend/alerts/integrations/webhook"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/openlyinc/pointy"
)

func BuildLogAlert(project *model.Project, workspace *model.Workspace, admin *model.Admin, input modelInputs.LogAlertInput) (*model.LogAlert, error) {
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

	defaultArg := input.Default
	if defaultArg == nil {
		defaultArg = pointy.Bool(true)
	}

	return &model.LogAlert{
		Alert: model.Alert{
			ProjectID:            input.ProjectID,
			ExcludedEnvironments: envString,
			CountThreshold:       input.CountThreshold,
			ThresholdWindow:      &input.ThresholdWindow,
			Type:                 pointy.String("LogAlert"),
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 input.Name,
			LastAdminToEditID:    admin.ID,
			Disabled:             &input.Disabled,
			Default:              *defaultArg,
			Frequency:            input.ThresholdWindow,
		},
		BelowThreshold: input.BelowThreshold,
		Query:          input.Query,
		AlertIntegrations: model.AlertIntegrations{
			DiscordChannelsToNotify:        discord.GQLInputToGo(input.DiscordChannels),
			MicrosoftTeamsChannelsToNotify: microsoft_teams.GQLInputToGo(input.MicrosoftTeamsChannels),
			WebhookDestinations:            webhook.GQLInputToGo(input.WebhookDestinations),
		},
	}, nil
}
