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
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"go.opentelemetry.io/otel/trace"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"

	"github.com/golang-jwt/jwt/v4"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"

	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/go-oauth2/oauth2/v4"
	e "github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/oauth"
	"github.com/highlight-run/highlight/backend/util"
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
)

func GetEnvAuthMode() AuthMode {
	if strings.EqualFold(os.Getenv("REACT_APP_AUTH_MODE"), Simple) {
		return Simple
	}
	if strings.EqualFold(os.Getenv("REACT_APP_AUTH_MODE"), Password) {
		return Password
	}
	return Firebase
}

type Client interface {
	updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error)
	GetUser(ctx context.Context, uid string) (*auth.UserRecord, error)
}

type SimpleAuthClient struct{}

type PasswordAuthClient struct{}

type FirebaseAuthClient struct {
	AuthClient *auth.Client
}

func (c *FirebaseAuthClient) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	return c.AuthClient.GetUser(ctx, uid)
}

func SetupAuthClient(ctx context.Context, authMode AuthMode, oauthServer *oauth.Server, wsTokenHandler APITokenHandler) {
	OAuthServer = oauthServer
	workspaceTokenHandler = wsTokenHandler
	if authMode == Firebase {
		secret := os.Getenv("FIREBASE_SECRET")
		creds, err := google.CredentialsFromJSON(context.Background(), []byte(secret),
			"https://www.googleapis.com/auth/firebase",
			"https://www.googleapis.com/auth/identitytoolkit",
			"https://www.googleapis.com/auth/userinfo.email")
		if err != nil {
			log.WithContext(ctx).Errorf("error converting credentials from json: %v", err)
			return
		}
		app, err := firebase.NewApp(context.Background(), nil, option.WithCredentials(creds))
		if err != nil {
			log.WithContext(ctx).Errorf("error initializing firebase app: %v", err)
			return
		}
		// create a client to communicate with firebase project
		var client *auth.Client
		if client, err = app.Auth(context.Background()); err != nil {
			log.WithContext(ctx).Errorf("error creating firebase client: %v", err)
			return
		}
		AuthClient = &FirebaseAuthClient{AuthClient: client}
	} else if authMode == Simple {
		AuthClient = &SimpleAuthClient{}
	} else if authMode == Password {
		AuthClient = &PasswordAuthClient{}
	} else {
		log.WithContext(ctx).Fatalf("private graph auth client configured with unknown auth mode")
	}
}

func (c *SimpleAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func authenticateToken(tokenString string) (jwt.MapClaims, error) {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(JwtAccessSecret), nil
	})
	if err != nil {
		return claims, e.Wrap(err, "invalid id token")
	}

	exp, ok := claims["exp"]
	if !ok {
		return claims, e.Wrap(err, "invalid exp claim")
	}

	expClaim := int64(exp.(float64))
	if time.Now().After(time.Unix(expClaim, 0)) {
		return claims, e.Wrap(err, "token expired")
	}

	return claims, nil
}

func (c *PasswordAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func (c *PasswordAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	var uid string
	email := ""

	if token != "" {
		claims, err := authenticateToken(token)
		if err != nil {
			return ctx, err
		}

		email = claims["email"].(string)
		uid = claims["uid"].(string)
	}

	ctx = context.WithValue(ctx, model.ContextKeys.UID, uid)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, email)
	return ctx, nil
}

func (c *SimpleAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	ctx = context.WithValue(ctx, model.ContextKeys.UID, "demo@example.com")
	ctx = context.WithValue(ctx, model.ContextKeys.Email, "demo@example.com")
	return ctx, nil
}

func (c *FirebaseAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	var uid string
	email := ""
	if token != "" {
		t, err := c.AuthClient.VerifyIDToken(context.Background(), token)
		if err != nil {
			return ctx, e.Wrap(err, "invalid id token")
		}
		uid = t.UID
		if userRecord, err := c.AuthClient.GetUser(context.Background(), uid); err == nil {
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
		span, ctx := util.StartSpanFromContext(ctx, "middleware.private", util.WithSpanKind(trace.SpanKindServer))
		defer span.Finish()
		var err error
		if token := r.Header.Get("token"); token != "" {
			span.SetAttribute("type", "tokenHeader")
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
	return transport.WebsocketInitFunc(func(socketContext context.Context, initPayload transport.InitPayload) (context.Context, error) {
		token := ""
		if initPayload["token"] != nil {
			token = fmt.Sprintf("%v", initPayload["token"])
		}
		ctx, err := AuthClient.updateContextWithAuthenticatedUser(socketContext, token)
		if err != nil {
			log.WithContext(ctx).Errorf("Unable to authenticate/initialize websocket: %s", err.Error())
		}
		return ctx, err
	})
}
