package vercel

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strconv"
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

	redirectUri := os.Getenv("FRONTEND_URI") + "/callback/vercel"

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

func SetEnvVariable(projectId string, accessToken string, teamId *string) error {
	client := &http.Client{}

	data := url.Values{}
	if teamId != nil {
		data.Set("teamId", *teamId)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("/v9/projects/%s/env", projectId),
		strings.NewReader(`[{"type":"secret","value":"ZANE-TEST","target":["production"],"key":"HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY"}]`))
	if err != nil {
		return errors.Wrap(err, "error creating api request to Vercel")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	res, err := client.Do(req)

	if err != nil {
		return errors.Wrap(err, "error getting response from Vercel env endpoint")
	}

	b, err := ioutil.ReadAll(res.Body)

	if res.StatusCode != 200 {
		return errors.New("Vercel API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return errors.Wrap(err, "error reading response body from Vercel env endpoint")
	}

	return nil
}

func GetProjects(accessToken string, teamId *string) ([]*model.VercelProject, error) {
	client := &http.Client{}

	projects := []*model.VercelProject{}
	next := 0
	for {
		data := url.Values{}
		if teamId != nil {
			data.Set("teamId", *teamId)
		}
		if next != 0 {
			data.Set("until", strconv.Itoa(next))
		}

		req, err := http.NewRequest("GET", "https://api.vercel.com/v9/projects", strings.NewReader(data.Encode()))
		if err != nil {
			return nil, errors.Wrap(err, "error creating api request to Vercel")
		}
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

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
			Projects   []*model.VercelProject `json:"projects"`
			Pagination struct {
				Next int `json:"next"`
			} `json:"pagination"`
		}
		err = json.Unmarshal(b, &projectsResponse)
		if err != nil {
			return nil, errors.Wrap(err, "error unmarshaling Vercel projects response")
		}

		projects = append(projects, projectsResponse.Projects...)

		// Break if there are no more pages
		next = projectsResponse.Pagination.Next
		if next == 0 {
			break
		}
	}

	return projects, nil
}
