package height

import (
	"context"
	"fmt"
	"os"

	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/pkg/errors"

	"golang.org/x/oauth2"
)

var (
	HeightClientId     = os.Getenv("HEIGHT_CLIENT_ID")
	HeightClientSecret = os.Getenv("HEIGHT_CLIENT_SECRET")
	HeightApiBaseUrl   = "https://api.height.app"
)

var heightEndpoint = oauth2.Endpoint{
	AuthURL:   fmt.Sprintf("%s/oauth/tokens", HeightApiBaseUrl),
	TokenURL:  fmt.Sprintf("%s/oauth/tokens", HeightApiBaseUrl),
	AuthStyle: oauth2.AuthStyleInParams,
}

type HeightAccessTokenResponse struct {
	AccessToken string `json:"access_token"`
}

func oauthConfig() (*oauth2.Config, error) {
	var (
		ok                 bool
		heightClientID     string
		heightClientSecret string
		frontendUri        string
	)
	if heightClientID, ok = os.LookupEnv("HEIGHT_CLIENT_ID"); !ok || heightClientID == "" {
		return nil, errors.New("HEIGHT_CLIENT_ID not set")
	}
	if heightClientSecret, ok = os.LookupEnv("HEIGHT_CLIENT_SECRET"); !ok || heightClientSecret == "" {
		return nil, errors.New("HEIGHT_CLIENT_SECRET not set")
	}
	if frontendUri, ok = os.LookupEnv("REACT_APP_FRONTEND_URI"); !ok || frontendUri == "" {
		return nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	return &oauth2.Config{
		ClientID:     heightClientID,
		ClientSecret: heightClientSecret,
		Endpoint:     heightEndpoint,
		RedirectURL:  fmt.Sprintf("%s/callback/height", frontendUri),
	}, nil
}

func GetAccessToken(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, err := oauthConfig()

	if err != nil {
		return nil, err
	}

	// Height expects an array here but the oauth2 spec says this should be a string
	param := oauth2.SetAuthURLParam("scope", `["api"]`)

	return conf.Exchange(ctx, code, param)
}

func GetWorkspaces(accessToken string) ([]*model.HeightWorkspace, error) {
	workspaces := []*model.HeightWorkspace{}

	workspaces = append(workspaces, &model.HeightWorkspace{
		ID:    "uuid",
		Model: "workspace",
		Name:  "My workspace",
		URL:   "https://height.app/abc123456",
	})

	return workspaces, nil
}
