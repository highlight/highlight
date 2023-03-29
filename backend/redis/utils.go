package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/golang/snappy"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"
)

type Client struct {
	redisClient redis.Cmdable
}

var (
	ServerAddr = os.Getenv("REDIS_EVENTS_STAGING_ENDPOINT")
)

func UseRedis(projectId int, sessionSecureId string) bool {
	return true
}

func EventsKey(sessionId int) string {
	return fmt.Sprintf("events-%d", sessionId)
}

func NetworkResourcesKey(sessionId int) string {
	return fmt.Sprintf("network-resources-%d", sessionId)
}

func ConsoleMessagesKey(sessionId int) string {
	return fmt.Sprintf("console-messages-%d", sessionId)
}

func SessionInitializedKey(sessionSecureId string) string {
	return fmt.Sprintf("session-init-%s", sessionSecureId)
}

func BillingQuotaExceededKey(projectId int) string {
	return fmt.Sprintf("billing-quota-exceeded-%d", projectId)
}

func LastLogTimestampKey(projectId int) string {
	return fmt.Sprintf("last-log-timestamp-%d", projectId)
}

func NewClient() *Client {
	if util.IsDevOrTestEnv() {
		return &Client{
			redisClient: redis.NewClient(&redis.Options{
				Addr:         ServerAddr,
				Password:     "",
				ReadTimeout:  5 * time.Second,
				WriteTimeout: 5 * time.Second,
				MaxConnAge:   5 * time.Minute,
				IdleTimeout:  5 * time.Minute,
				MaxRetries:   5,
				MinIdleConns: 16,
				PoolSize:     256,
			}),
		}
	} else {
		c := redis.NewClusterClient(&redis.ClusterOptions{
			Addrs:        []string{ServerAddr},
			Password:     "",
			ReadTimeout:  5 * time.Second,
			WriteTimeout: 5 * time.Second,
			MaxConnAge:   5 * time.Minute,
			IdleTimeout:  5 * time.Minute,
			MaxRetries:   5,
			MinIdleConns: 16,
			PoolSize:     256,
			OnConnect: func(context.Context, *redis.Conn) error {
				hlog.Incr("redis.new-conn", nil, 1)
				return nil
			},
		})
		go func() {
			for {
				stats := c.PoolStats()
				if stats == nil {
					return
				}
				hlog.Histogram("redis.hits", float64(stats.Hits), nil, 1)
				hlog.Histogram("redis.misses", float64(stats.Misses), nil, 1)
				hlog.Histogram("redis.idle-conns", float64(stats.IdleConns), nil, 1)
				hlog.Histogram("redis.stale-conns", float64(stats.StaleConns), nil, 1)
				hlog.Histogram("redis.total-conns", float64(stats.TotalConns), nil, 1)
				hlog.Histogram("redis.timeouts", float64(stats.Timeouts), nil, 1)
				time.Sleep(time.Second)
			}
		}()
		return &Client{
			redisClient: c,
		}
	}
}

func (r *Client) RemoveValues(ctx context.Context, sessionId int, valuesToRemove []interface{}) error {
	cmd := r.redisClient.ZRem(ctx, EventsKey(sessionId), valuesToRemove...)
	if cmd.Err() != nil {
		return errors.Wrap(cmd.Err(), "error removing values from Redis")
	}
	return nil
}

func (r *Client) GetRawZRange(ctx context.Context, sessionId int, nextPayloadId int) ([]redis.Z, error) {
	maxScore := "(" + strconv.FormatInt(int64(nextPayloadId), 10)

	vals, err := r.redisClient.ZRangeByScoreWithScores(ctx, EventsKey(sessionId), &redis.ZRangeBy{
		Min: "-inf",
		Max: maxScore,
	}).Result()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving prior events from Redis")
	}

	return vals, nil
}

func GetKey(sessionId int, payloadType model.RawPayloadType) string {
	switch payloadType {
	case model.PayloadTypeEvents:
		return EventsKey(sessionId)
	case model.PayloadTypeResources:
		return NetworkResourcesKey(sessionId)
	case model.PayloadTypeMessages:
		return ConsoleMessagesKey(sessionId)
	default:
		return ""
	}
}

func (r *Client) GetSessionData(ctx context.Context, sessionId int, payloadType model.RawPayloadType, objects map[int]string) ([]model.SessionData, error) {
	key := GetKey(sessionId, payloadType)

	vals, err := r.redisClient.ZRangeByScoreWithScores(ctx, key, &redis.ZRangeBy{
		Min: "-inf",
		Max: "+inf",
	}).Result()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving events from Redis")
	}

	for idx, z := range vals {
		intScore := int(z.Score)
		// Beacon payloads have decimals, skip unless it's the last payload
		if z.Score != float64(intScore) && idx != len(vals)-1 {
			continue
		}

		objects[intScore] = z.Member.(string)
	}

	keys := make([]int, 0, len(objects))
	for k := range objects {
		keys = append(keys, k)
	}
	sort.Ints(keys)

	results := []model.SessionData{}
	if len(keys) == 0 {
		return results, nil
	}

	for _, k := range keys {
		asBytes := []byte(objects[k])

		// Messages may be encoded with `snappy`.
		// Try decoding them, but if decoding fails, use the original message.
		decoded, err := snappy.Decode(nil, asBytes)
		if err != nil {
			decoded = asBytes
		}

		results = append(results, model.SessionData{
			Data: string(decoded),
		})
	}

	return results, nil
}

