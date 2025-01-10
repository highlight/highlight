package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/parser/listener"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/huandu/go-sqlbuilder"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

const TracesTable = "traces"
const TracesSamplingTable = "traces_sampling_new"
const TraceKeysTable = "trace_keys"
const TraceKeyValuesTable = "trace_key_values"
const HighlightKeyKey = "highlight.key"
const HighlightTypeKey = "highlight.type"
const HttpResponseBodyKey = "http.response.body"
const HttpRequestBodyKey = "http.request.body"
const HttpUrlKey = "http.url"
const HttpPrefix = "http."
const ProcessPrefix = "process."
const OsPrefix = "os."
const TelemetryPrefix = "telemetry."
const WsPrefix = "ws."
const EventPrefix = "event."
const DbPrefix = "db."

var traceKeysToColumns = map[string]string{
	string(modelInputs.ReservedTraceKeySecureSessionID): "SecureSessionId",
	string(modelInputs.ReservedTraceKeySpanID):          "SpanId",
	string(modelInputs.ReservedTraceKeyTraceID):         "TraceId",
	string(modelInputs.ReservedTraceKeyParentSpanID):    "ParentSpanId",
	string(modelInputs.ReservedTraceKeyTraceState):      "TraceState",
	string(modelInputs.ReservedTraceKeySpanName):        "SpanName",
	string(modelInputs.ReservedTraceKeySpanKind):        "SpanKind",
	string(modelInputs.ReservedTraceKeyDuration):        "Duration",
	string(modelInputs.ReservedTraceKeyServiceName):     "ServiceName",
	string(modelInputs.ReservedTraceKeyServiceVersion):  "ServiceVersion",
	string(modelInputs.ReservedTraceKeyMetricName):      "MetricName",
	string(modelInputs.ReservedTraceKeyMetricValue):     "MetricValue",
	string(modelInputs.ReservedTraceKeyEnvironment):     "Environment",
	string(modelInputs.ReservedTraceKeyHasErrors):       "HasErrors",
	string(modelInputs.ReservedTraceKeyTimestamp):       "Timestamp",
	string(modelInputs.ReservedTraceKeyHighlightType):   "HighlightType",
	HighlightKeyKey:     "HighlightKey",
	HttpResponseBodyKey: "HttpResponseBody",
	HttpRequestBodyKey:  "HttpRequestBody",
	HttpUrlKey:          "HttpUrl",
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
	"HttpResponseBody",
	"HttpRequestBody",
	"HttpUrl",
	"TraceAttributes",
	"HttpAttributes",
	"ProcessAttributes",
	"OsAttributes",
	"TelemetryAttributes",
	"WsAttributes",
	"EventAttributes",
	"DbAttributes",
	"StatusCode",
	"StatusMessage",
	"Environment",
	"HasErrors",
	"Events.Timestamp",
	"Events.Name",
	"Events.Attributes",
}

var selectTraceColumns = strings.Join(traceColumns, ", ")

// These keys show up as recommendations, but with no recommended values due to high cardinality
var defaultTraceKeys = []*modelInputs.QueryKey{
	{Name: string(modelInputs.ReservedTraceKeyTraceID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeySpanName), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeySpanID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeyDuration), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedTraceKeyParentSpanID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeySecureSessionID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeyMetricName), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeyMetricValue), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedTraceKeyTimestamp), Type: modelInputs.KeyTypeNumeric},
}

var reservedTraceKeys = lo.Map(modelInputs.AllReservedTraceKey, func(key modelInputs.ReservedTraceKey, _ int) string {
	return string(key)
})

var attributesColumns = []model.ColumnMapping{
	{Prefix: HttpPrefix, Column: "HttpAttributes"},
	{Prefix: ProcessPrefix, Column: "ProcessAttributes"},
	{Prefix: OsPrefix, Column: "OsAttributes"},
	{Prefix: TelemetryPrefix, Column: "TelemetryAttributes"},
	{Prefix: WsPrefix, Column: "WsAttributes"},
	{Prefix: EventPrefix, Column: "EventAttributes"},
	{Prefix: DbPrefix, Column: "DbAttributes"},
	{Column: "TraceAttributes"},
}

