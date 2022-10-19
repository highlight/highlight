package alerts

type ErrorAlertPayload struct {
	ErrorsCount    int
	URL            string
	UserIdentifier string
}

type IIntegration interface {
	GetChannels()
	PostErrorAlert(channelId string, payload ErrorAlertPayload)
}
