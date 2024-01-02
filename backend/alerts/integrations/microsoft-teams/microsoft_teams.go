package microsoft_teams

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net/http"
	nUrl "net/url"
	"os"
	"strconv"
	"strings"

	"github.com/pkg/errors"
	"github.com/samber/lo"

	log "github.com/sirupsen/logrus"

	"github.com/go-chi/chi"
	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/infracloudio/msbotbuilder-go/core"
	"github.com/infracloudio/msbotbuilder-go/core/activity"
	"github.com/infracloudio/msbotbuilder-go/schema"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

type BotMessages interface {
	// tested
	SendNewSessionAlert(string, integrations.NewSessionAlertPayload)
	// tested
	SendTrackPropertiesAlert(string, integrations.TrackPropertiesAlertPayload)
	// tested
	SendErrorFeedbackAlert(string, integrations.ErrorFeedbackAlertPayload)
	// tested
	SendRageClicksAlert(string, integrations.RageClicksAlertPayload)

	SendUserPropertiesAlert(string, integrations.UserPropertiesAlertPayload)

	//UNTESTED (click testing)
	SendMetricMonitorAlert(string, integrations.MetricMonitorAlertPayload)
	SendLogAlert(string, integrations.LogAlertPayload)
	SendErrorAlert(string, integrations.ErrorAlertPayload)
	SendNewUserAlert(string, integrations.NewUserAlertPayload)
}

var (
	authBaseUrl       = "https://login.microsoftonline.com"
	MicrosoftGraphUrl = "https://graph.microsoft.com/v1.0"
)

type WelcomeMessageData struct {
	Workspace     *model.Workspace
	Admin         *model.Admin
	Project       *model.Project
	OperationName string
}

type BotHandler struct {
	core.Adapter
	DB *gorm.DB
}

type MicrosoftTeamsBot struct {
	core.Adapter
	TenantID string
	BotID    string
}

func (bot *MicrosoftTeamsBot) makeChannelConversation(channelId string) schema.ConversationAccount {
	return schema.ConversationAccount{
		IsGroup:          true,
		ConversationType: "channel",
		ID:               channelId,
		TenantID:         bot.TenantID,
	}
}

func (bot *MicrosoftTeamsBot) makeChannelMessageActivity(channelId string) schema.Activity {
	return schema.Activity{
		Type:         schema.Message,
		ChannelID:    "msteams",
		ServiceURL:   "https://smba.trafficmanager.net/amer/",
		Conversation: bot.makeChannelConversation(channelId),
		From: schema.ChannelAccount{
			ID: bot.BotID,
		},
	}
}

func makeAttachmentHandler(attachments interface{}) activity.HandlerFuncs {
	return activity.HandlerFuncs{
		OnMessageFunc: func(turn *activity.TurnContext) (schema.Activity, error) {
			attachments := []schema.Attachment{
				{
					ContentType: "application/vnd.microsoft.card.adaptive",
					Content:     attachments,
				},
			}
			return turn.SendActivity(activity.MsgOptionAttachments(attachments))
		},
	}
}

func makeMessageHandler(message string) activity.HandlerFuncs {
	return activity.HandlerFuncs{
		OnMessageFunc: func(turn *activity.TurnContext) (schema.Activity, error) {
			return turn.SendActivity(activity.MsgOptionText(message))
		},
	}
}