var TracesTableNoDefaultConfig = model.TableConfig{
	TableName:         TracesTable,
	KeysToColumns:     traceKeysToColumns,
	ReservedKeys:      reservedTraceKeys,
	BodyColumn:        "SpanName",
	AttributesColumns: attributesColumns,
	SelectColumns:     traceColumns,
}

var TracesTableConfig = model.TableConfig{
	TableName:         TracesTableNoDefaultConfig.TableName,
	KeysToColumns:     TracesTableNoDefaultConfig.KeysToColumns,
	ReservedKeys:      TracesTableNoDefaultConfig.ReservedKeys,
	BodyColumn:        TracesTableNoDefaultConfig.BodyColumn,
	AttributesColumns: TracesTableNoDefaultConfig.AttributesColumns,
	SelectColumns:     TracesTableNoDefaultConfig.SelectColumns,
	DefaultFilter:     fmt.Sprintf("%s!=%s %s!=%s", modelInputs.ReservedTraceKeySpanName, highlight.MetricSpanName, modelInputs.ReservedTraceKeyHighlightType, highlight.TraceTypeHighlightInternal),
}

var tracesSamplingTableConfig = model.TableConfig{
	TableName:         TracesSamplingTable,
	BodyColumn:        TracesTableNoDefaultConfig.BodyColumn,
	KeysToColumns:     TracesTableNoDefaultConfig.KeysToColumns,
	ReservedKeys:      TracesTableNoDefaultConfig.ReservedKeys,
	AttributesColumns: TracesTableNoDefaultConfig.AttributesColumns,
	SelectColumns:     TracesTableNoDefaultConfig.SelectColumns,
	DefaultFilter:     TracesTableConfig.DefaultFilter,
}

var TracesSampleableTableConfig = SampleableTableConfig{
	tableConfig:         TracesTableConfig,
	samplingTableConfig: tracesSamplingTableConfig,
	sampleSizeRows:      20_000_000,
}

type ClickhouseTraceRow struct {
	Timestamp           time.Time
	UUID                string
	TraceId             string
	SpanId              string
	ParentSpanId        string
	ProjectId           uint32
	SecureSessionId     string
	TraceState          string
	SpanName            string
	SpanKind            string
	Duration            int64
	ServiceName         string
	ServiceVersion      string
	TraceAttributes     map[string]string
	StatusCode          string
	StatusMessage       string
	Environment         string
	HasErrors           bool
	EventsTimestamp     []time.Time         `json:"Events.Timestamp" ch:"Events.Timestamp"`
	EventsName          []string            `json:"Events.Name" ch:"Events.Name"`
	EventsAttributes    []map[string]string `json:"Events.Attributes" ch:"Events.Attributes"`
	LinksTraceId        []string            `json:"Links.TraceId" ch:"Links.TraceId"`
	LinksSpanId         []string            `json:"Links.SpanId" ch:"Links.SpanId"`
	LinksTraceState     []string            `json:"Links.TraceState" ch:"Links.TraceState"`
	LinksAttributes     []map[string]string `json:"Links.Attributes" ch:"Links.Attributes"`
	HttpResponseBody    string
	HttpRequestBody     string
	HttpUrl             string
	HighlightKey        string
	HighlightType       string
	HttpAttributes      map[string]string
	ProcessAttributes   map[string]string
	OsAttributes        map[string]string
	TelemetryAttributes map[string]string
	WsAttributes        map[string]string
	EventAttributes     map[string]string
	DbAttributes        map[string]string
}

func getSubAttributes(attributes map[string]string, prefix string) map[string]string {
	results := map[string]string{}
	for k, v := range attributes {
		if strings.HasPrefix(k, prefix) {
			results[k] = v
		}
	}
	return results
}

func getHttpAttributes(attributes map[string]string) map[string]string {
	httpAttributes := getSubAttributes(attributes, HttpPrefix)
	delete(httpAttributes, HttpResponseBodyKey)
	delete(httpAttributes, HttpRequestBodyKey)
	delete(httpAttributes, HttpUrlKey)
	return httpAttributes
}

