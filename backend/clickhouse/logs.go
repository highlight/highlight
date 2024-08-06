package clickhouse

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/openlyinc/pointy"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	e "github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/parser/listener"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/huandu/go-sqlbuilder"
	"github.com/samber/lo"
)

const LogsTable = "logs"
const LogsSamplingTable = "logs_sampling"
const LogKeysTable = "log_keys"
const LogKeyValuesTable = "log_key_values"

var logKeysToColumns = map[string]string{
	string(modelInputs.ReservedLogKeyLevel):           "SeverityText",
	string(modelInputs.ReservedLogKeySecureSessionID): "SecureSessionId",
	string(modelInputs.ReservedLogKeySpanID):          "SpanId",
	string(modelInputs.ReservedLogKeyTraceID):         "TraceId",
	string(modelInputs.ReservedLogKeySource):          "Source",
	string(modelInputs.ReservedLogKeyServiceName):     "ServiceName",
	string(modelInputs.ReservedLogKeyServiceVersion):  "ServiceVersion",
	string(modelInputs.ReservedLogKeyEnvironment):     "Environment",
	string(modelInputs.ReservedLogKeyMessage):         "Body",
	string(modelInputs.ReservedLogKeyTimestamp):       "Timestamp",
}

// These keys show up as recommendations, but with no recommended values due to high cardinality
var defaultLogKeys = []*modelInputs.QueryKey{
	{Name: string(modelInputs.ReservedLogKeySecureSessionID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedLogKeySpanID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedLogKeyTraceID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedLogKeyMessage), Type: modelInputs.KeyTypeString},
}

var reservedLogKeys = lo.Map(modelInputs.AllReservedLogKey, func(key modelInputs.ReservedLogKey, _ int) string {
	return string(key)
})

var LogsTableConfig = model.TableConfig{
	TableName:        LogsTable,
	KeysToColumns:    logKeysToColumns,
	ReservedKeys:     reservedLogKeys,
	BodyColumn:       "Body",
	SeverityColumn:   "SeverityText",
	AttributesColumn: "LogAttributes",
	SelectColumns: []string{
		"ProjectId",
		"Timestamp",
		"UUID",
		"SeverityText",
		"Body",
		"LogAttributes",
		"TraceId",
		"SpanId",
		"SecureSessionId",
		"Source",
		"ServiceName",
		"ServiceVersion",
		"Environment",
	},
}

var logsSamplingTableConfig = model.TableConfig{
	TableName:        fmt.Sprintf("%s SAMPLE %d", LogsSamplingTable, SamplingRows),
	KeysToColumns:    logKeysToColumns,
	ReservedKeys:     reservedLogKeys,
	BodyColumn:       "Body",
	AttributesColumn: "LogAttributes",
}

var LogsSampleableTableConfig = SampleableTableConfig{
	tableConfig:         LogsTableConfig,
	samplingTableConfig: logsSamplingTableConfig,
	useSampling: func(d time.Duration) bool {
		return d >= 24*time.Hour
	},
}

func (client *Client) BatchWriteLogRows(ctx context.Context, logRows []*LogRow) error {
	if len(logRows) == 0 {
		return nil
	}

	rows := lo.Map(logRows, func(l *LogRow, _ int) interface{} {
		if len(l.UUID) == 0 {
			l.UUID = uuid.New().String()
		}
		return l
	})

	batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", LogsTable))
	if err != nil {
		return e.Wrap(err, "failed to create logs batch")
	}

	for _, logRow := range rows {
		err = batch.AppendStruct(logRow)
		if err != nil {
			return err
		}
	}

	return batch.Send()
}

const LogsLimit int = 50
const KeyValuesLimit int = 50

const OrderBackwardNatural = "Timestamp ASC, UUID ASC"
const OrderForwardNatural = "Timestamp DESC, UUID DESC"

const OrderBackwardInverted = "Timestamp DESC, UUID DESC"
const OrderForwardInverted = "Timestamp ASC, UUID ASC"

type Pagination struct {
	After     *string
	Before    *string
	At        *string
	Direction modelInputs.SortDirection
	CountOnly bool
}

