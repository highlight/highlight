package alertintegrations

import "github.com/bwmarrin/discordgo"

type ErrorAlertPayload struct {
	ErrorsCount    int
	URL            string
	UserIdentifier string
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

type BaseAlertIntegration interface {
	GetChannels() ([]*discordgo.Channel, error)
	PostErrorAlert(channelId string, payload ErrorAlertPayload) error
	SendNewUserAlert(channelId string, payload NewUserAlertPayload) error
	SendNewSessionAlert(channelId string, payload NewSessionAlertPayload) error
}