func ConvertTraceRow(traceRow *TraceRow) *ClickhouseTraceRow {
	traceTimes, traceNames, traceAttrs := convertEvents(traceRow)
	linkTraceIds, linkSpanIds, linkStates, linkAttrs := convertLinks(traceRow)

	httpResponseBody := traceRow.TraceAttributes[HttpResponseBodyKey]
	httpRequestBody := traceRow.TraceAttributes[HttpRequestBodyKey]
	httpUrl := traceRow.TraceAttributes[HttpUrlKey]
	highlightKey := traceRow.TraceAttributes[HighlightKeyKey]
	highlightType := traceRow.TraceAttributes[HighlightTypeKey]

	httpAttributes := getHttpAttributes(traceRow.TraceAttributes)
	processAttributes := getSubAttributes(traceRow.TraceAttributes, ProcessPrefix)
	osAttributes := getSubAttributes(traceRow.TraceAttributes, OsPrefix)
	telemetryAttributes := getSubAttributes(traceRow.TraceAttributes, TelemetryPrefix)
	wsAttributes := getSubAttributes(traceRow.TraceAttributes, WsPrefix)
	eventAttributes := getSubAttributes(traceRow.TraceAttributes, EventPrefix)
	dbAttributes := getSubAttributes(traceRow.TraceAttributes, DbPrefix)

	prefixesToRemove := map[string]bool{
		HttpPrefix:      true,
		ProcessPrefix:   true,
		OsPrefix:        true,
		TelemetryPrefix: true,
		WsPrefix:        true,
		EventPrefix:     true,
		DbPrefix:        true,
	}

	filtered := map[string]string{}
	for k, v := range traceRow.TraceAttributes {
		if k == HighlightKeyKey || k == HighlightTypeKey {
			continue
		}
		if doRemove := prefixesToRemove[strings.SplitAfter(k, ".")[0]]; doRemove {
			continue
		}
		filtered[k] = v
	}

	return &ClickhouseTraceRow{
		Timestamp:           traceRow.Timestamp,
		UUID:                traceRow.UUID,
		TraceId:             traceRow.TraceId,
		SpanId:              traceRow.SpanId,
		ParentSpanId:        traceRow.ParentSpanId,
		ProjectId:           traceRow.ProjectId,
		SecureSessionId:     traceRow.SecureSessionId,
		TraceState:          traceRow.TraceState,
		SpanName:            traceRow.SpanName,
		SpanKind:            traceRow.SpanKind,
		Duration:            traceRow.Duration,
		ServiceName:         traceRow.ServiceName,
		ServiceVersion:      traceRow.ServiceVersion,
		TraceAttributes:     filtered,
		StatusCode:          traceRow.StatusCode,
		StatusMessage:       traceRow.StatusMessage,
		Environment:         traceRow.Environment,
		HasErrors:           traceRow.HasErrors,
		EventsTimestamp:     traceTimes,
		EventsName:          traceNames,
		EventsAttributes:    traceAttrs,
		LinksTraceId:        linkTraceIds,
		LinksSpanId:         linkSpanIds,
		LinksTraceState:     linkStates,
		LinksAttributes:     linkAttrs,
		HttpResponseBody:    httpResponseBody,
		HttpRequestBody:     httpRequestBody,
		HttpUrl:             httpUrl,
		HighlightKey:        highlightKey,
		HighlightType:       highlightType,
		HttpAttributes:      httpAttributes,
		ProcessAttributes:   processAttributes,
		OsAttributes:        osAttributes,
		TelemetryAttributes: telemetryAttributes,
		WsAttributes:        wsAttributes,
		EventAttributes:     eventAttributes,
		DbAttributes:        dbAttributes,
	}
}

func (client *Client) BatchWriteTraceRows(ctx context.Context, traceRows []*ClickhouseTraceRow) error {
	if len(traceRows) == 0 {
		return nil
	}

	span, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.batched.flushTraces.prepareRows"))
	span.SetAttribute("BatchSize", len(traceRows))

	batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", TracesTable))
	if err != nil {
		span.Finish(err)
		return e.Wrap(err, "failed to create traces batch")
	}

	for _, traceRow := range traceRows {
		err = batch.AppendStruct(traceRow)
		if err != nil {
			span.Finish(err)
			return err
		}
	}
	span.Finish()

	return batch.Send()
}

func convertEvents(traceRow *TraceRow) ([]time.Time, []string, []map[string]string) {
	var (
		times []time.Time
		names []string
		attrs []map[string]string
	)

	events := traceRow.Events
	for _, event := range events {
		times = append(times, event.Timestamp)
		names = append(names, event.Name)
		attrs = append(attrs, event.Attributes)
	}
	return times, names, attrs
}

