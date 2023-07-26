package otel

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	model "github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	e "github.com/pkg/errors"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/plog"
	"go.opentelemetry.io/collector/pdata/ptrace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

var fluentProjectPattern = regexp.MustCompile(fmt.Sprintf(`%s=([\S]+)`, highlight.ProjectIDAttribute))

// Extracted fields
type extractedFields struct {
	projectID      string
	projectIDInt   int
	sessionID      string
	requestID      string
	source         modelInputs.LogSource
	serviceName    string
	serviceVersion string

	// This represents the merged result of resource, span...log attributes
	// _after_ we extract fields out. In other words, if `serviceName` is extracted, it won't be included
	// in this map.
	// This is the data that should be written to the attributes column (e.g. LogAttributes)
	attrs map[string]string
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

	var resourceAttributes, spanAttributes, eventAttributes, scopeAttributes, logAttributes map[string]any
	if params.resource != nil {
		resourceAttributes = params.resource.Attributes().AsRaw()
	}

	if params.span != nil {
		spanAttributes = params.span.Attributes().AsRaw()
	}

	if params.event != nil {
		eventAttributes = params.event.Attributes().AsRaw()
	}

	if params.scopeLogs != nil {
		scopeAttributes = params.scopeLogs.Scope().Attributes().AsRaw()
	}

	if params.logRecord != nil {
		logAttributes = params.logRecord.Attributes().AsRaw()
	}

	attrs := mergeMaps(
		resourceAttributes,
		spanAttributes,
		eventAttributes,
		scopeAttributes,
		logAttributes,
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

	if val, ok := resourceAttributes[string(semconv.ServiceNameKey)]; ok { // we know that service name will be in the resource hash
		fields.serviceName = val.(string)
		delete(attrs, string(semconv.ServiceNameKey))
	}

	if val, ok := resourceAttributes[string(semconv.ServiceVersionKey)]; ok { // we know that service version will be in the resource hash
		fields.serviceVersion = val.(string)
		delete(attrs, string(semconv.ServiceVersionKey))
	}

	if fields.projectID == "" {
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
	fields.attrs = attributesMap

	projectIDInt, err := projectToInt(fields.projectID)

	if err != nil {
		return fields, err
	}

	fields.projectIDInt = projectIDInt

	return fields, nil
}

func mergeMaps(maps ...map[string]any) map[string]any {
	merged := make(map[string]any)

	for _, m := range maps {
		for key, value := range m {
			merged[key] = value
		}
	}

	return merged
}

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
