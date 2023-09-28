package jira

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/pkg/errors"
	"golang.org/x/oauth2"
)

var (
	JiraClientId     = os.Getenv("JIRA_CLIENT_ID")
	JiraClientSecret = os.Getenv("JIRA_CLIENT_SECRET")
	JiraApiBaseUrl   = "https://auth.atlassian.com"
)

var jiraEndpoint = oauth2.Endpoint{
	AuthURL:   fmt.Sprintf("%s/oauth/authorize", JiraApiBaseUrl),
	TokenURL:  fmt.Sprintf("%s/oauth/token?grant_type=client_credentials", JiraApiBaseUrl),
	AuthStyle: oauth2.AuthStyleInParams,
}

type JiraAccessTokenResponse struct {
	AccessToken string `json:"access_token"`
}

func GetOAuthConfig() (*oauth2.Config, []oauth2.AuthCodeOption, error) {
	var (
		ok               bool
		jiraClientID     string
		jiraClientSecret string
		frontendUri      string
	)
	if jiraClientID, ok = os.LookupEnv("JIRA_CLIENT_ID"); !ok || jiraClientID == "" {
		return nil, nil, errors.New("JIRA_CLIENT_ID not set")
	}
	if jiraClientSecret, ok = os.LookupEnv("JIRA_CLIENT_SECRET"); !ok || jiraClientSecret == "" {
		return nil, nil, errors.New("JIRA_CLIENT_SECRET not set")
	}
	if frontendUri, ok = os.LookupEnv("REACT_APP_FRONTEND_URI"); !ok || frontendUri == "" {
		return nil, nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	option := oauth2.SetAuthURLParam("grant_type", "client_credentials")
	options := []oauth2.AuthCodeOption{
		option,
	}

	return &oauth2.Config{
		ClientID:     jiraClientID,
		ClientSecret: jiraClientSecret,
		Endpoint:     jiraEndpoint,
		RedirectURL:  fmt.Sprintf("%s/callback/jira", frontendUri),
	}, options, nil
}

func GetAccessToken(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, opts, err := GetOAuthConfig()

	if err != nil {
		return nil, err
	}

	// grantType := oauth2.SetAuthURLParam("grant_type", "client_credentials")
	return conf.Exchange(ctx, code, opts...)
}

func doJiraPostRequest[TOut any, TIn any](accessToken string, relativeUrl string, input TIn) (TOut, error) {
	var zero TOut
	b, err := json.Marshal(input)
	if err != nil {
		return zero, err
	}

	return doJiraRequest[TOut]("POST", accessToken, relativeUrl, string(b))
}

func doJiraGetRequest[T any](accessToken string, relativeUrl string) (T, error) {
	return doJiraRequest[T]("GET", accessToken, relativeUrl, "")
}

func doJiraRequest[T any](method string, accessToken string, relativeUrl string, body string) (T, error) {
	var unmarshalled T
	client := &http.Client{}

	req, err := http.NewRequest(method, fmt.Sprintf("%s%s", JiraApiBaseUrl, relativeUrl), strings.NewReader(body))
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error creating api request to Jira")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	if method != "GET" {
		req.Header.Set("Content-Type", "application/json")
	}

	res, err := client.Do(req)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error getting response from jira endpoint")
	}

	b, err := io.ReadAll(res.Body)
	if res.StatusCode != 200 {
		return unmarshalled, errors.New("Jira API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error reading response body from jira endpoint")
	}

	err = json.Unmarshal(b, &unmarshalled)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error unmarshaling jira api response")
	}

	return unmarshalled, nil
}
