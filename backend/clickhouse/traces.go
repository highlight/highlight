package clickhouse

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/highlight/highlight/sdk/highlight-go"

	"github.com/highlight-run/highlight/backend/queryparser"
	"golang.org/x/exp/slices"

	"github.com/huandu/go-sqlbuilder"
	e "github.com/pkg/errors"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/samber/lo"
)

const TracesTable = "traces"
const TracesSamplingTable = "traces_sampling"
const TraceKeysTable = "trace_keys"
const TraceKeyValuesTable = "trace_key_values"
const TraceMetricsTable = "trace_metrics"
const TracesByIdTable = "traces_by_id"

var traceKeysToColumns = map[modelInputs.ReservedTraceKey]string{
	modelInputs.ReservedTraceKeySecureSessionID: "SecureSessionId",
	modelInputs.ReservedTraceKeySpanID:          "SpanId",
	modelInputs.ReservedTraceKeyTraceID:         "TraceId",
	modelInputs.ReservedTraceKeyParentSpanID:    "ParentSpanId",
	modelInputs.ReservedTraceKeyTraceState:      "TraceState",
	modelInputs.ReservedTraceKeySpanName:        "SpanName",
	modelInputs.ReservedTraceKeySpanKind:        "SpanKind",
	modelInputs.ReservedTraceKeyDuration:        "Duration",
	modelInputs.ReservedTraceKeyServiceName:     "ServiceName",
	modelInputs.ReservedTraceKeyServiceVersion:  "ServiceVersion",
	modelInputs.ReservedTraceKeyMetric:          "Events.Attributes[1]['metric.name']",
	modelInputs.ReservedTraceKeyEnvironment:     "Environment",
}

var traceColumns = []string{
	"Timestamp",
	"UUID",
	"TraceId",
	"SpanId",
	"ParentSpanId",
	"ProjectId",
	"SecureSessionId",
	"TraceState",
	"SpanName",
	"SpanKind",
	"Duration",
	"ServiceName",
	"ServiceVersion",
	"TraceAttributes",
	"StatusCode",
	"StatusMessage",
	"Environment",
}

var defaultTraceKeys = []*modelInputs.QueryKey{
	{Name: "trace_id", Type: modelInputs.KeyTypeString},
	{Name: "span_id", Type: modelInputs.KeyTypeString},
}

var tracesTableConfig = tableConfig[modelInputs.ReservedTraceKey]{
	tableName:        TracesTable,
	keysToColumns:    traceKeysToColumns,
	reservedKeys:     modelInputs.AllReservedTraceKey,
	bodyColumn:       "SpanName",
	attributesColumn: "TraceAttributes",
	selectColumns:    traceColumns,
	defaultFilters: map[string]string{
		highlight.TraceTypeAttribute: fmt.Sprintf("!%s", highlight.TraceTypeHighlightInternal),
	},
}

var tracesSamplingTableConfig = tableConfig[modelInputs.ReservedTraceKey]{
	tableName:        fmt.Sprintf("%s SAMPLE %d", TracesSamplingTable, SamplingRows),
	bodyColumn:       "SpanName",
	keysToColumns:    traceKeysToColumns,
	reservedKeys:     modelInputs.AllReservedTraceKey,
	attributesColumn: "TraceAttributes",
	selectColumns:    traceColumns,
}

type ClickhouseTraceRow struct {
	Timestamp        time.Time
	UUID             string
	TraceId          string
	SpanId           string
	ParentSpanId     string
	ProjectId        uint32
	SecureSessionId  string
	TraceState       string
	SpanName         string
	SpanKind         string
	Duration         int64
	ServiceName      string
	ServiceVersion   string
	TraceAttributes  map[string]string
	StatusCode       string
	StatusMessage    string
	Environment      string
	EventsTimestamp  clickhouse.ArraySet `ch:"Events.Timestamp"`
	EventsName       clickhouse.ArraySet `ch:"Events.Name"`
	EventsAttributes clickhouse.ArraySet `ch:"Events.Attributes"`
	LinksTraceId     clickhouse.ArraySet `ch:"Links.TraceId"`
	LinksSpanId      clickhouse.ArraySet `ch:"Links.SpanId"`
	LinksTraceState  clickhouse.ArraySet `ch:"Links.TraceState"`
	LinksAttributes  clickhouse.ArraySet `ch:"Links.Attributes"`
}