func convertLinks(traceRow *TraceRow) ([]string, []string, []string, []map[string]string) {
	var (
		traceIDs []string
		spanIDs  []string
		states   []string
		attrs    []map[string]string
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

func mergeAttributes(result ClickhouseTraceRow) map[string]string {
	allAttributes := map[string]string{}
	for _, attrs := range []map[string]string{
		result.TraceAttributes,
		result.HttpAttributes,
		result.OsAttributes,
		result.TelemetryAttributes,
		result.WsAttributes,
		result.EventAttributes,
		result.DbAttributes,
	} {
		for k, v := range attrs {
			allAttributes[k] = v
		}
	}
	allAttributes[HttpResponseBodyKey] = result.HttpResponseBody
	allAttributes[HttpRequestBodyKey] = result.HttpRequestBody
	allAttributes[HttpUrlKey] = result.HttpUrl
	return allAttributes
}

func (client *Client) ReadTraces(ctx context.Context, projectID int, params modelInputs.QueryInput, pagination Pagination) (*modelInputs.TraceConnection, error) {
	scanTrace := func(rows driver.Rows) (*Edge[modelInputs.Trace], error) {
		var result ClickhouseTraceRow
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		allAttributes := mergeAttributes(result)

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
				Environment:     result.Environment,
				HasErrors:       result.HasErrors,
				TraceAttributes: expandJSON(allAttributes),
				StatusCode:      result.StatusCode,
				StatusMessage:   result.StatusMessage,
				Events:          extractEvents(result),
			},
		}, nil
	}

	conn, err := readObjects(ctx, client, TracesTableConfig, tracesSamplingTableConfig, projectID, params, pagination, scanTrace)
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
		Sampled:  useSamplingTable(params),
	}, nil
}

func (client *Client) ExistingTraceIds(ctx context.Context, projectID int, traceIDs []string, startDate time.Time, endDate time.Time) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}

	sb.From(TracesTable).
		Select("DISTINCT TraceId").
		Where(sb.Equal("ProjectId", projectID)).
		Where(sb.In("TraceId", traceIDs)).
		Where(sb.GreaterThan("Timestamp", startDate)).
		Where(sb.LessThan("Timestamp", endDate))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(ctx, "traces", util.ResourceName("ReadTracesByIDs"))

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		span.Finish(err)
		return nil, err
	}

	existingTraceIds := []string{}
	for rows.Next() {
		var result struct{ TraceId string }
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		existingTraceIds = append(existingTraceIds, result.TraceId)
	}

	span.Finish(rows.Err())

	return existingTraceIds, rows.Err()
}

func getTracesFromRows(rows driver.Rows) ([]*modelInputs.Trace, error) {
	var seenUUIDs = map[string]struct{}{}
	var traces []*modelInputs.Trace
	for rows.Next() {
		var result ClickhouseTraceRow
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		// Skip already-seen UUIDs to remove duplicate traces
		if _, ok := seenUUIDs[result.UUID]; ok {
			continue
		}
		seenUUIDs[result.UUID] = struct{}{}

		allAttributes := mergeAttributes(result)

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
			Environment:     result.Environment,
			HasErrors:       result.HasErrors,
			TraceAttributes: expandJSON(allAttributes),
			StatusCode:      result.StatusCode,
			StatusMessage:   result.StatusMessage,
			Events:          extractEvents(result),
		})
	}

	// Order by timestamp
	// Doing this in code rather than Clickhouse so Clickhouse will use the `traceId` projection
	slices.SortFunc(traces, func(a *modelInputs.Trace, b *modelInputs.Trace) int {
		return a.Timestamp.Compare(b.Timestamp)
	})

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return traces, nil
}

func extractEvents(result ClickhouseTraceRow) []*modelInputs.TraceEvent {
	return lo.Map(result.EventsTimestamp, func(t time.Time, idx int) *modelInputs.TraceEvent {
		return &modelInputs.TraceEvent{
			Timestamp: t,
			Name:      result.EventsName[idx],
			Attributes: lo.MapEntries(result.EventsAttributes[idx], func(k string, v string) (string, interface{}) {
				return k, v
			}),
		}
	})
}

