package discord

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/pkg/errors"

	"golang.org/x/oauth2"
)

var Endpoint = oauth2.Endpoint{
	AuthURL:   "https://discord.com/api/oauth2/authorize",
	TokenURL:  "https://discord.com/api/oauth2/token",
	AuthStyle: oauth2.AuthStyleInParams,
}

func oauthConfig() (*oauth2.Config, error) {
	if env.Config.DiscordClientId == "" {
		return nil, errors.New("DISCORD_CLIENT_ID not set")
	}
	if env.Config.DiscordClientSecret == "" {
		return nil, errors.New("DISCORD_CLIENT_SECRET not set")
	}
	if env.Config.FrontendUri == "" {
		return nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	return &oauth2.Config{
		ClientID:     env.Config.DiscordClientId,
		ClientSecret: env.Config.DiscordClientSecret,
		Endpoint:     Endpoint,
		RedirectURL:  env.Config.FrontendUri + "/callback/discord",
	}, nil
}

func OAuth(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, err := oauthConfig()

	if err != nil {
		return nil, err
	}
	return conf.Exchange(ctx, code)
}
