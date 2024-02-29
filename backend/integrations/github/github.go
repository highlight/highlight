package github

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/bradleyfalzon/ghinstallation/v2"
	"github.com/google/go-github/v50/github"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
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

type ClientInterface interface {
	CreateIssue(ctx context.Context, repo string, issueRequest *github.IssueRequest) (*github.Issue, error)
	ListLabels(ctx context.Context, repo string) ([]*github.Label, error)
	ListRepos(ctx context.Context) ([]*github.Repository, error)
	DeleteInstallation(ctx context.Context, installation string) error
	GetRepoContent(ctx context.Context, githubPath string, path string, version string) (fileContent *github.RepositoryContent, directoryContent []*github.RepositoryContent, resp *github.Response, err error)
	GetRepoBlob(ctx context.Context, githubPath string, blobSHA string) (*github.Blob, *github.Response, error)
	GetLatestCommitHash(ctx context.Context, githubPath string) (string, *github.Response, error)
	SearchIssues(ctx context.Context, rawQuery string) ([]*github.Issue, error)
}

type Client struct {
	client *github.Client
	// the regular client can authenticate all calls except `Apps.Get()` and `Apps.GetInstallation()`
	// for those two methods, use the jwtClient
	jwtClient *github.Client
	// unique identifier of the GitHub app installation
	installationID int64
	redis          *redis.Client
}

// NewClient creates a GitHub client using the installation workflow (https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation).
// installation corresponds to the numeric installation ID provided by the installation setup workflow.
// On its own, the installation ID does not provide access to any GitHub resources, but when
// paired with the app ID and private key, allows us to access a particular organization's entities.
func NewClient(ctx context.Context, installation string, redis *redis.Client) (*Client, error) {

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

	return &Client{client, jwtClient, installationID, redis}, nil
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

func (c *Client) GetInstallationOwner(ctx context.Context) (*string, error) {
	// TODO: this should never change for an installation, so we can look into moving this into postgres
	return redis.CachedEval(ctx, c.redis, fmt.Sprintf("github-installation-owner-%d", c.installationID), 5*time.Second, 24*time.Hour, func() (*string, error) {
		install, _, err := c.jwtClient.Apps.GetInstallation(ctx, c.installationID)
		if err != nil {
			return nil, err
		}

		owner := install.GetAccount().GetLogin()

		return &owner, nil
	})
}

func (c *Client) CreateIssue(ctx context.Context, repo string, issueRequest *github.IssueRequest) (*github.Issue, error) {
	owner, err := c.GetInstallationOwner(ctx)
	if err != nil {
		return nil, err
	}

	issue, _, err := c.client.Issues.Create(ctx, *owner, repo, issueRequest)
	return issue, err
}

func (c *Client) ListLabels(ctx context.Context, repo string) ([]*github.Label, error) {
	return getPaginated(func(page int) ([]*github.Label, *int, *bool, error) {
		owner, err := c.GetInstallationOwner(ctx)
		if err != nil {
			return nil, nil, nil, err
		}

		list, _, err := c.client.Issues.ListLabels(ctx, *owner, repo, &github.ListOptions{Page: page})
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

func (c *Client) GetRepoContent(ctx context.Context, githubPath string, path string, version string) (fileContent *github.RepositoryContent, directoryContent []*github.RepositoryContent, resp *github.Response, err error) {
	repoPath := strings.Split(githubPath, "/")
	opts := new(github.RepositoryContentGetOptions)
	opts.Ref = version
	return c.client.Repositories.GetContents(ctx, repoPath[0], repoPath[1], path, opts)
}

func (c *Client) GetRepoBlob(ctx context.Context, githubPath string, blobSHA string) (*github.Blob, *github.Response, error) {
	repoPath := strings.Split(githubPath, "/")
	return c.client.Git.GetBlob(ctx, repoPath[0], repoPath[1], blobSHA)
}

func (c *Client) GetLatestCommitHash(ctx context.Context, githubPath string) (string, *github.Response, error) {
	repoPath := strings.Split(githubPath, "/")
	return c.client.Repositories.GetCommitSHA1(ctx, repoPath[0], repoPath[1], "HEAD", "")
}

func (c *Client) SearchIssues(ctx context.Context, rawQuery string) ([]*github.Issue, error) {
	owner, err := c.GetInstallationOwner(ctx)
	if err != nil {
		return nil, err
	}

	query := fmt.Sprintf("owner:%s %s", *owner, rawQuery)

	rearch_result, _, err := c.client.Search.Issues(ctx, query, &github.SearchOptions{})
	return rearch_result.Issues, err
}
