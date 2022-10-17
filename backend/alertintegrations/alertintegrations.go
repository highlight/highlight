package alertintegrations

import "github.com/bwmarrin/discordgo"

type ErrorAlertPayload struct {
	ErrorCount     int64
	ErrorTitle     string
	SessionURL     string
	ErrorURL       string
	UserIdentifier string
	VisitedURL     string
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
	SendErrorAlert(channelId string, payload ErrorAlertPayload) error
	SendNewUserAlert(channelId string, payload NewUserAlertPayload) error
	SendNewSessionAlert(channelId string, payload NewSessionAlertPayload) error
}
