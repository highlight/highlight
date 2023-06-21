package lambda

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/highlight-run/highlight/backend/model"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	log "github.com/sirupsen/logrus"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/pkg/errors"
)

const (
	NilPayloadHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
)

type ServiceType string

const (
	ExecuteAPI ServiceType = "execute-api"
)

type Client struct {
	Config      *aws.Config
	Credentials *aws.Credentials
	HTTPClient  *http.Client
}

func NewLambdaClient() (*Client, error) {
	ctx := context.TODO()
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(model.AWS_REGION_US_EAST_2))
	if err != nil {
		return nil, errors.Wrap(err, "error loading default from config")
	}

	creds, err := cfg.Credentials.Retrieve(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error loading lambda credentials")
	}

	return &Client{
		Config:      &cfg,
		Credentials: &creds,
		HTTPClient:  &http.Client{},
	}, nil
}

func (s *Client) GetSessionScreenshot(ctx context.Context, projectID int, sessionID int, ts int, chunk int) (*http.Response, error) {
	log.WithContext(ctx).Infof("requesting session screenshot for project=%d&session=%d&ts=%d&chunk=%d", projectID, sessionID, ts, chunk)
	req, _ := http.NewRequest(http.MethodGet, fmt.Sprintf("https://zbty37wu02.execute-api.us-east-2.amazonaws.com/default/session-screenshots?project=%d&session=%d&ts=%d&chunk=%d", projectID, sessionID, ts, chunk), nil)
	req = req.WithContext(ctx)

	signer := v4.NewSigner()
	_ = signer.SignHTTP(ctx, *s.Credentials, req, NilPayloadHash, string(ExecuteAPI), s.Config.Region, time.Now())
	return s.HTTPClient.Do(req)
}
