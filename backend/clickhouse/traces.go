package clickhouse

import (
	"context"
	"fmt"
	"time"

	e "github.com/pkg/errors"
)

const TracesTable = "traces"

func (client *Client) BatchWriteTraceRows(ctx context.Context, traceRows []*TraceRow) error {
	if len(traceRows) == 0 {
		return nil
	}

	batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", TracesTable))
	if err != nil {
		return e.Wrap(err, "could not prepare traces batch")
	}

	for _, traceRow := range traceRows {
		// Was not able to figure out a way to insert nested values using a struct +
		// AppendStruct, so had to pull them out to individual arrays.
		traceTimes, traceNames, traceAttrs := convertEvents(traceRow)
		linkTraceIds, linkSpanIds, linkStates, linkAttrs := convertLinks(traceRow)

		err = batch.Append(
			traceRow.Timestamp,
			traceRow.UUID,
			traceRow.TraceId,
			traceRow.SpanId,
			traceRow.ParentSpanId,
			traceRow.ProjectId,
			traceRow.SecureSessionId,
			traceRow.TraceState,
			traceRow.SpanName,
			traceRow.SpanKind,
			traceRow.Duration,
			traceRow.ServiceName,
			traceRow.ServiceVersion,
			traceRow.TraceAttributes,
			traceRow.StatusCode,
			traceRow.StatusMessage,
			traceTimes,
			traceNames,
			traceAttrs,
			linkTraceIds,
			linkSpanIds,
			linkStates,
			linkAttrs,
		)
		if err != nil {
			return err
		}
	}

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
