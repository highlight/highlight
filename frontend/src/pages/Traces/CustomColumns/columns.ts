import { TraceCustomColumn } from '@/components/CustomColumnPopover'

const SPAN_NAME_COLUMN: TraceCustomColumn = {
	id: 'span_name',
	label: 'Span',
	type: 'string',
	size: '2fr',
	accessKey: 'spanName',
}

const SERVICE_NAME_COLUMN: TraceCustomColumn = {
	id: 'service_name',
	label: 'Service',
	type: 'string',
	size: '1fr',
	accessKey: 'serviceName',
}

const SERVICE_VERSION_COLUMN: TraceCustomColumn = {
	id: 'service_version',
	label: 'Version',
	type: 'string',
	size: '1fr',
	accessKey: 'serviceVersion',
}

const TRACE_ID_COLUMN: TraceCustomColumn = {
	id: 'trace_id',
	label: 'Trace ID',
	type: 'string',
	size: '2fr',
	accessKey: 'traceID',
}

const PARENT_SPAN_ID_COLUMN: TraceCustomColumn = {
	id: 'parent_span_id',
	label: 'Parent Span ID',
	type: 'string',
	size: '1fr',
	accessKey: 'parentSpanID',
}

const SECURE_SESSION_ID_COLUMN: TraceCustomColumn = {
	id: 'secure_session_id',
	label: 'Secure Session ID',
	type: 'session',
	size: '2fr',
	accessKey: 'secureSessionID',
}

const TIMESTAMP_COLUMN: TraceCustomColumn = {
	id: 'timestamp',
	label: 'Timestamp',
	type: 'datetime',
	size: '1.2fr',
	accessKey: 'timestamp',
}

const START_TIME_COLUMN: TraceCustomColumn = {
	id: 'start_time',
	label: 'Start Time',
	type: 'datetime',
	size: '1.2fr',
	accessKey: 'startTime',
}

const DURATION_COLUMN: TraceCustomColumn = {
	id: 'duration',
	label: 'Duration',
	type: 'duration',
	size: '1fr',
	accessKey: 'duration',
}

const ENVIRONMENT_COLUMN: TraceCustomColumn = {
	id: 'environment',
	label: 'Environment',
	type: 'string',
	size: '1fr',
	accessKey: 'environment',
}

const SPAN_KIND_COLUMN: TraceCustomColumn = {
	id: 'span_kind',
	label: 'Span Kind',
	type: 'string',
	size: '1fr',
	accessKey: 'spanKind',
}

const STATUS_CODE_COLUMN: TraceCustomColumn = {
	id: 'status_code',
	label: 'Status Code',
	type: 'string',
	size: '1fr',
	accessKey: 'statusCode',
}

const STATUS_MESSAGE_COLUMN: TraceCustomColumn = {
	id: 'status_message',
	label: 'Status Message',
	type: 'string',
	size: '1fr',
	accessKey: 'statusMessage',
}

const TRACE_STATE_COLUMN: TraceCustomColumn = {
	id: 'trace_state',
	label: 'Trace State',
	type: 'string',
	size: '1fr',
	accessKey: 'traceState',
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
	secure_session_id: SECURE_SESSION_ID_COLUMN,
	duration: DURATION_COLUMN,
	environment: ENVIRONMENT_COLUMN,
	timestamp: TIMESTAMP_COLUMN,
	start_time: START_TIME_COLUMN,
	span_kind: SPAN_KIND_COLUMN,
	status_code: STATUS_CODE_COLUMN,
	status_message: STATUS_MESSAGE_COLUMN,
	trace_state: TRACE_STATE_COLUMN,
}
