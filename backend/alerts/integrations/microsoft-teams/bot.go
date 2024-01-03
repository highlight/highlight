package microsoft_teams

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/infracloudio/msbotbuilder-go/core"
	"github.com/infracloudio/msbotbuilder-go/core/activity"
	"github.com/infracloudio/msbotbuilder-go/schema"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type BotHandler struct {
	core.Adapter
	DB *gorm.DB
}

type MicrosoftTeamsBot struct {
	core.Adapter
	TenantID string
	BotID    string
}

type BotAdapter struct {
	Adapter core.Adapter
	BotID   string
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

					if err := ht.DB.Where(&query).Select(updateFields).Updates(updates).Error; err != nil {
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
