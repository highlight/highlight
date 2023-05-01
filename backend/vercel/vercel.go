package vercel

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-chi/chi"
	model2 "github.com/highlight-run/highlight/backend/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/pkg/errors"
)

const (
	SourcemapEnvKey       = "HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY"
	ProjectIdEnvVar       = "NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID"
	ApiBaseUrl            = "https://api.vercel.com"
	LogDrainProjectHeader = "x-highlight-project"
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

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/v2/oauth/access_token", ApiBaseUrl), strings.NewReader(data.Encode()))
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

	req, err := http.NewRequest(method, fmt.Sprintf("%s/v9/projects/%s/env%s%s", ApiBaseUrl, projectId, envIdStr, teamIdParam),
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

	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/v1/integrations/configuration/%s%s", ApiBaseUrl, configId, teamIdParam), nil)
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

		req, err := http.NewRequest("GET", fmt.Sprintf("%s/v9/projects%s", ApiBaseUrl, queryStr), strings.NewReader(data.Encode()))
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

func CreateLogDrain(ctx context.Context, vercelTeamID *string, vercelProjectIDs []string, projectVerboseID string, name string, accessToken string) error {
	client := &http.Client{}

	headers := fmt.Sprintf(`{"%s":"%s"}`, LogDrainProjectHeader, projectVerboseID)
	projectIds := fmt.Sprintf(`[%s]`, strings.Join(lo.Map(vercelProjectIDs, func(t string, i int) string {
		return fmt.Sprintf("\"%s\"", t)
	}), ","))
	body := fmt.Sprintf(`{"url":"https://pub.highlight.run/vercel/v1/logs", "name":"%s", "headers":%s, "projectIds":%s, "deliveryFormat":"ndjson", "secret": "%s", "sources": ["static", "lambda", "edge", "build", "external"]}`, name, headers, projectIds, projectVerboseID)
	u := fmt.Sprintf("%s/v2/integrations/log-drains", ApiBaseUrl)
	if vercelTeamID != nil {
		u = fmt.Sprintf("%s?teamId=%s", u, *vercelTeamID)
	}
	req, err := http.NewRequest("POST", u, strings.NewReader(body))
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
		log.WithContext(ctx).WithField("Body", string(b)).
			WithField("Url", u).
			Errorf("Vercel Log Drain API responded with error")
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
		log.WithContext(r.Context()).WithError(err).Error("invalid vercel logs body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var logs []hlog.VercelLog
	jsons := regexp.MustCompile(`\n+`).Split(string(body), -1)
	for _, j := range jsons {
		if j == "" {
			continue
		}
		var l hlog.VercelLog
		if err := json.Unmarshal([]byte(j), &l); err != nil {
			log.WithContext(r.Context()).WithError(err).WithField("payload", j).Error("failed to unmarshal vercel logs")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if l.Message != "" {
			logs = append(logs, l)
		} else {
			log.WithContext(r.Context()).WithField("log", l).Warn("received empty log message from vercel")
		}
	}

	projectVerboseID := r.Header.Get(LogDrainProjectHeader)
	projectID, err := model2.FromVerboseID(projectVerboseID)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).WithField("projectVerboseID", projectVerboseID).Error("failed to parse highlight project id from vercel request")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	hlog.SubmitVercelLogs(r.Context(), projectID, logs)

	w.WriteHeader(http.StatusOK)
}

func Listen(r *chi.Mux) {
	r.Route("/vercel/v1", func(r chi.Router) {
		r.Use(highlightChi.Middleware)
		r.HandleFunc("/logs", HandleLog)
	})
}
