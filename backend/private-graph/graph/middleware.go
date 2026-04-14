package graph

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/samber/lo"

	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/go-oauth2/oauth2/v4"
	"github.com/highlight-run/highlight/backend/enterprise"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/oauth"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/util"
	log "github.com/sirupsen/logrus"
)

type APITokenHandler func(ctx context.Context, apiKey string) (*int, error)

var (
	AuthClient            Client
	OAuthServer           *oauth.Server
	workspaceTokenHandler APITokenHandler
	migrationStore        *store.Store
)

// migrationBlockedResponse is a GraphQL-formatted JSON error for blocked users.
var migrationBlockedResponse = []byte(`{"errors":[{"message":"Highlight has migrated to LaunchDarkly. Visit https://www.highlight.io/blog/launchdarkly-migration for migration details.","extensions":{"code":"MIGRATION_BLOCKED"}}]}`)

// isUserInAllowedWorkspace checks if the authenticated user (by UID) belongs
// to at least one of the allowed workspaces defined in SystemConfiguration.
// Uses a single query that joins system_configurations to avoid two round trips.
// Fails open (returns true) when: no store, no UID, no config row, or empty allowlist.
func isUserInAllowedWorkspace(ctx context.Context, uid string) bool {
	if migrationStore == nil || uid == "" {
		return true
	}
	var allowed bool
	if err := migrationStore.DB.WithContext(ctx).Raw(`
		SELECT COALESCE(
			(SELECT CASE
				WHEN sc.migration_allowlist IS NULL
				  OR array_length(sc.migration_allowlist, 1) IS NULL THEN true
				ELSE EXISTS (
					SELECT 1 FROM workspace_admins wa
					INNER JOIN admins a ON a.id = wa.admin_id
					WHERE a.uid = ? AND wa.workspace_id = ANY(sc.migration_allowlist)
				)
			END
			FROM system_configurations sc WHERE sc.active = true LIMIT 1),
			true
		)
	`, uid).Scan(&allowed).Error; err != nil {
		log.WithContext(ctx).WithError(err).Warn("failed to check workspace membership for migration block")
		return true
	}
	return allowed
}

// writeMigrationBlockedError writes a 403 response with a GraphQL-formatted error body.
func writeMigrationBlockedError(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusForbidden)
	_, _ = w.Write(migrationBlockedResponse)
}

// migrationBypassOperations are GraphQL operations that must be allowed even
// when the caller is not yet a member of any allowlisted workspace. These
// cover the signup → onboarding → workspace-join flow.
var migrationBypassOperations = map[string]bool{
	"CreateAdmin":                true,
	"UpdateAdminAboutYouDetails": true,
	"AddAdminToWorkspace":        true,
	"JoinWorkspace":              true,
}

