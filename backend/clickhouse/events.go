package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const SessionEventsTable = "session_events"
const SessionEventsView = "session_events_vw"
const EventKeysTable = "event_keys"
const EventKeyValuesTable = "event_key_values"

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
}

var defaultEventKeys = []*modelInputs.QueryKey{
	{Name: string(modelInputs.ReservedEventKeyFirstSession), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedEventKeyIdentified), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedEventKeySecureSessionID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedEventKeySessionActiveLength), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedEventKeySessionLength), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedEventKeySessionPagesVisited), Type: modelInputs.KeyTypeNumeric},
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
	useSampling: func(d time.Duration) bool {
		return false
	},
}

type SessionEventRow struct {
	UUID             string
	ProjectID        uint32
	SessionID        uint64
	SessionCreatedAt time.Time
	Timestamp        time.Time
	Event            string
	Attributes       map[string]string
}

func (client *Client) BatchWriteSessionEventRows(ctx context.Context, eventRows []*SessionEventRow) error {
	if len(eventRows) == 0 {
		return nil
	}

	rows := lo.Map(eventRows, func(l *SessionEventRow, _ int) interface{} {
		if len(l.UUID) == 0 {
			l.UUID = uuid.New().String()
		}
		return l
	})

	batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", SessionEventsTable))
	if err != nil {
		return e.Wrap(err, "failed to create session events batch")
	}

	for _, sessionEventRow := range rows {
		err = batch.AppendStruct(sessionEventRow)
		if err != nil {
			return err
		}
	}

	return batch.Send()
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

func (client *Client) EventsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	eventKeys, err := KeysAggregated(ctx, client, EventKeysTable, projectID, startDate, endDate, query, typeArg)
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

func (client *Client) EventsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, query *string, limit *int) ([]string, error) {
	if eventBooleanKeys[keyName] {
		return []string{"true", "false"}, nil
	}

	return KeyValuesAggregated(ctx, client, EventKeyValuesTable, projectID, keyName, startDate, endDate, query, limit)
}

func (client *Client) EventsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, eventsTableConfig, projectID, params)
}
