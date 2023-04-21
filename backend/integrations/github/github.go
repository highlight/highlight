package github

import (
	"context"
	"github.com/bradleyfalzon/ghinstallation/v2"
	"github.com/google/go-github/v50/github"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"strconv"
)

type Config struct {
	githubAppId      string
	githubPrivateKey string
	// not used for installation workflow, but kept in case we need an oauth workflow in the future
	githubClientID string
	// not used for installation workflow, but kept in case we need an oauth workflow in the future
	githubClientSecret string
}

func GetConfig() (*Config, error) {
	var ok bool
	var config Config
	if config.githubAppId, ok = os.LookupEnv("GITHUB_APP_ID"); !ok || config.githubAppId == "" {
		return nil, errors.New("GITHUB_APP_ID not set")
	}
	if config.githubClientID, ok = os.LookupEnv("GITHUB_CLIENT_ID"); !ok || config.githubClientID == "" {
		return nil, errors.New("GITHUB_CLIENT_ID not set")
	}
	if config.githubClientSecret, ok = os.LookupEnv("GITHUB_CLIENT_SECRET"); !ok || config.githubClientSecret == "" {
		return nil, errors.New("GITHUB_CLIENT_SECRET not set")
	}
	if config.githubPrivateKey, ok = os.LookupEnv("GITHUB_PRIVATE_KEY"); !ok || config.githubPrivateKey == "" {
		return nil, errors.New("GITHUB_PRIVATE_KEY not set")
	}

	return &config, nil
}

type Client struct {
	client *github.Client
	owner  string
}

func NewClient(ctx context.Context, installation string) *Client {
	installationID, err := strconv.ParseInt(installation, 10, 64)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create github client")
		return nil
	}

	config, err := GetConfig()
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create github client")
		return nil
	}

	appID, err := strconv.ParseInt(config.githubAppId, 10, 64)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create github client")
		return nil
	}

	// we use an app installation workflow to get access to the 'organization' into which
	// an app is installed. if we went with an oauth workflow, we would only have access
	// to the repositories the installing user owns.
	// see https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
	jwtTransport, err := ghinstallation.NewAppsTransport(http.DefaultTransport, appID, []byte(config.githubPrivateKey))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create github client")
		return nil
	}

	itt := ghinstallation.NewFromAppsTransport(jwtTransport, installationID)

	// a workaround from https://github.com/bradleyfalzon/ghinstallation/issues/39
	client := github.NewClient(&http.Client{Transport: itt})
	appsGhClient := github.NewClient(&http.Client{Transport: jwtTransport})
	// this client can authenticate all calls except `Apps.Get()`
	client.Apps = appsGhClient.Apps

	app, _, err := client.Apps.Get(ctx, "")
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create github client")
		return nil
	}

	return &Client{client, app.Owner.GetLogin()}
}

func (c *Client) CreateIssue(ctx context.Context, repo string, issueRequest *github.IssueRequest) (*github.Issue, error) {
	issue, _, err := c.client.Issues.Create(ctx, c.owner, repo, issueRequest)
	return issue, err
}

func (c *Client) GetRepos(ctx context.Context) ([]*github.Repository, error) {
	repos, _, err := c.client.Repositories.List(ctx, c.owner, &github.RepositoryListOptions{})
	return repos, err
}
