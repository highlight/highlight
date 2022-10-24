package clickup

import (
	"context"
	"fmt"
	"os"

	"github.com/pkg/errors"
	"golang.org/x/oauth2"
)

var (
	ClickUpClientId     = os.Getenv("CLICKUP_CLIENT_ID")
	ClickUpClientSecret = os.Getenv("CLICKUP_CLIENT_SECRET")
	ClickUpApiBaseUrl   = "https://api.clickup.com/api"
)

var clickUpEndpoint = oauth2.Endpoint{
	AuthURL:   fmt.Sprintf("%s/oauth2/authorize", ClickUpApiBaseUrl),
	TokenURL:  fmt.Sprintf("%s/oauth2/token", ClickUpApiBaseUrl),
	AuthStyle: oauth2.AuthStyleInParams,
}

type ClickUpAccessTokenResponse struct {
	AccessToken string `json:"access_token"`
}

func oauthConfig() (*oauth2.Config, error) {
	var (
		ok                  bool
		clickUpClientID     string
		clickUpClientSecret string
		frontendUri         string
	)
	if clickUpClientID, ok = os.LookupEnv("CLICKUP_CLIENT_ID"); !ok || clickUpClientID == "" {
		return nil, errors.New("CLICKUP_CLIENT_ID not set")
	}
	if clickUpClientSecret, ok = os.LookupEnv("CLICKUP_CLIENT_SECRET"); !ok || clickUpClientSecret == "" {
		return nil, errors.New("CLICKUP_CLIENT_SECRET not set")
	}
	if frontendUri, ok = os.LookupEnv("REACT_APP_FRONTEND_URI"); !ok || frontendUri == "" {
		return nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	return &oauth2.Config{
		ClientID:     clickUpClientID,
		ClientSecret: clickUpClientSecret,
		Endpoint:     clickUpEndpoint,
		RedirectURL:  fmt.Sprintf("%s/callback/clickup", frontendUri),
	}, nil
}

func GetAccessToken(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, err := oauthConfig()

	if err != nil {
		return nil, err
	}
	return conf.Exchange(ctx, code)
}
