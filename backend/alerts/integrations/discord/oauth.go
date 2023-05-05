package discord

import (
	"context"
	"errors"
	"os"

	"golang.org/x/oauth2"
)

var Endpoint = oauth2.Endpoint{
	AuthURL:   "https://discord.com/api/oauth2/authorize",
	TokenURL:  "https://discord.com/api/oauth2/token",
	AuthStyle: oauth2.AuthStyleInParams,
}

func oauthConfig() (*oauth2.Config, error) {
	var (
		ok                  bool
		DiscordClientID     string
		DiscordClientSecret string
		FrontendUri         string
	)
	if DiscordClientID, ok = os.LookupEnv("DISCORD_CLIENT_ID"); !ok || DiscordClientID == "" {
		return nil, errors.New("DISCORD_CLIENT_ID not set")
	}
	if DiscordClientSecret, ok = os.LookupEnv("DISCORD_CLIENT_SECRET"); !ok || DiscordClientSecret == "" {
		return nil, errors.New("DISCORD_CLIENT_SECRET not set")
	}
	if FrontendUri, ok = os.LookupEnv("REACT_APP_FRONTEND_URI"); !ok || FrontendUri == "" {
		return nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	return &oauth2.Config{
		ClientID:     DiscordClientID,
		ClientSecret: DiscordClientSecret,
		Endpoint:     Endpoint,
		RedirectURL:  FrontendUri + "/callback/discord",
	}, nil
}

func OAuth(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, err := oauthConfig()

	if err != nil {
		return nil, err
	}
	return conf.Exchange(ctx, code)
}
