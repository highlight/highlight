package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strconv"
	"time"

	"github.com/go-redis/cache/v9"
	"github.com/go-redsync/redsync/v4"
	"github.com/go-redsync/redsync/v4/redis/goredis/v9"
	"github.com/golang/snappy"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	hmetric "github.com/highlight/highlight/sdk/highlight-go/metric"
)

const CacheKeyHubspotCompanies = "hubspot-companies"
const CacheKeySessionsToProcess = "sessions-to-process"

type Client struct {
	Client  redis.Cmdable
	Cache   *cache.Cache
	Redsync *redsync.Redsync
}

const LockPollInterval = 100 * time.Millisecond

var (
	ServerAddr = os.Getenv("REDIS_EVENTS_STAGING_ENDPOINT")
)

func EventsKey(sessionId int) string {
	return fmt.Sprintf("events-%d", sessionId)
}

func NetworkResourcesKey(sessionId int) string {
	return fmt.Sprintf("network-resources-%d", sessionId)
}

func WebSocketEventsKey(sessionId int) string {
	return fmt.Sprintf("web-socket-events-%d", sessionId)
}

func SessionInitializedKey(sessionSecureId string) string {
	return fmt.Sprintf("session-init-%s", sessionSecureId)
}

func BillingQuotaExceededKey(projectId int, productType model.PricingProductType) string {
	return fmt.Sprintf("billing-quota-exceeded-%d-%s", projectId, productType)
}

func LastLogTimestampKey(projectId int) string {
	return fmt.Sprintf("last-log-timestamp-%d", projectId)
}

func ServiceGithubErrorCountKey(serviceId int) string {
	return fmt.Sprintf("service-github-errors-%d", serviceId)
}

func GithubRateLimitKey(gitHubRepo string) string {
	return fmt.Sprintf("github-rate-limit-exceeded-%s", gitHubRepo)
}

func GitHubFileErrorKey(gitHubRepo string, version string, fileName string) string {
	return fmt.Sprintf("github-file-error-%s-%s-%s", gitHubRepo, version, fileName)
}

func NewClient() *Client {
	var lfu cache.LocalCache
	// disable lfu cache locally to allow flushing cache between test-cases
	if !util.IsTestEnv() {
		lfu = cache.NewTinyLFU(100_000, time.Second)
	}
	if util.IsDevOrTestEnv() {
		client := redis.NewClient(&redis.Options{
			Addr:            ServerAddr,
			Password:        "",
			ReadTimeout:     5 * time.Second,
			WriteTimeout:    5 * time.Second,
			ConnMaxIdleTime: 5 * time.Minute,
			ConnMaxLifetime: 5 * time.Minute,
			MaxRetries:      5,
			MinIdleConns:    16,
			PoolSize:        256,
		})
		return &Client{
			Client: client,
			Cache: cache.New(&cache.Options{
				Redis:      client,
				LocalCache: lfu,
			}),
			Redsync: redsync.New(goredis.NewPool(client)),
		}
	} else {
		c := redis.NewClusterClient(&redis.ClusterOptions{
			Addrs:           []string{ServerAddr},
			Password:        "",
			ReadTimeout:     5 * time.Second,
			WriteTimeout:    5 * time.Second,
			ConnMaxIdleTime: 5 * time.Minute,
			ConnMaxLifetime: 5 * time.Minute,
			MaxRetries:      5,
			MinIdleConns:    16,
			PoolSize:        256,
			OnConnect: func(ctx context.Context, _ *redis.Conn) error {
				hmetric.Incr(ctx, "redis.new-conn", nil, 1)
				return nil
			},
		})
		rCache := cache.New(&cache.Options{
			Redis:      c,
			LocalCache: lfu,
		})
		go func() {
			ctx := context.Background()
			for {
				stats := c.PoolStats()
				if stats == nil {
					return
				}
				hmetric.Histogram(ctx, "redis.hits", float64(stats.Hits), nil, 1)
				hmetric.Histogram(ctx, "redis.misses", float64(stats.Misses), nil, 1)
				hmetric.Histogram(ctx, "redis.idle-conns", float64(stats.IdleConns), nil, 1)
				hmetric.Histogram(ctx, "redis.stale-conns", float64(stats.StaleConns), nil, 1)
				hmetric.Histogram(ctx, "redis.total-conns", float64(stats.TotalConns), nil, 1)
				hmetric.Histogram(ctx, "redis.timeouts", float64(stats.Timeouts), nil, 1)

				if stats := rCache.Stats(); stats != nil {
					hmetric.Histogram(ctx, "redis.cache.hits", float64(stats.Hits), nil, 1)
					hmetric.Histogram(ctx, "redis.cache.misses", float64(stats.Misses), nil, 1)
				}

				time.Sleep(time.Second)
			}
		}()
		return &Client{
			Client:  c,
			Cache:   rCache,
			Redsync: redsync.New(goredis.NewPool(c)),
		}
	}
}