func (client *Client) ReadLogs(ctx context.Context, projectID int, params modelInputs.QueryInput, pagination Pagination) (*modelInputs.LogConnection, error) {
	scanLog := func(rows driver.Rows) (*Edge[modelInputs.Log], error) {
		var result struct {
			Timestamp       time.Time
			UUID            string
			SeverityText    string
			Body            string
			LogAttributes   map[string]string
			TraceId         string
			SpanId          string
			SecureSessionId string
			Source          string
			ServiceName     string
			ServiceVersion  string
			Environment     string
			ProjectId       uint32
		}
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		return &Edge[modelInputs.Log]{
			Cursor: encodeCursor(result.Timestamp, result.UUID),
			Node: &modelInputs.Log{
				Timestamp:       result.Timestamp,
				Level:           makeLogLevel(result.SeverityText),
				Message:         result.Body,
				LogAttributes:   expandJSON(result.LogAttributes),
				TraceID:         &result.TraceId,
				SpanID:          &result.SpanId,
				SecureSessionID: &result.SecureSessionId,
				Source:          &result.Source,
				ServiceName:     &result.ServiceName,
				ServiceVersion:  &result.ServiceVersion,
				Environment:     &result.Environment,
				ProjectID:       int(result.ProjectId),
			},
		}, nil
	}

	conn, err := readObjects(ctx, client, LogsTableConfig, logsSamplingTableConfig, projectID, params, pagination, scanLog)
	if err != nil {
		return nil, err
	}

	mappedEdges := []*modelInputs.LogEdge{}
	for _, edge := range conn.Edges {
		mappedEdges = append(mappedEdges, &modelInputs.LogEdge{
			Cursor: edge.Cursor,
			Node:   edge.Node,
		})
	}

	return &modelInputs.LogConnection{
		Edges:    mappedEdges,
		PageInfo: conn.PageInfo,
	}, nil
}

// This is a lighter weight version of the previous function for loading the minimal about of data for a session
func (client *Client) ReadSessionLogs(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogEdge, error) {
	sb, err := makeSelectBuilder(
		LogsTableConfig,
		LogsTableConfig.SelectColumns,
		[]int{projectID},
		params,
		Pagination{Direction: modelInputs.SortDirectionAsc},
	)
	if err != nil {
		return nil, err
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(ctx, "logs", util.ResourceName("ReadSessionLogs"))
	span.SetAttribute("sql", sql)
	span.SetAttribute("args", args)

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
		span.Finish(err)
		return nil, err
	}

	edges := []*modelInputs.LogEdge{}

	for rows.Next() {
		var result struct {
			Timestamp       time.Time
			UUID            string
			SeverityText    string
			Body            string
			LogAttributes   map[string]string
			TraceId         string
			SpanId          string
			SecureSessionId string
			Source          string
			ServiceName     string
			ServiceVersion  string
			Environment     string
			ProjectId       uint32
		}
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		edges = append(edges, &modelInputs.LogEdge{
			Cursor: encodeCursor(result.Timestamp, result.UUID),
			Node: &modelInputs.Log{
				Timestamp:       result.Timestamp,
				Level:           makeLogLevel(result.SeverityText),
				Message:         result.Body,
				LogAttributes:   expandJSON(result.LogAttributes),
				TraceID:         &result.TraceId,
				SpanID:          &result.SpanId,
				SecureSessionID: &result.SecureSessionId,
				Source:          &result.Source,
				ServiceName:     &result.ServiceName,
				ServiceVersion:  &result.ServiceVersion,
				Environment:     &result.Environment,
				ProjectID:       int(result.ProjectId),
			},
		})
	}
	rows.Close()
	span.Finish(rows.Err())
	return edges, rows.Err()
}

