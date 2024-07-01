package gitlab

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"io"
	"net/http"
	"net/url"
	nUrl "net/url"
	"strings"
	"time"

	"golang.org/x/oauth2"

	"github.com/pkg/errors"
	"github.com/samber/lo"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const (
	AuthBaseUrl = "https://gitlab.com"
	ApiBaseUrl  = "https://gitlab.com/api/v4"
)

var gitlabEndpoint = oauth2.Endpoint{
	AuthURL:   fmt.Sprintf("%s/oauth/authorize", AuthBaseUrl),
	TokenURL:  fmt.Sprintf("%s/oauth/token", AuthBaseUrl),
	AuthStyle: oauth2.AuthStyleInParams,
}

type GitlabTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
}

type GitlabIssue struct {
	ID                   int                  `json:"id"`
	IID                  int                  `json:"iid"`
	ProjectID            int                  `json:"project_id"`
	Title                string               `json:"title"`
	Description          string               `json:"description"`
	State                string               `json:"state"`
	CreatedAt            time.Time            `json:"created_at"`
	UpdatedAt            time.Time            `json:"updated_at"`
	ClosedAt             *time.Time           `json:"closed_at"`
	ClosedBy             *int                 `json:"closed_by"`
	Labels               []string             `json:"labels"`
	Milestone            *int                 `json:"milestone"`
	Assignees            []int                `json:"assignees"`
	Author               Author               `json:"author"`
	Type                 string               `json:"type"`
	Assignee             *int                 `json:"assignee"`
	UserNotesCount       int                  `json:"user_notes_count"`
	MergeRequestsCount   int                  `json:"merge_requests_count"`
	Upvotes              int                  `json:"upvotes"`
	Downvotes            int                  `json:"downvotes"`
	DueDate              *time.Time           `json:"due_date"`
	Confidential         bool                 `json:"confidential"`
	DiscussionLocked     *bool                `json:"discussion_locked"`
	IssueType            string               `json:"issue_type"`
	WebURL               string               `json:"web_url"`
	TimeStats            TimeStats            `json:"time_stats"`
	TaskCompletionStatus TaskCompletionStatus `json:"task_completion_status"`
	BlockingIssuesCount  int                  `json:"blocking_issues_count"`
	HasTasks             bool                 `json:"has_tasks"`
	TaskStatus           string               `json:"task_status"`
	Links                Links                `json:"_links"`
	References           References           `json:"references"`
	Severity             string               `json:"severity"`
	Subscribed           bool                 `json:"subscribed"`
	MovedToID            *int                 `json:"moved_to_id"`
	ServiceDeskReplyTo   *string              `json:"service_desk_reply_to"`
}

type Author struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Name      string `json:"name"`
	State     string `json:"state"`
	Locked    bool   `json:"locked"`
	AvatarURL string `json:"avatar_url"`
	WebURL    string `json:"web_url"`
}

type TimeStats struct {
	TimeEstimate        *int    `json:"time_estimate"`
	TotalTimeSpent      *int    `json:"total_time_spent"`
	HumanTimeEstimate   *string `json:"human_time_estimate"`
	HumanTotalTimeSpent *string `json:"human_total_time_spent"`
}

type TaskCompletionStatus struct {
	Count          int `json:"count"`
	CompletedCount int `json:"completed_count"`
}

type Links struct {
	Self                string  `json:"self"`
	Notes               string  `json:"notes"`
	AwardEmoji          string  `json:"award_emoji"`
	Project             string  `json:"project"`
	ClosedAsDuplicateOf *string `json:"closed_as_duplicate_of"`
}

type References struct {
	Short    string `json:"short"`
	Relative string `json:"relative"`
	Full     string `json:"full"`
}

