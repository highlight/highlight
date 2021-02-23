package graph

import (
	"context"
	"log"
	"net/http"
	"os"

	"firebase.google.com/go/auth"

	firebase "firebase.google.com/go"
	beeline "github.com/honeycombio/beeline-go"
	e "github.com/pkg/errors"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

var (
	AuthClient *auth.Client
	DemoHeader string = "Highlight-Demo"
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

func AdminMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// If we're on a demo domain, we have some special logic.
		beeline.AddField(r.Context(), "backend", "main-graph")
		var uid string
		if r.Header.Get(DemoHeader) != "true" {
			token := r.Header.Get("token")
			t, err := AuthClient.VerifyIDToken(context.Background(), token)
			if err != nil {
				http.Error(w, e.Wrap(err, "invalid id token").Error(), http.StatusInternalServerError)
				return
			}
			uid = t.UID
		}
		ctx := context.WithValue(r.Context(), "uid", uid)
		next(w, r.WithContext(ctx))
	}
}
