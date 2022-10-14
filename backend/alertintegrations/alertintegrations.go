package alertintegrations

import "github.com/bwmarrin/discordgo"

type ErrorAlertPayload struct {
	ErrorsCount    int
	URL            string
	UserIdentifier string
}

type IAlertIntegration interface {
	GetChannels() ([]*discordgo.Channel, error)
	PostErrorAlert(channelId string, payload ErrorAlertPayload) error
}