func GetOAuthConfig() (*oauth2.Config, []oauth2.AuthCodeOption, error) {
	if env.Config.GitlabClientId == "" {
		return nil, nil, errors.New("GITLAB_CLIENT_ID not set")
	}
	if env.Config.GitlabClientSecret == "" {
		return nil, nil, errors.New("GITLAB_CLIENT_SECRET not set")
	}
	if env.Config.FrontendUri == "" {
		return nil, nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	options := []oauth2.AuthCodeOption{
		oauth2.AccessTypeOffline,
	}

	return &oauth2.Config{
		ClientID:     env.Config.GitlabClientId,
		ClientSecret: env.Config.GitlabClientSecret,
		Endpoint:     gitlabEndpoint,
		RedirectURL:  fmt.Sprintf("%s/callback/gitlab", env.Config.FrontendUri),
	}, options, nil
}

func GetAccessToken(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, opts, err := GetOAuthConfig()

	if err != nil {
		return nil, err
	}

	return conf.Exchange(ctx, code, opts...)
}

func doGitlabPostRequest[TOut any, TIn any](accessToken string, url string, input TIn) (TOut, error) {
	var zero TOut
	b, err := json.Marshal(input)
	if err != nil {
		return zero, err
	}

	return doGitlabRequest[TOut]("POST", accessToken, url, string(b))
}

func doGitlabGetRequest[T any](accessToken string, url string) (T, error) {
	return doGitlabRequest[T]("GET", accessToken, url, "")
}

func doGitlabRequest[T any](method string, accessToken string, url string, body string) (T, error) {
	var unmarshalled T
	client := &http.Client{}

	// code to tell whether we are using absoluteUrl or relative url
	var finalUrl = fmt.Sprintf("%s%s", ApiBaseUrl, url)
	parsedUrl, err := nUrl.Parse(url)

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error parsing url") // this really should not happen
	}

	if parsedUrl.IsAbs() {
		finalUrl = url
	}

	req, err := http.NewRequest(method, finalUrl, strings.NewReader(body))
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error creating api request to GitLab")
	}

	if accessToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	}
	if method != "GET" {
		req.Header.Set("Content-Type", "application/json")
	}

	res, err := client.Do(req)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error getting response from gitlab endpoint")
	}

	b, err := io.ReadAll(res.Body)
	if res.StatusCode != 200 && res.StatusCode != 201 {
		return unmarshalled, errors.New("GitLab API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error reading response body from gitlab endpoint")
	}

	err = json.Unmarshal(b, &unmarshalled)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error unmarshaling gitlab api response"+string(b))
	}

	return unmarshalled, nil
}

type GitlabProjectResponse struct {
	ID                int       `json:"id"`
	Description       *string   `json:"description"`
	Name              string    `json:"name"`
	NameWithNamespace string    `json:"name_with_namespace"`
	Path              string    `json:"path"`
	PathWithNamespace string    `json:"path_with_namespace"`
	CreatedAt         time.Time `json:"created_at"`
	DefaultBranch     string    `json:"default_branch"`
	TagList           []string  `json:"tag_list"`
	Topics            []string  `json:"topics"`
	SSHURLToRepo      string    `json:"ssh_url_to_repo"`
	HTTPURLToRepo     string    `json:"http_url_to_repo"`
	WebURL            string    `json:"web_url"`
	ReadmeURL         string    `json:"readme_url"`
	ForksCount        int       `json:"forks_count"`
	AvatarURL         *string   `json:"avatar_url"`
	StarCount         int       `json:"star_count"`
	LastActivityAt    time.Time `json:"last_activity_at"`
	Namespace         Namespace `json:"namespace"`
}

type Namespace struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Path      string  `json:"path"`
	Kind      string  `json:"kind"`
	FullPath  string  `json:"full_path"`
	ParentID  *int    `json:"parent_id"`
	AvatarURL *string `json:"avatar_url"`
	WebURL    string  `json:"web_url"`
}

