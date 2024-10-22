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

export const DEFAULT_ERROR_OBJECT_COLUMNS = [
	EVENT_COLUMN,
	SESSION_COLUMN,
	TIMESTAMP_COLUMN,
]
