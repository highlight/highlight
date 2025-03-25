import { ProductType } from '@/graph/generated/schemas'

const STANDARD_LOG_FILTERS = [
	'level',
	'service_name',
	'service_version',
	'environment',
	'source',
]

export const STANDARD_FILTERS: Record<ProductType, string[]> = {
	[ProductType.Sessions]: [],
	[ProductType.Errors]: [],
	[ProductType.Logs]: STANDARD_LOG_FILTERS,
	[ProductType.Traces]: [],
	[ProductType.Metrics]: [],
	[ProductType.Events]: [],
}

export type FilterInfo = {
	saved: boolean
	values: Map<string, boolean> // value name -> selected
}
