package graph

import (
	"context"
	"net/http"
	"strings"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/backend/redis"

	e "github.com/pkg/errors"
)

func ClientMiddleWare(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
		// get users ip for geolocation data
		IPAddress := r.Header.Get("X-Real-Ip")
		if IPAddress == "" {
			IPAddress = r.Header.Get("X-Client-IP")
		}
		if IPAddress == "" {
			IPAddress = r.Header.Get("X-Forwarded-For")
			if IPAddress != "" && strings.Contains(IPAddress, ",") {
				if ipList := strings.Split(IPAddress, ","); len(ipList) > 0 {
					IPAddress = ipList[0]
				}
			}
		}
		if IPAddress == "" {
			IPAddress = r.RemoteAddr
		}

		// get user-agent string
		UserAgent := r.Header.Get("user-agent")
		// get the accept-language string
		AcceptLanguage := r.Header.Get("Accept-Language")
		// Pass the user's id, ip address, user agent, and accept-language through context.
		ctx := context.WithValue(r.Context(), "uid", session.Values["uid"])
		ctx = context.WithValue(ctx, "ip", IPAddress)
		ctx = context.WithValue(ctx, "userAgent", UserAgent)
		ctx = context.WithValue(ctx, "acceptLanguage", AcceptLanguage)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
