package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/parser"
	"github.com/huandu/go-sqlbuilder"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const SessionEventsTable = "session_events"
const SessionEventsView = "session_events_vw"
const EventKeysTable = "event_keys_new"
const EventKeyValuesTable = "event_key_values_new"

var eventKeysToColumns = map[string]string{
	string(modelInputs.ReservedEventKeyBrowserName):         "BrowserName",
	string(modelInputs.ReservedEventKeyBrowserVersion):      "BrowserVersion",
	string(modelInputs.ReservedEventKeyCity):                "City",
	string(modelInputs.ReservedEventKeyCountry):             "Country",
	string(modelInputs.ReservedEventKeyEnvironment):         "Environment",
	string(modelInputs.ReservedEventKeyEvent):               "Event",
	string(modelInputs.ReservedEventKeyFirstSession):        "FirstSession",
	string(modelInputs.ReservedEventKeyIdentified):          "Identified",
	string(modelInputs.ReservedEventKeyIdentifier):          "Identifier",
	string(modelInputs.ReservedEventKeyIP):                  "IP",
	string(modelInputs.ReservedEventKeyServiceVersion):      "ServiceVersion",
	string(modelInputs.ReservedEventKeySessionActiveLength): "SessionActiveLength",
	string(modelInputs.ReservedEventKeySessionLength):       "SessionLength",
	string(modelInputs.ReservedEventKeySessionPagesVisited): "SessionPagesVisited",
	string(modelInputs.ReservedEventKeyOsName):              "OSName",
	string(modelInputs.ReservedEventKeyOsVersion):           "OSVersion",
	string(modelInputs.ReservedEventKeySecureSessionID):     "SecureSessionId",
	string(modelInputs.ReservedEventKeyState):               "State",
	string(modelInputs.ReservedEventKeyTimestamp):           "Timestamp",
}

var defaultEventKeys = []*modelInputs.QueryKey{
	{Name: string(modelInputs.ReservedEventKeyFirstSession), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedEventKeyIdentified), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedEventKeySecureSessionID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedEventKeySessionActiveLength), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedEventKeySessionLength), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedEventKeySessionPagesVisited), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedEventKeyTimestamp), Type: modelInputs.KeyTypeNumeric},
}

var eventBooleanKeys = map[string]bool{
	string(modelInputs.ReservedEventKeyFirstSession): true,
	string(modelInputs.ReservedEventKeyIdentified):   true,
}

var reservedEventKeys = lo.Map(modelInputs.AllReservedEventKey, func(key modelInputs.ReservedEventKey, _ int) string {
	return string(key)
})

var eventsTableConfig = model.TableConfig{
	AttributesColumn: "Attributes",
	BodyColumn:       "Event",
	KeysToColumns:    eventKeysToColumns,
	ReservedKeys:     reservedEventKeys,
	TableName:        SessionEventsView,
}

var EventsSampleableTableConfig = SampleableTableConfig{
	tableConfig: eventsTableConfig,
}

type SessionEventRow struct {
	UUID             string
	ProjectID        uint32
	SessionID        uint64
	SessionCreatedAt int64
	Timestamp        int64
	Event            string
	Attributes       map[string]string
}

func (client *Client) BatchWriteSessionEventRows(ctx context.Context, eventRows []*SessionEventRow) error {
	if len(eventRows) == 0 {
		return nil
	}

	chEvents := []interface{}{}

	for _, event := range eventRows {
		if event == nil {
			return errors.New("nil event")
		}

		newEvent := *event
		if len(newEvent.UUID) == 0 {
			newEvent.UUID = uuid.New().String()
		}

		chEvents = append(chEvents, newEvent)
	}

	if len(chEvents) > 0 {
		chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
			"async_insert":          1,
			"wait_for_async_insert": 1,
		}))

		eventsSql, eventsArgs := sqlbuilder.
			NewStruct(new(SessionEventRow)).
			InsertInto(SessionEventsTable, chEvents...).
			BuildWithFlavor(sqlbuilder.ClickHouse)
		eventsSql, eventsArgs = replaceTimestampInserts(eventsSql, eventsArgs, map[int]bool{3: true, 4: true}, MicroSeconds)

		return client.conn.Exec(chCtx, eventsSql, eventsArgs...)
	}

	return nil
}

