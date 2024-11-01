import { ErrorObjectCustomColumn } from '@/components/CustomColumnPopover'
import { ErrorObjectNode } from '@/graph/generated/schemas'

const TIMESTAMP_COLUMN: ErrorObjectCustomColumn = {
	id: 'timestamp',
	label: 'Timestamp',
	type: 'datetime',
	size: '2fr',
	accessor: (row: ErrorObjectNode) => row.timestamp,
}

const EVENT_COLUMN: ErrorObjectCustomColumn = {
	id: 'event',
	label: 'Event',
	type: 'error_object',
	size: '2fr',
	accessor: (row: ErrorObjectNode) => ({
		secureId: row.errorGroupSecureID,
		id: row.id,
		event: row.event,
	}),
}

const SESSION_COLUMN: ErrorObjectCustomColumn = {
	id: 'session',
	label: 'Session',
	type: 'session',
	size: '2fr',
	accessor: (row: ErrorObjectNode) => row.session?.secureID,
}

const SERVICE_NAME_COLUMN: ErrorObjectCustomColumn = {
	id: 'service_name',
	label: 'Service',
	type: 'string',
	size: '1fr',
	accessor: (row: ErrorObjectNode) => row.serviceName,
}

const SERVICE_VERSION_COLUMN: ErrorObjectCustomColumn = {
	id: 'service_version',
	label: 'Version',
	type: 'string',
	size: '1fr',
	accessor: (row: ErrorObjectNode) => row.serviceVersion,
}

const ERROR_GROUP_SECURE_ID_COLUMN: ErrorObjectCustomColumn = {
	id: 'error_group_secure_id',
	label: 'Group Secure ID',
	type: 'string',
	size: '1fr',
	accessor: (row: ErrorObjectNode) => row.errorGroupSecureID,
}

export const ERROR_OBJECT_STANDARD_COLUMNS: Record<
	string,
	ErrorObjectCustomColumn
> = {
	timestamp: TIMESTAMP_COLUMN,
	event: EVENT_COLUMN,
	session: SESSION_COLUMN,
	service_name: SERVICE_NAME_COLUMN,
	service_version: SERVICE_VERSION_COLUMN,
	error_group_secure_id: ERROR_GROUP_SECURE_ID_COLUMN,
}

export const DEFAULT_ERROR_OBJECT_COLUMNS = [
	EVENT_COLUMN,
	SESSION_COLUMN,
	TIMESTAMP_COLUMN,
]
