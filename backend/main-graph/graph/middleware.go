package graph

import (
	"context"
	"log"
	"net/http"

	"firebase.google.com/go/auth"

	firebase "firebase.google.com/go"
	e "github.com/pkg/errors"
)

var AuthClient *auth.Client

func init() {
	app, err := firebase.NewApp(context.Background(), nil)
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
		token := r.Header.Get("token")
		t, err := AuthClient.VerifyIDToken(context.Background(), token)
		if err != nil {
			http.Error(w, e.Wrap(err, "invalid id token").Error(), http.StatusInternalServerError)
			return
		}

		ctx := context.WithValue(r.Context(), "uid", t.UID)
		next(w, r.WithContext(ctx))
	}
}
