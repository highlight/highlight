package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"os"
	"strconv"

	"github.com/go-redis/redis"
	"github.com/golang/snappy"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
)

type Client struct {
	redisClient redis.Cmdable
}

var (
	redisEventsStagingEndpoint = os.Getenv("REDIS_EVENTS_STAGING_ENDPOINT")
	redisProjectIds            = []int{1, 1074} // Enabled for Highlight and Solitaired
)

func UseRedis(projectId int, sessionSecureId string) bool {
	sidHash := fnv.New32a()
	defer sidHash.Reset()
	if _, err := sidHash.Write([]byte(sessionSecureId)); err != nil {
		log.Error(errors.Wrap(err, "failed to hash secure id to int"))
	}

	// Enable redis for 10% of other traffic
	return lo.Contains(redisProjectIds, projectId) || sidHash.Sum32()%10 == 0
}

func EventsKey(sessionId int) string {
	return fmt.Sprintf("events-%d", sessionId)
}

func NewClient() *Client {
	if util.IsDevOrTestEnv() {
		return &Client{
			redisClient: redis.NewClient(&redis.Options{
				Addr:     redisEventsStagingEndpoint,
				Password: "",
			}),
		}
	} else {
		return &Client{
			redisClient: redis.NewClusterClient(&redis.ClusterOptions{
				Addrs:    []string{redisEventsStagingEndpoint},
				Password: "",
			}),
		}
	}

}

func (r *Client) GetEventObjects(ctx context.Context, s *model.Session, cursor model.EventsCursor) ([]model.EventsObject, error, *model.EventsCursor) {
	// Session is live if the cursor is not the default
	isLive := cursor != model.EventsCursor{}

	eventObjectIndex := "-inf"
	if cursor.EventObjectIndex != nil {
		eventObjectIndex = "(" + strconv.FormatInt(int64(*cursor.EventObjectIndex), 10)
	}

	vals, err := r.redisClient.ZRangeByScoreWithScores(EventsKey(s.ID), redis.ZRangeBy{
		Min: eventObjectIndex,
		Max: "+inf",
	}).Result()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving events from Redis"), nil
	}

	eventsObjects := []model.EventsObject{}

	if len(vals) == 0 {
		return eventsObjects, nil, &cursor
	}

	maxScore := 0
	for idx, z := range vals {
		intScore := int(z.Score)
		// Beacon events have decimals, skip them if it's live mode or not the last event
		if z.Score != float64(intScore) && (isLive || idx != len(vals)-1) {
			continue
		}
		if intScore > maxScore {
			maxScore = intScore
		}

		// Messages may be encoded with `snappy`.
		// Try decoding them, but if decoding fails, use the original message.
		asBytes := []byte(z.Member.(string))
		decoded, err := snappy.Decode(nil, asBytes)
		if err != nil {
			decoded = asBytes
		}

		eventsObjects = append(eventsObjects, model.EventsObject{
			Events: string(decoded),
		})
	}

	nextCursor := model.EventsCursor{EventIndex: 0, EventObjectIndex: pointy.Int(maxScore)}
	return eventsObjects, nil, &nextCursor
}

func (r *Client) GetEvents(ctx context.Context, s *model.Session, cursor model.EventsCursor) ([]interface{}, error, *model.EventsCursor) {
	allEvents := make([]interface{}, 0)

	eventsObjects, err, newCursor := r.GetEventObjects(ctx, s, cursor)
	if err != nil {
		return nil, errors.Wrap(err, "error getting events objects"), nil
	}

	if len(eventsObjects) == 0 {
		return allEvents, nil, &cursor
	}

	for _, obj := range eventsObjects {
		subEvents := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(obj.Events), &subEvents); err != nil {
			return nil, errors.Wrap(err, "error decoding event data"), nil
		}
		allEvents = append(allEvents, subEvents["events"]...)
	}

	if cursor.EventIndex != 0 && cursor.EventIndex < len(allEvents) {
		allEvents = allEvents[cursor.EventIndex:]
	}

	return allEvents, nil, newCursor
}

func (r *Client) AddEventPayload(sessionID int, score float64, payload string) error {
	encoded := string(snappy.Encode(nil, []byte(payload)))

	// Calls ZADD, and if the key does not exist yet, sets an expiry of 4h10m.
	var zAddAndExpire = redis.NewScript(`
		local key = KEYS[1]
		local score = ARGV[1]
		local value = ARGV[2]

		local count = redis.call("EXISTS", key)
		redis.call("ZADD", key, score, value)

		if count == 0 then
			redis.call("EXPIRE", key, 30000)
		end

		return
	`)

	keys := []string{EventsKey(sessionID)}
	values := []interface{}{score, encoded}
	cmd := zAddAndExpire.Run(r.redisClient, keys, values...)

	if err := cmd.Err(); err != nil && !errors.Is(err, redis.Nil) {
		return errors.Wrap(err, "error adding events payload in Redis")
	}
	return nil
}
