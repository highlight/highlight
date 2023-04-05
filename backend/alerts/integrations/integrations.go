package integrations

import "github.com/bwmarrin/discordgo"

type ErrorAlertPayload struct {
	ErrorCount      int64
	ErrorTitle      string
	SessionURL      string
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

type SessionFeedbackAlertPayload struct {
	SessionCommentURL string
	UserIdentifier    string
	CommentText       string
}

type RageClicksAlertPayload struct {
	RageClicksCount int64
	UserIdentifier  string
	SessionURL      string
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
	SendSessionFeedbackAlert(channelId string, payload SessionFeedbackAlertPayload) error
	SendRageClicksAlert(channelId string, payload RageClicksAlertPayload) error
	SendMetricMonitorAlert(channelId string, payload MetricMonitorAlertPayload) error
	SendLogAlert(channelId string, payload MetricMonitorAlertPayload) error
}
