package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/openlyinc/pointy"

	"github.com/highlight-run/highlight/backend/parser/listener"

	"github.com/highlight/highlight/sdk/highlight-go"

	"golang.org/x/exp/slices"

	"github.com/highlight-run/highlight/backend/model"

	"github.com/huandu/go-sqlbuilder"
	e "github.com/pkg/errors"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

const TracesTable = "traces"
const TracesSamplingTable = "traces_sampling"
const TraceKeysTable = "trace_keys"
const TraceKeyValuesTable = "trace_key_values"
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
	modelInputs.ReservedTraceKeyMetricName:      "MetricName",
	modelInputs.ReservedTraceKeyMetricValue:     "MetricValue",
	modelInputs.ReservedTraceKeyEnvironment:     "Environment",
	modelInputs.ReservedTraceKeyHasErrors:       "HasErrors",
	modelInputs.ReservedTraceKeyTimestamp:       "Timestamp",
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
	"HasErrors",
}

// These keys show up as recommendations, but with no recommended values due to high cardinality
var defaultTraceKeys = []*modelInputs.QueryKey{
	{Name: string(modelInputs.ReservedTraceKeyTraceID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeySpanName), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeySpanID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeyDuration), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedTraceKeyParentSpanID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedTraceKeySecureSessionID), Type: modelInputs.KeyTypeString},
}

var TracesTableNoDefaultConfig = model.TableConfig[modelInputs.ReservedTraceKey]{
	TableName:        TracesTable,
	KeysToColumns:    traceKeysToColumns,
	ReservedKeys:     modelInputs.AllReservedTraceKey,
	BodyColumn:       "SpanName",
	AttributesColumn: "TraceAttributes",
	SelectColumns:    traceColumns,
}

var TracesTableConfig = model.TableConfig[modelInputs.ReservedTraceKey]{
	TableName:        TracesTableNoDefaultConfig.TableName,
	KeysToColumns:    TracesTableNoDefaultConfig.KeysToColumns,
	ReservedKeys:     TracesTableNoDefaultConfig.ReservedKeys,
	BodyColumn:       TracesTableNoDefaultConfig.BodyColumn,
	AttributesColumn: TracesTableNoDefaultConfig.AttributesColumn,
	SelectColumns:    TracesTableNoDefaultConfig.SelectColumns,
	DefaultFilter:    fmt.Sprintf("%s!=%s %s!=%s", modelInputs.ReservedTraceKeySpanName, highlight.MetricSpanName, highlight.TraceTypeAttribute, highlight.TraceTypeHighlightInternal),
}

var tracesSamplingTableConfig = model.TableConfig[modelInputs.ReservedTraceKey]{
	TableName:        fmt.Sprintf("%s SAMPLE %d", TracesSamplingTable, SamplingRows),
	BodyColumn:       "SpanName",
	KeysToColumns:    traceKeysToColumns,
	ReservedKeys:     modelInputs.AllReservedTraceKey,
	AttributesColumn: "TraceAttributes",
	SelectColumns:    traceColumns,
	DefaultFilter:    fmt.Sprintf("%s!=%s %s!=%s", modelInputs.ReservedTraceKeySpanName, highlight.MetricSpanName, highlight.TraceTypeAttribute, highlight.TraceTypeHighlightInternal),
}

var tracesSampleableTableConfig = sampleableTableConfig[modelInputs.ReservedTraceKey]{
	tableConfig:         TracesTableConfig,
	samplingTableConfig: tracesSamplingTableConfig,
	useSampling: func(d time.Duration) bool {
		return d >= time.Hour
	},
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
	HasErrors        bool
	EventsTimestamp  []time.Time         `json:"Events.Timestamp" ch:"Events.Timestamp"`
	EventsName       []string            `json:"Events.Name" ch:"Events.Name"`
	EventsAttributes []map[string]string `json:"Events.Attributes" ch:"Events.Attributes"`
	LinksTraceId     []string            `json:"Links.TraceId" ch:"Links.TraceId"`
	LinksSpanId      []string            `json:"Links.SpanId" ch:"Links.SpanId"`
	LinksTraceState  []string            `json:"Links.TraceState" ch:"Links.TraceState"`
	LinksAttributes  []map[string]string `json:"Links.Attributes" ch:"Links.Attributes"`
}

