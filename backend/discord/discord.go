package discord

import (
	"context"
	"os"

	e "github.com/pkg/errors"

	"golang.org/x/oauth2"
)

// All scope constants that can be used.
const (
	ScopeIdentify                   = "identify"
	ScopeBot                        = "bot"
	ScopeEmail                      = "email"
	ScopeGuilds                     = "guilds"
	ScopeGuildsJoin                 = "guilds.join"
	ScopeConnections                = "connections"
	ScopeGroupDMJoin                = "gdm.join"
	ScopeMessagesRead               = "messages.read"
	ScopeRPC                        = "rpc"                    // Whitelist only
	ScopeRPCAPI                     = "rpc.api"                // Whitelist only
	ScopeRPCNotificationsRead       = "rpc.notifications.read" // Whitelist only
	ScopeWebhookIncoming            = "webhook.Incoming"
	ScopeApplicationsBuildsUpload   = "applications.builds.upload" // Whitelist only
	ScopeApplicationsBuildsRead     = "applications.builds.read"
	ScopeApplicationsStoreUpdate    = "applications.store.update"
	ScopeApplicationsEntitlements   = "applications.entitlements"
	ScopeRelationshipsRead          = "relationships.read" // Whitelist only
	ScopeActivitiesRead             = "activities.read"    // Whitelist only
	ScopeActivitiesWrite            = "activities.write"   // Whitelist only
	ScopeApplicationsCommands       = "applications.commands"
	ScopeApplicationsCommandsUpdate = "applications.commands.update"
)

func OAuth(ctx context.Context, code string) (*oauth2.Token, error) {
	var (
		ok                  bool
		DiscordClientID     string
		DiscordClientSecret string
		FrontendUri         string
	)
	if DiscordClientID, ok = os.LookupEnv("DISCORD_CLIENT_ID"); !ok || DiscordClientID == "" {
		return nil, e.New("DISCORD_CLIENT_ID not set")
	}
	if DiscordClientSecret, ok = os.LookupEnv("DISCORD_CLIENT_SECRET"); !ok || DiscordClientSecret == "" {
		return nil, e.New("DISCORD_CLIENT_SECRET not set")
	}
	if FrontendUri, ok = os.LookupEnv("REACT_APP_FRONTEND_URI"); !ok || FrontendUri == "" {
		return nil, e.New("REACT_APP_FRONTEND_URI not set")
	}

	DiscordEndpoint := oauth2.Endpoint{
		AuthURL:   "https://discord.com/api/oauth2/authorize",
		TokenURL:  "https://discord.com/api/oauth2/token",
		AuthStyle: oauth2.AuthStyleInParams,
	}

	conf := &oauth2.Config{
		ClientID:     DiscordClientID,
		ClientSecret: DiscordClientSecret,
		Scopes:       []string{ScopeBot},
		Endpoint:     DiscordEndpoint,
		RedirectURL:  FrontendUri + "/callback/discord",
	}

	return conf.Exchange(ctx, code)
}