func (r *Client) RemoveValues(ctx context.Context, sessionId int, payloadType model.RawPayloadType, valuesToRemove []interface{}) error {
	cmd := r.Client.ZRem(ctx, GetKey(sessionId, payloadType), valuesToRemove...)
	if cmd.Err() != nil {
		return errors.Wrap(cmd.Err(), "error removing values from Redis")
	}
	return nil
}

func (r *Client) GetRawZRange(ctx context.Context, sessionId int, nextPayloadId *int, payloadType model.RawPayloadType) ([]redis.Z, error) {
	maxScore := "+inf"
	if nextPayloadId != nil {
		maxScore = "(" + strconv.FormatInt(int64(*nextPayloadId), 10)
	}

	vals, err := r.Client.ZRangeByScoreWithScores(ctx, GetKey(sessionId, payloadType), &redis.ZRangeBy{
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
	case model.PayloadTypeWebSocketEvents:
		return WebSocketEventsKey(sessionId)
	default:
		return ""
	}
}

func (r *Client) GetSessionData(ctx context.Context, sessionId int, payloadType model.RawPayloadType, objects map[int]string) ([]string, error) {
	key := GetKey(sessionId, payloadType)

	vals, err := r.Client.ZRangeByScoreWithScores(ctx, key, &redis.ZRangeBy{
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

	results := []string{}
	if len(keys) == 0 {
		return results, nil
	}

	for _, k := range keys {
		results = append(results, objects[k])
	}

	return results, nil
}

func (r *Client) GetEventObjects(ctx context.Context, s *model.Session, cursor model.EventsCursor, events map[int]string) ([]model.EventsObject, error, *model.EventsCursor) {
	// Session is live if the cursor is not the default
	isLive := cursor.EventObjectIndex != nil

	eventObjectIndex := "-inf"
	if cursor.EventObjectIndex != nil {
		eventObjectIndex = "(" + strconv.FormatInt(int64(*cursor.EventObjectIndex), 10)
	}

	vals, err := r.Client.ZRangeByScoreWithScores(ctx, EventsKey(s.ID), &redis.ZRangeBy{
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

	if cursor.EventIndex != 0 && cursor.EventIndex <= len(allEvents) {
		allEvents = allEvents[cursor.EventIndex:]
	}

	return allEvents, nil, newCursor
}

func (r *Client) GetResources(ctx context.Context, s *model.Session, resources map[int]string) ([]interface{}, error) {
	allResources := make([]interface{}, 0)
	results, err := r.GetSessionData(ctx, s.ID, model.PayloadTypeResources, resources)
	if err != nil {
		return nil, err
	}

	for _, result := range results {
		asBytes := []byte(result)

		// Messages may be encoded with `snappy`.
		// Try decoding them, but if decoding fails, use the original message.
		decoded, err := snappy.Decode(nil, asBytes)
		if err != nil {
			decoded = asBytes
		}

		resourceObject := model.ResourcesObject{
			Resources: string(decoded),
		}

		subResources := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(resourceObject.Resources), &subResources); err != nil {
			return nil, errors.Wrap(err, "error decoding resource data")
		}
		allResources = append(allResources, subResources["resources"]...)
	}

	if err != nil {
		return nil, errors.Wrap(err, "error getting resource objects")
	}

	return allResources, nil
}

// Adds a session to be processed `delaySeconds` in the future
func (r *Client) AddSessionToProcess(ctx context.Context, sessionId int, delaySeconds int) error {
	score := float64(time.Now().Unix() + int64(delaySeconds))

	cmd := r.Client.ZAdd(ctx, CacheKeySessionsToProcess, redis.Z{
		Score:  score,
		Member: sessionId,
	})
	if err := cmd.Err(); err != nil {
		return err
	}

	return nil
}

// Removes a session after processing (successfully or with errors)
// Only removes the session if its processing time is from a 'lock',
// in case more events were added after it started processing.
func (r *Client) RemoveSessionToProcess(ctx context.Context, sessionId int) error {
	var script = redis.NewScript(`
		local key = KEYS[1]
		local sessionId = ARGV[1]
		
		local score = tonumber(redis.call("ZSCORE", key, sessionId))
		if score ~= nil and score ~= math.floor(score) then
			return redis.call("ZREM", key, sessionId)
		end
		
		return 0
	`)

	keys := []string{CacheKeySessionsToProcess}
	values := []interface{}{sessionId}
	cmd := script.Run(ctx, r.Client, keys, values...)

	if err := cmd.Err(); err != nil && !errors.Is(err, redis.Nil) {
		return err
	}

	return nil
}

// Retrieves up to `limit` sessions to process. Sets the processing time
// for each to `lockPeriod` minutes after the current time, so they
// can be retried in case processing fails.
func (r *Client) GetSessionsToProcess(ctx context.Context, lockPeriod int, limit int) ([]int64, error) {
	now := time.Now().Unix()
	// Use a non-integer score, then check the score again when removing processed sessions
	// in case a session had new events added to it while it was being processed.
	timeAfterLock := float64(now+int64(60*lockPeriod)) + .5
	var script = redis.NewScript(`
		local key = KEYS[1]
		local now = ARGV[1]
		local timeAfterLock = ARGV[2]
		local limit = ARGV[3]
		local range = redis.call("ZRANGEBYSCORE", key, 0, now, "LIMIT", 0, limit)

		local input = {}
		local count = 0
		for k, item in pairs(range) do 
			table.insert(input, timeAfterLock)
			table.insert(input, item)
			count = count + 1
		end

		if count == 0 then
			return {}
		end

		redis.call("ZADD", key, unpack(input))

		return range
	`)

	keys := []string{CacheKeySessionsToProcess}
	values := []interface{}{time.Now().Unix(), timeAfterLock, limit}
	cmd := script.Run(ctx, r.Client, keys, values...)

	if err := cmd.Err(); err != nil && !errors.Is(err, redis.Nil) {
		return nil, err
	}

	return cmd.Int64Slice()
}

func (r *Client) AddPayload(ctx context.Context, sessionID int, score float64, payloadType model.RawPayloadType, payload []byte) (int, error) {
	encoded := string(snappy.Encode(nil, payload))

	// Calls ZADD, and if the key does not exist yet, sets an expiry of 4h10m.
	var zAddAndExpire = redis.NewScript(`
		local key = KEYS[1]
		local score = ARGV[1]
		local value = ARGV[2]

		local count = redis.call("ZCARD", key)
		redis.call("ZADD", key, score, value)

		if count == 0 then
			redis.call("EXPIRE", key, 30000)
		end

		return count + 1
	`)

	keys := []string{GetKey(sessionID, payloadType)}
	values := []interface{}{score, encoded}
	cmd := zAddAndExpire.Run(ctx, r.Client, keys, values...)

	if err := cmd.Err(); err != nil && !errors.Is(err, redis.Nil) {
		return 0, errors.Wrap(err, "error adding events payload in Redis")
	}
	return cmd.Int()
}

func (r *Client) getString(ctx context.Context, key string) (string, error) {
	val, err := r.Client.Get(ctx, key).Result()

	// return empty for non-existent keys
	if err == redis.Nil {
		return "", nil
	} else if err != nil {
		return "", errors.Wrap(err, "error getting string from Redis")
	}
	return val, nil
}

func (r *Client) setFlag(ctx context.Context, key string, value bool, exp time.Duration) error {
	return set(ctx, r, key, value, exp)
}

func (r *Client) getFlag(ctx context.Context, key string) (bool, error) {
	val, err := r.getString(ctx, key)
	return val == "1" || val == "true", err
}

func set[T any](ctx context.Context, r *Client, key string, value T, exp time.Duration) error {
	cmd := r.Client.Set(ctx, key, value, exp)
	if cmd.Err() != nil {
		return errors.Wrap(cmd.Err(), "error setting flag from Redis")
	}
	return nil
}

func (r *Client) getFlagOrNil(ctx context.Context, key string) (*bool, error) {
	val, err := r.getString(ctx, key)
	if err == nil && val == "" {
		return nil, nil
	}
	return pointy.Bool(val == "1" || val == "true"), err
}

func (r *Client) IsPendingSession(ctx context.Context, sessionSecureId string) (bool, error) {
	return r.getFlag(ctx, SessionInitializedKey(sessionSecureId))
}

func (r *Client) SetIsPendingSession(ctx context.Context, sessionSecureId string, initialized bool) error {
	return r.setFlag(ctx, SessionInitializedKey(sessionSecureId), initialized, 24*time.Hour)
}

func (r *Client) IsBillingQuotaExceeded(ctx context.Context, projectId int, productType model.PricingProductType) (*bool, error) {
	return r.getFlagOrNil(ctx, BillingQuotaExceededKey(projectId, productType))
}

func (r *Client) SetBillingQuotaExceeded(ctx context.Context, projectId int, productType model.PricingProductType, exceeded bool) error {
	return r.setFlag(ctx, BillingQuotaExceededKey(projectId, productType), exceeded, 1*time.Minute)
}

func (r *Client) GetCustomerBillingInvalid(ctx context.Context, stripeCustomerID string) (bool, error) {
	return r.getFlag(ctx, fmt.Sprintf("billing-invalid-%s", stripeCustomerID))
}

func (r *Client) SetCustomerBillingInvalid(ctx context.Context, stripeCustomerID string, value bool) error {
	return r.setFlag(ctx, fmt.Sprintf("billing-invalid-%s", stripeCustomerID), value, 30*24*time.Hour)
}

func (r *Client) GetCustomerBillingWarning(ctx context.Context, stripeCustomerID string) (time.Time, error) {
	result, err := r.getString(ctx, fmt.Sprintf("billing-warning-%s", stripeCustomerID))
	if err != nil || result == "" {
		return time.Time{}, err
	}
	return time.Parse(time.RFC3339Nano, result)
}

func (r *Client) SetCustomerBillingWarning(ctx context.Context, stripeCustomerID string, value time.Time) error {
	return set(ctx, r, fmt.Sprintf("billing-warning-%s", stripeCustomerID), value.Format(time.RFC3339Nano), 30*24*time.Hour)
}

func (r *Client) SetHubspotCompanies(ctx context.Context, companies interface{}) error {
	span, _ := util.StartSpanFromContext(ctx, "redis.cache.SetHubspotCompanies")
	defer span.Finish()
	if err := r.Cache.Set(&cache.Item{
		Ctx:   ctx,
		Key:   CacheKeyHubspotCompanies,
		Value: companies,
		TTL:   time.Hour,
	}); err != nil {
		span.Finish(err)
		return err
	}
	return nil
}

func (r *Client) GetHubspotCompanies(ctx context.Context, companies interface{}) (err error) {
	span, _ := util.StartSpanFromContext(ctx, "redis.cache.GetHubspotCompanies")
	err = r.Cache.Get(ctx, CacheKeyHubspotCompanies, companies)
	span.Finish(err)
	return
}

func (r *Client) SetGithubRateLimitExceeded(ctx context.Context, gitHubRepo string, expirationTime time.Time) error {
	expirationDuration := time.Until(expirationTime)
	if expirationDuration <= 0 {
		expirationDuration = time.Hour
	}

	return r.setFlag(ctx, GithubRateLimitKey(gitHubRepo), true, expirationDuration)
}

func (r *Client) GetGithubRateLimitExceeded(ctx context.Context, gitHubRepo string) (bool, error) {
	return r.getFlag(ctx, GithubRateLimitKey(gitHubRepo))
}

func (r *Client) IncrementServiceErrorCount(ctx context.Context, projectId int) (int64, error) {
	serviceKey := ServiceGithubErrorCountKey(projectId)
	count, err := r.Client.Incr(ctx, serviceKey).Result()

	if count == 1 {
		r.Client.Expire(ctx, serviceKey, time.Hour)
	}

	return count, err
}

func (r *Client) ResetServiceErrorCount(ctx context.Context, projectId int) (int64, error) {
	serviceKey := ServiceGithubErrorCountKey(projectId)
	return r.Client.Del(ctx, serviceKey).Result()
}

func (r *Client) SetGitHubFileError(ctx context.Context, gitHubRepo string, version string, fileName string) error {
	return r.setFlag(ctx, GitHubFileErrorKey(gitHubRepo, version, fileName), true, 1*time.Hour)
}

func (r *Client) GetGitHubFileError(ctx context.Context, repo string, version string, fileName string) (bool, error) {
	return r.getFlag(ctx, GitHubFileErrorKey(repo, version, fileName))
}

func (r *Client) AcquireLock(_ context.Context, key string, timeout time.Duration) (*redsync.Mutex, error) {
	mutex := r.Redsync.NewMutex(
		key,
		redsync.WithRetryDelay(LockPollInterval),
		redsync.WithTries(int(timeout/LockPollInterval)),
		// ecs containers have up to 25 seconds to shut down
		redsync.WithExpiry(25*time.Second),
	)
	return mutex, mutex.Lock()
}

func (r *Client) FlushDB(ctx context.Context) error {
	if util.IsDevOrTestEnv() {
		return r.Client.FlushAll(ctx).Err()
	}
	return nil
}

func (r *Client) Del(ctx context.Context, key string) error {
	if util.IsDevOrTestEnv() {
		return r.Client.Del(ctx, key).Err()
	}
	return nil
}

func (r *Client) TTL(ctx context.Context, key string) time.Duration {
	return r.Client.TTL(ctx, key).Val()
}
