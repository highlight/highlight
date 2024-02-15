package front

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type OAuthToken struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresAt    int64  `json:"expires_at"`
}

// RefreshOAuth will refresh the OAuthToken if it has expired..
func RefreshOAuth(ctx context.Context, currentOAuth *OAuthToken) (*OAuthToken, error) {
	exp := time.Unix(currentOAuth.ExpiresAt, 0)
	if time.Now().After(exp) {
		return OAuth(ctx, "", currentOAuth)
	}
	return currentOAuth, nil
}

// OAuth will return the oauth tokens based on either the code or refresh token provided.
func OAuth(ctx context.Context, code string, currentOAuth *OAuthToken) (*OAuthToken, error) {
	var (
		ok                bool
		FrontClientID     string
		FrontClientSecret string
	)

	if FrontClientID, ok = os.LookupEnv("FRONT_CLIENT_ID"); !ok || FrontClientID == "" {
		return nil, e.New("FRONT_CLIENT_ID not set")
	}
	if FrontClientSecret, ok = os.LookupEnv("FRONT_CLIENT_SECRET"); !ok || FrontClientSecret == "" {
		return nil, e.New("FRONT_CLIENT_SECRET not set")
	}

	form := url.Values{}
	if currentOAuth != nil {
		form.Add("refresh_token", currentOAuth.RefreshToken)
		form.Add("grant_type", "refresh_token")
	} else {
		redirect := os.Getenv("REACT_APP_FRONTEND_URI") + "/callback/front"
		form.Add("code", code)
		form.Add("redirect_uri", redirect)
		form.Add("grant_type", "authorization_code")
	}

	req, err := http.NewRequest("POST", "https://app.frontapp.com/oauth/token", strings.NewReader(form.Encode()))
	if err != nil {
		return nil, e.Wrap(err, "failed to create front oauth http request")
	}
	req.SetBasicAuth(FrontClientID, FrontClientSecret)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	c := &http.Client{}
	resp, err := c.Do(req)
	if err != nil {
		return nil, e.Wrap(err, "failed to send front oauth http request")
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.WithContext(ctx).Errorf("failed to close front response body: %s", err)
		}
	}(resp.Body)

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, e.Wrap(err, "failed to read front oauth http request")
	}

	var response OAuthToken
	if err := json.Unmarshal(data, &response); err != nil {
		return nil, e.Wrap(err, "failed to json unmarshal front oauth http request")
	}

	return &response, nil
}
