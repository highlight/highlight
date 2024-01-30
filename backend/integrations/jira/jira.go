package jira

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	nUrl "net/url"
	"os"
	"strings"
	"time"

	"golang.org/x/exp/slices"
	"golang.org/x/oauth2"

	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

var (
	JiraClientId     = os.Getenv("JIRA_CLIENT_ID")
	JiraClientSecret = os.Getenv("JIRA_CLIENT_SECRET")
	JiraAuthBaseUrl  = "https://auth.atlassian.com"
	JiraApiBaseUrl   = "https://api.atlassian.com"
)

var jiraEndpoint = oauth2.Endpoint{
	AuthURL:   fmt.Sprintf("%s/oauth/authorize", JiraAuthBaseUrl),
	TokenURL:  fmt.Sprintf("%s/oauth/token", JiraAuthBaseUrl),
	AuthStyle: oauth2.AuthStyleInParams,
}

type JiraTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
}

type JiraIssue struct {
	Id   string `json:"id"`
	Key  string `json:"key"`
	Self string `json:"self"`
}

type JiraIssueProjectData struct {
	Id string `json:"id"`
}

type JiraIssueTypeData struct {
	Id string `json:"id"`
}

type JiraCreateIssueFields struct {
	Description string               `json:"description"`
	Summary     string               `json:"summary"`
	Project     JiraIssueProjectData `json:"project"`
	IssueType   JiraIssueTypeData    `json:"issuetype"`
}

type JiraCreateIssuePayload struct {
	Fields JiraCreateIssueFields `json:"fields"`
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

	return &oauth2.Config{
		ClientID:     jiraClientID,
		ClientSecret: jiraClientSecret,
		Endpoint:     jiraEndpoint,
		RedirectURL:  fmt.Sprintf("%s/callback/jira", frontendUri),
	}, []oauth2.AuthCodeOption{}, nil
}

func GetAccessToken(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, opts, err := GetOAuthConfig()

	if err != nil {
		return nil, err
	}

	return conf.Exchange(ctx, code, opts...)
}

func doJiraPostRequest[TOut any, TIn any](accessToken string, url string, input TIn) (TOut, error) {
	var zero TOut
	b, err := json.Marshal(input)
	if err != nil {
		return zero, err
	}

	return doJiraRequest[TOut]("POST", accessToken, url, string(b))
}

func doJiraGetRequest[T any](accessToken string, url string) (T, error) {
	return doJiraRequest[T]("GET", accessToken, url, "")
}

func doJiraRequest[T any](method string, accessToken string, url string, body string) (T, error) {
	var unmarshalled T
	client := &http.Client{}

	// code to tell whether we are using absoluteUrl or relative url
	var finalUrl = fmt.Sprintf("%s%s", JiraApiBaseUrl, url)
	parsedUrl, err := nUrl.Parse(url)

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error parsing url") // this really should not happen
	}

	if parsedUrl.IsAbs() {
		finalUrl = url
	}

	req, err := http.NewRequest(method, finalUrl, strings.NewReader(body))
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error creating api request to Jira")
	}

	if accessToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	}
	if method != "GET" {
		req.Header.Set("Content-Type", "application/json")
	}

	res, err := client.Do(req)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error getting response from jira endpoint")
	}

	b, err := io.ReadAll(res.Body)
	if res.StatusCode != 200 && res.StatusCode != 201 {
		return unmarshalled, errors.New("Jira API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error reading response body from jira endpoint")
	}

	err = json.Unmarshal(b, &unmarshalled)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error unmarshaling jira api response"+string(b))
	}

	return unmarshalled, nil
}

func getJiraSiteFromAccessibleResources(responses []*modelInputs.AccessibleJiraResources) (*modelInputs.AccessibleJiraResources, error) {
	var JiraSite *modelInputs.AccessibleJiraResources
	jiraIdentifier := "write:jira-work"
	for _, site := range responses {
		if slices.Contains(site.Scopes, jiraIdentifier) {
			return site, nil
		}
	}
	return JiraSite, errors.New("No jira site found")
}

func GetJiraSite(accessToken string) (*modelInputs.AccessibleJiraResources, error) {
	url := "/oauth/token/accessible-resources"
	res, err := doJiraGetRequest[[]*modelInputs.AccessibleJiraResources](accessToken, url)

	if err != nil {
		return nil, err
	}

	return getJiraSiteFromAccessibleResources(res)
}

func GetJiraIssueCreateMeta(accessToken string, cloudID string) ([]*modelInputs.JiraProject, error) {
	type listsResponse struct {
		Projects []*modelInputs.JiraProject `json:"projects"`
	}
	url := fmt.Sprintf("/ex/jira/%s/rest/api/2/issue/createmeta", cloudID)
	res, err := doJiraGetRequest[listsResponse](accessToken, url)
	if err != nil {
		return nil, err
	}

	return res.Projects, nil
}

func GetJiraProjects(workspace *model.Workspace, accessToken string) ([]*modelInputs.JiraProject, error) {
	return GetJiraIssueCreateMeta(accessToken, *workspace.JiraCloudID)
}

func MakeExternalIdForJiraTask(workspace *model.Workspace, issue *JiraIssue) string {
	url := fmt.Sprintf("%s/browse/%s", *workspace.JiraDomain, issue.Key)
	return url
}

func CreateJiraTask(workspace *model.Workspace, accessToken string, payload JiraCreateIssuePayload) (*JiraIssue, error) {
	url := fmt.Sprintf("/ex/jira/%s/rest/api/2/issue", *workspace.JiraCloudID)
	res, err := doJiraPostRequest[*JiraIssue](accessToken, url, payload)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func GetRefreshToken(ctx context.Context, oldToken *oauth2.Token) (*oauth2.Token, error) {
	conf, _, err := GetOAuthConfig()
	if err != nil {
		return nil, err
	}

	payload := struct {
		GrantType    string `json:"grant_type"`
		ClientId     string `json:"client_id"`
		ClientSecret string `json:"client_secret"`
		RefreshToken string `json:"refresh_token"`
	}{
		GrantType:    "refresh_token",
		ClientId:     conf.ClientID,
		ClientSecret: conf.ClientSecret,
		RefreshToken: oldToken.RefreshToken,
	}

	response, err := doJiraPostRequest[*JiraTokenResponse]("", jiraEndpoint.TokenURL, payload)
	if err != nil {
		return nil, err
	}

	newToken := &oauth2.Token{
		AccessToken:  response.AccessToken,
		RefreshToken: response.RefreshToken,
		Expiry:       time.Now().Add(time.Duration(response.ExpiresIn) * time.Second),
	}

	return newToken, nil
}
