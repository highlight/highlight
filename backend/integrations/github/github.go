package github

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/go-github/v50/github"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/pkg/errors"

	"golang.org/x/oauth2"
)

var githubEndpoint = oauth2.Endpoint{
	AuthURL:   "https://github.com/login/oauth/access_token",
	TokenURL:  "https://github.com/login/oauth/access_token",
	AuthStyle: oauth2.AuthStyleInParams,
}

type GitHubTokenResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

func GetOAuthConfig() (*oauth2.Config, []oauth2.AuthCodeOption, error) {
	var (
		ok                 bool
		githubClientID     string
		githubClientSecret string
		frontendUri        string
	)
	if githubClientID, ok = os.LookupEnv("GITHUB_CLIENT_ID"); !ok || githubClientID == "" {
		return nil, nil, errors.New("GITHUB_CLIENT_ID not set")
	}
	if githubClientSecret, ok = os.LookupEnv("GITHUB_CLIENT_SECRET"); !ok || githubClientSecret == "" {
		return nil, nil, errors.New("GITHUB_CLIENT_SECRET not set")
	}
	if frontendUri, ok = os.LookupEnv("REACT_APP_FRONTEND_URI"); !ok || frontendUri == "" {
		return nil, nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	// scope should be a string, not an array (see https://www.rfc-editor.org/rfc/rfc6749#page-23)
	// We have an email out to GitHub requesting they fix this.
	option := oauth2.SetAuthURLParam("scope", `["api"]`)
	options := []oauth2.AuthCodeOption{
		option,
	}

	return &oauth2.Config{
		ClientID:     githubClientID,
		ClientSecret: githubClientSecret,
		Endpoint:     githubEndpoint,
		RedirectURL:  fmt.Sprintf("%s/callback/github", frontendUri),
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
	// We have an email out to GitHub requesting they fix this.
	v.Add("redirect_uri", conf.RedirectURL)
	v.Add("scope", `["api"]`)

	req, err := http.NewRequest("POST", conf.Endpoint.TokenURL, strings.NewReader(v.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create GitHub oauth token http request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	c := &http.Client{}
	resp, err := c.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send github oauth http request: %w", err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.WithContext(ctx).Errorf("failed to close github response body: %s", err)
		}
	}(resp.Body)

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read github oauth http request: %w", err)
	}

	var response GitHubTokenResponse
	if err := json.Unmarshal(data, &response); err != nil {
		return nil, fmt.Errorf("failed to json unmarshal github oauth http request: %w", err)
	}

	newToken := oauth2.Token{
		AccessToken:  response.AccessToken,
		RefreshToken: response.RefreshToken,
		Expiry:       response.ExpiresAt,
	}

	return &newToken, nil

}

type Client struct {
	client *github.Client
	owner  string
}

func NewClient(ctx context.Context, accessToken string) *Client {
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: accessToken},
	)
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	user, _, _ := client.Users.Get(ctx, "")
	user.GetOrganizationsURL()
	return &Client{client, *user.Login}
}

func (c *Client) CreateIssue(ctx context.Context, repo string, issueRequest *github.IssueRequest) (*github.Issue, error) {
	issue, _, err := c.client.Issues.Create(ctx, c.owner, repo, issueRequest)
	return issue, err
}

func (c *Client) GetRepos(ctx context.Context) ([]*github.Repository, error) {
	repos, _, err := c.client.Repositories.List(ctx, "", &github.RepositoryListOptions{})
	return repos, err
}
