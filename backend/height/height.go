package height

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

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

func doPostRequest[TOut any, TIn any](accessToken string, relativeUrl string, input TIn) (TOut, error) {
	var zero TOut
	b, err := json.Marshal(input)
	if err != nil {
		return zero, err
	}

	return doRequest[TOut]("POST", accessToken, relativeUrl, string(b))
}

func doGetRequest[T any](accessToken string, relativeUrl string) (T, error) {
	return doRequest[T]("GET", accessToken, relativeUrl, "")
}

func doRequest[T any](method string, accessToken string, relativeUrl string, body string) (T, error) {
	var unmarshalled T
	client := &http.Client{}

	req, err := http.NewRequest(method, fmt.Sprintf("%s%s", HeightApiBaseUrl, relativeUrl), strings.NewReader(body))
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error creating api request to Height")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	if method != "GET" {
		req.Header.Set("Content-Type", "application/json")
	}

	res, err := client.Do(req)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error getting response from Height endpoint")
	}

	b, err := io.ReadAll(res.Body)
	if res.StatusCode != 200 {
		return unmarshalled, errors.New("Height API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error reading response body from ClickUp endpoint")
	}

	err = json.Unmarshal(b, &unmarshalled)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error unmarshaling Height response")
	}

	return unmarshalled, nil
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
	// https://www.notion.so/Retrieve-the-workspace-33edc907797d4c8ab39fe10ed38a9549

	res, err := doGetRequest[*model.HeightWorkspace](accessToken, "/workspace")

	if err != nil {
		return nil, err
	}

	// Even though we can only fetch one workspace, force it into a slice for future compatability
	return []*model.HeightWorkspace{res}, nil

}