var botMessagesHandler = activity.HandlerFuncs{
	OnMessageFunc: func(turn *activity.TurnContext) (schema.Activity, error) {
		if strings.EqualFold(turn.Activity.Text, "ping") {
			return turn.SendActivity(activity.MsgOptionText("POOONGGGG!!!!!!!!!!!!!"))
		}
		return schema.Activity{}, nil
	},
	// this is called whenever our bot or a new member is added/removed from the team.
	// use this to "uninstall/remove bot/teams integration integration"
	OnConversationUpdateFunc: func(turn *activity.TurnContext) (schema.Activity, error) {
		if len(turn.Activity.MembersRemoved) > 0 {
			for _, memberRemoved := range turn.Activity.MembersRemoved {
				if memberRemoved.ID == turn.Activity.Recipient.ID {
					// this is probably redundant since bot will no longer be part of the team but ...
					return turn.SendActivity(activity.MsgOptionText("Hightlight bot uninstalled successfully"))
				}
			}
		}

		if len(turn.Activity.MembersAdded) > 0 {
			// identify if our bot is part of the id
			for _, member := range turn.Activity.MembersAdded {
				// our bot is the recipient of this message - so we are being added to the conversation
				if member.ID == turn.Activity.Recipient.ID {
					return turn.SendActivity(activity.MsgOptionText("👋 your highlight notifications bot has been installed successfully. You can now set a teams channel as receipient for your alerts. Your highlight microsoft teams integration will be removed on highlight whenever you uninstall the bot."))
				}
			}
		}

		return schema.Activity{}, nil
	},
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

func GetMicrosoftTeamsChannelsFromWorkspace(workspace *model.Workspace) (map[string][]*model.MicrosoftTeamsChannel, error) {
	microsoftTeamsChannels := make(map[string][]*model.MicrosoftTeamsChannel)
	if workspace.MicrosoftTeamsChannels != nil && *workspace.MicrosoftTeamsChannels != "" {
		err := json.Unmarshal([]byte(*workspace.MicrosoftTeamsChannels), &microsoftTeamsChannels)

		return microsoftTeamsChannels, err
	}
	return microsoftTeamsChannels, nil
}

func (ht *BotHandler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	ctx := context.Background()
	act, err := ht.Adapter.ParseRequest(ctx, req)

	if err != nil {
		fmt.Println("Failed to parse request.", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if act.Type == schema.ConversationUpdate {
		if len(act.MembersRemoved) > 0 {
			// identify if our bot is part of the id
			for _, memberRemoved := range act.MembersRemoved {
				// our bot is the recipient of this message - so we are being removed from the conversation
				if memberRemoved.ID == act.Recipient.ID {
					query := model.Workspace{
						MicrosoftTeamsTenantId: &act.Conversation.TenantID,
					}
					updates := model.Workspace{}

					var workspace *model.Workspace
					if err := ht.DB.Where(&query).Take(&workspace).Error; err != nil {
						http.Error(w, err.Error(), http.StatusBadRequest)
						return
					}

					microsoftTeamsChannels, err := GetMicrosoftTeamsChannelsFromWorkspace(workspace)
					if err != nil {
						log.Println("error extracting microsoft_teams channels from workspace")
						break
					}

					groupID := GetAadGroupIDFromActivity(act)
					delete(microsoftTeamsChannels, groupID)

					updateFields := []string{"microsoft_teams_channels"}
					if len(microsoftTeamsChannels) == 0 {
						updates.MicrosoftTeamsChannels = nil
						updates.MicrosoftTeamsTenantId = nil
						updateFields = append(updateFields, "microsoft_teams_tenant_id")
					} else {
						channelsJson, _ := json.Marshal(microsoftTeamsChannels)
						channelsUpdate := string(channelsJson)
						updates.MicrosoftTeamsChannels = &channelsUpdate
					}

					if err := ht.DB.Where(&query).Select(updateFields...).Updates(updates).Error; err != nil {
						log.Println("error removing microsoft_teams bot from workspace")
						http.Error(w, err.Error(), http.StatusBadRequest)
						break
					}
					break
				}
			}
		}

		if len(act.MembersAdded) > 0 {
			// identify if our bot is part of the id
			for _, memberAddded := range act.MembersAdded {
				// our bot is the recipient of this message - so we are being added to the conversation - aka installation
				if memberAddded.ID == act.Recipient.ID {
					query := model.Workspace{
						MicrosoftTeamsTenantId: &act.Conversation.TenantID,
					}

					var workspace *model.Workspace
					if err := ht.DB.Where(&query).Take(&workspace).Error; err != nil {
						fmt.Println("Error fetching workspace")
						return
					}

					microsoftTeamsChannels := make(map[string][]model.MicrosoftTeamsChannel)
					if workspace.MicrosoftTeamsChannels != nil && *workspace.MicrosoftTeamsChannels != "" {
						err := json.Unmarshal([]byte(*workspace.MicrosoftTeamsChannels), &microsoftTeamsChannels)

						if err != nil {
							log.Println("error transforming ms teams channels into map", err)
							http.Error(w, err.Error(), http.StatusBadRequest)
							return
						}
					}

					groupID := GetAadGroupIDFromActivity(act)
					if groupID != "" {
						channels, err := GetMicrosoftTeamsChannels(*query.MicrosoftTeamsTenantId, groupID)
						if err != nil {
							fmt.Println("error fetching ms teams channels", err)
							http.Error(w, err.Error(), http.StatusBadRequest)
							return
						}
						microsoftTeamsChannels[groupID] = channels
					}

					channelsJson, _ := json.Marshal(microsoftTeamsChannels)
					channelsUpdate := string(channelsJson)

					updates := model.Workspace{
						MicrosoftTeamsChannels: &channelsUpdate,
					}

					if err := ht.DB.Where(&query).Updates(&updates).Error; err != nil {
						fmt.Println("microsoft teams bot installation failed", err)
						break
					}

					err = ht.Adapter.ProcessActivity(ctx, act, botMessagesHandler)
					if err != nil {
						fmt.Println("Failed to process request", err)
						http.Error(w, err.Error(), http.StatusBadRequest)
						return
					}
				}
			}
		}
	}

	//TODO: This is for testing only - DELETE IT AFTERWARDS
	if act.Type == schema.Message {
		err = ht.Adapter.ProcessActivity(ctx, act, botMessagesHandler)
		if err != nil {
			fmt.Println("Failed to process request", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
}

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

func GetMicrosoftTeamsChannels(tenantID string, teamID string) ([]model.MicrosoftTeamsChannel, error) {
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

	return lo.Map(response.Value, func(team TeamsResponseValue, index int) model.MicrosoftTeamsChannel {
		return model.MicrosoftTeamsChannel{
			ID:   team.ID,
			Name: team.DisplayName,
		}
	}), nil
}

type BotAdapter struct {
	Adapter core.Adapter
	BotID   string
}

func MakeBotAdapter() (*BotAdapter, error) {
	var (
		ok          bool
		botPassword string
		botID       string
	)
	if botPassword, ok = os.LookupEnv("MICROSOFT_TEAMS_BOT_PASSWORD"); !ok || botPassword == "" {
		return nil, errors.New("MICROSOFT_TEAMS_BOT_PASSWORD not set")
	}

	if botID, ok = os.LookupEnv("MICROSOFT_TEAMS_BOT_ID"); !ok || botID == "" {
		return nil, errors.New("MICROSOFT_TEAMS_BOT_ID not set")
	}

	setting := core.AdapterSetting{
		AppID:       botID,
		AppPassword: botPassword,
	}

	adapter, err := core.NewBotAdapter(setting)
	if err != nil {
		log.Println("Error creating adapter: ", err)
		return nil, err
	}

	return &BotAdapter{Adapter: adapter, BotID: botID}, nil
}

func NewMicrosoftTeamsBot(tenantID string) (*MicrosoftTeamsBot, error) {
	botAdapter, err := MakeBotAdapter()
	if err != nil {
		log.Println("Error creating adapter: ", err)
		return nil, errors.New("error creating microsoft teams bot adapter")
	}
	return &MicrosoftTeamsBot{botAdapter.Adapter, tenantID, botAdapter.BotID}, nil
}

func BotHandlerFunc(db *gorm.DB) (*BotHandler, error) {
	botAdapter, err := MakeBotAdapter()
	if err != nil {
		log.Println("Error creating adapter: ", err)
		return nil, err
	}

	botHandler := &BotHandler{botAdapter.Adapter, db}
	return botHandler, nil
}

// RegisterMicrosoftTeamsBotHandler registers a POST url at endpoint/microsoft-teams/bot
func RegisterMicrosoftTeamsBotHandler(r *chi.Mux, endpoint string, db *gorm.DB) {
	botHandler, err := BotHandlerFunc(db)
	if err != nil {
		log.Println("error creating teams bot handler: ", err)
		return
	}
	r.Post(fmt.Sprintf("%s/%s", endpoint, "microsoft-teams/bot"), http.HandlerFunc(botHandler.ServeHTTP))
	fmt.Println("Microsoft Teams Bot registered")
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

func GetTeamsChannel(workspace *model.Workspace) ([]*model.MicrosoftTeamsChannel, error) {
	allChannels := []*model.MicrosoftTeamsChannel{}
	teamsChannels, err := GetMicrosoftTeamsChannelsFromWorkspace(workspace)

	if err != nil {
		return nil, err
	}

	for _, channels := range teamsChannels {
		allChannels = append(allChannels, channels...)
	}
	return allChannels, nil
}

type Fact struct {
	Title string `json:"title"`
	Value string `json:"value"`
}

func (bot *MicrosoftTeamsBot) SendLogAlert(channelId string, payload integrations.LogAlertPayload, workspace *model.Workspace) error {
	facts := []*Fact{}

	if payload.Query != "" {
		facts = append(facts, &Fact{
			Title: "Query",
			Value: payload.Query,
		})
	}

	facts = append(facts, &Fact{
		Title: "Count",
		Value: strconv.Itoa(payload.Count),
	})

	facts = append(facts, &Fact{
		Title: "Threshold",
		Value: strconv.Itoa(payload.Threshold),
	})

	factset := map[string]interface{}{
		"type":  "FactSet",
		"facts": facts,
	}

	aboveStr := "above"
	if payload.BelowThreshold {
		aboveStr = "below"
	}

	description := fmt.Sprintf("*%s* is currently %s the threshold.", payload.Name, aboveStr)

	jsonFacts, _ := json.Marshal(factset)

	templateData := BasicTemplatePayload{
		Title:       "Highlight Log Alert",
		Description: description,
		ActionURL:   payload.AlertURL,
		Facts:       string(jsonFacts),
		ActionTitle: "View Logs",
	}

	adaptiveCard, err := MakeAdaptiveCard(BasicMessageTemplate, templateData)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}

func MakeTemplateString(source string, data map[string]string) (string, error) {
	var output bytes.Buffer
	tmpl, err := template.New("message").Parse(source)
	if err != nil {
		return "", err
	}
	err = tmpl.Execute(&output, data)
	return output.String(), err
}

func SendLogAlertsWelcomeMessage(ctx context.Context, alert *model.LogAlert, input *WelcomeMessageData) error {
	bot, err := NewMicrosoftTeamsBot(*input.Workspace.MicrosoftTeamsTenantId)
	if err != nil {
		return errors.New("microsoft teams bot installation not complete")
	}

	adminName := input.Admin.Name

	if adminName == nil {
		adminName = input.Admin.Email
	}

	description := "Log alerts will now be sent to this channel."

	frontendURL := os.Getenv("FRONTEND_URI")
	alertUrl := fmt.Sprintf("%s/%d/%s/%d", frontendURL, input.Project.Model.ID, "alerts/logs", alert.ID)
	message := fmt.Sprintf("👋 %s has %s the alert \"%s\". %s %s", *adminName, input.OperationName, alert.GetName(), description, alertUrl)

	for _, channel := range alert.MicrosoftTeamsChannelsToNotify {
		handler := makeMessageHandler(message)
		ctx := context.Background()

		err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channel.ID), handler)

		if err != nil {
			log.WithContext(ctx).Error(err)
			return err
		}
	}

	return nil
}

func (bot *MicrosoftTeamsBot) SendNewSessionAlert(channelId string, payload integrations.NewSessionAlertPayload) error {

	facts := []*Fact{}

	if payload.VisitedURL != nil && *payload.VisitedURL != "" {
		facts = append(facts, &Fact{
			Title: "Visited URL",
			Value: *payload.VisitedURL,
			// Inline: false,
		})
	}

	for key, value := range payload.UserProperties {
		facts = append(facts, &Fact{
			Title: key,
			Value: value,
		})
	}

	jsonFacts, _ := json.Marshal(facts) // no need to handle errors here, we specify the json string - sort of

	newSessionAlertPayload := NewSessionAlertPayload{
		Title:          "Highlight New Session Alert",
		SessionURL:     payload.SessionURL,
		UserIdentifier: payload.UserIdentifier,
		Facts:          string(jsonFacts),
	}

	if payload.AvatarURL != nil && *payload.AvatarURL != "" {
		newSessionAlertPayload.AvatarURL = *payload.AvatarURL
	}

	adaptiveCard, err := MakeAdaptiveCard(NewSessionAlertMessageTemplate, newSessionAlertPayload)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}

func (bot *MicrosoftTeamsBot) SendTrackPropertiesAlert(channelId string, payload integrations.TrackPropertiesAlertPayload) error {
	matchedValue := []string{}
	for _, field := range payload.MatchedProperties {
		matchedValue = append(matchedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
	}

	templateData := map[string]interface{}{
		"Title":         "Highlight Track Properties Alert",
		"Description":   payload.UserIdentifier,
		"MatchedValues": matchedValue,
	}

	if len(payload.RelatedProperties) > 0 {
		relatedValue := []string{}
		for _, field := range payload.RelatedProperties {
			relatedValue = append(relatedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
		}

		templateData["RelatedValues"] = strings.Join(relatedValue, "\n")
	}

	adaptiveCard, err := MakeAdaptiveCard(TrackPropertiesTemplate, templateData)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}

func (bot *MicrosoftTeamsBot) SendUserPropertiesAlert(channelId string, payload integrations.UserPropertiesAlertPayload) error {
	matchedValue := []string{}
	for _, field := range payload.MatchedProperties {
		matchedValue = append(matchedValue, fmt.Sprintf("**%s**: %s", field.Key, field.Value))
	}

	templateData := map[string]interface{}{
		"Title":                 "Highlight Track Properties Alert",
		"Description":           payload.UserIdentifier,
		"MatchedUserProperties": matchedValue,
		"ActionTitle":           "View Session",
		"ActionURL":             payload.SessionURL,
	}

	adaptiveCard, err := MakeAdaptiveCard(UserPropertiesTemplate, templateData)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}

func (bot *MicrosoftTeamsBot) SendNewUserAlert(channelId string, payload integrations.NewUserAlertPayload) error {

	facts := []*Fact{}

	for key, value := range payload.UserProperties {
		facts = append(facts, &Fact{
			Title: key,
			Value: value,
		})
	}

	jsonFacts, _ := json.Marshal(facts) // no need to handle errors here, we specify the json string - sort of

	newSessionAlertPayload := NewSessionAlertPayload{
		Title:          "Highlight New User Alert",
		SessionURL:     payload.SessionURL,
		UserIdentifier: payload.UserIdentifier,
		Facts:          string(jsonFacts),
	}

	if payload.AvatarURL != nil && *payload.AvatarURL != "" {
		newSessionAlertPayload.AvatarURL = *payload.AvatarURL
	}

	adaptiveCard, err := MakeAdaptiveCard(NewSessionAlertMessageTemplate, newSessionAlertPayload)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}

func (bot *MicrosoftTeamsBot) SendErrorFeedbackAlert(channelId string, payload integrations.ErrorFeedbackAlertPayload) error {
	facts := []*Fact{
		{
			Title: "Comment",
			Value: payload.CommentText,
		},
	}

	jsonFacts, _ := json.Marshal(facts)

	templateData := BasicTemplatePayload{
		Title:       "Highlight Error Feedback Alert",
		Description: payload.UserIdentifier,
		ActionURL:   payload.SessionCommentURL,
		Facts:       string(jsonFacts),
		ActionTitle: "View Comment",
	}

	adaptiveCard, err := MakeAdaptiveCard(BasicMessageTemplate, templateData)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}

func (bot *MicrosoftTeamsBot) SendRageClicksAlert(channelId string, payload integrations.RageClicksAlertPayload) error {
	facts := []*Fact{
		{
			Title: "User",
			Value: payload.UserIdentifier,
		},
		{
			Title: "Rage click count",
			Value: strconv.FormatInt(payload.RageClicksCount, 10),
		},
	}

	jsonFacts, _ := json.Marshal(facts)

	templateData := BasicTemplatePayload{
		Title:       "Highlight Rage Clicks Alert",
		Description: payload.UserIdentifier,
		ActionURL:   payload.SessionURL,
		Facts:       string(jsonFacts),
		ActionTitle: "View Session",
	}

	adaptiveCard, err := MakeAdaptiveCard(BasicMessageTemplate, templateData)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}

func (bot *MicrosoftTeamsBot) SendMetricMonitorAlert(channelId string, payload integrations.MetricMonitorAlertPayload) error {
	facts := []*Fact{
		{
			Title: "Value",
			Value: fmt.Sprintf("%s %s", payload.Value, payload.UnitsFormat),
		},
		{
			Title: "Threshold",
			Value: fmt.Sprintf("%s %s", payload.Threshold, payload.UnitsFormat),
		},
	}

	jsonFacts, _ := json.Marshal(facts)

	templateData := BasicTemplatePayload{
		Title:       "Highlight Metric Monitor Alert",
		Description: fmt.Sprintf("*%s* is currently %s %s over the threshold.", payload.MetricToMonitor, payload.DiffOverValue, payload.UnitsFormat),
		ActionURL:   payload.MonitorURL,
		Facts:       string(jsonFacts),
		ActionTitle: "View Monitor",
	}

	adaptiveCard, err := MakeAdaptiveCard(BasicMessageTemplate, templateData)
	if err != nil {
		return errors.Wrap(err, "error making adaptive card")
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProcessActivity(ctx, bot.makeChannelMessageActivity(channelId), handler)
	return err
}
