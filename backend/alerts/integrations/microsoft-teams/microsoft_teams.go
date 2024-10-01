package microsoft_teams

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"io"
	"net/http"
	nUrl "net/url"
	"strings"

	"github.com/infracloudio/msbotbuilder-go/schema"
	"github.com/pkg/errors"
	"github.com/samber/lo"

	"github.com/highlight-run/highlight/backend/model"
	"golang.org/x/oauth2"
	"golang.org/x/sync/errgroup"
)

var (
	authBaseUrl       = "https://login.microsoftonline.com"
	MicrosoftGraphUrl = "https://graph.microsoft.com/v1.0"
)

type TeamResponse struct {
	OdataId     string `json:"@odata.id"`
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	Description string `json:"description"`
}

type TeamsApp struct {
	Id         string `json:"id"`
	ExternalId string `json:"externalId"`
}

type TeamsAppResponse struct {
	ID       string   `json:"id"`
	TeamsApp TeamsApp `json:"teamsApp"`
}

type ChannelResponse struct {
	OdataId             string `json:"@odata.id"`
	ID                  string `json:"id"`
	CreatedDateTime     string `json:"createdDateTime"`
	DisplayName         string `json:"displayName"`
	Description         string `json:"description"`
	IsFavoriteByDefault bool   `json:"isFavoriteByDefault"`
	Email               string `json:"email"`
	TenantID            string `json:"tenantId"`
	WebUrl              string `json:"webUrl"`
	MembershipType      string `json:"membershipType"`
}

type GraphResponse[T any] struct {
	Context string `json:"@odata.context"`
	Count   int    `json:"@odata.count"`
	Value   []T    `json:"value"`
}

func GetTeamsFromWorkspace(workspace *model.Workspace) ([]TeamResponse, error) {
	if workspace.MicrosoftTeamsTenantId == nil {
		return nil, errors.Errorf("MicrosoftTeamsTenantId is nil: workspace %d", workspace.ID)
	}

	ctx := context.Background()
	accessToken, err := GetAccessToken(ctx, *workspace.MicrosoftTeamsTenantId)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/teams", MicrosoftGraphUrl)
	response, err := doGetRequest[*GraphResponse[TeamResponse]](accessToken.AccessToken, url)
	if err != nil {
		return nil, err
	}

	// Filter all teams for teams where the integration is installed
	found := make([]bool, len(response.Value))
	var eg errgroup.Group
	for idx, team := range response.Value {
		idx := idx
		team := team
		eg.Go(func() error {
			url := fmt.Sprintf("%s/teams/%s/installedApps?$expand=teamsApp", MicrosoftGraphUrl, team.ID)
			response, _ := doGetRequest[*GraphResponse[TeamsAppResponse]](accessToken.AccessToken, url)
			if err != nil {
				return err
			}
			if response == nil {
				return errors.New("nil response from teams api")
			}
			for _, value := range response.Value {
				if value.TeamsApp.Id == env.Config.MicrosoftTeamsBotId || value.TeamsApp.ExternalId == env.Config.MicrosoftTeamsBotId {
					found[idx] = true
				}
			}
			return nil
		})
	}

	if err := eg.Wait(); err != nil {
		return nil, err
	}

	return lo.Filter(response.Value, func(_ TeamResponse, idx int) bool {
		return found[idx]
	}), nil
}

func GetChannels(tenantID string, teamResponse TeamResponse) ([]*model.MicrosoftTeamsChannel, error) {
	ctx := context.Background()
	accessToken, err := GetAccessToken(ctx, tenantID)

	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/teams/%s/allChannels", MicrosoftGraphUrl, teamResponse.ID)
	response, err := doGetRequest[*GraphResponse[ChannelResponse]](accessToken.AccessToken, url)
	if err != nil {
		return nil, err
	}

	channels := make([]*model.MicrosoftTeamsChannel, len(response.Value))

	for i, channel := range response.Value {
		channels[i] = &model.MicrosoftTeamsChannel{
			ID:   channel.ID,
			Name: fmt.Sprintf("%s > %s", teamResponse.DisplayName, channel.DisplayName),
		}
	}

	return channels, nil
}