func (client *Client) BatchWriteTraceRows(ctx context.Context, traceRows []*TraceRow) error {
	if len(traceRows) == 0 {
		return nil
	}

	span, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.batched.flushTraces.prepareRows"))
	span.SetAttribute("BatchSize", len(traceRows))
	rows := lo.Map(traceRows, func(traceRow *TraceRow, _ int) *ClickhouseTraceRow {
		traceTimes, traceNames, traceAttrs := convertEvents(traceRow)
		linkTraceIds, linkSpanIds, linkStates, linkAttrs := convertLinks(traceRow)

		return &ClickhouseTraceRow{
			Timestamp:        traceRow.Timestamp,
			UUID:             traceRow.UUID,
			TraceId:          traceRow.TraceId,
			SpanId:           traceRow.SpanId,
			ParentSpanId:     traceRow.ParentSpanId,
			ProjectId:        traceRow.ProjectId,
			SecureSessionId:  traceRow.SecureSessionId,
			TraceState:       traceRow.TraceState,
			SpanName:         traceRow.SpanName,
			SpanKind:         traceRow.SpanKind,
			Duration:         traceRow.Duration,
			ServiceName:      traceRow.ServiceName,
			ServiceVersion:   traceRow.ServiceVersion,
			TraceAttributes:  traceRow.TraceAttributes,
			StatusCode:       traceRow.StatusCode,
			StatusMessage:    traceRow.StatusMessage,
			Environment:      traceRow.Environment,
			EventsTimestamp:  traceTimes,
			EventsName:       traceNames,
			EventsAttributes: traceAttrs,
			LinksTraceId:     linkTraceIds,
			LinksSpanId:      linkSpanIds,
			LinksTraceState:  linkStates,
			LinksAttributes:  linkAttrs,
		}
	})

	batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", TracesTable))
	if err != nil {
		span.Finish(err)
		return e.Wrap(err, "failed to create traces batch")
	}

	for _, traceRow := range rows {
		err = batch.AppendStruct(traceRow)
		if err != nil {
			span.Finish(err)
			return err
		}
	}
	span.Finish()

	return batch.Send()
}

func convertEvents(traceRow *TraceRow) (clickhouse.ArraySet, clickhouse.ArraySet, clickhouse.ArraySet) {
	var (
		times clickhouse.ArraySet
		names clickhouse.ArraySet
		attrs clickhouse.ArraySet
	)

	events := traceRow.Events
	for _, event := range events {
		times = append(times, event.Timestamp)
		names = append(names, event.Name)
		attrs = append(attrs, event.Attributes)
	}
	return times, names, attrs
}

func convertLinks(traceRow *TraceRow) (clickhouse.ArraySet, clickhouse.ArraySet, clickhouse.ArraySet, clickhouse.ArraySet) {
	var (
		traceIDs clickhouse.ArraySet
		spanIDs  clickhouse.ArraySet
		states   clickhouse.ArraySet
		attrs    clickhouse.ArraySet
	)
	links := traceRow.Links
	for _, link := range links {
		traceIDs = append(traceIDs, link.TraceId)
		spanIDs = append(spanIDs, link.SpanId)
		states = append(states, link.TraceState)
		attrs = append(attrs, link.Attributes)
	}
	return traceIDs, spanIDs, states, attrs
}

func (client *Client) ReadTraces(ctx context.Context, projectID int, params modelInputs.QueryInput, pagination Pagination) (*modelInputs.TraceConnection, error) {
	scanTrace := func(rows driver.Rows) (*Edge[modelInputs.Trace], error) {
		var result ClickhouseTraceRow
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		return &Edge[modelInputs.Trace]{
			Cursor: encodeCursor(result.Timestamp, result.UUID),
			Node: &modelInputs.Trace{
				Timestamp:       result.Timestamp,
				TraceID:         result.TraceId,
				SpanID:          result.SpanId,
				ParentSpanID:    result.ParentSpanId,
				ProjectID:       int(result.ProjectId),
				SecureSessionID: result.SecureSessionId,
				TraceState:      result.TraceState,
				SpanName:        result.SpanName,
				SpanKind:        result.SpanKind,
				Duration:        int(result.Duration),
				ServiceName:     result.ServiceName,
				ServiceVersion:  result.ServiceVersion,
				TraceAttributes: expandJSON(result.TraceAttributes),
				StatusCode:      result.StatusCode,
				StatusMessage:   result.StatusMessage,
			},
		}, nil
	}

	conn, err := readObjects(ctx, client, tracesTableConfig, projectID, params, pagination, scanTrace)
	if err != nil {
		return nil, err
	}

	mappedEdges := []*modelInputs.TraceEdge{}
	for _, edge := range conn.Edges {
		mappedEdges = append(mappedEdges, &modelInputs.TraceEdge{
			Cursor: edge.Cursor,
			Node:   edge.Node,
		})
	}

	return &modelInputs.TraceConnection{
		Edges:    mappedEdges,
		PageInfo: conn.PageInfo,
	}, nil
}

