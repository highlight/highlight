package clickup

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"io"
	"net/http"
	"strings"

	"golang.org/x/oauth2"

	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const ApiBaseUrl = "https://api.clickup.com/api/v2"

var clickUpEndpoint = oauth2.Endpoint{
	AuthURL:   fmt.Sprintf("%s/oauth/authorize", ApiBaseUrl),
	TokenURL:  fmt.Sprintf("%s/oauth/token", ApiBaseUrl),
	AuthStyle: oauth2.AuthStyleInParams,
}

type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
}

func oauthConfig() (*oauth2.Config, error) {
	if env.Config.ClickUpClientID == "" {
		return nil, errors.New("CLICKUP_CLIENT_ID not set")
	}
	if env.Config.ClickUpClientSecret == "" {
		return nil, errors.New("CLICKUP_CLIENT_SECRET not set")
	}
	if env.Config.FrontendUri == "" {
		return nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	return &oauth2.Config{
		ClientID:     env.Config.ClickUpClientID,
		ClientSecret: env.Config.ClickUpClientSecret,
		Endpoint:     clickUpEndpoint,
		RedirectURL:  fmt.Sprintf("%s/callback/clickup", env.Config.FrontendUri),
	}, nil
}

func GetAccessToken(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, err := oauthConfig()

	if err != nil {
		return nil, err
	}
	return conf.Exchange(ctx, code)
}

func doClickUpPostRequest[TOut any, TIn any](accessToken string, relativeUrl string, input TIn) (TOut, error) {
	var zero TOut
	b, err := json.Marshal(input)
	if err != nil {
		return zero, err
	}

	return doClickUpRequest[TOut]("POST", accessToken, relativeUrl, string(b))
}

func doClickUpGetRequest[T any](accessToken string, relativeUrl string) (T, error) {
	return doClickUpRequest[T]("GET", accessToken, relativeUrl, "")
}

func doClickUpRequest[T any](method string, accessToken string, relativeUrl string, body string) (T, error) {
	var unmarshalled T
	client := &http.Client{}

	req, err := http.NewRequest(method, fmt.Sprintf("%s%s", ApiBaseUrl, relativeUrl), strings.NewReader(body))
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error creating api request to ClickUp")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	if method != "GET" {
		req.Header.Set("Content-Type", "application/json")
	}

	res, err := client.Do(req)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error getting response from ClickUp Teams endpoint")
	}

	b, err := io.ReadAll(res.Body)
	if res.StatusCode != 200 {
		return unmarshalled, errors.New("ClickUp API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error reading response body from ClickUp Teams endpoint")
	}

	err = json.Unmarshal(b, &unmarshalled)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error unmarshaling ClickUp folders response")
	}

	return unmarshalled, nil
}

func GetFolders(accessToken string, spaceId string) ([]*model.ClickUpFolder, error) {
	type foldersResponse struct {
		Folders []*model.ClickUpFolder `json:"folders"`
	}
	res, err := doClickUpGetRequest[foldersResponse](accessToken, fmt.Sprintf("/space/%s/folder", spaceId))
	if err != nil {
		return nil, err
	}

	return res.Folders, nil
}

func GetFolderlessLists(accessToken string, spaceId string) ([]*model.ClickUpList, error) {
	type listsResponse struct {
		Lists []*model.ClickUpList `json:"lists"`
	}
	res, err := doClickUpGetRequest[listsResponse](accessToken, fmt.Sprintf("/space/%s/list", spaceId))
	if err != nil {
		return nil, err
	}

	return res.Lists, nil
}

func GetSpaces(accessToken string, teamId string) ([]*model.ClickUpSpace, error) {
	type spacesResponse struct {
		Spaces []*model.ClickUpSpace `json:"spaces"`
	}
	res, err := doClickUpGetRequest[spacesResponse](accessToken, fmt.Sprintf("/team/%s/space", teamId))
	if err != nil {
		return nil, err
	}

	return res.Spaces, nil
}

func GetTeams(accessToken string) ([]*model.ClickUpTeam, error) {
	type teamsResponse struct {
		Teams []*model.ClickUpTeam `json:"teams"`
	}
	res, err := doClickUpGetRequest[teamsResponse](accessToken, "/team")
	if err != nil {
		return nil, err
	}

	return res.Teams, nil
}

func CreateTask(accessToken string, listId string, name string, description string) (*model.ClickUpTask, error) {
	input := struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}{Name: name, Description: description}
	res, err := doClickUpPostRequest[*model.ClickUpTask](accessToken, fmt.Sprintf("/list/%s/task", listId), input)
	if err != nil {
		return nil, err
	}

	return res, nil
}