func GetOAuthConfigForTenant(tenantID string) (*oauth2.Config, []oauth2.AuthCodeOption, error) {
	if env.Config.MicrosoftTeamsBotId == "" {
		return nil, nil, errors.New("MICROSOFT_TEAMS_BOT_ID not set")
	}
	if env.Config.MicrosoftTeamsBotPassword == "" {
		return nil, nil, errors.New("MICROSOFT_TEAMS_BOT_PASSWORD not set")
	}
	if env.Config.FrontendUri == "" {
		return nil, nil, errors.New("REACT_APP_FRONTEND_URI not set")
	}

	var oauthEndPoint = oauth2.Endpoint{
		AuthURL:   fmt.Sprintf("%s/oauth2/v2.0/authorize", authBaseUrl),
		TokenURL:  fmt.Sprintf("%s/%s/oauth2/v2.0/token", authBaseUrl, tenantID),
		AuthStyle: oauth2.AuthStyleInParams,
	}

	options := []oauth2.AuthCodeOption{
		oauth2.SetAuthURLParam("grant_type", "client_credentials"),
		oauth2.SetAuthURLParam("scope", "https://graph.microsoft.com/.default"),
	}

	return &oauth2.Config{
		ClientID:     env.Config.MicrosoftTeamsBotId,
		ClientSecret: env.Config.MicrosoftTeamsBotPassword,
		Endpoint:     oauthEndPoint,
		RedirectURL:  fmt.Sprintf("%s/callback/microsoft_teams", env.Config.FrontendUri),
	}, options, nil
}

func GetAccessToken(ctx context.Context, tenantID string) (*oauth2.Token, error) {
	conf, opts, err := GetOAuthConfigForTenant(tenantID)

	if err != nil {
		return nil, err
	}

	return conf.Exchange(ctx, "", opts...)
}

func GetAadGroupIDFromActivity(activity schema.Activity) string {
	team, ok := activity.ChannelData["team"]
	if ok {
		team, ok := team.(map[string]interface{})
		if ok {
			teamID, ok := team["aadGroupId"].(string)
			if ok {
				return teamID
			}
		}
	}
	return ""
}

func doGetRequest[T any](accessToken string, url string) (T, error) {
	return doRequest[T]("GET", accessToken, url, "")
}

func doRequest[T any](method string, accessToken string, url string, body string) (T, error) {
	var unmarshalled T
	client := &http.Client{}

	// code to tell whether we are using absoluteUrl or relative url
	var finalUrl = fmt.Sprintf("%s%s", MicrosoftGraphUrl, url)
	parsedUrl, err := nUrl.Parse(url)

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error parsing url") // this really should not happen
	}

	if parsedUrl.IsAbs() {
		finalUrl = url
	}

	req, err := http.NewRequest(method, finalUrl, strings.NewReader(body))
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error creating api request to microsoft")
	}

	if accessToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	}
	if method != "GET" {
		req.Header.Set("Content-Type", "application/json")
	}

	res, err := client.Do(req)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error getting response from microsoft endpoint")
	}

	b, err := io.ReadAll(res.Body)
	if res.StatusCode != 200 && res.StatusCode != 201 {
		return unmarshalled, errors.New("Microsoft Graph API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return unmarshalled, errors.Wrap(err, "error reading response body from microsoft endpoint")
	}

	err = json.Unmarshal(b, &unmarshalled)
	if err != nil {
		return unmarshalled, errors.Wrap(err, "error unmarshaling microsoft api response"+string(b))
	}

	return unmarshalled, nil
}

func GetChannelSuggestions(workspace *model.Workspace) ([]*model.MicrosoftTeamsChannel, error) {
	teams, err := GetTeamsFromWorkspace(workspace)
	if err != nil {
		return nil, err
	}

	allChannels := make([][]*model.MicrosoftTeamsChannel, len(teams))

	var g errgroup.Group
	for idx, team := range teams {
		idx := idx
		team := team
		g.Go(func() error {
			channels, err := GetChannels(*workspace.MicrosoftTeamsTenantId, team)
			if err != nil {
				return err
			}
			allChannels[idx] = channels
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return nil, err
	}

	return lo.Flatten(allChannels), nil
}