func (client *Client) ReadTrace(ctx context.Context, projectID int, traceID string) ([]*modelInputs.Trace, error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}

	sb.From(TracesByIdTable).
		Select("Timestamp, UUID, TraceId, SpanId, ParentSpanId, ProjectId, SecureSessionId, TraceState, SpanName, SpanKind, Duration, ServiceName, ServiceVersion, TraceAttributes, StatusCode, StatusMessage").
		Where(sb.Equal("ProjectId", projectID)).
		Where(sb.Equal("TraceId", traceID))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(ctx, "traces", util.ResourceName("ReadTrace"))
	query, err := sqlbuilder.ClickHouse.Interpolate(sql, args)
	if err != nil {
		span.Finish(err)
		return nil, err
	}

	rows, err := client.conn.Query(ctx, query)
	if err != nil {
		span.Finish(err)
		return nil, err
	}

	var traces []*modelInputs.Trace
	for rows.Next() {
		var result ClickhouseTraceRow
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		traces = append(traces, &modelInputs.Trace{
			Timestamp:       result.Timestamp,
			TraceID:         result.TraceId,
			SpanID:          result.SpanId,
			ParentSpanID:    result.ParentSpanId,
			ProjectID:       int(result.ProjectId),
			SecureSessionID: result.SecureSessionId,
			TraceState:      result.TraceState,
			SpanName:        result.SpanName,
			SpanKind:        result.SpanKind,
			Duration:        int(result.Duration),
			ServiceName:     result.ServiceName,
			ServiceVersion:  result.ServiceVersion,
			TraceAttributes: expandJSON(result.TraceAttributes),
			StatusCode:      result.StatusCode,
			StatusMessage:   result.StatusMessage,
		})
	}

	// Order by timestamp
	// Doing this in code rather than Clickhouse so Clickhouse will use the `traceId` projection
	slices.SortFunc(traces, func(a *modelInputs.Trace, b *modelInputs.Trace) bool {
		return a.Timestamp.Before(b.Timestamp)
	})

	span.Finish(rows.Err())

	return traces, rows.Err()
}

