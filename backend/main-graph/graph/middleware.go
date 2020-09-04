package graph

import (
	"context"
	"log"
	"net/http"

	"firebase.google.com/go/auth"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/backend/redis"

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
		session, _ := redis.Store.Get(r, "admin-session")
		// If the session is new, grab the 'token' and validate it.
		if session.IsNew {
			user := &model.User{}
			if err := model.DB.Create(user).Error; err != nil {
				http.Error(w, e.Wrap(err, "error creating user").Error(), http.StatusInternalServerError)
				return
			}
			session.Values["uid"] = user.ID
			err := session.Save(r, w)
			if err != nil {
				http.Error(w, e.Wrap(err, "error saving session").Error(), http.StatusInternalServerError)
				return
			}
		}
		// Pass the user's id through context.
		ctx := context.WithValue(r.Context(), "uid", session.Values["uid"])
		next(w, r.WithContext(ctx))
	}
}