func (client *Client) ReadTrace(ctx context.Context, projectID int, traceID string, timestamp time.Time) ([]*modelInputs.Trace, error) {
	span, ctx := util.StartSpanFromContext(ctx, "clickhouse.ReadTrace", util.Tag("projectID", projectID), util.Tag("traceID", traceID))
	defer span.Finish()

	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}

	sb.From(TracesSamplingTable).
		Select(selectTraceColumns).
		Where(sb.Equal("ProjectId", projectID)).
		Where(sb.Equal("TraceId", traceID)).
		Where(fmt.Sprintf("farmHash64(TraceId) = farmHash64(%s)", sb.Var(traceID))).
		Where(sb.GreaterEqualThan("Timestamp", timestamp.Add(-1*time.Hour))).
		Where(sb.LessEqualThan("Timestamp", timestamp.Add(time.Hour)))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		span.Finish(err)
		return nil, err
	}

	traces, err := getTracesFromRows(rows)
	if err != nil {
		span.Finish(err)
		return nil, err
	}

	if len(traces) > 0 {
		return traces, nil
	}

	span.SetAttribute("mode", "fallback")

	sb.From(TracesTable).
		Select(selectTraceColumns).
		Where(sb.Equal("ProjectId", projectID)).
		Where(sb.Equal("TraceId", traceID)).
		Where(sb.GE("Timestamp", time.Now().Add(-5*time.Minute))).
		Where(sb.LE("Timestamp", time.Now()))

	sql, args = sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err = client.conn.Query(ctx, sql, args...)
	if err != nil {
		span.Finish(err)
		return nil, err
	}

	traces, err = getTracesFromRows(rows)
	if err != nil {
		span.Finish(err)
		return nil, err
	}

	return traces, nil
}

func (client *Client) ReadTracesMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string, expressions []*modelInputs.MetricExpressionInput) (*modelInputs.MetricsBuckets, error) {
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: TracesSampleableTableConfig,
		ProjectIDs:       []int{projectID},
		Params:           params,
		GroupBy:          groupBy,
		BucketCount:      nBuckets,
		BucketWindow:     bucketWindow,
		BucketBy:         bucketBy,
		Limit:            limit,
		LimitAggregator:  limitAggregator,
		LimitColumn:      limitColumn,
		Expressions:      expressions,
	})
}

func (client *Client) ReadWorkspaceTraceCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: TracesSampleableTableConfig,
		ProjectIDs:       projectIDs,
		Params:           params,
		BucketCount:      pointy.Int(12),
		BucketBy:         modelInputs.MetricBucketByTimestamp.String(),
		Expressions: []*modelInputs.MetricExpressionInput{{
			Aggregator: modelInputs.MetricAggregatorCount,
		}},
	})
}

func (client *Client) TracesKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	traceKeys, err := KeysAggregated(ctx, client, TraceKeysTable, projectID, startDate, endDate, query, typeArg, nil)
	if err != nil {
		return nil, err
	}

	if query == nil || *query == "" {
		traceKeys = append(traceKeys, defaultTraceKeys...)
	} else {
		queryLower := strings.ToLower(*query)
		for _, key := range defaultTraceKeys {
			if strings.Contains(key.Name, queryLower) {
				traceKeys = append(traceKeys, key)
			}
		}
	}

	return traceKeys, nil
}

func (client *Client) TracesKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, query *string, limit *int) ([]string, error) {
	return KeyValuesAggregated(ctx, client, TraceKeyValuesTable, projectID, keyName, startDate, endDate, query, limit, nil)
}

func TraceMatchesQuery(trace *TraceRow, filters listener.Filters) bool {
	return matchesQuery(trace, TracesTableConfig, filters, listener.OperatorAnd)
}

func (client *Client) TracesLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, TracesTableConfig, projectID, params)
}

func (client *Client) ReadTracesDailySum(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (uint64, error) {
	return readDailyImpl[uint64](ctx, client, "trace_count_daily_mv", "sum", projectIds, dateRange, nil)
}

func (client *Client) ReadTracesDailyAverage(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (float64, error) {
	return readDailyImpl[float64](ctx, client, "trace_count_daily_mv", "avg", projectIds, dateRange, nil)
}