func (client *Client) ReadEventsMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: EventsSampleableTableConfig,
		ProjectIDs:       []int{projectID},
		Params:           params,
		Column:           column,
		MetricTypes:      metricTypes,
		GroupBy:          groupBy,
		BucketCount:      nBuckets,
		BucketWindow:     bucketWindow,
		BucketBy:         bucketBy,
		Limit:            limit,
		LimitAggregator:  limitAggregator,
		LimitColumn:      limitColumn,
	})
}

func (client *Client) ReadWorkspaceEventCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: EventsSampleableTableConfig,
		ProjectIDs:       projectIDs,
		Params:           params,
		Column:           "",
		MetricTypes:      []modelInputs.MetricAggregator{modelInputs.MetricAggregatorCount},
		BucketCount:      pointy.Int(12),
		BucketBy:         modelInputs.MetricBucketByTimestamp.String(),
	})
}

func GetEventsQueryImpl(params modelInputs.QueryInput, projectId int, selectColumns string, orderBy *string, limit *int, offset *int) (string, []interface{}, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.From(fmt.Sprintf("%s FINAL", eventsTableConfig.TableName))

	sb.Where(sb.Equal("ProjectId", projectId)).
		Where(sb.LessEqualThan("Timestamp", params.DateRange.EndDate)).
		Where(sb.GreaterEqualThan("Timestamp", params.DateRange.StartDate))

	listener := parser.GetSearchListener(sb, params.Query, eventsTableConfig)
	parser.GetSearchFilters(params.Query, eventsTableConfig, listener)

	sb.Select(selectColumns)

	if orderBy != nil {
		sb = sb.OrderBy(*orderBy)
	}
	if limit != nil {
		sb = sb.Limit(*limit)
	}
	if offset != nil {
		sb = sb.Offset(*offset)
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	return sql, args, nil
}

func (client *Client) QueryEventSessionIds(ctx context.Context, projectId int, count int, params modelInputs.QueryInput, sortField string, page *int) ([]int64, int64, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, err := GetEventsQueryImpl(
		params, projectId,
		"DISTINCT SessionId, count() OVER() AS total",
		pointy.String(sortField), pointy.Int(count), pointy.Int(offset),
	)
	if err != nil {
		return nil, 0, err
	}

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, 0, err
	}

	var sessionIDs []int64
	var total uint64
	for rows.Next() {
		var sessionID int64
		columns := []interface{}{&sessionID, &total}
		if err := rows.Scan(columns...); err != nil {
			return nil, 0, err
		}
		sessionIDs = append(sessionIDs, sessionID)
	}

	return sessionIDs, int64(total), nil
}

func (client *Client) EventsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType, event *string) ([]*modelInputs.QueryKey, error) {
	eventKeys, err := KeysAggregated(ctx, client, EventKeysTable, projectID, startDate, endDate, query, typeArg, event)
	if err != nil {
		return nil, err
	}

	if query == nil || *query == "" {
		eventKeys = append(eventKeys, defaultEventKeys...)
	} else {
		queryLower := strings.ToLower(*query)
		for _, key := range defaultEventKeys {
			if strings.Contains(key.Name, queryLower) {
				eventKeys = append(eventKeys, key)
			}
		}
	}

	return eventKeys, nil
}

func (client *Client) EventsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, query *string, limit *int, event *string) ([]string, error) {
	if eventBooleanKeys[keyName] {
		return []string{"true", "false"}, nil
	}

	return KeyValuesAggregated(ctx, client, EventKeyValuesTable, projectID, keyName, startDate, endDate, query, limit, event)
}

func (client *Client) EventsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, eventsTableConfig, projectID, params)
}