func (client *Client) ReadLogsTotalCount(ctx context.Context, projectID int, params modelInputs.QueryInput) (uint64, error) {
	sb, err := makeSelectBuilder(
		LogsTableConfig,
		[]string{"COUNT(*)"},
		[]int{projectID},
		params,
		Pagination{CountOnly: true})
	if err != nil {
		return 0, err
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	var count uint64
	err = client.conn.QueryRow(
		ctx,
		sql,
		args...,
	).Scan(&count)

	return count, err
}

type number interface {
	uint64 | float64
}

func (client *Client) ReadTracesDailySum(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (uint64, error) {
	return readDailyImpl[uint64](ctx, client, "trace_count_daily_mv", "sum", projectIds, dateRange)
}

func (client *Client) ReadTracesDailyAverage(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (float64, error) {
	return readDailyImpl[float64](ctx, client, "trace_count_daily_mv", "avg", projectIds, dateRange)
}

func (client *Client) ReadLogsDailySum(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (uint64, error) {
	return readDailyImpl[uint64](ctx, client, "log_count_daily_mv", "sum", projectIds, dateRange)
}

func (client *Client) ReadLogsDailyAverage(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (float64, error) {
	return readDailyImpl[float64](ctx, client, "log_count_daily_mv", "avg", projectIds, dateRange)
}

func readDailyImpl[N number](ctx context.Context, client *Client, table string, aggFn string, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (N, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(fmt.Sprintf("COALESCE(%s(Count), 0) AS Count", aggFn)).
		From(table).
		Where(sb.In("ProjectId", projectIds)).
		Where(sb.LessThan("toUInt64(Day)", uint64(dateRange.EndDate.Unix()))).
		Where(sb.GreaterEqualThan("toUInt64(Day)", uint64(dateRange.StartDate.Unix())))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	var out N
	err := client.conn.QueryRow(
		ctx,
		sql,
		args...,
	).Scan(&out)

	switch v := any(out).(type) {
	case float64:
		if math.IsNaN(v) {
			return 0, err
		}
	}

	return out, err
}

func (client *Client) ReadLogsHistogram(ctx context.Context, projectID int, params modelInputs.QueryInput, nBuckets int) (*modelInputs.LogsHistogram, error) {
	startTimestamp := uint64(params.DateRange.StartDate.Unix())
	endTimestamp := uint64(params.DateRange.EndDate.Unix())

	bucketIdxExpr := fmt.Sprintf(
		"toUInt64(intDiv(%d * (toRelativeSecondNum(Timestamp) - %d), (%d - %d)) * 8 + SeverityNumber)",
		nBuckets,
		startTimestamp,
		endTimestamp,
		startTimestamp,
	)

	// If the queried time range is >= 24 hours, query the sampling table.
	// Else, query the logs table directly.
	var fromSb *sqlbuilder.SelectBuilder
	var err error
	if params.DateRange.EndDate.Sub(params.DateRange.StartDate) >= 24*time.Hour {
		fromSb, err = makeSelectBuilder(
			logsSamplingTableConfig,
			[]string{bucketIdxExpr, "toUInt64(round(count() * any(_sample_factor)))", "any(_sample_factor)"},
			[]int{projectID},
			params,
			Pagination{CountOnly: true},
		)
	} else {
		fromSb, err = makeSelectBuilder(
			LogsTableConfig,
			[]string{bucketIdxExpr, "count()", "1.0"},
			[]int{projectID},
			params,
			Pagination{CountOnly: true},
		)
	}
	if err != nil {
		return nil, err
	}

	fromSb.GroupBy("1")

	sql, args := fromSb.BuildWithFlavor(sqlbuilder.ClickHouse)

	histogram := &modelInputs.LogsHistogram{
		Buckets:    make([]*modelInputs.LogsHistogramBucket, 0, nBuckets),
		TotalCount: uint64(nBuckets),
	}

	rows, err := client.conn.Query(
		ctx,
		sql,
		args...,
	)

	if err != nil {
		return nil, err
	}

	var (
		groupKey     uint64
		count        uint64
		sampleFactor float64
	)

	buckets := make(map[uint64]map[modelInputs.LogLevel]uint64)

	for rows.Next() {
		if err := rows.Scan(&groupKey, &count, &sampleFactor); err != nil {
			return nil, err
		}

		bucketId := groupKey / 8
		level := logrus.Level(groupKey % 8)

		// clamp bucket to [0, nBuckets)
		if bucketId >= uint64(nBuckets) {
			bucketId = uint64(nBuckets - 1)
		}

		// create bucket if not exists
		if _, ok := buckets[bucketId]; !ok {
			buckets[bucketId] = make(map[modelInputs.LogLevel]uint64)
		}

		// add count to bucket
		buckets[bucketId][getLogLevel(level)] = count
	}

	var objectCount uint64
	for bucketId := uint64(0); bucketId < uint64(nBuckets); bucketId++ {
		if _, ok := buckets[bucketId]; !ok {
			continue
		}
		bucket := buckets[bucketId]
		counts := make([]*modelInputs.LogsHistogramBucketCount, 0, len(bucket))
		for _, level := range modelInputs.AllLogLevel {
			if _, ok := bucket[level]; !ok {
				bucket[level] = 0
			}
			counts = append(counts, &modelInputs.LogsHistogramBucketCount{
				Level: level,
				Count: bucket[level],
			})
			objectCount += bucket[level]
		}

		histogram.Buckets = append(histogram.Buckets, &modelInputs.LogsHistogramBucket{
			BucketID: bucketId,
			Counts:   counts,
		})
	}

	histogram.ObjectCount = objectCount
	histogram.SampleFactor = sampleFactor

	return histogram, err
}

func (client *Client) ReadLogsMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: LogsSampleableTableConfig,
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

func (client *Client) ReadWorkspaceLogCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: LogsSampleableTableConfig,
		ProjectIDs:       projectIDs,
		Params:           params,
		Column:           "",
		MetricTypes:      []modelInputs.MetricAggregator{modelInputs.MetricAggregatorCount},
		BucketCount:      pointy.Int(12),
		BucketBy:         modelInputs.MetricBucketByTimestamp.String(),
	})
}

func (client *Client) LogsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	logKeys, err := KeysAggregated(ctx, client, LogKeysTable, projectID, startDate, endDate, query, typeArg)
	if err != nil {
		return nil, err
	}

	if query == nil || *query == "" {
		logKeys = append(logKeys, defaultLogKeys...)
	} else {
		queryLower := strings.ToLower(*query)
		for _, key := range defaultLogKeys {
			if strings.Contains(key.Name, queryLower) {
				logKeys = append(logKeys, key)
			}
		}
	}

	return logKeys, nil
}

func (client *Client) LogsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, limit *int) ([]string, error) {
	return KeyValuesAggregated(ctx, client, LogKeyValuesTable, projectID, keyName, startDate, endDate, limit)
}

func LogMatchesQuery(logRow *LogRow, filters listener.Filters) bool {
	return matchesQuery(logRow, LogsTableConfig, filters, listener.OperatorAnd)
}

func (client *Client) LogsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, LogsTableConfig, projectID, params)
}
