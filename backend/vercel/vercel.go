package vercel

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/pkg/errors"
)

var (
	VercelClientId     = os.Getenv("VERCEL_CLIENT_ID")
	VercelClientSecret = os.Getenv("VERCEL_CLIENT_SECRET")
)

type VercelAccessTokenResponse struct {
	AccessToken string  `json:"access_token"`
	TeamID      *string `json:"team_id"`
}

func GetAccessToken(code string) (VercelAccessTokenResponse, error) {
	client := &http.Client{}

	redirectUri := os.Getenv("FRONTEND_URI") + "/integrations/vercel"

	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", VercelClientId)
	data.Set("client_secret", VercelClientSecret)
	data.Set("redirect_uri", redirectUri)

	accessTokenResponse := VercelAccessTokenResponse{}

	req, err := http.NewRequest("POST", "https://api.vercel.com/v2/oauth/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		return accessTokenResponse, errors.Wrap(err, "error creating api request to Vercel")
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := client.Do(req)

	if err != nil {
		return accessTokenResponse, errors.Wrap(err, "error getting response from Vercel oauth token endpoint")
	}

	b, err := ioutil.ReadAll(res.Body)

	if res.StatusCode != 200 {
		return accessTokenResponse, errors.New("Vercel API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return accessTokenResponse, errors.Wrap(err, "error reading response body from Vercel oauth token endpoint")
	}
	err = json.Unmarshal(b, &accessTokenResponse)
	if err != nil {
		return accessTokenResponse, errors.Wrap(err, "error unmarshaling Vercel oauth token response")
	}

	return accessTokenResponse, nil
}

func GetProjects(accessToken string, teamId *string) ([]*model.VercelProject, error) {
	client := &http.Client{}

	data := url.Values{}
	if teamId != nil {
		data.Set("teamId", *teamId)
	}

	req, err := http.NewRequest("GET", "https://api.vercel.com/v9/projects", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, errors.Wrap(err, "error creating api request to Vercel")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	// req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)

	if err != nil {
		return nil, errors.Wrap(err, "error getting response from Vercel projects endpoint")
	}

	b, err := ioutil.ReadAll(res.Body)

	if res.StatusCode != 200 {
		return nil, errors.New("Vercel API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return nil, errors.Wrap(err, "error reading response body from Vercel projects endpoint")
	}

	var projectsResponse struct {
		Projects []*model.VercelProject `json:"projects"`
	}
	err = json.Unmarshal(b, &projectsResponse)
	if err != nil {
		return nil, errors.Wrap(err, "error unmarshaling Vercel projects response")
	}

	return projectsResponse.Projects, nil
}
