package microsoft_teams

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	nUrl "net/url"
	"os"
	"strings"
	"sync"

	"github.com/infracloudio/msbotbuilder-go/schema"
	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/model"
	"golang.org/x/oauth2"
)

var (
	authBaseUrl       = "https://login.microsoftonline.com"
	MicrosoftGraphUrl = "https://graph.microsoft.com/v1.0"
)

type TeamsResponseValue struct {
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

type TeamsResponse struct {
	Context string               `json:"@odata.context"`
	Count   int                  `json:"@odata.count"`
	Value   []TeamsResponseValue `json:"value"`
}

func GetMicrosoftTeamsGroupsFromWorkspace(workspace *model.Workspace) []string {
	var microsoftTeamsGroups []string
	if workspace.MicrosoftTeamsGroups != nil && *workspace.MicrosoftTeamsGroups != "" {
		_ = json.Unmarshal([]byte(*workspace.MicrosoftTeamsGroups), &microsoftTeamsGroups)
	}
	return microsoftTeamsGroups
}

func GetMicrosoftTeamsChannels(tenantID string, teamID string) ([]*model.MicrosoftTeamsChannel, error) {
	ctx := context.Background()
	accessToken, err := GetAccessToken(ctx, tenantID)

	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/teams/%s/allChannels", MicrosoftGraphUrl, teamID)
	response, err := doGetRequest[*TeamsResponse](accessToken.AccessToken, url)
	if err != nil {
		return nil, err
	}

	channels := make([]*model.MicrosoftTeamsChannel, len(response.Value))

	for i, team := range response.Value {
		channels[i] = &model.MicrosoftTeamsChannel{
			ID:   team.ID,
			Name: team.DisplayName,
		}
	}

	return channels, nil
}

func GetOAuthConfigForTenant(tenantID string) (*oauth2.Config, []oauth2.AuthCodeOption, error) {
	var (
		ok           bool
		clientID     string
		clientSecret string
		frontendUri  string
	)
	if clientID, ok = os.LookupEnv("MICROSOFT_TEAMS_BOT_ID"); !ok || clientID == "" {
		return nil, nil, errors.New("MICROSOFT_TEAMS_BOT_ID not set")
	}
	if clientSecret, ok = os.LookupEnv("MICROSOFT_TEAMS_BOT_PASSWORD"); !ok || clientSecret == "" {
		return nil, nil, errors.New("MICROSOFT_TEAMS_BOT_PASSWORD not set")
	}
	if frontendUri, ok = os.LookupEnv("REACT_APP_FRONTEND_URI"); !ok || frontendUri == "" {
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
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     oauthEndPoint,
		RedirectURL:  fmt.Sprintf("%s/callback/microsoft_teams", frontendUri),
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

func GetMicrosoftTeamsChannelSuggestions(workspace *model.Workspace) ([]*model.MicrosoftTeamsChannel, error) {
	allChannels := []*model.MicrosoftTeamsChannel{}
	teamsGroups := GetMicrosoftTeamsGroupsFromWorkspace(workspace)

	ch := make(chan []*model.MicrosoftTeamsChannel, len(teamsGroups))
	errCh := make(chan error)

	defer func() {
		close(ch)
		close(errCh)
	}()

	var wg sync.WaitGroup
	wg.Add(len(teamsGroups))

	for _, teamGroup := range teamsGroups {
		go func(teamGroup string) {
			defer wg.Done()

			channels, err := GetMicrosoftTeamsChannels(*workspace.MicrosoftTeamsTenantId, teamGroup)
			if err != nil {
				errCh <- err
			} else {
				ch <- channels
			}
		}(teamGroup)
	}

	wg.Wait()

	for {
		select {
		case channels := <-ch:
			allChannels = append(allChannels, channels...)
		case err := <-errCh:
			return nil, err // Return the first encountered error
		default:
			return allChannels, nil
		}
	}
}
