package graph

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"

	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
)

var (
	AuthClient *auth.Client
)

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

func PrivateMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var uid string
		email := ""
		token := r.Header.Get("token")
		if token != "" {
			token := r.Header.Get("token")
			t, err := AuthClient.VerifyIDToken(context.Background(), token)
			if err != nil {
				http.Error(w, e.Wrap(err, "invalid id token").Error(), http.StatusInternalServerError)
				return
			}
			uid = t.UID
			if userRecord, err := AuthClient.GetUser(context.Background(), uid); err == nil {
				email = userRecord.Email

				// This is to prevent attackers from impersonating Highlight staff.
				if strings.Contains(userRecord.Email, "@highlight.run") && !userRecord.EmailVerified {
					email = ""
				}
			}
		}
		ctx := context.WithValue(r.Context(), model.ContextKeys.UID, uid)
		ctx = context.WithValue(ctx, model.ContextKeys.Email, email)
		ctx = context.WithValue(ctx, model.ContextKeys.AcceptEncoding, r.Header.Get("Accept-Encoding"))
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
