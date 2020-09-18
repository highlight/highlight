package redis

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-redis/redis/v8"
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
		// Expires every 10 years (we will IPO by then).
		MaxAge:   20 * 365 * 24 * 60 * 60,
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	}
	Store = s
}

func SetupRedisClient() {
	Client = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_ADDRESS"),
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	_, err := Client.Ping(context.Background()).Result()
	if err != nil {
		log.Fatalf(fmt.Sprintf("error connecting to redis instance w/ address %v: %v", os.Getenv("REDIS_ADDRESS"), err))
	}
}
