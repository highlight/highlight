import { ProductType } from '@/graph/generated/schemas'

export type TIME_MODE = 'fixed-range' | 'permalink'

export const TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.000000000Z'

export const AI_SEARCH_PLACEHOLDERS = {
	[ProductType.Logs]: "e.g. 'logs with level error in the last 24 hours'",
	[ProductType.Traces]: "e.g. 'traces with errors from 5-6am'",
	[ProductType.Errors]: "e.g. 'errors in Chrome from yesterday'",
	[ProductType.Metrics]: 'TODO: if/when implemented for metrics',
	[ProductType.Sessions]: "e.g. 'sessions with rage clicks this week'",
}
