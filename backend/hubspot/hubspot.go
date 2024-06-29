package hubspot

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"io"
	"net/http"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

var (
	OAuthToken = env.Config.HubspotOAuthToken
	APIKey     = env.Config.HubspotApiKey
	// CookieString and CSRFToken are reverse engineered from the frontend request flow.
	// they only need to be set for the doppelgänger functionality.
	CookieString = env.Config.HubspotCookieString
	CSRFToken    = env.Config.HubspotCsrfToken
)

type QSParam struct {
	key   string
	value string
}

func doRequest(ctx context.Context, url string, result interface{}, params []QSParam, method string, b io.Reader) error {
	for {
		req, _ := http.NewRequest(method, fmt.Sprintf("https://api.hubapi.com%s", url), b)
		req.Header.Add("Accept", "application/json")
		req.Header.Add("Content-Type", "application/json")
		req.Header.Add("Authorization", "Bearer "+OAuthToken)
		q := req.URL.Query()
		q.Add("hapikey", APIKey)
		for _, p := range params {
			q.Add(p.key, p.value)
		}
		// for doppelgänger requests
		if CookieString != "" {
			for _, s := range strings.Split(CookieString, "; ") {
				val := strings.Split(s, "=")
				k, v := val[0], val[1]
				req.AddCookie(&http.Cookie{Name: k, Value: v})
			}
		}
		// for doppelgänger requests
		if CSRFToken != "" {
			req.Header.Add("X-Hubspot-Csrf-Hubspotapi", CSRFToken)
		}
		req.URL.RawQuery = q.Encode()

		httpClient := http.Client{}
		resp, err := httpClient.Do(req)
		if err != nil {
			return err
		}
		defer func(Body io.ReadCloser) {
			_ = Body.Close()
		}(resp.Body)

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}

		if result != nil {
			err = json.Unmarshal(body, &result)
			if err != nil {
				return err
			}
		}

		if resp.StatusCode != 200 && resp.StatusCode != 204 {
			if resp.StatusCode == 429 && strings.Contains(string(body), "RATE_LIMIT") {
				log.WithContext(ctx).WithField("body", string(body)).Warn("hit hubspot rate limit")
				time.Sleep(10 * time.Second)
				continue
			}
			return fmt.Errorf("HubSpot API error: %d - %s \n%s", resp.StatusCode, resp.Status, string(body))
		}
		return nil
	}
}
