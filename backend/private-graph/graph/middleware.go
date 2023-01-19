package graph

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/oauth"
	e "github.com/pkg/errors"
)

type APITokenHandler func(ctx context.Context, apiKey string) (*int, error)

var (
	AuthClient            *auth.Client
	OAuthServer           *oauth.Server
	workspaceTokenHandler APITokenHandler
)

var HighlightAdminEmailDomains = []string{"@highlight.run", "@highlight.io", "@runhighlight.com"}

func SetupAuthClient(oauthServer *oauth.Server, wsTokenHandler APITokenHandler) {
	secret := os.Getenv("FIREBASE_SECRET")
	creds, err := google.CredentialsFromJSON(context.Background(), []byte(secret),
		"https://www.googleapis.com/auth/firebase",
		"https://www.googleapis.com/auth/identitytoolkit",
		"https://www.googleapis.com/auth/userinfo.email")
	if err != nil {
		return
		log.Errorf("error converting credentials from json: %v", err)
	}
	app, err := firebase.NewApp(context.Background(), nil, option.WithCredentials(creds))
	if err != nil {
		return
		log.Errorf("error initializing firebase app: %v", err)
	}
	// create a client to communicate with firebase project
	if AuthClient, err = app.Auth(context.Background()); err != nil {
		log.Errorf("error creating firebase client: %v", err)
	}
	OAuthServer = oauthServer
	workspaceTokenHandler = wsTokenHandler
}

func updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	var uid string
	email := ""
	if token != "" {
		t, err := AuthClient.VerifyIDToken(context.Background(), token)
		if err != nil {
			return ctx, e.Wrap(err, "invalid id token")
		}
		uid = t.UID
		if userRecord, err := AuthClient.GetUser(context.Background(), uid); err == nil {
			email = userRecord.Email

			// This is to prevent attackers from impersonating Highlight staff.
			_, isAdmin := lo.Find(HighlightAdminEmailDomains, func(domain string) bool { return strings.Contains(email, domain) })
			if isAdmin && !userRecord.EmailVerified {
				email = ""
			}
		}
	}
	ctx = context.WithValue(ctx, model.ContextKeys.UID, uid)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, email)
	return ctx, nil
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
		span, _ := tracer.StartSpanFromContext(ctx, "middleware.private")
		defer span.Finish()
		var err error
		if token := r.Header.Get("token"); token != "" {
			span.SetOperationName("tokenHeader")
			ctx, err = updateContextWithAuthenticatedUser(ctx, token)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else if apiKey := r.Header.Get("ApiKey"); apiKey != "" {
			span.SetOperationName("apiKeyHeader")
			workspaceID, err := workspaceTokenHandler(ctx, apiKey)
			if err != nil || workspaceID == nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
		} else if sourcemapRequestToken := getSourcemapRequestToken(r); sourcemapRequestToken != "" {
			span.SetOperationName("sourcemapBody")
			workspaceID, err := workspaceTokenHandler(ctx, sourcemapRequestToken)
			if err != nil || workspaceID == nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
		} else if OAuthServer.HasCookie(r) {
			span.SetOperationName("oauth")
			var cookie *http.Cookie
			ctx, _, cookie, err = OAuthServer.Validate(ctx, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
			http.SetCookie(w, cookie)
		}
		ctx = context.WithValue(ctx, model.ContextKeys.AcceptEncoding, r.Header.Get("Accept-Encoding"))
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func WebsocketInitializationFunction() transport.WebsocketInitFunc {
	return transport.WebsocketInitFunc(func(socketContext context.Context, initPayload transport.InitPayload) (context.Context, error) {
		token := ""
		if initPayload["token"] != nil {
			token = fmt.Sprintf("%v", initPayload["token"])
		}
		ctx, err := updateContextWithAuthenticatedUser(socketContext, token)
		if err != nil {
			log.Errorf("Unable to authenticate/initialize websocket: %s", err.Error())
		}
		return ctx, err
	})
}
