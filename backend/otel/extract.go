package otel

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/highlight-run/highlight/backend/clickhouse"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/plog"
	"go.opentelemetry.io/collector/pdata/ptrace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

var fluentProjectPattern = regexp.MustCompile(fmt.Sprintf(`%s=([\S]+)`, highlight.ProjectIDAttribute))

// Extracted fields
type extractedFields struct {
	projectID    string
	projectIDInt int
	sessionID    string
	requestID    string
	source       modelInputs.LogSource
	serviceName  string

	// The original map data. Should only be used for debugging.
	// TODO(et) - if we only use this for debugging purposes, should we just omit?
	resourceAttributes map[string]any
	spanAttributes     map[string]any
	eventAttributes    map[string]any
	scopeAttributes    map[string]any
	logAttributes      map[string]any

	// This represents the merged result of resource, span...log attributes
	// _after_ we extract fields out. In other words, if `serviceName` is extracted, it won't be included
	// in this map.
	// This is the data that should be written to the attributes column (e.g. LogAttributes)
	modifiedAttributes map[string]string
}

type extractFieldsParams struct {
	resource  *pcommon.Resource
	span      *ptrace.Span
	event     *ptrace.SpanEvent
	scopeLogs *plog.ScopeLogs
	logRecord *plog.LogRecord
}

func extractFields(ctx context.Context, params extractFieldsParams) (extractedFields, error) {
	fields := extractedFields{
		source: modelInputs.LogSourceBackend,
	}

	if params.resource != nil {
		fields.resourceAttributes = params.resource.Attributes().AsRaw()
	}

	if params.span != nil {
		fields.spanAttributes = params.span.Attributes().AsRaw()
	}

	if params.event != nil {
		fields.eventAttributes = params.event.Attributes().AsRaw()
	}

	if params.scopeLogs != nil {
		fields.scopeAttributes = params.scopeLogs.Scope().Attributes().AsRaw()
	}

	if params.logRecord != nil {
		fields.logAttributes = params.logRecord.Attributes().AsRaw()
	}

	attrs := mergeMaps(
		fields.resourceAttributes,
		fields.spanAttributes,
		fields.eventAttributes,
		fields.scopeAttributes,
		fields.logAttributes,
	)

	if val, ok := attrs[highlight.DeprecatedProjectIDAttribute]; ok {
		fields.projectID = val.(string)
		delete(attrs, highlight.DeprecatedProjectIDAttribute)
	}

	if val, ok := attrs[highlight.ProjectIDAttribute]; ok {
		fields.projectID = val.(string)
		delete(attrs, highlight.ProjectIDAttribute)
	}

	if val, ok := attrs[highlight.DeprecatedSessionIDAttribute]; ok {
		fields.sessionID = val.(string)
		delete(attrs, highlight.DeprecatedSessionIDAttribute)
	}

	if val, ok := attrs[highlight.SessionIDAttribute]; ok {
		fields.sessionID = val.(string)
		delete(attrs, highlight.SessionIDAttribute)
	}

	if val, ok := attrs[highlight.DeprecatedSourceAttribute]; ok {
		if val == modelInputs.LogSourceFrontend.String() {
			fields.source = modelInputs.LogSourceFrontend
		}
		delete(attrs, highlight.DeprecatedSourceAttribute)
	}

	if val, ok := attrs[highlight.SourceAttribute]; ok {
		if val == modelInputs.LogSourceFrontend.String() {
			fields.source = modelInputs.LogSourceFrontend
		}
		delete(attrs, highlight.SourceAttribute)
	}

	if val, ok := attrs[highlight.RequestIDAttribute]; ok {
		fields.requestID = val.(string)
		delete(attrs, highlight.RequestIDAttribute)
	}

	if val, ok := fields.resourceAttributes[string(semconv.ServiceNameKey)]; ok { // we know that service name will be in the resource hash
		fields.serviceName = val.(string)
		delete(attrs, string(semconv.ServiceNameKey))
	}

	if fields.projectID != "" {
		if tag := attrs["fluent.tag"]; tag != nil {
			if v, _ := tag.(string); v != "" {
				project := fluentProjectPattern.FindStringSubmatch(v)
				if project != nil {
					fields.projectID = project[1]
				}
			}
			delete(attrs, "fluent.tag")
		}
	}

	attributesMap := make(map[string]string)
	for k, v := range attrs {
		prefixes := highlight.InternalAttributePrefixes
		if fields.source == modelInputs.LogSourceFrontend {
			prefixes = append(prefixes, highlight.BackendOnlyAttributePrefixes...)
		}

		shouldSkip := false
		for _, prefix := range prefixes {
			if strings.HasPrefix(k, prefix) {
				shouldSkip = true
				break
			}
		}
		if shouldSkip {
			continue
		}

		for key, value := range util.FormatLogAttributes(ctx, k, v) {
			attributesMap[key] = value
		}
	}
	fields.modifiedAttributes = attributesMap

	projectIDInt, err := clickhouse.ProjectToInt(fields.projectID)

	if err != nil {
		return fields, err
	}

	fields.projectIDInt = projectIDInt

	return fields, nil
}

func mergeMaps(maps ...map[string]any) map[string]any {
	combinedMap := make(map[string]any)

	for _, m := range maps {
		for key, value := range m {
			combinedMap[key] = value
		}
	}

	return combinedMap
}
