package clickhouse

import (
	"context"
	"fmt"
	"time"

	e "github.com/pkg/errors"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/samber/lo"
)

const TracesTable = "traces"

var tracesTableConfig = tableConfig[modelInputs.ReservedTraceKey]{
	tableName: TracesTable,
	keysToColumns: map[modelInputs.ReservedTraceKey]string{
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
	},
	reservedKeys:     modelInputs.AllReservedTraceKey,
	attributesColumn: "TraceAttributes",
	selectColumns: []string{
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

func (client *Client) TracesKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time) ([]*modelInputs.QueryKey, error) {
	return Keys(ctx, client, tracesTableConfig, projectID, startDate, endDate)
}

func (client *Client) TracesKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	return KeyValues(ctx, client, tracesTableConfig, projectID, keyName, startDate, endDate)
}
