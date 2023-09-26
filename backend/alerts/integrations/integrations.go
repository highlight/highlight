package integrations

import (
	"time"

	"github.com/bwmarrin/discordgo"
)

type ErrorAlertPayload struct {
	ErrorCount      int64
	ErrorTitle      string
	SessionSecureID string
	SessionURL      string
	SessionExcluded bool
	ErrorURL        string
	ErrorResolveURL string
	ErrorIgnoreURL  string
	ErrorSnoozeURL  string
	UserIdentifier  string
	VisitedURL      string
}

type NewUserAlertPayload struct {
	SessionURL     string
	UserIdentifier string
	UserProperties map[string]string
	AvatarURL      *string
}

type NewSessionAlertPayload struct {
	SessionURL     string
	UserIdentifier string
	UserProperties map[string]string
	AvatarURL      *string
	VisitedURL     *string
}

type Property struct {
	Key   string
	Value string
}

type TrackPropertiesAlertPayload struct {
	UserIdentifier    string
	MatchedProperties []Property
	RelatedProperties []Property
}

type UserPropertiesAlertPayload struct {
	UserIdentifier    string
	SessionURL        string
	MatchedProperties []Property
}

type RageClicksAlertPayload struct {
	RageClicksCount int64
	UserIdentifier  string
	SessionURL      string
}

type ErrorFeedbackAlertPayload struct {
	SessionCommentURL string
	UserIdentifier    string
	CommentText       string
}

type MetricMonitorAlertPayload struct {
	MetricToMonitor string
	UnitsFormat     string
	DiffOverValue   string
	Value           string
	Threshold       string
	MonitorURL      string
}

type LogAlertPayload struct {
	Name           string
	Query          string
	Count          int
	StartDate      time.Time
	EndDate        time.Time
	Threshold      int
	BelowThreshold bool
	AlertURL       string
}

type BaseAlertIntegration interface {
	GetChannels() ([]*discordgo.Channel, error)
	SendErrorAlert(channelId string, payload ErrorAlertPayload) error
	SendNewUserAlert(channelId string, payload NewUserAlertPayload) error
	SendNewSessionAlert(channelId string, payload NewSessionAlertPayload) error
	SendTrackPropertiesAlert(channelId string, payload TrackPropertiesAlertPayload) error
	SendUserPropertiesAlert(channelId string, payload UserPropertiesAlertPayload) error
	SendErrorFeedbackAlert(channelId string, payload ErrorFeedbackAlertPayload) error
	SendRageClicksAlert(channelId string, payload RageClicksAlertPayload) error
	SendMetricMonitorAlert(channelId string, payload MetricMonitorAlertPayload) error
	SendLogAlert(channelId string, payload MetricMonitorAlertPayload) error
}
