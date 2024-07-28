import { LogCustomColumn } from '@components/CustomColumnPopover'

import { LogEdge } from '@/graph/generated/schemas'

const TIMESTAMP_COLUMN: LogCustomColumn = {
	id: 'timestamp',
	label: 'Timestamp',
	type: 'datetime',
	size: '175px',
	accessor: (row: LogEdge) => row.node.timestamp,
}

const LEVEL_COLUMN: LogCustomColumn = {
	id: 'level',
	label: 'Level',
	type: 'level',
	size: '75px',
	accessor: (row: LogEdge) => row.node.level,
}

const BODY_COLUMN: LogCustomColumn = {
	id: 'message',
	label: 'Body',
	type: 'body',
	size: '5fr',
	accessor: (row: LogEdge) => row.node.message,
}

const SERVICE_NAME_COLUMN: LogCustomColumn = {
	id: 'service_name',
	label: 'Service',
	type: 'string',
	size: '1fr',
	accessor: (row: LogEdge) => row.node.serviceName,
}

const SERVICE_VERSION_COLUMN: LogCustomColumn = {
	id: 'service_version',
	label: 'Version',
	type: 'string',
	size: '1fr',
	accessor: (row: LogEdge) => row.node.serviceVersion,
}

const SECURE_SESSION_ID_COLUMN: LogCustomColumn = {
	id: 'secure_session_id',
	label: 'Secure Session ID',
	type: 'session',
	size: '2fr',
	accessor: (row: LogEdge) => row.node.secureSessionID,
}

const TRACE_ID_COLUMN: LogCustomColumn = {
	id: 'trace_id',
	label: 'Trace ID',
	type: 'string',
	size: '2fr',
	accessor: (row: LogEdge) => row.node.traceID,
}

const ENVIRONMENT_COLUMN: LogCustomColumn = {
	id: 'environment',
	label: 'Environment',
	type: 'string',
	size: '1fr',
	accessor: (row: LogEdge) => row.node.environment,
}

const SPAN_ID_COLUMN: LogCustomColumn = {
	id: 'span_id',
	label: 'Span ID',
	type: 'string',
	size: '1fr',
	accessor: (row: LogEdge) => row.node.spanID,
}

const SOURCE_COLUMN: LogCustomColumn = {
	id: 'source',
	label: 'Source',
	type: 'string',
	size: '1fr',
	accessor: (row: LogEdge) => row.node.source,
}

export const DEFAULT_LOG_COLUMNS = [TIMESTAMP_COLUMN, LEVEL_COLUMN, BODY_COLUMN]

export const HIGHLIGHT_STANDARD_COLUMNS: Record<string, LogCustomColumn> = {
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
