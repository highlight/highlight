package height

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"

	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/private-graph/graph/model"

	"golang.org/x/oauth2"
)

const (
	ApiBaseUrl = "https://api.height.app"
)

var heightEndpoint = oauth2.Endpoint{
	AuthURL:   fmt.Sprintf("%s/oauth/tokens", ApiBaseUrl),
	TokenURL:  fmt.Sprintf("%s/oauth/tokens", ApiBaseUrl),
	AuthStyle: oauth2.AuthStyleInParams,
}

type HeightTokenResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
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

	req, err := http.NewRequest(method, fmt.Sprintf("%s%s", ApiBaseUrl, relativeUrl), strings.NewReader(body))
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

	statusOK := res.StatusCode >= 200 && res.StatusCode < 300
	if !statusOK {
		return unmarshalled, errors.New("Height API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error reading response body from Height endpoint")
	}

	err = json.Unmarshal(b, &unmarshalled)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error unmarshaling Height response")
	}

	return unmarshalled, nil
}

type HeightClient struct {
}

func NewHeightClient() *HeightClient {
	return &HeightClient{}
}

func GetOAuthConfig() (*oauth2.Config, []oauth2.AuthCodeOption, error) {
	if env.Config.HeightClientId == "" {
		return nil, nil, errors.New("HEIGHT_CLIENT_ID not set")
	}
	if env.Config.HeightClientSecret == "" {
		return nil, nil, errors.New("HEIGHT_CLIENT_SECRET not set")
	}
	if env.Config.FrontendUri == "" {
		return nil, nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	// scope should be a string, not an array (see https://www.rfc-editor.org/rfc/rfc6749#page-23)
	// We have an email out to Height requesting they fix this.
	option := oauth2.SetAuthURLParam("scope", `["api"]`)
	options := []oauth2.AuthCodeOption{
		option,
	}

	return &oauth2.Config{
		ClientID:     env.Config.HeightClientId,
		ClientSecret: env.Config.HeightClientSecret,
		Endpoint:     heightEndpoint,
		RedirectURL:  fmt.Sprintf("%s/callback/height", env.Config.FrontendUri),
	}, options, nil
}

func GetRefreshToken(ctx context.Context, oldToken *oauth2.Token) (*oauth2.Token, error) {
	conf, _, err := GetOAuthConfig()
	if err != nil {
		return nil, err
	}

	v := url.Values{}
	v.Add("refresh_token", oldToken.RefreshToken)
	v.Add("grant_type", "refresh_token")
	v.Add("client_id", conf.ClientID)
	v.Add("client_secret", conf.ClientSecret)
	// `redirect_uri` and `scope` should not be required to get a refresh token (see https://www.oauth.com/oauth2-servers/access-tokens/refreshing-access-tokens/)
	// We have an email out to Height requesting they fix this.
	v.Add("redirect_uri", conf.RedirectURL)
	v.Add("scope", `["api"]`)

	req, err := http.NewRequest("POST", conf.Endpoint.TokenURL, strings.NewReader(v.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create Height oauth token http request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	c := &http.Client{}
	resp, err := c.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send height oauth http request: %w", err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.WithContext(ctx).Errorf("failed to close height response body: %s", err)
		}
	}(resp.Body)

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read height oauth http request: %w", err)
	}

	var response HeightTokenResponse
	if err := json.Unmarshal(data, &response); err != nil {
		return nil, fmt.Errorf("failed to json unmarshal height oauth http request: %w", err)
	}

	newToken := oauth2.Token{
		AccessToken:  response.AccessToken,
		RefreshToken: response.RefreshToken,
		Expiry:       response.ExpiresAt,
	}

	return &newToken, nil

}

// https://www.notion.so/Retrieve-the-workspace-33edc907797d4c8ab39fe10ed38a9549
func GetWorkspaces(accessToken string) ([]*model.HeightWorkspace, error) {
	res, err := doGetRequest[*model.HeightWorkspace](accessToken, "/workspace")

	if err != nil {
		return nil, err
	}

	// Even though we can only fetch one workspace, force it into a slice for future compatability
	return []*model.HeightWorkspace{res}, nil
}

// https://www.notion.so/List-all-lists-4c0b34cbc33e49cf9fd8a77deb12d43b
func GetLists(accessToken string) ([]*model.HeightList, error) {
	type listsResponse struct {
		List []*model.HeightList `json:"list"`
	}

	res, err := doGetRequest[listsResponse](accessToken, "/lists")

	if err != nil {
		return nil, err
	}

	filteredLists := []*model.HeightList{}

	for _, list := range res.List {
		// Filter out irrelevant lists (e.g. trash or user lists)
		// See https://www.notion.so/The-list-object-fcbc598cbda7422ca518ac8e44bdde42 for other list types
		if list.Type == "list" {
			filteredLists = append(filteredLists, list)
		}
	}

	return filteredLists, nil
}

// https://www.notion.so/Create-a-task-b50565736830422684b28ae570a53a9e
func CreateTask(accessToken string, listId string, name string, description string) (*model.HeightTask, error) {
	var listIds []string
	listIds = append(listIds, listId)

	input := struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
		ListIds     []string `json:"listIds"`
	}{Name: name, Description: description, ListIds: listIds}

	type taskResponse struct {
		Name string `json:"name"`
		URL  string `json:"url"`
	}

	res, err := doPostRequest[taskResponse](accessToken, "/tasks", input)

	if err != nil {
		return nil, err
	}

	return &model.HeightTask{
		Name: res.Name,
		// The external attachment data model prepends the URL on the frontend.
		ID: strings.TrimPrefix(res.URL, "https://height.app/"),
	}, nil
}

func makeQueryParams(query string) string {
	lastActivity := time.Now().AddDate(-5, 0, 0).UTC().Format("2006-01-02T15:04:05Z")

	order := []struct {
		Column    string `json:"column"`
		Direction string `json:"direction"`
	}{
		{Column: "lastActivityAt", Direction: "DESC"},
	}

	orderStr, _ := json.Marshal(order)
	filter := map[string]interface{}{
		"lastActivityAt": map[string]interface{}{
			"gt": map[string]string{
				"date": lastActivity,
			},
		},
	}

	filterStr, _ := json.Marshal(filter)

	params := map[string]interface{}{
		"query":   query,
		"order":   string(orderStr),
		"filters": string(filterStr),
	}

	queryParams := url.Values{}
	for key, value := range params {
		queryParams.Set(key, fmt.Sprintf("%v", value))
	}
	return queryParams.Encode()
}

func SearchTask(accessToken string, query string) ([]*model.IssuesSearchResult, error) {
	type HeightTask struct {
		Name  string `json:"name"`
		URL   string `json:"url"`
		ID    string `json:"id"`
		Index int    `json:"index"`
	}

	type HeightTaskSearchResponse struct {
		List []HeightTask `json:"list"`
	}

	url := fmt.Sprintf("/tasks?%s", makeQueryParams(query))
	results, err := doGetRequest[HeightTaskSearchResponse](accessToken, url)

	if err != nil {
		return nil, err
	}

	return lo.Map(results.List, func(res HeightTask, _ int) *model.IssuesSearchResult {
		return &model.IssuesSearchResult{
			ID:       res.ID,
			Title:    fmt.Sprintf("#%d - %s", res.Index, res.Name),
			IssueURL: res.URL,
		}
	}), nil
}
