import { createContext } from '@util/context/context'

export const dateTimeFormats = [
	'Smart',
	'Relative',
	'Date Only',
	'Date and Time',
	'Date and Time with Milliseconds',
	'Unix',
	'Unix With Milliseconds',
	'ISO',
] as const

export type SESSION_FEED_DATETIME_FORMAT = typeof dateTimeFormats[number]

export const countFormats = ['Short', 'Full'] as const

export type SESSION_FEED_COUNT_FORMAT = typeof countFormats[number]

export const sortOrders = ['Descending', 'Ascending'] as const

export type SESSION_FEED_SORT_ORDER = typeof sortOrders[number]

export interface SessionFeedConfigurationContext {
	datetimeFormat: SESSION_FEED_DATETIME_FORMAT
	setDatetimeFormat: (newDatetimeFormat: SESSION_FEED_DATETIME_FORMAT) => void
	countFormat: SESSION_FEED_COUNT_FORMAT
	setCountFormat: (newCountFormat: SESSION_FEED_COUNT_FORMAT) => void
	sortOrder: SESSION_FEED_SORT_ORDER
	setSortOrder: (newSortOrder: SESSION_FEED_SORT_ORDER) => void
}

export const [
	useSessionFeedConfigurationContext,
	SessionFeedConfigurationContextProvider,
] = createContext<SessionFeedConfigurationContext>(
	'SessionFeedConfigurationContext',
)
