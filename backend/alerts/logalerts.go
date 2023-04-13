package alerts

import (
	"github.com/highlight-run/highlight/backend/alerts/integrations/discord"
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

	return &model.LogAlert{
		Alert: model.Alert{
			ProjectID:            input.ProjectID,
			OrganizationID:       input.ProjectID,
			ExcludedEnvironments: envString,
			CountThreshold:       input.CountThreshold,
			ThresholdWindow:      &input.ThresholdWindow,
			Type:                 pointy.String("LogAlert"),
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 &input.Name,
			LastAdminToEditID:    admin.ID,
			Disabled:             &input.Disabled,
			Frequency:            input.ThresholdWindow,
		},
		BelowThreshold: input.BelowThreshold,
		Query:          input.Query,
		AlertIntegrations: model.AlertIntegrations{
			DiscordChannelsToNotify: discord.GQLInputToGo(input.DiscordChannels),
			WebhookDestinations:     webhook.GQLInputToGo(input.WebhookDestinations),
		},
	}, nil
}
