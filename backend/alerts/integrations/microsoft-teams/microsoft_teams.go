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
	"time"

	"github.com/pkg/errors"

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

var (
	authBaseUrl    = "https://login.microsoftonline.com"
	JiraApiBaseUrl = "https://microsoft.graph.com"
)

var oauthEndPoint = oauth2.Endpoint{
	AuthURL:   fmt.Sprintf("%s/oauth2/v2.0/authorize", authBaseUrl),
	TokenURL:  fmt.Sprintf("%s/oauth2/v2.0/token", authBaseUrl),
	AuthStyle: oauth2.AuthStyleInParams,
}

type MicrosoftTeamsTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
}

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
			return turn.SendActivity(activity.MsgOptionText("Sample attachment"), activity.MsgOptionAttachments(attachments))
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
		return turn.SendActivity(activity.MsgOptionText("POOONGGGG!!!!!!!!!!!!!"))
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

		return turn.Activity, nil // TODO: I intended to send nothing back here but ...
	},
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
					query := &model.Workspace{
						MicrosoftTeamsTenantId: &act.Conversation.TenantID,
					}
					updates := &model.Workspace{
						MicrosoftTeamsTenantId:        nil,
						MicrosoftTeamsConversationRef: nil,
					}
					if err := ht.DB.Where(query).Select("microsoft_teams_conversation_ref", "microsoft_teams_tenant_id").Updates(updates).Error; err != nil {
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
					query := &model.Workspace{
						MicrosoftTeamsTenantId: &act.Conversation.TenantID,
					}

					conversationReference := activity.GetCoversationReference(act)

					conversation := conversationReference.Conversation
					conversationReferenceData := map[string]interface{}{
						"id":               conversation.ID,
						"isGroup":          conversation.IsGroup,
						"conversationType": conversation.ConversationType,
						"tenantID":         conversation.TenantID,
						"name":             conversation.Name,
						"aadObjectId":      conversation.AadObjectID,
						"role":             "bot",
					}

					if err := ht.DB.Where(&query).Select("microsoft_teams_conversation_ref").Updates(&model.Workspace{MicrosoftTeamsConversationRef: conversationReferenceData}).Error; err != nil {
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

func MakeBotAdapter() (core.Adapter, error) {
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

	return adapter, nil
}

func NewMicrosoftTeamsBot() (*MicrosoftTeamsBot, error) {
	adapter, err := MakeBotAdapter()
	if err != nil {
		log.Println("Error creating adapter: ", err)
		return nil, errors.New("error creating microsoft teams bot adapter")
	}
	return &MicrosoftTeamsBot{adapter}, nil
}

func BotHandlerFunc(db *gorm.DB) (*BotHandler, error) {
	adapter, err := MakeBotAdapter()
	if err != nil {
		log.Println("Error creating adapter: ", err)
		return nil, err
	}

	botHandler := &BotHandler{adapter, db}
	return botHandler, nil
}

// RegisterMicrosoftTeamsBotHandler registers a POST url at endpoint/microsoft-teams/bot
func RegisterMicrosoftTeamsBotHandler(r *chi.Mux, endpoint string, db *gorm.DB) {
	fmt.Println("Microsoft Teams Bot registeration started")
	botHandler, err := BotHandlerFunc(db)
	if err != nil {
		log.Println("Microsoft teams bot handler could not be set because of", err)
		return
	} else {
		fmt.Println("URLL", fmt.Sprintf("%s/%s", endpoint, "microsoft-teams-bot"))
		r.Post(fmt.Sprintf("%s/%s", endpoint, "microsoft-teams/bot"), http.HandlerFunc(botHandler.ServeHTTP))
		fmt.Println("Microsoft Teams Bot registered")
	}
}

func GetOAuthConfig() (*oauth2.Config, []oauth2.AuthCodeOption, error) {
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

	return &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     oauthEndPoint,
		RedirectURL:  fmt.Sprintf("%s/callback/microsoft_teams", frontendUri),
	}, []oauth2.AuthCodeOption{}, nil
}

func GetAccessToken(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, opts, err := GetOAuthConfig()

	if err != nil {
		return nil, err
	}

	return conf.Exchange(ctx, code, opts...)
}

func doPostRequest[TOut any, TIn any](accessToken string, url string, input TIn) (TOut, error) {
	var zero TOut
	b, err := json.Marshal(input)
	if err != nil {
		return zero, err
	}

	return doRequest[TOut]("POST", accessToken, url, string(b))
}

// func doGetRequest[T any](accessToken string, url string) (T, error) {
// 	return doRequest[T]("GET", accessToken, url, "")
// }

func doRequest[T any](method string, accessToken string, url string, body string) (T, error) {
	var unmarshalled T
	client := &http.Client{}

	// code to tell whether we are using absoluteUrl or relative url
	var finalUrl = fmt.Sprintf("%s%s", JiraApiBaseUrl, url)
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
		return unmarshalled, errors.New("Jira API responded with error; status_code=" + res.Status + "; body=" + string(b))
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

	response, err := doPostRequest[*MicrosoftTeamsTokenResponse]("", oauthEndPoint.TokenURL, payload)
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

func GetTeamsChannel(tenantId string) ([]*model.MicrosoftTeamsChannel, error) {
	// TODO: Implement this
	channels := []*model.MicrosoftTeamsChannel{
		{ID: "19:2dbc75ed0f8846a9a6b448afdf909286@thread.tacv2", Name: "General"},
		{ID: "19:6b49795502b2466db51b004a0de90b9c@thread.tacv2", Name: "Monthly Reports"},
	}
	return channels, nil
}

type Fact struct {
	Title string `json:"title"`
	Value string `json:"value"`
}

func (bot *MicrosoftTeamsBot) SendLogAlert(channelId string, payload integrations.LogAlertPayload, workspace *model.Workspace) error {
	if workspace.MicrosoftTeamsConversationRef == nil {
		return errors.New("microsoft teams bot installation not complete")
	}

	var conversation schema.ConversationAccount
	err := workspace.MicrosoftTeamsConversationRef.Scan(conversation)

	fmt.Println("Worskpace conversation restored")

	if err != nil {
		return errors.New("invalid microsoft teams conversation reference found")
	}

	/**
	What could go wrong

	**/
	fmt.Println("TEST> About to create conversation reference")
	conversationRef := schema.ConversationReference{
		Bot: schema.ChannelAccount{
			ID:   "28:9817330b-7262-42de-bfa9-055b47b67967",
			Name: "highlight-notifications",
		},
		Conversation: conversation,
		ChannelID:    "msteams",
		// Locale:       "en-GB",
		ServiceURL: "https://smba.trafficmanager.net/amer/",
	}
	fmt.Println("TEST> Conversation reference cereated")
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

	titleTextBlock := map[string]interface{}{
		"type":   "TextBlock",
		"size":   "Medium",
		"weight": "Bolder",
		"text":   "Highlight Log Alert",
	}

	description := fmt.Sprintf("*%s* is currently %s the threshold.", payload.Name, aboveStr)

	descriptionTextBlock := map[string]interface{}{
		"type": "TextBlock",
		"text": description,
		"wrap": true,
	}

	columnSet := map[string]interface{}{
		"type":  "Column",
		"width": "stretch",
		"items": []map[string]interface{}{descriptionTextBlock},
	}

	decriptionTextBlock := map[string]interface{}{
		"type":    "ColumnSet",
		"columns": []map[string]interface{}{columnSet},
	}

	action := map[string]interface{}{
		"type":  "Action.OpenUrl",
		"title": "View Logs",
		"url":   payload.AlertURL,
	}
	actions := []map[string]interface{}{action}

	var body []map[string]interface{}

	body = append(body, titleTextBlock)
	body = append(body, decriptionTextBlock)
	body = append(body, factset)

	adaptiveCard := map[string]interface{}{
		"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
		"type":    "AdaptiveCard",
		"version": "1.6",
		"body":    body,
		"actions": actions,
	}

	handler := makeAttachmentHandler(adaptiveCard)
	ctx := context.Background()

	err = bot.Adapter.ProactiveMessage(ctx, conversationRef, handler)
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
	workspace := input.Workspace

	adminName := input.Admin.Name

	if adminName == nil {
		adminName = input.Admin.Email
	}
	description := "Log alerts will now be sent to this channel."
	frontendURL := os.Getenv("FRONTEND_URI")
	alertUrl := fmt.Sprintf("%s/%d/%s/%d", frontendURL, input.Project.Model.ID, "alerts/logs", alert.ID)
	message := fmt.Sprintf("👋 %s has %s the alert \"%s\". %s %s", *adminName, input.OperationName, alert.GetName(), description, alertUrl)

	channels := alert.MicrosoftTeamsChannelsToNotify

	bot, err := NewMicrosoftTeamsBot()

	if err != nil {
		return errors.New("microsoft teams bot installation not complete")
	}

	for _, channel := range channels {

		fmt.Println(channel)

		if workspace.MicrosoftTeamsConversationRef == nil {
			return errors.New("microsoft teams bot installation not complete")
		}

		conversation := schema.ConversationAccount{
			IsGroup:          true,
			ConversationType: "channel",
			ID:               channel.ID,
			TenantID:         *workspace.MicrosoftTeamsTenantId,
		}

		newActivity := schema.Activity{
			Type:         schema.Message,
			ChannelID:    "msteams",
			ServiceURL:   "https://smba.trafficmanager.net/amer/",
			Conversation: conversation,
			From: schema.ChannelAccount{
				// TODO: unhardcode
				ID: "28:9817330b-7262-42de-bfa9-055b47b67967",
			},
		}

		handler := makeMessageHandler(message)
		ctx := context.Background()

		err = bot.Adapter.ProcessActivity(ctx, newActivity, handler)

		if err != nil {
			log.WithContext(ctx).Error(err)
			return err
		}
	}

	return nil
}