// getGraphQLOperationName reads the request body, extracts the GraphQL
// operationName field, and restores the body so downstream handlers can
// read it again.
func getGraphQLOperationName(r *http.Request) string {
	body, err := io.ReadAll(r.Body)
	r.Body = io.NopCloser(bytes.NewBuffer(body))
	if err != nil {
		return ""
	}
	var payload struct {
		OperationName string `json:"operationName"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return ""
	}
	return payload.OperationName
}

var HighlightAdminEmailDomains = []string{"@highlight.run", "@highlight.io"}
var EnterpriseAuthModes = []AuthMode{Firebase, OAuth}

type AuthMode = string

const (
	Simple   AuthMode = "Simple"
	Firebase AuthMode = "Firebase"
	Password AuthMode = "Password"
	OAuth    AuthMode = "OAuth"
)

func GetEnvAuthMode() AuthMode {
	if strings.EqualFold(env.Config.AuthMode, Simple) {
		return Simple
	}
	if strings.EqualFold(env.Config.AuthMode, Password) {
		return Password
	}
	if strings.EqualFold(env.Config.AuthMode, OAuth) {
		return OAuth
	}
	return Firebase
}

func SetupAuthClient(ctx context.Context, store *store.Store, authMode AuthMode, oauthServer *oauth.Server, wsTokenHandler APITokenHandler) {
	OAuthServer = oauthServer
	workspaceTokenHandler = wsTokenHandler
	if store != nil {
		migrationStore = store
	}

	log.WithContext(ctx).WithField("mode", authMode).Info("configuring private graph auth client")
	if lo.Contains(EnterpriseAuthModes, authMode) {
		enterprise.RequireEnterprise(ctx)
	}
	var err error
	if authMode == Firebase {
		AuthClient, err = NewCloudAuthClient(ctx, store)
	} else if authMode == Simple {
		AuthClient = &SimpleAuthClient{}
	} else if authMode == Password {
		AuthClient = &PasswordAuthClient{}
	} else if authMode == OAuth {
		AuthClient, err = NewOAuthClient(ctx, store)
	} else {
		log.WithContext(ctx).Fatalf("private graph auth client configured with unknown auth mode")
	}
	if err != nil {
		log.WithContext(ctx).WithError(err).Fatalf("private graph auth client failed to configure")
	}
}

func getSourcemapRequestToken(r *http.Request) string {
	body, err := io.ReadAll(r.Body)
	// put the body back so that graphql can also read it
	r.Body = io.NopCloser(bytes.NewBuffer(body))
	if err != nil {
		return ""
	}
	var graphqlQuery struct {
		Query     string
		Variables struct {
			APIKey string `json:"api_key"`
		}
	}
	err = json.Unmarshal(body, &graphqlQuery)
	if err != nil {
		return ""
	}
	return graphqlQuery.Variables.APIKey
}

func PrivateMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		span, ctx := util.StartSpanFromContext(ctx, "middleware.private")
		defer span.Finish()
		var err error

		var token string
		if t := r.Header.Get(tokenCookieName); t != "" {
			span.SetAttribute("type", "tokenHeader")
			token = t
		} else if t, err := r.Cookie(tokenCookieName); err == nil && t.Value != "" {
			span.SetAttribute("type", "tokenCookie")
			token = t.Value
		}

		if token != "" {
			ctx, err = AuthClient.updateContextWithAuthenticatedUser(ctx, w, r, token)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
			// Check if the authenticated user belongs to an allowed workspace.
			// Bypass for operations that run before the user has joined any workspace
			// (signup/onboarding/invite acceptance).
			if uid, ok := ctx.Value(model.ContextKeys.UID).(string); ok && uid != "" {
				if !migrationBypassOperations[getGraphQLOperationName(r)] && !isUserInAllowedWorkspace(ctx, uid) {
					writeMigrationBlockedError(w)
					return
				}
			}
		} else if apiKey := r.Header.Get("ApiKey"); apiKey != "" {
			span.SetAttribute("type", "apiKeyHeader")
			workspaceID, err := workspaceTokenHandler(ctx, apiKey)
			if err != nil || workspaceID == nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
		} else if sourcemapRequestToken := getSourcemapRequestToken(r); sourcemapRequestToken != "" {
			span.SetAttribute("type", "sourcemapBody")
			workspaceID, err := workspaceTokenHandler(ctx, sourcemapRequestToken)
			if err != nil || workspaceID == nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
		} else if OAuthServer.HasCookie(r) || OAuthServer.HasBearer(r) {
			span.SetAttribute("type", "oauth")
			var cookie *http.Cookie
			var tokenInfo oauth2.TokenInfo
			ctx, tokenInfo, cookie, err = OAuthServer.Validate(ctx, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
			http.SetCookie(w, cookie)
			span.SetAttribute("client_id", tokenInfo.GetClientID())
			span.SetAttribute("user_id", tokenInfo.GetUserID())
		}
		ctx = context.WithValue(ctx, model.ContextKeys.AcceptEncoding, r.Header.Get("Accept-Encoding"))
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func WebsocketInitializationFunction() transport.WebsocketInitFunc {
	return transport.WebsocketInitFunc(func(socketContext context.Context, initPayload transport.InitPayload) (context.Context, *transport.InitPayload, error) {
		token := ""
		if initPayload["token"] != nil {
			token = fmt.Sprintf("%v", initPayload["token"])
		}
		ctx, err := AuthClient.updateContextWithAuthenticatedUser(socketContext, nil, nil, token)
		if err != nil {
			log.WithContext(ctx).Errorf("Unable to authenticate/initialize websocket: %s", err.Error())
			return ctx, &initPayload, err
		}
		// Check if the authenticated user belongs to an allowed workspace
		if uid, ok := ctx.Value(model.ContextKeys.UID).(string); ok && uid != "" {
			if !isUserInAllowedWorkspace(ctx, uid) {
				return ctx, &initPayload, fmt.Errorf("Highlight has migrated to LaunchDarkly")
			}
		}
		return ctx, &initPayload, nil
	})
}
