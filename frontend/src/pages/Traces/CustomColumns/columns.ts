type ColumnType = 'string' | 'datetime' | 'session' | 'duration'

export type CustomColumn = {
	id: string
	label: string
	type: ColumnType
	size: string
}

export const HIGHLIGHT_STANDARD_COLUMNS = [
	'spanName',
	'serviceName',
	'traceID',
	'parentSpanID',
	'secureSessionID',
	'timestamp',
	'duration',
	'environment',
	'spanKind',
	'statusCode',
	'statusMessage',
	'traceState',
]

const SPAN_NAME_COLUMN: CustomColumn = {
	id: 'spanName',
	label: 'Span',
	type: 'string',
	size: '2fr',
}
const SERVICE_NAME_COLUMN: CustomColumn = {
	id: 'serviceName',
	label: 'Service',
	type: 'string',
	size: '1fr',
}

const TRACE_ID_COLUMN: CustomColumn = {
	id: 'traceID',
	label: 'Trace ID',
	type: 'string',
	size: '2fr',
}

const PARENT_SPAN_ID_COLUMN: CustomColumn = {
	id: 'parentSpanID',
	label: 'Parent Span ID',
	type: 'string',
	size: '1fr',
}

const SECURE_SESSION_ID_COLUMN: CustomColumn = {
	id: 'secureSessionID',
	label: 'Secure Session ID',
	type: 'session',
	size: '2fr',
}

const TIMESTAMP_COLUMN: CustomColumn = {
	id: 'timestamp',
	label: 'Timestamp',
	type: 'datetime',
	size: '1.2fr',
}

const DURATION_COLUMN: CustomColumn = {
	id: 'duration',
	label: 'Duration',
	type: 'duration',
	size: '1fr',
}

const ENVIRONMENT_COLUMN: CustomColumn = {
	id: 'environment',
	label: 'Environment',
	type: 'string',
	size: '1fr',
}

const SPAN_KIND_COLUMN: CustomColumn = {
	id: 'spanKind',
	label: 'Span Kind',
	type: 'string',
	size: '1fr',
}

const STATUS_CODE_COLUMN: CustomColumn = {
	id: 'statusCode',
	label: 'Status Code',
	type: 'string',
	size: '1fr',
}

const STATUS_MESSAGE_COLUMN: CustomColumn = {
	id: 'statusMessage',
	label: 'Status Message',
	type: 'string',
	size: '1fr',
}

const TRACE_STATE_COLUMN: CustomColumn = {
	id: 'traceState',
	label: 'Trace State',
	type: 'string',
	size: '1fr',
}

export const DEFAULT_TRACE_COLUMNS = [
	SPAN_NAME_COLUMN,
	SERVICE_NAME_COLUMN,
	TRACE_ID_COLUMN,
	PARENT_SPAN_ID_COLUMN,
	SECURE_SESSION_ID_COLUMN,
	TIMESTAMP_COLUMN,
]

export const TRACE_COLUMN_OPTIONS = [
	SPAN_NAME_COLUMN,
	SERVICE_NAME_COLUMN,
	TRACE_ID_COLUMN,
	PARENT_SPAN_ID_COLUMN,
	SECURE_SESSION_ID_COLUMN,
	DURATION_COLUMN,
	ENVIRONMENT_COLUMN,
	TIMESTAMP_COLUMN,
	SPAN_KIND_COLUMN,
	STATUS_CODE_COLUMN,
	STATUS_MESSAGE_COLUMN,
	TRACE_STATE_COLUMN,
]
