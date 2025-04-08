import { ProductType } from '@/graph/generated/schemas'

const STANDARD_LOG_FILTERS = [
	'level',
	'service_name',
	'service_version',
	'environment',
	'source',
]

const STANDARD_TRACE_FILTERS = [
	'service_name',
	'service_version',
	'environment',
	'span_name',
	'span_kind',
	'metric_name',
]

export const STANDARD_FILTERS: Record<ProductType, string[]> = {
	[ProductType.Sessions]: [],
	[ProductType.Errors]: [],
	[ProductType.Logs]: STANDARD_LOG_FILTERS,
	[ProductType.Traces]: STANDARD_TRACE_FILTERS,
	[ProductType.Metrics]: [],
	[ProductType.Events]: [],
}

export type FilterInfo = {
	saved: boolean
	values: Map<string, boolean> // value name -> selected
}
