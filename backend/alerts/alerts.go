package alerts

import (
	"net/url"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/alerts/integrations/webhook"
	"github.com/highlight-run/highlight/backend/model"
	"golang.org/x/sync/errgroup"

	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/highlight-run/highlight/backend/alerts/integrations/discord"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type SendErrorAlertEvent struct {
	Session     *model.Session
	ErrorAlert  *model.ErrorAlert
	ErrorGroup  *model.ErrorGroup
	ErrorObject *model.ErrorObject
	Workspace   *model.Workspace
	ErrorCount  int64
	VisitedURL  string
}

func SendErrorAlert(event SendErrorAlertEvent) error {
	errorAlertPayload := integrations.ErrorAlertPayload{
		ErrorCount:      event.ErrorCount,
		ErrorTitle:      event.ErrorGroup.Event,
		UserIdentifier:  event.Session.Identifier,
		ErrorURL:        getErrorURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorResolveURL: getErrorResolveURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorIgnoreURL:  getErrorIgnoreURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		ErrorSnoozeURL:  getErrorSnoozeURL(event.ErrorAlert, event.ErrorGroup, event.ErrorObject),
		SessionURL:      getSessionURL(event.ErrorAlert.ProjectID, event.Session),
		VisitedURL:      event.VisitedURL,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.ErrorAlert.WebhookDestinations {
			if err := webhook.SendErrorAlert(wh, &errorAlertPayload); err != nil {
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

		for _, channel := range event.ErrorAlert.DiscordChannelsToNotify {
			err = bot.SendErrorAlert(channel.ID, errorAlertPayload)

			if err != nil {
				return err
			}
		}
		return nil
	})

	return g.Wait()
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

		channels := event.SessionAlert.DiscordChannelsToNotify
		for _, channel := range channels {
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

	return g.Wait()
}

type SessionFeedbackAlertEvent struct {
	Session        *model.Session
	SessionAlert   *model.SessionAlert
	Workspace      *model.Workspace
	SessionComment *model.SessionComment
	UserName       *string
	UserEmail      *string
}

func SendSessionFeedbackAlert(event SessionFeedbackAlertEvent) error {
	identifier := "Someone"
	if event.UserName != nil {
		identifier = *event.UserName
	} else if event.UserEmail != nil {
		identifier = *event.UserEmail
	}

	payload := integrations.SessionFeedbackAlertPayload{
		UserIdentifier:    identifier,
		SessionCommentURL: getSessionCommentURL(event.SessionAlert.ProjectID, event.Session, event.SessionComment),
		CommentText:       event.SessionComment.Text,
	}

	var g errgroup.Group
	g.Go(func() error {
		for _, wh := range event.SessionAlert.WebhookDestinations {
			if err := webhook.SendSessionFeedbackAlert(wh, &payload); err != nil {
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
			err = bot.SendSessionFeedbackAlert(channel.ID, payload)

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
		Name:           *event.LogAlert.Name,
		Query:          event.LogAlert.Query,
		Count:          event.Count,
		StartDate:      event.StartDate,
		EndDate:        event.EndDate,
		Threshold:      event.LogAlert.CountThreshold,
		BelowThreshold: event.LogAlert.BelowThreshold,
		AlertURL:       model.GetLogAlertURL(event.LogAlert.ProjectID, event.LogAlert.Query, event.StartDate, event.EndDate),
	}

	for _, wh := range event.LogAlert.WebhookDestinations {
		if err := webhook.SendLogAlert(wh, &payload); err != nil {
			return err
		}
	}

	if !isWorkspaceIntegratedWithDiscord(*event.Workspace) {
		return nil
	}

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

	return nil
}

func isWorkspaceIntegratedWithDiscord(workspace model.Workspace) bool {
	return workspace.DiscordGuildId != nil
}