func getQueryParams() string {
	lastActivity := time.Now().AddDate(-2, 0, 0).UTC().Format("2006-01-02T15:04:05Z")

	params := map[string]string{
		"membership":          "true",
		"archived":            "false",
		"with_issues_enabled": "true",
		"simple":              "true",
		"last_activity_after": lastActivity,
	}

	queryParams := nUrl.Values{}
	for key, value := range params {
		queryParams.Set(key, value)
	}
	return queryParams.Encode()
}

func GetGitlabProjects(workspace *model.Workspace, accessToken string) ([]*modelInputs.GitlabProject, error) {
	url := fmt.Sprintf("%s/projects?/%s", ApiBaseUrl, getQueryParams())
	res, err := doGitlabGetRequest[[]*GitlabProjectResponse](accessToken, url)
	if err != nil {
		return nil, err
	}

	return lo.Map(res, func(project *GitlabProjectResponse, _ int) *modelInputs.GitlabProject {
		return &modelInputs.GitlabProject{
			Name:              project.Name,
			ID:                project.ID,
			NameWithNameSpace: project.NameWithNamespace,
		}
	}), nil
}

func SearchGitlabIssues(accessToken string, query string) ([]*modelInputs.IssuesSearchResult, error) {
	url := fmt.Sprintf("%s/issues?search=%s", ApiBaseUrl, url.QueryEscape(query))
	res, err := doGitlabGetRequest[[]GitlabIssue](accessToken, url)
	if err != nil {
		return nil, err
	}

	return lo.Map(res, func(res GitlabIssue, _ int) *modelInputs.IssuesSearchResult {
		return &modelInputs.IssuesSearchResult{
			ID:       fmt.Sprint(res.ID),
			Title:    fmt.Sprintf("#%d - %s", res.IID, res.Title),
			IssueURL: res.WebURL,
		}
	}), nil
}

type NewGitlabIssuePayload struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

func CreateGitlabTask(accessToken string, projectId string, payload NewGitlabIssuePayload) (*GitlabIssue, error) {
	url := fmt.Sprintf("%s/projects/%s/issues", ApiBaseUrl, projectId)

	res, err := doGitlabPostRequest[*GitlabIssue](accessToken, url, payload)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func GetRefreshToken(ctx context.Context, oldToken *oauth2.Token) (*oauth2.Token, error) {
	conf, _, err := GetOAuthConfig()
	if err != nil {
		return nil, err
	}

	payload := struct {
		GrantType    string `json:"grant_type"`
		ClientId     string `json:"client_id"`
		ClientSecret string `json:"client_secret"`
		RefreshToken string `json:"refresh_token"`
	}{
		GrantType:    "refresh_token",
		ClientId:     conf.ClientID,
		ClientSecret: conf.ClientSecret,
		RefreshToken: oldToken.RefreshToken,
	}

	response, err := doGitlabPostRequest[*GitlabTokenResponse]("", gitlabEndpoint.TokenURL, payload)
	if err != nil {
		return nil, err
	}

	newToken := &oauth2.Token{
		AccessToken:  response.AccessToken,
		RefreshToken: response.RefreshToken,
		Expiry:       time.Now().Add(time.Duration(response.ExpiresIn) * time.Second),
	}

	return newToken, nil
}

func RevokeGitlabAccessToken(accessToken string) error {
	conf, _, err := GetOAuthConfig()
	if err != nil {
		return err
	}
	client := &http.Client{}

	data := url.Values{}
	data.Set("token", accessToken)
	data.Set("client_id", conf.ClientID)
	data.Set("client_secret", conf.ClientSecret)

	req, err := http.NewRequest("POST", "https://gitlab.com/oauth/revoke", strings.NewReader(data.Encode()))
	if err != nil {
		return errors.Wrap(err, "error creating api request to gitlab")
	}

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := client.Do(req)
	if err != nil {
		return errors.Wrap(err, "error getting response from gitlab revoke oauth token endpoint")
	}

	if res.StatusCode != 200 {
		return errors.New("gitlab API responded with error; status_code=" + res.Status)
	}

	return nil
}
