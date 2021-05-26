package graph

import (
	"context"
	"net/http"
	"strings"
)

func PublicMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
		ctx := context.WithValue(r.Context(), "ip", IPAddress)         //nolint
		ctx = context.WithValue(ctx, "userAgent", UserAgent)           //nolint
		ctx = context.WithValue(ctx, "acceptLanguage", AcceptLanguage) //nolint
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
