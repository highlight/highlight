package clickhouse

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const SessionEventsTable = "session_events"
const SessionEventsView = "session_events_view"

var eventsTableConfig = model.TableConfig{
	// AttributesColumn: TracesTableNoDefaultConfig.AttributesColumn,
	// BodyColumn:       TracesTableNoDefaultConfig.BodyColumn,
	// MetricColumn:     ptr.String("MetricValue"),
	// KeysToColumns:    TracesTableNoDefaultConfig.KeysToColumns,
	// ReservedKeys:     TracesTableNoDefaultConfig.ReservedKeys,
	// SelectColumns:    TracesTableNoDefaultConfig.SelectColumns,
	// TableName:        TracesTableNoDefaultConfig.TableName,
}

var eventsSamplingTableConfig = model.TableConfig{
	// AttributesColumn: metricsTableConfig.AttributesColumn,
	// BodyColumn:       metricsTableConfig.BodyColumn,
	// MetricColumn:     metricsTableConfig.MetricColumn,
	// KeysToColumns:    metricsTableConfig.KeysToColumns,
	// ReservedKeys:     metricsTableConfig.ReservedKeys,
	// SelectColumns:    metricsTableConfig.SelectColumns,
	// TableName:        fmt.Sprintf("%s SAMPLE %d", TracesSamplingTable, SamplingRows),
}

var EventsSampleableTableConfig = SampleableTableConfig{
	tableConfig:         eventsTableConfig,
	samplingTableConfig: eventsSamplingTableConfig,
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

func (client *Client) EventMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
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
	params.Query = params.Query + " " + modelInputs.ReservedTraceKeyMetricValue.String() + " exists"
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: MetricsSampleableTableConfig,
		ProjectIDs:       projectIDs,
		Params:           params,
		Column:           "",
		MetricTypes:      []modelInputs.MetricAggregator{modelInputs.MetricAggregatorCount},
		BucketCount:      pointy.Int(12),
		BucketBy:         modelInputs.MetricBucketByTimestamp.String(),
	})
}

func (client *Client) EventsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	if typeArg != nil && *typeArg == modelInputs.KeyTypeNumeric {
		metricKeys, err := KeysAggregated(ctx, client, MetricNamesTable, projectID, startDate, endDate, query, typeArg)
		if err != nil {
			return nil, err
		}

		return metricKeys, nil
	}

	return client.TracesKeys(ctx, projectID, startDate, endDate, query, typeArg)
}

func (client *Client) EventssKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, query *string, limit *int) ([]string, error) {
	return KeyValuesAggregated(ctx, client, TraceKeyValuesTable, projectID, keyName, startDate, endDate, query, limit)
}

func (client *Client) EventsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, metricsTableConfig, projectID, params)
}