func (client *Client) ReadTracesMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column modelInputs.TracesMetricColumn, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets int) (*modelInputs.TracesMetrics, error) {
	if len(metricTypes) == 0 {
		return nil, e.New("no metric types provided")
	}

	startTimestamp := uint64(params.DateRange.StartDate.Unix())
	endTimestamp := uint64(params.DateRange.EndDate.Unix())
	// always sample - use a comparison here to trick the compiler into not complaining about unused branches
	useSampling := params.DateRange.EndDate.Sub(params.DateRange.StartDate) >= 0

	metricColName := "Duration"
	switch column {
	case modelInputs.TracesMetricColumnMetricValue:
		metricColName = "toFloat64OrZero(Events.Attributes[1]['metric.value'])"
	}

	fnStr := ""
	for _, metricType := range metricTypes {
		switch metricType {
		case modelInputs.MetricAggregatorCount:
			if useSampling {
				fnStr += ", round(count() * any(_sample_factor))"
			} else {
				fnStr += ", toFloat64(count())"
			}
		case modelInputs.MetricAggregatorCountDistinctKey:
			if useSampling {
				fnStr += fmt.Sprintf(", round(count(distinct TraceAttributes['%s']) * any(_sample_factor))", highlight.TraceKeyAttribute)
			} else {
				fnStr += fmt.Sprintf(", toFloat64(count(distinct TraceAttributes['%s']))", highlight.TraceKeyAttribute)
			}
		case modelInputs.MetricAggregatorMin:
			fnStr += fmt.Sprintf(", min(%s)", metricColName)
		case modelInputs.MetricAggregatorAvg:
			fnStr += fmt.Sprintf(", avg(%s)", metricColName)
		case modelInputs.MetricAggregatorP50:
			fnStr += fmt.Sprintf(", quantile(.5)(%s)", metricColName)
		case modelInputs.MetricAggregatorP90:
			fnStr += fmt.Sprintf(", quantile(.9)(%s)", metricColName)
		case modelInputs.MetricAggregatorP95:
			fnStr += fmt.Sprintf(", quantile(.95)(%s)", metricColName)
		case modelInputs.MetricAggregatorP99:
			fnStr += fmt.Sprintf(", quantile(.99)(%s)", metricColName)
		case modelInputs.MetricAggregatorMax:
			fnStr += fmt.Sprintf(", max(%s)", metricColName)
		case modelInputs.MetricAggregatorSum:
			fnStr += fmt.Sprintf(", sum(%s) * any(_sample_factor)", metricColName)
		}
	}

	var fromSb *sqlbuilder.SelectBuilder
	var err error
	if useSampling {
		fromSb, err = makeSelectBuilder(
			tracesSamplingTableConfig,
			fmt.Sprintf(
				"toUInt64(intDiv(%d * (toRelativeSecondNum(Timestamp) - %d), (%d - %d))), any(_sample_factor)%s",
				nBuckets,
				startTimestamp,
				endTimestamp,
				startTimestamp,
				fnStr,
			),
			groupBy,
			projectID,
			params,
			Pagination{CountOnly: true},
			OrderBackwardNatural,
			OrderForwardNatural,
		)
	} else {
		fromSb, err = makeSelectBuilder(
			tracesTableConfig,
			fmt.Sprintf(
				"toUInt64(intDiv(%d * (toRelativeSecondNum(Timestamp) - %d), (%d - %d))), 1.0%s",
				nBuckets,
				startTimestamp,
				endTimestamp,
				startTimestamp,
				fnStr,
			),
			groupBy,
			projectID,
			params,
			Pagination{CountOnly: true},
			OrderBackwardNatural,
			OrderForwardNatural,
		)
	}
	if err != nil {
		return nil, err
	}

	base := 3 + len(metricTypes)

	groupByCols := []string{"1"}
	for i := base; i < base+len(groupBy); i++ {
		groupByCols = append(groupByCols, strconv.Itoa(i))
	}
	fromSb.GroupBy(groupByCols...)
	fromSb.OrderBy(groupByCols...)
	fromSb.Limit(10000)

	sql, args := fromSb.BuildWithFlavor(sqlbuilder.ClickHouse)

	metrics := &modelInputs.TracesMetrics{
		Buckets: []*modelInputs.TracesMetricBucket{},
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
		sampleFactor float64
	)

	groupByColResults := make([]string, len(groupBy))
	metricResults := make([]float64, len(metricTypes))
	scanResults := make([]interface{}, 2+len(groupByColResults) + +len(metricResults))
	scanResults[0] = &groupKey
	scanResults[1] = &sampleFactor
	for idx := range metricTypes {
		scanResults[2+idx] = &metricResults[idx]
	}
	for idx := range groupByColResults {
		scanResults[2+len(metricTypes)+idx] = &groupByColResults[idx]
	}

	for rows.Next() {
		if err := rows.Scan(scanResults...); err != nil {
			return nil, err
		}

		bucketId := groupKey
		if bucketId >= uint64(nBuckets) {
			continue
		}

		for idx, metricType := range metricTypes {
			metrics.Buckets = append(metrics.Buckets, &modelInputs.TracesMetricBucket{
				BucketID: bucketId,
				// make a slice copy as we reuse the same `groupByColResults` across multiple scans
				Group:       append(make([]string, 0), groupByColResults...),
				MetricType:  metricType,
				MetricValue: metricResults[idx],
			})
		}
	}

	metrics.SampleFactor = sampleFactor
	metrics.BucketCount = uint64(nBuckets)

	return metrics, err
}

func (client *Client) TracesKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string) ([]*modelInputs.QueryKey, error) {
	traceKeys, err := KeysAggregated(ctx, client, TraceKeysTable, projectID, startDate, endDate, query)
	if err != nil {
		return nil, err
	}

	traceKeys = append(traceKeys, defaultTraceKeys...)
	return traceKeys, nil
}

func (client *Client) TracesKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	return KeyValuesAggregated(ctx, client, TraceKeyValuesTable, projectID, keyName, startDate, endDate)
}

func (client *Client) TracesMetrics(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string) ([]*modelInputs.QueryKey, error) {
	return KeysAggregated(ctx, client, TraceMetricsTable, projectID, startDate, endDate, query)
}

func TraceMatchesQuery(trace *TraceRow, filters *queryparser.Filters) bool {
	return matchesQuery(trace, tracesTableConfig, filters)
}
