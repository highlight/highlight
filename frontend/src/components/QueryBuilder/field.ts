export enum CustomFieldType {
	CUSTOM = 'custom',
	SESSION = 'session',
	ERROR = 'error',
	ERROR_FIELD = 'error-field',
}

export interface Field {
	label: string
	value: string
}

export interface SelectOption extends Field {
	kind: OptionKind.SINGLE
}

export interface MultiselectOption {
	kind: OptionKind.MULTI
	options: readonly Field[]
}

export interface SelectProps {
	inputValue: string
}

export enum OptionKind {
	SINGLE = 'SINGLE',
	MULTI = 'MULTI',
}

const FieldName: { [key: string]: string } = {
	referrer: 'Referrer',
	os_name: 'Operating System',
	active_length: 'Length',
	app_version: 'App Version',
	browser_name: 'Browser',
	browser: 'Browser',
	'visited-url': 'Visited URL',
	visited_url: 'Visited URL',
	city: 'City',
	country: 'Country',
	created_at: 'Date',
	device_id: 'Device ID',
	os_version: 'OS Version',
	browser_version: 'Browser Version',
	environment: 'Environment',
	processed: 'Status',
	viewed: 'Viewed By Anyone',
	viewed_by_me: 'Viewed By Me',
	first_time: 'First Time',
	starred: 'Starred',
	identifier: 'Identifier',
	reload: 'Reloaded',
	state: 'State',
	event: 'Event',
	timestamp: 'Date',
	has_rage_clicks: 'Has Rage Clicks',
	has_errors: 'Has Errors',
	pages_visited: 'Pages Visited',
	landing_page: 'Landing Page',
	exit_page: 'Exit Page',
} as const

export function getFieldDisplayName(field: Field) {
	return FieldName[field?.label] ?? field.label
}

export function getFieldType(field: Field) {
	return field?.value.split('_')[0]
}

export function getFieldTypeDisplayName(type?: string) {
	const $type = type

	if (!!$type && $type in ['track', 'user', 'session']) {
		return $type
	}

	return undefined
}
