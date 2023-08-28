package clickhouse

import (
	"context"
	"fmt"
	e "github.com/pkg/errors"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	"github.com/huandu/go-sqlbuilder"
	"github.com/samber/lo"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

const TracesTable = "traces"

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

	span, _ := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.flushTraces.prepareRows"))
	span.SetTag("BatchSize", len(traceRows))
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
		span.Finish(tracer.WithError(err))
		return e.Wrap(err, "failed to create logs batch")
	}

	for _, traceRow := range rows {
		err = batch.AppendStruct(traceRow)
		if err != nil {
			span.Finish(tracer.WithError(err))
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

func (client *Client) ReadTraces(ctx context.Context, projectID int, params modelInputs.TracesParamsInput) ([]*modelInputs.Trace, error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}

	sb.From("traces").
		Select("Timestamp, UUID, TraceId, SpanId, ParentSpanId, ProjectId, SecureSessionId, TraceState, SpanName, SpanKind, Duration, ServiceName, ServiceVersion, TraceAttributes, StatusCode, StatusMessage").
		Where(sb.Equal("ProjectId", projectID))

	// Very basic filtering for now. Will add better support + pagination later.
	queryParams := queryparser.Parse(params.Query)
	for key, value := range queryParams.Attributes {
		sb.Where(sb.Equal(key, value[0]))
	}

	sb.OrderBy("Timestamp DESC").Limit(100)
	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := tracer.StartSpanFromContext(ctx, "traces", tracer.ResourceName("ReadTraces"))
	query, err := sqlbuilder.ClickHouse.Interpolate(sql, args)
	if err != nil {
		span.Finish(tracer.WithError(err))
		return nil, err
	}
	span.SetTag("Query", query)
	span.SetTag("Params", params)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		span.Finish(tracer.WithError(err))
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
	rows.Close()

	span.Finish(tracer.WithError(rows.Err()))
	return traces, rows.Err()
}
