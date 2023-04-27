package github

import (
	"context"
	"github.com/bradleyfalzon/ghinstallation/v2"
	"github.com/google/go-github/v50/github"
	"github.com/openlyinc/pointy"
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

func parseInstallation(installation string) (int64, error) {
	installationID, err := strconv.ParseInt(installation, 10, 64)
	if err != nil {
		return 0, err
	}
	return installationID, nil
}

type Client struct {
	client *github.Client
	// the regular client can authenticate all calls except `Apps.Get()` and `Apps.GetInstallation()`
	// for those two methods, use the jwtClient
	jwtClient *github.Client
	// owner is the login of the organization where the app is installed
	owner string
}

// NewClient creates a GitHub client using the installation workflow (https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation).
// installation corresponds to the numeric installation ID provided by the installation setup workflow.
// On its own, the installation ID does not provide access to any GitHub resources, but when
// paired with the app ID and private key, allows us to access a particular organization's entities.
func NewClient(ctx context.Context, installation string) (*Client, error) {
	installationID, err := parseInstallation(installation)
	if err != nil {
		return nil, err
	}

	config, err := GetConfig()
	if err != nil {
		return nil, err
	}

	appID, err := strconv.ParseInt(config.githubAppId, 10, 64)
	if err != nil {
		return nil, err
	}

	// we use an app installation workflow to get access to the 'organization' into which
	// an app is installed. if we went with an oauth workflow, we would only have access
	// to the repositories the installing user owns.
	// see https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
	jwtTransport, err := ghinstallation.NewAppsTransport(http.DefaultTransport, appID, []byte(config.githubPrivateKey))
	if err != nil {
		return nil, err
	}

	itt := ghinstallation.NewFromAppsTransport(jwtTransport, installationID)

	// a workaround from https://github.com/bradleyfalzon/ghinstallation/issues/39
	client := github.NewClient(&http.Client{Transport: itt})
	jwtClient := github.NewClient(&http.Client{Transport: jwtTransport})

	install, _, err := jwtClient.Apps.GetInstallation(ctx, installationID)
	if err != nil {
		return nil, err
	}

	return &Client{client, jwtClient, install.Account.GetLogin()}, nil
}

func getPaginated[T any](fn func(int) ([]T, *int, *bool, error)) (data []T, err error) {
	page := 1
	for {
		list, totalCount, hasNext, err := fn(page)
		if err != nil {
			return nil, err
		}
		data = append(data, list...)
		if totalCount != nil && len(data) >= *totalCount {
			break
		}
		if hasNext != nil && !*hasNext {
			break
		}
		page += 1
	}
	return
}

func (c *Client) CreateIssue(ctx context.Context, repo string, issueRequest *github.IssueRequest) (*github.Issue, error) {
	issue, _, err := c.client.Issues.Create(ctx, c.owner, repo, issueRequest)
	return issue, err
}

func (c *Client) ListLabels(ctx context.Context, repo string) ([]*github.Label, error) {
	return getPaginated(func(page int) ([]*github.Label, *int, *bool, error) {
		list, _, err := c.client.Issues.ListLabels(ctx, c.owner, repo, &github.ListOptions{Page: page})
		if err != nil {
			return nil, nil, nil, err
		}
		return list, nil, pointy.Bool(len(list) > 0), nil
	})
}

func (c *Client) ListRepos(ctx context.Context) (repos []*github.Repository, err error) {
	return getPaginated(func(page int) ([]*github.Repository, *int, *bool, error) {
		list, _, err := c.client.Apps.ListRepos(ctx, &github.ListOptions{Page: page})
		if err != nil {
			return nil, nil, nil, err
		}
		return list.Repositories, pointy.Int(list.GetTotalCount()), nil, nil
	})
}

func (c *Client) DeleteInstallation(ctx context.Context, installation string) error {
	installationID, err := parseInstallation(installation)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create github client")
		return nil
	}

	_, err = c.jwtClient.Apps.DeleteInstallation(ctx, installationID)
	return err
}
