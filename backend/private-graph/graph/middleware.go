package graph

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"

	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
)

var (
	AuthClient *auth.Client
)

var HighlightAdminEmailDomains = []string{"@highlight.run", "@highlight.io", "@runhighlight.com"}

func SetupAuthClient() {
	secret := os.Getenv("FIREBASE_SECRET")
	creds, err := google.CredentialsFromJSON(context.Background(), []byte(secret),
		"https://www.googleapis.com/auth/firebase",
		"https://www.googleapis.com/auth/identitytoolkit",
		"https://www.googleapis.com/auth/userinfo.email")
	if err != nil {
		log.Fatalf("error converting credentials from json: %v", err)
	}
	app, err := firebase.NewApp(context.Background(), nil, option.WithCredentials(creds))
	if err != nil {
		log.Fatalf("error initializing firebase app: %v", err)
	}
	// create a client to communicate with firebase project
	if AuthClient, err = app.Auth(context.Background()); err != nil {
		log.Fatalf("error creating firebase client: %v", err)
	}
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

func PrivateMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("token")
		ctx, err := updateContextWithAuthenticatedUser(r.Context(), token)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
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
