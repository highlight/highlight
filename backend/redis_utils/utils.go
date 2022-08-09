package redis_utils

import (
	"os"

	"github.com/go-redis/redis"
	"github.com/samber/lo"
)

var (
	useRedis                   = os.Getenv("ENABLE_OBJECT_STORAGE") == "true"
	redisEventsStagingEndpoint = os.Getenv("REDIS_EVENTS_STAGING_ENDPOINT")
	redisProjectIds            = []int{} // Disabled for all projects for now
)

func UseRedis(projectId int) bool {
	return useRedis && lo.Contains(redisProjectIds, projectId)
}

func NewClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     redisEventsStagingEndpoint,
		Password: "", // no password set
		DB:       0,  // use default DB
	})
}
