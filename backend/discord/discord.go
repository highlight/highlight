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

var Endpoint = oauth2.Endpoint{
	AuthURL:   "https://discord.com/api/oauth2/authorize",
	TokenURL:  "https://discord.com/api/oauth2/token",
	AuthStyle: oauth2.AuthStyleInParams,
}

func oauthConfig() (*oauth2.Config, error) {
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

	return &oauth2.Config{
		ClientID:     DiscordClientID,
		ClientSecret: DiscordClientSecret,
		Scopes:       []string{ScopeBot},
		Endpoint:     Endpoint,
		RedirectURL:  FrontendUri + "/callback/discord",
	}, nil
}

func OAuth(ctx context.Context, code string) (*oauth2.Token, error) {
	conf, err := oauthConfig()

	if err != nil {
		return nil, e.Wrap(err, "failed to generate discord oauth config")
	}
	return conf.Exchange(ctx, code)
}

func RefreshOAuth(ctx context.Context, token *oauth2.Token) (*oauth2.Token, error) {
	conf, err := oauthConfig()

	if err != nil {
		return nil, e.Wrap(err, "failed to generate discord oauth config")
	}

	tokenSource := conf.TokenSource(ctx, token)

	newToken, err := tokenSource.Token()
	if err != nil {
		return nil, e.Wrap(err, "failed to refetch new token for discord")
	}

	return newToken, nil
}
