import { TraceCustomColumn } from '@/components/CustomColumnPopover'

const SPAN_NAME_COLUMN: TraceCustomColumn = {
	id: 'span_name',
	label: 'Span',
	type: 'string',
	size: '2fr',
	accessor: (row) => row.node.spanName,
}

const SERVICE_NAME_COLUMN: TraceCustomColumn = {
	id: 'service_name',
	label: 'Service',
	type: 'string',
	size: '1fr',
	accessor: (row) => row.node.serviceName,
}

const SERVICE_VERSION_COLUMN: TraceCustomColumn = {
	id: 'service_version',
	label: 'Version',
	type: 'string',
	size: '1fr',
	accessor: (row) => row.node.serviceVersion,
}

const TRACE_ID_COLUMN: TraceCustomColumn = {
	id: 'trace_id',
	label: 'Trace ID',
	type: 'string',
	size: '2fr',
	accessor: (row) => row.node.traceID,
}

const PARENT_SPAN_ID_COLUMN: TraceCustomColumn = {
	id: 'parent_span_id',
	label: 'Parent Span ID',
	type: 'string',
	size: '1fr',
	accessor: (row) => row.node.parentSpanID,
}

const SPAN_ID_COLUMN: TraceCustomColumn = {
	id: 'span_id',
	label: 'Span ID',
	type: 'string',
	size: '1fr',
	accessor: (row) => row.node.spanID,
}

const SECURE_SESSION_ID_COLUMN: TraceCustomColumn = {
	id: 'secure_session_id',
	label: 'Secure Session ID',
	type: 'session',
	size: '2fr',
	accessor: (row) => row.node.secureSessionID,
}

const HAS_ERRORS_COLUMN: TraceCustomColumn = {
	id: 'has_errors',
	label: 'Has Errors',
	type: 'boolean',
	size: '1fr',
	accessor: (row) => row.node.hasErrors,
}

const TIMESTAMP_COLUMN: TraceCustomColumn = {
	id: 'timestamp',
	label: 'Timestamp',
	type: 'datetime',
	size: '1.2fr',
	accessor: (row) => row.node.timestamp,
}

const DURATION_COLUMN: TraceCustomColumn = {
	id: 'duration',
	label: 'Duration',
	type: 'duration',
	size: '1fr',
	accessor: (row) => row.node.duration,
}

const ENVIRONMENT_COLUMN: TraceCustomColumn = {
	id: 'environment',
	label: 'Environment',
	type: 'string',
	size: '1fr',
	accessor: (row) => row.node.environment,
}

const SPAN_KIND_COLUMN: TraceCustomColumn = {
	id: 'span_kind',
	label: 'Span Kind',
	type: 'string',
	size: '1fr',
	accessor: (row) => row.node.spanKind,
}

const METRIC_NAME_COLUMN: TraceCustomColumn = {
	id: 'metric_name',
	label: 'Metric',
	type: 'metric_name',
	size: '1fr',
	accessor: (row) => row.node.events?.at(0)?.attributes['metric.name'],
}

const METRIC_VALUE_COLUMN: TraceCustomColumn = {
	id: 'metric_value',
	label: 'Metric Value',
	type: 'metric_value',
	size: '1fr',
	accessor: (row) => row.node.events?.at(0)?.attributes['metric.value'],
}

export const DEFAULT_TRACE_COLUMNS = [
	SPAN_NAME_COLUMN,
	SERVICE_NAME_COLUMN,
	TRACE_ID_COLUMN,
	PARENT_SPAN_ID_COLUMN,
	SECURE_SESSION_ID_COLUMN,
	TIMESTAMP_COLUMN,
]

export const HIGHLIGHT_STANDARD_COLUMNS: Record<string, TraceCustomColumn> = {
	span_name: SPAN_NAME_COLUMN,
	service_name: SERVICE_NAME_COLUMN,
	service_version: SERVICE_VERSION_COLUMN,
	trace_id: TRACE_ID_COLUMN,
	parent_span_id: PARENT_SPAN_ID_COLUMN,
	span_id: SPAN_ID_COLUMN,
	secure_session_id: SECURE_SESSION_ID_COLUMN,
	has_errors: HAS_ERRORS_COLUMN,
	duration: DURATION_COLUMN,
	environment: ENVIRONMENT_COLUMN,
	timestamp: TIMESTAMP_COLUMN,
	span_kind: SPAN_KIND_COLUMN,
	metric_name: METRIC_NAME_COLUMN,
	metric_value: METRIC_VALUE_COLUMN,
}