func ConvertTraceRow(traceRow *TraceRow) *ClickhouseTraceRow {
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
		HasErrors:        traceRow.HasErrors,
		EventsTimestamp:  traceTimes,
		EventsName:       traceNames,
		EventsAttributes: traceAttrs,
		LinksTraceId:     linkTraceIds,
		LinksSpanId:      linkSpanIds,
		LinksTraceState:  linkStates,
		LinksAttributes:  linkAttrs,
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
				Environment:     result.Environment,
				HasErrors:       result.HasErrors,
				TraceAttributes: expandJSON(result.TraceAttributes),
				StatusCode:      result.StatusCode,
				StatusMessage:   result.StatusMessage,
			},
		}, nil
	}

	tableConfig := TracesTableConfig
	if params.Sort != nil {
		tableConfig = tracesSamplingTableConfig
	}

	conn, err := readObjects(ctx, client, tableConfig, projectID, params, pagination, scanTrace)
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
			TraceAttributes: expandJSON(result.TraceAttributes),
			StatusCode:      result.StatusCode,
			StatusMessage:   result.StatusMessage,
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

func (client *Client) ReadTrace(ctx context.Context, projectID int, traceID string) ([]*modelInputs.Trace, error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}

	sb.From(TracesByIdTable).
		Select("Timestamp, UUID, TraceId, SpanId, ParentSpanId, ProjectId, SecureSessionId, TraceState, SpanName, SpanKind, Duration, ServiceName, ServiceVersion, Environment, HasErrors, TraceAttributes, StatusCode, StatusMessage").
		Where(sb.Equal("ProjectId", projectID)).
		Where(sb.Equal("TraceId", traceID))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(ctx, "traces", util.ResourceName("ReadTrace"))

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

	span.Finish()

	if len(traces) > 0 {
		return traces, nil
	}

	span, _ = util.StartSpanFromContext(ctx, "traces", util.ResourceName("ReadTraceFallback"))

	sb.From(TracesTable).
		Select("Timestamp, UUID, TraceId, SpanId, ParentSpanId, ProjectId, SecureSessionId, TraceState, SpanName, SpanKind, Duration, ServiceName, ServiceVersion, Environment, HasErrors, TraceAttributes, StatusCode, StatusMessage").
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

	span.Finish()
	return traces, nil
}

func (client *Client) ReadTracesMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	return readMetrics(ctx, client, tracesSampleableTableConfig, projectID, params, column, metricTypes, groupBy, nBuckets, bucketBy, limit, limitAggregator, limitColumn)
}

func (client *Client) ReadWorkspaceTraceCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return readWorkspaceMetrics(ctx, client, tracesSampleableTableConfig, projectIDs, params, "", []modelInputs.MetricAggregator{modelInputs.MetricAggregatorCount}, nil, pointy.Int(12), modelInputs.MetricBucketByTimestamp.String(), nil, nil, nil)
}

func (client *Client) TracesKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	traceKeys, err := KeysAggregated(ctx, client, TraceKeysTable, projectID, startDate, endDate, query, typeArg)
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

func (client *Client) TracesKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	return KeyValuesAggregated(ctx, client, TraceKeyValuesTable, projectID, keyName, startDate, endDate)
}

func TraceMatchesQuery(trace *TraceRow, filters listener.Filters) bool {
	return matchesQuery(trace, TracesTableConfig, filters, listener.OperatorAnd)
}

func (client *Client) TracesLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, TracesTableConfig, projectID, params)
}
