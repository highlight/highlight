package clickhouse

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

const TraceAttributeValueLengthLimit = 2 << 15

func truncateValue(input string) string {
	if len(input) > TraceAttributeValueLengthLimit {
		return input[:TraceAttributeValueLengthLimit] + "..."
	}
	return input
}

type TraceRow struct {
	Timestamp       time.Time
	UUID            string
	TraceId         string
	SpanId          string
	ParentSpanId    string
	TraceState      string
	SpanName        string
	SpanKind        string
	ServiceName     string
	ServiceVersion  string
	TraceAttributes map[string]string
	Duration        int64
	StatusCode      string
	StatusMessage   string
	Events          []*Event
	Links           []*Link
	ProjectId       uint32
	SecureSessionId string
	Environment     string
	HasErrors       bool
}

type Event struct {
	Timestamp  time.Time
	Name       string
	Attributes map[string]string
}

type Link struct {
	TraceId    string
	SpanId     string
	TraceState string
	Attributes map[string]string
}

func NewTraceRow(timestamp time.Time, projectID int) *TraceRow {
	traceRow := &TraceRow{
		Timestamp: timestamp,
		UUID:      uuid.New().String(),
		ProjectId: uint32(projectID),
	}

	return traceRow
}

func (t *TraceRow) WithSecureSessionId(sessionId string) *TraceRow {
	t.SecureSessionId = sessionId
	return t
}

func (t *TraceRow) WithTraceId(traceId string) *TraceRow {
	t.TraceId = traceId
	return t
}

func (t *TraceRow) WithSpanId(spanId string) *TraceRow {
	t.SpanId = spanId
	return t
}

func (t *TraceRow) WithParentSpanId(parentSpanId string) *TraceRow {
	t.ParentSpanId = parentSpanId
	return t
}

func (t *TraceRow) WithTraceState(traceState string) *TraceRow {
	t.TraceState = traceState
	return t
}

func (t *TraceRow) WithSpanName(spanName string) *TraceRow {
	t.SpanName = truncateValue(spanName)
	return t
}

func (t *TraceRow) WithSpanKind(spanKind string) *TraceRow {
	t.SpanKind = spanKind
	return t
}

func (t *TraceRow) WithDuration(startTime time.Time, endTime time.Time) *TraceRow {
	t.Duration = int64(endTime.Sub(startTime).Nanoseconds())
	return t
}

func (t *TraceRow) WithServiceName(serviceName string) *TraceRow {
	t.ServiceName = serviceName
	return t
}

func (t *TraceRow) WithServiceVersion(serviceVersion string) *TraceRow {
	t.ServiceVersion = serviceVersion
	return t
}

func (t *TraceRow) WithEnvironment(environment string) *TraceRow {
	t.Environment = environment
	return t
}

func (t *TraceRow) WithHasErrors(hasErrors bool) *TraceRow {
	t.HasErrors = hasErrors
	return t
}

func (t *TraceRow) WithStatusCode(statusCode string) *TraceRow {
	t.StatusCode = statusCode
	return t
}

func (t *TraceRow) WithStatusMessage(statusMessage string) *TraceRow {
	t.StatusMessage = truncateValue(statusMessage)
	return t
}

func (t *TraceRow) WithTraceAttributes(attributes map[string]string) *TraceRow {
	for k, v := range attributes {
		attributes[k] = truncateValue(v)
	}
	t.TraceAttributes = attributes
	return t
}

func (t *TraceRow) WithEvents(events []map[string]any) *TraceRow {
	traceEvents := make([]*Event, len(events))
	for i, event := range events {
		traceEvents[i] = &Event{
			Timestamp:  event["Timestamp"].(time.Time),
			Name:       event["Name"].(string),
			Attributes: attributesToMap(event["Attributes"].(map[string]any)),
		}
	}

	t.Events = traceEvents
	return t
}

func (t *TraceRow) WithLinks(links []map[string]any) *TraceRow {
	traceLinks := make([]*Link, len(links))
	for i, link := range links {
		traceLinks[i] = &Link{
			TraceId:    link["TraceId"].(string),
			SpanId:     link["SpanId"].(string),
			TraceState: link["TraceState"].(string),
			Attributes: attributesToMap(link["Attributes"].(map[string]any)),
		}
	}

	t.Links = traceLinks
	return t
}

func (t *TraceRow) AsClickhouseTraceRow() *ClickhouseTraceRow {
	return ConvertTraceRow(t)
}

func attributesToMap(attributes map[string]any) map[string]string {
	newAttrMap := make(map[string]string)
	for k, v := range attributes {
		newAttrMap[k] = truncateValue(fmt.Sprintf("%v", v))
	}
	return newAttrMap
}