func (r *Client) GetEventObjects(ctx context.Context, s *model.Session, cursor model.EventsCursor, events map[int]string) ([]model.EventsObject, error, *model.EventsCursor) {
	// Session is live if the cursor is not the default
	isLive := cursor != model.EventsCursor{}

	eventObjectIndex := "-inf"
	if cursor.EventObjectIndex != nil {
		eventObjectIndex = "(" + strconv.FormatInt(int64(*cursor.EventObjectIndex), 10)
	}

	vals, err := r.redisClient.ZRangeByScoreWithScores(ctx, EventsKey(s.ID), &redis.ZRangeBy{
		Min: eventObjectIndex,
		Max: "+inf",
	}).Result()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving events from Redis"), nil
	}

	for idx, z := range vals {
		intScore := int(z.Score)
		// Beacon events have decimals, skip them if it's live mode or not the last event
		if z.Score != float64(intScore) && (isLive || idx != len(vals)-1) {
			continue
		}

		events[intScore] = z.Member.(string)
	}

	keys := make([]int, 0, len(events))
	for k := range events {
		keys = append(keys, k)
	}
	sort.Ints(keys)

	eventsObjects := []model.EventsObject{}
	if len(keys) == 0 {
		return eventsObjects, nil, &cursor
	}

	maxScore := keys[len(keys)-1]

	for _, k := range keys {
		asBytes := []byte(events[k])

		// Messages may be encoded with `snappy`.
		// Try decoding them, but if decoding fails, use the original message.
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

func (r *Client) GetEvents(ctx context.Context, s *model.Session, cursor model.EventsCursor, events map[int]string) ([]interface{}, error, *model.EventsCursor) {
	allEvents := make([]interface{}, 0)

	eventsObjects, err, newCursor := r.GetEventObjects(ctx, s, cursor, events)
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

func (r *Client) AddPayload(ctx context.Context, sessionID int, score float64, payloadType model.RawPayloadType, payload []byte) error {
	encoded := string(snappy.Encode(nil, payload))

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

	keys := []string{GetKey(sessionID, payloadType)}
	values := []interface{}{score, encoded}
	cmd := zAddAndExpire.Run(ctx, r.redisClient, keys, values...)

	if err := cmd.Err(); err != nil && !errors.Is(err, redis.Nil) {
		return errors.Wrap(err, "error adding events payload in Redis")
	}
	return nil
}

func (r *Client) setString(ctx context.Context, key string, value string, exp time.Duration) error {
	cmd := r.redisClient.Set(ctx, key, value, exp)
	if cmd.Err() != nil {
		return errors.Wrap(cmd.Err(), "error setting string from Redis")
	}
	return nil
}

func (r *Client) getString(ctx context.Context, key string) (string, error) {
	val, err := r.redisClient.Get(ctx, key).Result()

	// return empty for non-existent keys
	if err == redis.Nil {
		return "", nil
	} else if err != nil {
		return "", errors.Wrap(err, "error getting string from Redis")
	}
	return val, nil
}

func (r *Client) setFlag(ctx context.Context, key string, value bool, exp time.Duration) error {
	cmd := r.redisClient.Set(ctx, key, value, exp)
	if cmd.Err() != nil {
		return errors.Wrap(cmd.Err(), "error setting flag from Redis")
	}
	return nil
}

func (r *Client) getFlag(ctx context.Context, key string) (bool, error) {
	val, err := r.redisClient.Get(ctx, key).Result()

	// ignore non-existent keys
	if err == redis.Nil {
		return false, nil
	} else if err != nil {
		return false, errors.Wrap(err, "error getting flag from Redis")
	}
	return val == "1" || val == "true", nil
}

func (r *Client) IsPendingSession(ctx context.Context, sessionSecureId string) (bool, error) {
	return r.getFlag(ctx, SessionInitializedKey(sessionSecureId))
}

func (r *Client) SetIsPendingSession(ctx context.Context, sessionSecureId string, initialized bool) error {
	return r.setFlag(ctx, SessionInitializedKey(sessionSecureId), initialized, 24*time.Hour)
}

func (r *Client) IsBillingQuotaExceeded(ctx context.Context, projectId int) (bool, error) {
	return r.getFlag(ctx, BillingQuotaExceededKey(projectId))
}

func (r *Client) SetBillingQuotaExceeded(ctx context.Context, projectId int) error {
	return r.setFlag(ctx, BillingQuotaExceededKey(projectId), true, 5*time.Minute)
}

func (r *Client) GetLastLogTimestamp(ctx context.Context, projectId int) (time.Time, error) {
	str, err := r.getString(ctx, LastLogTimestampKey(projectId))
	if err != nil {
		return time.Time{}, err
	}
	// If no key set, assume time.Now()
	if str == "" {
		return time.Now(), nil
	}
	return time.Parse(time.RFC3339, str)
}

func (r *Client) SetLastLogTimestamp(ctx context.Context, projectId int, timestamp time.Time) error {
	str := timestamp.Format(time.RFC3339)
	return r.setString(ctx, LastLogTimestampKey(projectId), str, 0)
}
