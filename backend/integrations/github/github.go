package github

import (
	"context"
	"github.com/bradleyfalzon/ghinstallation/v2"
	"github.com/google/go-github/v50/github"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"strconv"
)

var (
	AppId        = os.Getenv("GITHUB_APP_ID")
	ClientId     = os.Getenv("GITHUB_CLIENT_ID")
	ClientSecret = os.Getenv("GITHUB_CLIENT_SECRET")
	PrivateKey   = os.Getenv("GITHUB_PRIVATE_KEY")
	ApiBaseUrl   = "https://api.github.com"
)

type Client struct {
	client *github.Client
}

func NewClient(ctx context.Context, installationID int64) (*Client, error) {
	appID, err := strconv.ParseInt(AppId, 10, 64)
	if err != nil {
		return nil, err
	}
	itr, err := ghinstallation.New(http.DefaultTransport, appID, installationID, []byte(PrivateKey))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create github client")
	}

	// Use installation transport with client.
	client := github.NewClient(&http.Client{Transport: itr})

	return &Client{client: client}, nil
}

func (c *Client) CreateIssue(ctx context.Context, owner, repo string) error {
	c.client.Issues.Create(ctx, owner, repo, &github.IssueRequest{
		Title:       nil,
		Body:        nil,
		Labels:      nil,
		Assignee:    nil,
		State:       nil,
		StateReason: nil,
		Milestone:   nil,
		Assignees:   nil,
	})

	return nil
}
