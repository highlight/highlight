import { SessionCustomColumn } from '@/components/CustomColumnPopover'
import { Session } from '@/graph/generated/schemas'

const CREATED_AT_COLUMN: SessionCustomColumn = {
	id: 'created_at',
	label: 'Timestamp',
	type: 'datetime',
	size: '2fr',
	accessor: (row: Session) => row.created_at,
}

const COUNTRY_COLUMN: SessionCustomColumn = {
	id: 'country',
	label: 'Country',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.country,
}

const EMAIL_COLUMN: SessionCustomColumn = {
	id: 'email',
	label: 'Email',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.email,
}

const SECURE_ID_COLUMN: SessionCustomColumn = {
	id: 'secure_id',
	label: 'Secure ID',
	type: 'session',
	size: '2fr',
	accessor: (row: Session) => row.secure_id,
}

const ACTIVE_LENGTH_COLUMN: SessionCustomColumn = {
	id: 'active_length',
	label: 'Active Length',
	type: 'duration',
	size: '1fr',
	accessor: (row: Session) => row.active_length,
}

export const DEFAULT_SESSION_COLUMNS = [
	SECURE_ID_COLUMN,
	EMAIL_COLUMN,
	COUNTRY_COLUMN,
	CREATED_AT_COLUMN,
	ACTIVE_LENGTH_COLUMN,
]
