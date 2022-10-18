package vercel

import (
	"encoding/json"
	"fmt"
	"io"
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
	SourcemapEnvKey    = "HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY"
	VercelApiBaseUrl   = "https://api.vercel.com"
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

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/v2/oauth/access_token", VercelApiBaseUrl), strings.NewReader(data.Encode()))
	if err != nil {
		return accessTokenResponse, errors.Wrap(err, "error creating api request to Vercel")
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := client.Do(req)

	if err != nil {
		return accessTokenResponse, errors.Wrap(err, "error getting response from Vercel oauth token endpoint")
	}

	b, err := io.ReadAll(res.Body)

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

func SetEnvVariable(projectId string, apiKey string, accessToken string, teamId *string, envId *string) error {
	client := &http.Client{}

	teamIdParam := ""
	if teamId != nil {
		teamIdParam = "?teamId=" + *teamId
	}

	body := fmt.Sprintf(`{"type":"encrypted","value":"%s","target":["production"],"key":"%s"}`, apiKey, SourcemapEnvKey)

	method := "POST"
	envIdStr := ""
	if envId != nil {
		method = "PATCH"
		envIdStr = fmt.Sprintf("/%s", *envId)
	} else {
		body = fmt.Sprintf("[%s]", body)
	}

	req, err := http.NewRequest(method, fmt.Sprintf("%s/v9/projects/%s/env%s%s", VercelApiBaseUrl, projectId, envIdStr, teamIdParam),
		strings.NewReader(body))
	if err != nil {
		return errors.Wrap(err, "error creating api request to Vercel")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	res, err := client.Do(req)

	if err != nil {
		return errors.Wrap(err, "error getting response from Vercel env endpoint")
	}

	b, err := io.ReadAll(res.Body)

	if res.StatusCode != 200 {
		return errors.New("Vercel API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return errors.Wrap(err, "error reading response body from Vercel env endpoint")
	}

	return nil
}

func RemoveConfiguration(configId string, accessToken string, teamId *string) error {
	client := &http.Client{}

	teamIdParam := ""
	if teamId != nil {
		teamIdParam = "?teamId=" + *teamId
	}

	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/v1/integrations/configuration/%s%s", VercelApiBaseUrl, configId, teamIdParam), nil)
	if err != nil {
		return errors.Wrap(err, "error creating api request to Vercel")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	res, err := client.Do(req)

	if err != nil {
		return errors.Wrap(err, "error getting response from Vercel env endpoint")
	}

	b, err := io.ReadAll(res.Body)

	if res.StatusCode != 204 {
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

		queryStr := ""
		if len(data) > 0 {
			queryStr = "?" + data.Encode()
		}

		req, err := http.NewRequest("GET", fmt.Sprintf("%s/v9/projects%s", VercelApiBaseUrl, queryStr), strings.NewReader(data.Encode()))
		if err != nil {
			return nil, errors.Wrap(err, "error creating api request to Vercel")
		}
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

		res, err := client.Do(req)

		if err != nil {
			return nil, errors.Wrap(err, "error getting response from Vercel projects endpoint")
		}

		b, err := io.ReadAll(res.Body)

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
