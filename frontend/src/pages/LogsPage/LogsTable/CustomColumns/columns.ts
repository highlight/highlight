type ColumnType = 'string' | 'datetime' | 'session' | 'level' | 'body'

export type CustomColumn = {
	id: string
	label: string
	type: ColumnType
	size: string
	// accessKey is the key used to access the column in the data object
	// not a perfect snake case to camel case conversion (i.e. id => ID)
	accessKey: string
}

const TIMESTAMP_COLUMN: CustomColumn = {
	id: 'timestamp',
	label: 'Timestamp',
	type: 'datetime',
	size: '175px',
	accessKey: 'timestamp',
}

const LEVEL_COLUMN: CustomColumn = {
	id: 'level',
	label: 'Level',
	type: 'level',
	size: '75px',
	accessKey: 'level',
}

const BODY_COLUMN: CustomColumn = {
	id: 'message',
	label: 'Body',
	type: 'body',
	size: '5fr',
	accessKey: 'message',
}

const SERVICE_NAME_COLUMN: CustomColumn = {
	id: 'service_name',
	label: 'Service',
	type: 'string',
	size: '1fr',
	accessKey: 'serviceName',
}

const SERVICE_VERSION_COLUMN: CustomColumn = {
	id: 'service_version',
	label: 'Version',
	type: 'string',
	size: '1fr',
	accessKey: 'serviceVersion',
}

const SECURE_SESSION_ID_COLUMN: CustomColumn = {
	id: 'secure_session_id',
	label: 'Secure Session ID',
	type: 'session',
	size: '2fr',
	accessKey: 'secureSessionID',
}

const TRACE_ID_COLUMN: CustomColumn = {
	id: 'trace_id',
	label: 'Trace ID',
	type: 'string',
	size: '2fr',
	accessKey: 'traceID',
}

const ENVIRONMENT_COLUMN: CustomColumn = {
	id: 'environment',
	label: 'Environment',
	type: 'string',
	size: '1fr',
	accessKey: 'environment',
}

const SPAN_ID_COLUMN: CustomColumn = {
	id: 'span_id',
	label: 'Span ID',
	type: 'string',
	size: '1fr',
	accessKey: 'spanID',
}

const SOURCE_COLUMN: CustomColumn = {
	id: 'source',
	label: 'Source',
	type: 'string',
	size: '1fr',
	accessKey: 'source',
}

export const DEFAULT_LOG_COLUMNS = [TIMESTAMP_COLUMN, LEVEL_COLUMN, BODY_COLUMN]

export const HIGHLIGHT_STANDARD_COLUMNS: Record<string, CustomColumn> = {
	timestamp: TIMESTAMP_COLUMN,
	level: LEVEL_COLUMN,
	message: BODY_COLUMN,
	service_name: SERVICE_NAME_COLUMN,
	service_version: SERVICE_VERSION_COLUMN,
	secure_session_id: SECURE_SESSION_ID_COLUMN,
	trace_id: TRACE_ID_COLUMN,
	environment: ENVIRONMENT_COLUMN,
	span_id: SPAN_ID_COLUMN,
	source: SOURCE_COLUMN,
}
