package vercel

import (
	"encoding/json"
	"fmt"
	"github.com/go-chi/chi"
	model2 "github.com/highlight-run/highlight/backend/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	log "github.com/sirupsen/logrus"
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
	VercelClientId              = os.Getenv("VERCEL_CLIENT_ID")
	VercelClientSecret          = os.Getenv("VERCEL_CLIENT_SECRET")
	SourcemapEnvKey             = "HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY"
	ProjectIdEnvVar             = "NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID"
	VercelApiBaseUrl            = "https://api.vercel.com"
	VercelLogDrainProjectHeader = "x-highlight-project"
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
		return accessTokenResponse, errors.New("Vercel Access Token API responded with error; status_code=" + res.Status + "; body=" + string(b))
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

func SetEnvVariable(projectId string, apiKey string, accessToken string, teamId *string, envId *string, key string) error {
	client := &http.Client{}

	teamIdParam := ""
	if teamId != nil {
		teamIdParam = "?teamId=" + *teamId
	}

	supportedEnvs := `["production"]`
	if key == ProjectIdEnvVar {
		supportedEnvs = `["production", "preview", "development"]`
	}

	body := fmt.Sprintf(`{"type":"encrypted","value":"%s","target":%s,"key":"%s"}`, apiKey, supportedEnvs, key)

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
		return errors.New("Vercel Project Env API responded with error; status_code=" + res.Status + "; body=" + string(b))
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
		return errors.New("Vercel Integration Config API responded with error; status_code=" + res.Status + "; body=" + string(b))
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
			return nil, errors.New("Vercel Projects API responded with error; status_code=" + res.Status + "; body=" + string(b))
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

func CreateLogDrain(vercelProjectID string, projectVerboseID string, name string, accessToken string) error {
	client := &http.Client{}

	headers := fmt.Sprintf(`{"%s":"%s"}`, VercelLogDrainProjectHeader, projectVerboseID)
	projectIds := fmt.Sprintf(`["%s"]`, vercelProjectID)
	body := fmt.Sprintf(`{"url":"https://pub.highlight.io/vercel/v1/logs","name":"%s","headers":%s,"projectIds":%s,"deliveryFormat":"ndjson"}`, name, headers, projectIds)
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/v2/integrations/log-drains?teamId=%s", VercelApiBaseUrl, vercelProjectID),
		strings.NewReader(body))
	if err != nil {
		return errors.Wrap(err, "error creating api request to Vercel")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	res, err := client.Do(req)

	if err != nil {
		return errors.Wrap(err, "error getting response from Vercel log-drain endpoint")
	}

	b, err := io.ReadAll(res.Body)

	if res.StatusCode != 200 {
		return errors.New("Vercel Log Drain API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return errors.Wrap(err, "error reading response body from Vercel log-drain endpoint")
	}

	return nil
}

func HandleLog(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Error(err, "invalid vercel logs body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var logs []hlog.VercelLog
	jsons := strings.Split(string(body), "\n")
	for _, j := range jsons {
		var l []hlog.VercelLog
		if err := json.Unmarshal([]byte(j), &l); err != nil {
			log.Error(err, "failed to unmarshal vercel logs")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		logs = append(logs, l...)
	}

	projectVerboseID := r.Header.Get(VercelLogDrainProjectHeader)
	projectID, err := model2.FromVerboseID(projectVerboseID)
	if err != nil {
		log.Error(err, "failed to parse highlight project id from vercel request")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	hlog.SubmitVercelLogs(r.Context(), projectID, logs)

	w.WriteHeader(http.StatusOK)
}

func Listen(r *chi.Mux) {
	r.Route("/vercel/v1", func(r chi.Router) {
		r.HandleFunc("/logs", HandleLog)
	})
}
