package clickhouse

import (
	"fmt"
	"time"

	"go.opentelemetry.io/collector/pdata/ptrace"
)

type TraceRow struct {
	ProjectId          uint32
	SecureSessionId    string
	Timestamp          time.Time
	TraceId            string
	SpanId             string
	ParentSpanId       string
	TraceState         string
	SpanName           string
	SpanKind           string
	ServiceName        string
	ResourceAttributes map[string]string
	SpanAttributes     map[string]string
	Duration           int64
	StatusCode         string
	StatusMessage      string
	// Events             map[string]any // TODO: Should we be more specific?
	// Links              map[string]any // TODO: Should we be more specific?
}

func NewTraceRow(span ptrace.Span, projectID uint32) *TraceRow {
	// TODO: Get handle resource attributes
	// TODO: Figure out why we get parsing errors in DB for attributes columns
	rawAttributes := span.Attributes().AsRaw()
	attributes := make(map[string]string)
	for k, v := range rawAttributes {
		attributes[k] = fmt.Sprintf("%v", v)
	}

	traceRow := &TraceRow{
		ProjectId:          projectID,
		SecureSessionId:    attributes["highlight.session_id"],
		Timestamp:          span.StartTimestamp().AsTime(),
		TraceId:            span.TraceID().String(),
		SpanId:             span.SpanID().String(),
		ParentSpanId:       span.ParentSpanID().String(),
		TraceState:         span.TraceState().AsRaw(),
		SpanName:           span.Name(),
		SpanKind:           span.Kind().String(),
		Duration:           int64(span.EndTimestamp().AsTime().Sub(span.StartTimestamp().AsTime()).Nanoseconds()),
		ServiceName:        "",
		ResourceAttributes: attributes,
		SpanAttributes:     attributes,
		StatusCode:         span.Status().Code().String(),
		StatusMessage:      span.Status().Message(),
		// Events:             map[string]any{},
		// Links:              map[string]any{},
	}

	return traceRow
}
