package lambda

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/hashicorp/go-retryablehttp"
	"github.com/highlight-run/highlight/backend/lambda-functions/sessionInsights/utils"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
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
	LambdaAPI  ServiceType = "lambda"
)

type Client struct {
	Config              *aws.Config
	Credentials         *aws.Credentials
	HTTPClient          *http.Client
	RetryableHTTPClient *retryablehttp.Client
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

	retryClient := retryablehttp.NewClient()
	retryClient.RetryMax = 5

	return &Client{
		Config:      &cfg,
		Credentials: &creds,
		HTTPClient: &http.Client{
			Timeout: 5 * time.Minute,
		},
		RetryableHTTPClient: retryClient,
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

	req, _ := retryablehttp.NewRequest(http.MethodGet, url, nil)
	req = req.WithContext(ctx)

	signer := v4.NewSigner()
	if err := signer.SignHTTP(ctx, *s.Credentials, req.Request, NilPayloadHash, string(LambdaAPI), "us-east-2", time.Now()); err != nil {
		return nil, err
	}
	return s.RetryableHTTPClient.Do(req)
}

func (s *Client) GetActivityGraph(ctx context.Context, eventCounts string) (*http.Response, error) {
	url := "https://4clivkkbxw5ckv6xxhyegvwajy0taeyp.lambda-url.us-east-2.on.aws/session-activity"
	req, _ := retryablehttp.NewRequest(http.MethodPost, url, strings.NewReader(eventCounts))
	req = req.WithContext(ctx)
	req.Header = http.Header{
		"Content-Type": []string{"text/plain"},
	}

	signer := v4.NewSigner()
	if err := signer.SignHTTP(ctx, *s.Credentials, req.Request, NilPayloadHash, string(LambdaAPI), "us-east-2", time.Now()); err != nil {
		return nil, err
	}
	return s.RetryableHTTPClient.Do(req)
}

func (s *Client) GetSessionInsight(ctx context.Context, projectID int, sessionID int) (*http.Response, error) {
	var req *retryablehttp.Request

	if util.IsDevEnv() {
		localReq := s.GetSessionInsightRequest(ctx, "http://localhost:8765/session/insight", 1, 232563428)
		res, localServerErr := s.HTTPClient.Do(localReq.Request)
		if localServerErr != nil {
			log.WithContext(ctx).Warnf("failed to make session insight request on local dev server: %+v", localServerErr)
			req = s.GetSessionInsightRequest(ctx, "https://ohw2ocqp0d.execute-api.us-east-2.amazonaws.com/default/ai-insights", 1, 232563428)
			return s.RetryableHTTPClient.Do(req)
		}
		return res, localServerErr
	} else {
		req = s.GetSessionInsightRequest(ctx, "https://ohw2ocqp0d.execute-api.us-east-2.amazonaws.com/default/ai-insights", projectID, sessionID)
	}
	return s.RetryableHTTPClient.Do(req)
}

func (s *Client) GetSessionInsightRequest(ctx context.Context, url string, projectID int, sessionID int) *retryablehttp.Request {
	b, _ := json.Marshal(&modelInputs.SessionQuery{
		ID:        sessionID,
		ProjectID: projectID,
	})

	req, _ := retryablehttp.NewRequest(http.MethodPost, url, bytes.NewBuffer(b))
	req = req.WithContext(ctx)
	req.Header = http.Header{
		"Content-Type": []string{"application/json"},
	}
	signer := v4.NewSigner()
	_ = signer.SignHTTP(ctx, *s.Credentials, req.Request, NilPayloadHash, string(ExecuteAPI), s.Config.Region, time.Now())
	return req
}

func (s *Client) GetSessionInsightEmailHtml(ctx context.Context, toEmail string, unsubscribeUrl string, data utils.SessionInsightsData) (string, error) {
	data.ToEmail = toEmail
	data.UnsubscribeUrl = unsubscribeUrl
	b, err := json.Marshal(data)
	if err != nil {
		return "", err
	}

	req, _ := retryablehttp.NewRequest(http.MethodPost, "https://fha2fg4du8.execute-api.us-east-2.amazonaws.com/default/session-insights-email", bytes.NewBuffer(b))
	req = req.WithContext(ctx)
	req.Header = http.Header{
		"Content-Type": []string{"application/json"},
	}
	signer := v4.NewSigner()
	_ = signer.SignHTTP(ctx, *s.Credentials, req.Request, NilPayloadHash, string(ExecuteAPI), s.Config.Region, time.Now())
	res, err := s.RetryableHTTPClient.Do(req)
	if err != nil {
		return "", err
	}

	b, err = io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}
	return string(b), nil
}
