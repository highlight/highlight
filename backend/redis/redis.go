package opensearch

import (
	"os"

	"github.com/go-redis/redis"
)

var (
	RedisEventsStagingEndpoint string = os.Getenv("REDIS_EVENTS_STAGING_ENDPOINT")
)

type Client struct {
	Client *redis.Client
}

func Init() Client {
	return Client{
		Client: redis.NewClient(&redis.Options{
			Addr:     RedisEventsStagingEndpoint,
			Password: "", // no password set
			DB:       0,  // use default DB
		}),
	}
}
