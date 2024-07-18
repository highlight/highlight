import { SessionCustomColumn } from '@/components/CustomColumnPopover'

const CREATED_AT_COLUMN: SessionCustomColumn = {
	id: 'created_at',
	label: 'Timestamp',
	type: 'session',
	size: '2fr',
	accessKey: 'created_at',
}

const COUNTRY_COLUMN: SessionCustomColumn = {
	id: 'country',
	label: 'Country',
	type: 'string',
	size: '1fr',
	accessKey: 'country',
}

const IDENTIFIER_COLUMN: SessionCustomColumn = {
	id: 'identifier',
	label: 'Identifier',
	type: 'string',
	size: '1fr',
	accessKey: 'identifier',
}

const SECURE_ID_COLUMN: SessionCustomColumn = {
	id: 'secure_id',
	label: 'Secure ID',
	type: 'session',
	size: '2fr',
	accessKey: 'secure_id',
}

export const DEFAULT_SESSION_COLUMNS = [
	SECURE_ID_COLUMN,
	IDENTIFIER_COLUMN,
	COUNTRY_COLUMN,
	CREATED_AT_COLUMN,
]
