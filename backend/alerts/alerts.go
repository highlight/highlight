package alerts

import (
	"context"
	"net/url"
	"strings"
	"time"

	microsoft_teams "github.com/highlight-run/highlight/backend/alerts/integrations/microsoft-teams"
	"github.com/highlight-run/highlight/backend/alerts/integrations/webhook"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/routing"
	tempalerts "github.com/highlight-run/highlight/backend/temp-alerts"
	"golang.org/x/sync/errgroup"

	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/highlight-run/highlight/backend/alerts/integrations/discord"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type SendErrorAlertEvent struct {
	Session         *model.Session
	ErrorAlert      *model.ErrorAlert
	ErrorGroup      *model.ErrorGroup
	ErrorObject     *model.ErrorObject
	Workspace       *model.Workspace
	ErrorCount      int64
	VisitedURL      string
	FirstErrorAlert bool
}

func SendErrorAlert(ctx context.Context, event SendErrorAlertEvent) error {
	payload := integrations.ErrorAlertPayload{
		ErrorCount:      event.ErrorCount,
		ErrorTitle:      event.ErrorObject.Event,
		UserIdentifier:  event.Session.Identifier,
		ErrorURL:        getErrorURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorResolveURL: getErrorResolveURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorIgnoreURL:  getErrorIgnoreURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorSnoozeURL:  getErrorSnoozeURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		SessionSecureID: event.Session.SecureID,
		SessionURL:      getSessionURL(event.ErrorAlert.ProjectID, event.Session),
		SessionExcluded: event.Session.Excluded && *event.Session.Processed,
		VisitedURL:      event.VisitedURL,
		FirstTimeAlert:  event.FirstErrorAlert,
	}

	var g errgroup.Group
	g.Go(func() error {
		payload = attachReferrerToErrorAlertPayload(ctx, payload, routing.Webhook)
		for _, wh := range event.ErrorAlert.WebhookDestinations {
			if err := webhook.SendErrorAlert(wh, &payload); err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
			return nil
		}

		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		payload = attachReferrerToErrorAlertPayload(ctx, payload, routing.Discord)
		for _, channel := range event.ErrorAlert.DiscordChannelsToNotify {
			err = bot.SendErrorAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
			return nil
		}

		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		payload = attachReferrerToErrorAlertPayload(ctx, payload, routing.MicrosoftTeams)
		for _, channel := range event.ErrorAlert.MicrosoftTeamsChannelsToNotify {
			err = bot.SendErrorAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
}

func attachReferrerToErrorAlertPayload(ctx context.Context, payload integrations.ErrorAlertPayload, referrer routing.Referrer) integrations.ErrorAlertPayload {
	payload.ErrorURL = routing.AttachReferrer(ctx, payload.ErrorURL, referrer)
	payload.ErrorResolveURL = routing.AttachReferrer(ctx, payload.ErrorResolveURL, referrer)
	payload.ErrorIgnoreURL = routing.AttachReferrer(ctx, payload.ErrorIgnoreURL, referrer)
	payload.ErrorSnoozeURL = routing.AttachReferrer(ctx, payload.ErrorSnoozeURL, referrer)

	return payload
}

func getUserPropertiesAndAvatar(sessionUserProperties map[string]string) (map[string]string, *string) {
	var avatarURL *string
	userProperties := make(map[string]string)

	caser := cases.Title(language.AmericanEnglish)

	for key, value := range sessionUserProperties {
		if key == "" {
			continue
		}
		if value == "" {
			value = "_empty_"
		}

		key = caser.String(strings.ToLower(key))

		if key == "Avatar" {
			_, err := url.ParseRequestURI(value)
			if err == nil {
				valueCopy := strings.Clone(value)
				avatarURL = &valueCopy
				continue
			}
		}

		userProperties[key] = value
	}
	return userProperties, avatarURL
}

type SendNewUserAlertEvent struct {
	Session      *model.Session
	SessionAlert *model.SessionAlert
	Workspace    *model.Workspace
}

func SendNewUserAlert(event SendNewUserAlertEvent) error {
	sessionUserProperties, err := event.Session.GetUserProperties()
	if err != nil {
		return err
	}

	userProperties, avatarUrl := getUserPropertiesAndAvatar(sessionUserProperties)

	payload := integrations.NewUserAlertPayload{
		SessionURL:     getSessionURL(event.SessionAlert.ProjectID, event.Session),
		UserIdentifier: event.Session.Identifier,
		UserProperties: userProperties,
		AvatarURL:      avatarUrl,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.SessionAlert.WebhookDestinations {
			if err := webhook.SendNewUserAlert(wh, &payload); err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
			return nil
		}

		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		for _, channel := range event.SessionAlert.DiscordChannelsToNotify {
			err = bot.SendNewUserAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
			return nil
		}

		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		for _, channel := range event.SessionAlert.MicrosoftTeamsChannelsToNotify {
			err = bot.SendNewUserAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
}

type SendNewSessionAlertEvent struct {
	Session      *model.Session
	SessionAlert *model.SessionAlert
	Workspace    *model.Workspace
	VisitedURL   *string
}

func SendNewSessionAlert(event SendNewSessionAlertEvent) error {
	var sessionUserProperties map[string]string
	var err error

	if event.Session.UserProperties != "" {
		sessionUserProperties, err = event.Session.GetUserProperties()

		if err != nil {
			return err
		}
	}

	userProperties, avatarUrl := getUserPropertiesAndAvatar(sessionUserProperties)

	payload := integrations.NewSessionAlertPayload{
		SessionURL:     getSessionURL(event.SessionAlert.ProjectID, event.Session),
		UserIdentifier: event.Session.Identifier,
		UserProperties: userProperties,
		AvatarURL:      avatarUrl,
		VisitedURL:     event.VisitedURL,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.SessionAlert.WebhookDestinations {
			if err := webhook.SendNewSessionAlert(wh, &payload); err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
			return nil
		}

		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		channels := event.SessionAlert.DiscordChannelsToNotify

		for _, channel := range channels {
			err = bot.SendNewSessionAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
			return nil
		}

		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		for _, channel := range event.SessionAlert.MicrosoftTeamsChannelsToNotify {
			err = bot.SendNewSessionAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
}

type TrackPropertiesAlertEvent struct {
	Session       *model.Session
	SessionAlert  *model.SessionAlert
	Workspace     *model.Workspace
	MatchedFields []*model.Field
	RelatedFields []*model.Field
}

func SendTrackPropertiesAlert(event TrackPropertiesAlertEvent) error {
	// format matched properties
	var mappedMatchedProperties []integrations.Property
	var mappedRelatedProperties []integrations.Property

	for _, field := range event.MatchedFields {
		mappedMatchedProperties = append(mappedMatchedProperties, integrations.Property{
			Key:   field.Name,
			Value: field.Value,
		})
	}
	for _, field := range event.RelatedFields {
		mappedRelatedProperties = append(mappedRelatedProperties, integrations.Property{
			Key:   field.Name,
			Value: field.Value,
		})
	}

	payload := integrations.TrackPropertiesAlertPayload{
		UserIdentifier:    event.Session.Identifier,
		MatchedProperties: mappedMatchedProperties,
		RelatedProperties: mappedRelatedProperties,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.SessionAlert.WebhookDestinations {
			if err := webhook.SendTrackPropertiesAlert(wh, &payload); err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
			return nil
		}

		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		channels := event.SessionAlert.DiscordChannelsToNotify

		for _, channel := range channels {
			err = bot.SendTrackPropertiesAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
			return nil
		}

		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		for _, channel := range event.SessionAlert.MicrosoftTeamsChannelsToNotify {
			err = bot.SendTrackPropertiesAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
}

type UserPropertiesAlertEvent struct {
	Session       *model.Session
	SessionAlert  *model.SessionAlert
	Workspace     *model.Workspace
	MatchedFields []*model.Field
}

func SendUserPropertiesAlert(event UserPropertiesAlertEvent) error {
	var mappedProperties []integrations.Property

	for _, field := range event.MatchedFields {
		mappedProperties = append(mappedProperties, integrations.Property{
			Key:   field.Name,
			Value: field.Value,
		})
	}

	payload := integrations.UserPropertiesAlertPayload{
		UserIdentifier:    event.Session.Identifier,
		SessionURL:        getSessionURL(event.Session.ProjectID, event.Session),
		MatchedProperties: mappedProperties,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.SessionAlert.WebhookDestinations {
			if err := webhook.SendUserPropertiesAlert(wh, &payload); err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
			return nil
		}

		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		channels := event.SessionAlert.DiscordChannelsToNotify

		for _, channel := range channels {
			err = bot.SendUserPropertiesAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
			return nil
		}

		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		for _, channel := range event.SessionAlert.MicrosoftTeamsChannelsToNotify {
			err = bot.SendUserPropertiesAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
}

type ErrorFeedbackAlertEvent struct {
	Session        *model.Session
	ErrorAlert     *model.ErrorAlert
	Workspace      *model.Workspace
	SessionComment *model.SessionComment
	UserName       *string
	UserEmail      *string
}

func SendErrorFeedbackAlert(event ErrorFeedbackAlertEvent) error {
	identifier := "Someone"
	if event.UserName != nil {
		identifier = *event.UserName
	} else if event.UserEmail != nil {
		identifier = *event.UserEmail
	}

	payload := integrations.ErrorFeedbackAlertPayload{
		UserIdentifier:    identifier,
		SessionCommentURL: getSessionCommentURL(event.ErrorAlert.ProjectID, event.Session, event.SessionComment),
		CommentText:       event.SessionComment.Text,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.ErrorAlert.WebhookDestinations {
			if err := webhook.SendErrorFeedbackAlert(wh, &payload); err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
			return nil
		}

		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		channels := event.ErrorAlert.DiscordChannelsToNotify

		for _, channel := range channels {
			err = bot.SendErrorFeedbackAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
			return nil
		}

		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		for _, channel := range event.ErrorAlert.MicrosoftTeamsChannelsToNotify {
			err = bot.SendErrorFeedbackAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
}

type RageClicksAlertEvent struct {
	Session         *model.Session
	SessionAlert    *model.SessionAlert
	Workspace       *model.Workspace
	RageClicksCount int64
}

func SendRageClicksAlert(event RageClicksAlertEvent) error {
	payload := integrations.RageClicksAlertPayload{
		RageClicksCount: event.RageClicksCount,
		SessionURL:      getSessionURL(event.SessionAlert.ProjectID, event.Session),
		UserIdentifier:  event.Session.Identifier,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.SessionAlert.WebhookDestinations {
			if err := webhook.SendRageClicksAlert(wh, &payload); err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
			return nil
		}

		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		channels := event.SessionAlert.DiscordChannelsToNotify

		for _, channel := range channels {
			err = bot.SendRageClicksAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
			return nil
		}

		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		for _, channel := range event.SessionAlert.MicrosoftTeamsChannelsToNotify {
			err = bot.SendRageClicksAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
}

type MetricMonitorAlertEvent struct {
	MetricMonitor *model.MetricMonitor
	Workspace     *model.Workspace
	UnitsFormat   string
	DiffOverValue string
	Value         string
	Threshold     string
}

func SendMetricMonitorAlert(event MetricMonitorAlertEvent) error {
	payload := integrations.MetricMonitorAlertPayload{
		MetricToMonitor: event.MetricMonitor.MetricToMonitor,
		MonitorURL:      getMonitorURL(event.MetricMonitor),
		UnitsFormat:     event.UnitsFormat,
		DiffOverValue:   event.DiffOverValue,
		Value:           event.Value,
		Threshold:       event.Value,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.MetricMonitor.WebhookDestinations {
			if err := webhook.SendMetricMonitorAlert(wh, &payload); err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
			return nil
		}

		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		channels := event.MetricMonitor.DiscordChannelsToNotify

		for _, channel := range channels {
			err = bot.SendMetricMonitorAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	g.Go(func() error {
		if !isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
			return nil
		}

		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		for _, channel := range event.MetricMonitor.MicrosoftTeamsChannelsToNotify {
			err = bot.SendMetricMonitorAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
}

type LogAlertEvent struct {
	LogAlert  *model.LogAlert
	Workspace *model.Workspace
	Count     int
	StartDate time.Time
	EndDate   time.Time
}

func SendLogAlert(event LogAlertEvent) error {
	payload := integrations.LogAlertPayload{
		Name:           event.LogAlert.Name,
		Query:          event.LogAlert.Query,
		Count:          event.Count,
		StartDate:      event.StartDate,
		EndDate:        event.EndDate,
		Threshold:      event.LogAlert.CountThreshold,
		BelowThreshold: event.LogAlert.BelowThreshold,
		AlertURL:       tempalerts.GetLogAlertURL(event.LogAlert.ProjectID, event.LogAlert.Query, event.StartDate, event.EndDate),
	}

	for _, wh := range event.LogAlert.WebhookDestinations {
		if err := webhook.SendLogAlert(wh, &payload); err != nil {
			return err
		}
	}

	if isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		bot, err := discord.NewDiscordBot(*event.Workspace.DiscordGuildId)
		if err != nil {
			return err
		}

		channels := event.LogAlert.DiscordChannelsToNotify

		for _, channel := range channels {
			err = bot.SendLogAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
	}

	if isWorkspaceIntegratedWithMicrosoftTeams(*event.Workspace) {
		bot, err := microsoft_teams.NewMicrosoftTeamsBot(*event.Workspace.MicrosoftTeamsTenantId)
		if err != nil {
			return err
		}

		channels := event.LogAlert.MicrosoftTeamsChannelsToNotify

		for _, channel := range channels {
			err = bot.SendLogAlert(channel.ID, payload)

			if err != nil {
				return err
			}
		}
	}

	return nil
}

func isWorkspaceIntegratedWithDiscord(workspace model.Workspace) bool {
	return workspace.DiscordGuildId != nil
}

func isWorkspaceIntegratedWithMicrosoftTeams(workspace model.Workspace) bool {
	return workspace.MicrosoftTeamsTenantId != nil
}
