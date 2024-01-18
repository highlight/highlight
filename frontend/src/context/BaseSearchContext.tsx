import { DateHistogramBucketSize } from '@graph/schemas'
import { DateRangePreset } from '@highlight-run/ui/components'
import { identity, omitBy, pickBy } from 'lodash'

export type Segment = { name: string; id: string } | undefined

export function normalizeParams<T>(params: object) {
	return omitBy(
		pickBy(params, identity),
		(val) => Array.isArray(val) && (val as Array<T>).length === 0,
	)
}

export type BaseSearchContext = {
	/** Local changes to the segment parameters that might not be persisted to the database. */
	searchQuery: string
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>
	/** The parameters that are persisted to the database. These params are saved to a segment. */
	existingQuery: string
	selectedSegment: Segment
	setSelectedSegment: (newValue: Segment, query: string) => void
	removeSelectedSegment: () => void
	histogramBucketSize: DateHistogramBucketSize
	page: number
	setPage: React.Dispatch<React.SetStateAction<number>>
	searchResultsLoading: boolean
	setSearchResultsLoading: React.Dispatch<React.SetStateAction<boolean>>
	searchResultsCount: number | undefined
	setSearchResultsCount: React.Dispatch<
		React.SetStateAction<number | undefined>
	>
	startDate: Date
	endDate: Date
	selectedPreset?: DateRangePreset
	setSearchTime: (
		startDate: Date,
		endDate: Date,
		preset?: DateRangePreset,
	) => void
	resetTime: () => void
	createNewSearch: (
		searchQuery: string,
		startDate?: Date,
		endDate?: Date,
		preset?: DateRangePreset,
	) => void
}
