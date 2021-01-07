package redis

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-redis/redis/v7"
	"github.com/gorilla/sessions"
	"gopkg.in/boj/redistore.v1"
)

// Store is used for working w/ cookies.
var Store *redistore.RediStore

// Client is used for working w/ actual redis data (e.g. session keepalive).
var Client *redis.Client

func SetupRedisStore() {
	// Fetch new store.
	s, err := redistore.NewRediStore(10, "tcp", os.Getenv("REDIS_ADDRESS"), "", []byte("here-is-some-secret-stuff"))
	if err != nil {
		log.Fatalf(fmt.Sprintf("error connecting to redis instance w/ address %v: %v", os.Getenv("REDIS_ADDRESS"), err))
	}
	s.Options = &sessions.Options{
		HttpOnly: true,
		// Expires every 5 days.
		MaxAge:   5 * 24 * 60 * 60,
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	}
	Store = s
}
