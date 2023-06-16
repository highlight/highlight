package lambda

import (
	"context"
	"fmt"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"

	"github.com/highlight-run/highlight/backend/model"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/pkg/errors"
)

const (
	NilPayloadHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
)

type ServiceType string

const (
	ExecuteAPI ServiceType = "execute-api"
	LambdaAPI  ServiceType = "lambda"
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
		HTTPClient: &http.Client{
			Timeout: 5 * time.Minute,
		},
	}, nil
}

type Format = string

var (
	FormatImage = "image/png"
	FormatGIF   = "image/gif"
	FormatMP4   = "video/mp4"
)

func (s *Client) GetSessionScreenshot(ctx context.Context, projectID int, sessionID int, ts *int, chunk *int, format *Format) (*http.Response, error) {
	host := "https://ygh5bj5f646ix4pixknhvysrje0haeoi.lambda-url.us-east-2.on.aws"
	url := fmt.Sprintf("%s/session-screenshots?project=%d&session=%d", host, projectID, sessionID)
	if ts != nil {
		url = fmt.Sprintf("%s&ts=%d", url, *ts)
	}
	if chunk != nil {
		url = fmt.Sprintf("%s&chunk=%d", url, *chunk)
	}
	if format != nil {
		url = fmt.Sprintf("%s&format=%s", url, *format)
	}
	log.WithContext(ctx).Infof("requesting session screenshot for %s", url)

	req, _ := http.NewRequest(http.MethodGet, url, nil)
	req = req.WithContext(ctx)

	signer := v4.NewSigner()
	if err := signer.SignHTTP(ctx, *s.Credentials, req, NilPayloadHash, string(LambdaAPI), "us-east-2", time.Now()); err != nil {
		return nil, err
	}
	return s.HTTPClient.Do(req)
}
