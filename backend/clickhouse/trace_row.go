package clickhouse

import (
	"fmt"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
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
	Events             []Event
	Links              []Link
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

func NewTraceRow(timestamp time.Time) *TraceRow {
	traceRow := &TraceRow{
		Timestamp:   timestamp,
		ServiceName: "",
	}

	return traceRow
}

func (t *TraceRow) WithProjectId(projectId int) *TraceRow {
	t.ProjectId = uint32(projectId)
	return t
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
	t.SpanName = spanName
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

func (t *TraceRow) WithStatusCode(statusCode string) *TraceRow {
	t.StatusCode = statusCode
	return t
}

func (t *TraceRow) WithStatusMessage(statusMessage string) *TraceRow {
	t.StatusMessage = statusMessage
	return t
}

func (t *TraceRow) WithResourceAttributes(attributes map[string]any) *TraceRow {
	resourceAttributes := make(map[string]string)
	for k, v := range attributes {
		resourceAttributes[k] = fmt.Sprintf("%v", v)
	}
	t.ResourceAttributes = resourceAttributes
	return t
}

func (t *TraceRow) WithSpanAttributes(attributes map[string]any) *TraceRow {
	spanAttributes := make(map[string]string)
	for k, v := range attributes {
		spanAttributes[k] = fmt.Sprintf("%v", v)
	}
	t.SpanAttributes = spanAttributes
	return t
}

func (t *TraceRow) WithEvents(events []map[string]any) *TraceRow {
	traceEvents := make([]Event, len(events))
	for i, event := range events {
		traceEvents[i] = Event{
			Timestamp:  event["Timestamp"].(time.Time),
			Name:       event["Name"].(string),
			Attributes: event["Attributes"].(map[string]string),
		}
	}

	t.Events = traceEvents
	return t
}

func (t *TraceRow) WithLinks(links []map[string]any) *TraceRow {
	traceLinks := make([]Link, len(links))
	for i, link := range links {
		traceLinks[i] = Link{
			TraceId:    link["TraceId"].(string),
			SpanId:     link["SpanId"].(string),
			TraceState: link["TraceState"].(string),
			Attributes: link["Attributes"].(map[string]string),
		}
	}

	t.Links = traceLinks
	return t
}

func attributesToMap(attributes map[string]any) map[string]string {
	newAttrMap := make(map[string]string)
	for k, v := range attributes {
		newAttrMap[k] = fmt.Sprintf("%v", v)
	}
	return newAttrMap
}

// TODO: Import from extract.go instead of copying here
func projectToInt(projectID string) (int, error) {
	i, err := strconv.ParseInt(projectID, 10, 32)
	if err == nil {
		return int(i), nil
	}
	i2, err := model.FromVerboseID(projectID)
	if err == nil {
		return i2, nil
	}
	return 0, e.New(fmt.Sprintf("invalid project id %s", projectID))
}
