package redis

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"gopkg.in/boj/redistore.v1"
)

var Store *redistore.RediStore

func SetupRedis() {
	// Fetch new store.
	s, err := redistore.NewRediStore(10, "tcp", os.Getenv("REDIS_ADDRESS"), "", []byte("here-is-some-secret-stuff"))
	if err != nil {
		log.Fatalf(fmt.Sprintf("error connecting to redis instance w/ address %v: %v", os.Getenv("REDIS_ADDRESS"), err))
	}
	s.Options = &sessions.Options{
		HttpOnly: true,
		// Expires every 10 years (we will IPO by then).
		MaxAge:   20 * 365 * 24 * 60 * 60,
		SameSite: http.SameSiteNoneMode,
	}
	Store = s
}
