package routing

import (
	"context"
	"net/url"

	log "github.com/sirupsen/logrus"
)

type Referrer string

const (
	Discord        Referrer = "discord"
	Email          Referrer = "email"
	Slack          Referrer = "slack"
	Webhook        Referrer = "webhook"
	MicrosoftTeams Referrer = "microsoft-teams"
)

func AttachReferrer(ctx context.Context, u string, referrer Referrer) string {
	return AttachQueryParam(ctx, u, "referrer", string(referrer))
}

func AttachQueryParam(ctx context.Context, u string, key string, value string) string {
	url, err := url.Parse(u)
	if err != nil {
		log.WithContext(ctx).Errorf("Failed to parse url: %s", u)
		log.WithContext(ctx).Error(err)
		return u
	}

	values := url.Query()
	values.Add(key, value)
	url.RawQuery = values.Encode()

	return url.String()
}
