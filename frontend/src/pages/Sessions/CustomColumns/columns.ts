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

const LENGTH_COLUMN: SessionCustomColumn = {
	id: 'length',
	label: 'Length',
	type: 'duration',
	size: '1fr',
	accessor: (row: Session) => row.length,
}

const BROWSER_NAME_COLUMN: SessionCustomColumn = {
	id: 'browser_name',
	label: 'Browser',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.browser_name,
}

const BROWSER_VERSION_COLUMN: SessionCustomColumn = {
	id: 'browser_version',
	label: 'Browser Version',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.browser_version,
}

const CITY_COLUMN: SessionCustomColumn = {
	id: 'city',
	label: 'City',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.city,
}

const FIRST_TIME_COLUMN: SessionCustomColumn = {
	id: 'first_time',
	label: 'First Session',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => String(row.first_time),
}

const HAS_RAGE_CLICKS_COLUMN: SessionCustomColumn = {
	id: 'has_rage_clicks',
	label: 'Has Rage Clicks',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => String(row.has_rage_clicks),
}

const HAS_ERRORS_COLUMN: SessionCustomColumn = {
	id: 'has_errors',
	label: 'Has Errors',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => String(row.has_errors),
}

const IDENTIFIER_COLUMN: SessionCustomColumn = {
	id: 'identifier',
	label: 'Identifier',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.identifier,
}

const OS_NAME_COLUMN: SessionCustomColumn = {
	id: 'os_name',
	label: 'OS',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.os_name,
}

const OS_VERSION_COLUMN: SessionCustomColumn = {
	id: 'os_version',
	label: 'OS Version',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.os_version,
}

const STATE_COLUMN: SessionCustomColumn = {
	id: 'state',
	label: 'State',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => row.state,
}

const VIEWED_COLUMN: SessionCustomColumn = {
	id: 'viewed',
	label: 'Viewed',
	type: 'string',
	size: '1fr',
	accessor: (row: Session) => String(row.viewed),
}

export const SESSION_STANDARD_COLUMNS: Record<string, SessionCustomColumn> = {
	secure_id: SECURE_ID_COLUMN,
	email: EMAIL_COLUMN,
	identifier: IDENTIFIER_COLUMN,
	city: CITY_COLUMN,
	state: STATE_COLUMN,
	country: COUNTRY_COLUMN,
	created_at: CREATED_AT_COLUMN,
	active_length: ACTIVE_LENGTH_COLUMN,
	length: LENGTH_COLUMN,
	first_time: FIRST_TIME_COLUMN,
	has_errors: HAS_ERRORS_COLUMN,
	has_rage_clicks: HAS_RAGE_CLICKS_COLUMN,
	browser_name: BROWSER_NAME_COLUMN,
	browser_version: BROWSER_VERSION_COLUMN,
	os_name: OS_NAME_COLUMN,
	os_version: OS_VERSION_COLUMN,
	viewed: VIEWED_COLUMN,
}

export const DEFAULT_SESSION_COLUMNS = [
	SECURE_ID_COLUMN,
	EMAIL_COLUMN,
	COUNTRY_COLUMN,
	CREATED_AT_COLUMN,
	ACTIVE_LENGTH_COLUMN,
]
