package graph

import (
	"context"
	"net/http"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/backend/redis"
	e "github.com/pkg/errors"
)

func ClientMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := redis.Store.Get(r, "highlight-session")
		// If the session is new (or empty), create a brand new user.
		if session.IsNew || session.Values["uid"] == nil {
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
