package vercel

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/go-chi/chi"
	highlightHttp "github.com/highlight-run/highlight/backend/http"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	"github.com/pkg/errors"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/trace"
)

const (
	SourcemapEnvKey = "HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY"
	ProjectIdEnvVar = "NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID"
)

var (
	ApiBaseUrl = "https://api.vercel.com"
)

type VercelAccessTokenResponse struct {
	AccessToken string  `json:"access_token"`
	TeamID      *string `json:"team_id"`
}

func GetAccessToken(code string) (VercelAccessTokenResponse, error) {
	client := &http.Client{}

	redirectUri := env.Config.FrontendUri + "/callback/vercel"

	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", env.Config.VercelClientId)
	data.Set("client_secret", env.Config.VercelClientSecret)
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
		if method == "PATCH" {
			return errors.New(fmt.Sprintf("Could not patch environment variable %s - If this environment variable is already defined in Vercel, please remove it from your Vercel project and retry.", key))
		}
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

func RemoveLogDrain(logDrainId string, accessToken string, teamId *string) error {
	client := &http.Client{}

	teamIdParam := ""
	if teamId != nil {
		teamIdParam = "?teamId=" + *teamId
	}

	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/v1/integrations/log-drains/%s%s", ApiBaseUrl, logDrainId, teamIdParam), nil)
	if err != nil {
		return errors.Wrap(err, "error creating api request to Vercel")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	res, err := client.Do(req)

	if err != nil {
		return errors.Wrap(err, "error getting response from Vercel log drains endpoint")
	}

	b, err := io.ReadAll(res.Body)

	if res.StatusCode != 204 {
		return errors.New("Vercel log drains API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return errors.Wrap(err, "error reading response body from Vercel log drains endpoint")
	}

	return nil
}

func GetProjects(accessToken string, teamId *string) ([]*privateModel.VercelProject, error) {
	client := &http.Client{}

	projects := []*privateModel.VercelProject{}
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
			Projects   []*privateModel.VercelProject `json:"projects"`
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

func RemoveLogDrains(ctx context.Context, vercelTeamID *string, accessToken string) error {
	client := &http.Client{}

	u := fmt.Sprintf("%s/v2/integrations/log-drains", ApiBaseUrl)
	if vercelTeamID != nil {
		u = fmt.Sprintf("%s?teamId=%s", u, *vercelTeamID)
	}
	req, err := http.NewRequest("GET", u, strings.NewReader(""))
	if err != nil {
		return errors.Wrap(err, "error creating log drains request to Vercel")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	res, err := client.Do(req)

	if err != nil {
		return errors.Wrap(err, "error getting response from Vercel log-drain endpoint")
	}

	b, err := io.ReadAll(res.Body)

	if res.StatusCode != 200 {
		return errors.New("Vercel log drains API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return errors.Wrap(err, "error reading response body from Vercel log drains endpoint")
	}

	var logDrainsResponse []struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(b, &logDrainsResponse)
	if err != nil {
		return errors.Wrap(err, "error unmarshaling Vercel log drains response")
	}

	for _, ld := range logDrainsResponse {
		if err := RemoveLogDrain(ld.Id, accessToken, vercelTeamID); err != nil {
			return err
		}
	}

	return nil
}

func CreateLogDrain(ctx context.Context, vercelTeamID *string, vercelProjectIDs []string, projectVerboseID string, name string, accessToken string) error {
	projects, err := GetProjects(accessToken, vercelTeamID)
	if err != nil {
		return err
	}
	vercelProjectNames := lo.SliceToMap(projects, func(item *privateModel.VercelProject) (string, string) {
		return item.ID, item.Name
	})

	client := &http.Client{}
	for _, vercelProjectID := range vercelProjectIDs {
		serviceName := vercelProjectNames[vercelProjectID]
		headers := fmt.Sprintf(`{"%s":"%s","%s":"%s"}`, highlightHttp.LogDrainProjectHeader, projectVerboseID, highlightHttp.LogDrainServiceHeader, serviceName)
		projectIds := fmt.Sprintf(`["%s"]`, vercelProjectID)
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
		if l.Message == "" {
			l.Message = fmt.Sprintf("%s %s://%s/%s", l.Proxy.Method, l.Proxy.Scheme, l.Proxy.Host, l.Proxy.Path)
		}
		logs = append(logs, l)
	}

	for vercelProjectID, logs := range lo.GroupBy(logs, func(item hlog.VercelLog) string {
		return item.ProjectId
	}) {
		projectVerboseID := r.Header.Get(highlightHttp.LogDrainProjectHeader)
		projectID, err := model.FromVerboseID(projectVerboseID)
		if err != nil {
			log.WithContext(r.Context()).WithError(err).WithField("projectVerboseID", projectVerboseID).Error("failed to parse highlight project id from vercel request")
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		serviceName := r.Header.Get(highlightHttp.LogDrainServiceHeader)
		// handle old log drains without the header
		if serviceName == "" {
			serviceName = "vercel-log-drain-" + vercelProjectID
		}

		hlog.SubmitVercelLogs(r.Context(), tracer, projectID, serviceName, logs)

	}

	w.WriteHeader(http.StatusOK)
}

var tracer trace.Tracer

func Listen(r *chi.Mux, t trace.Tracer) {
	tracer = t
	r.Route("/vercel/v1", func(r chi.Router) {
		r.Use(highlightChi.Middleware)
		r.HandleFunc("/logs", HandleLog)
	})
}
