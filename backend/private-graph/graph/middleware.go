package graph

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/go-oauth2/oauth2/v4"
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
)

var HighlightAdminEmailDomains = []string{"@highlight.run", "@highlight.io"}

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
	if authMode == Firebase {
		AuthClient = NewFirebaseClient(ctx)
	} else if authMode == Simple {
		AuthClient = &SimpleAuthClient{}
	} else if authMode == Password {
		AuthClient = &PasswordAuthClient{}
	} else if authMode == OAuth {
		AuthClient = NewOAuthClient(ctx, store)
	} else {
		log.WithContext(ctx).Fatalf("private graph auth client configured with unknown auth mode")
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
			ctx, err = AuthClient.updateContextWithAuthenticatedUser(ctx, token)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
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
		ctx, err := AuthClient.updateContextWithAuthenticatedUser(socketContext, token)
		if err != nil {
			log.WithContext(ctx).Errorf("Unable to authenticate/initialize websocket: %s", err.Error())
		}
		return ctx, &initPayload, err
	})
}
