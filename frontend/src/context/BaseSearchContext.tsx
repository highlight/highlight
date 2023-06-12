import { DateHistogramBucketSize } from '@graph/schemas'
import { identity, omitBy, pickBy } from 'lodash'
import moment from 'moment'

export type Segment = { name: string; id: string } | undefined

export type BackendSearchQuery =
	| undefined
	| {
			searchQuery: string
			childSearchQuery?: string
			startDate: moment.Moment
			endDate: moment.Moment
			histogramBucketSize: DateHistogramBucketSize
	  }

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
	setExistingQuery: React.Dispatch<React.SetStateAction<string>>
	selectedSegment: Segment
	setSelectedSegment: (newValue: Segment, query: string) => void
	removeSelectedSegment: () => void
	/** The query sent to the backend */
	backendSearchQuery: BackendSearchQuery
	setBackendSearchQuery: React.Dispatch<
		React.SetStateAction<BackendSearchQuery>
	>
	page: number
	setPage: React.Dispatch<React.SetStateAction<number>>
	searchResultsLoading: boolean
	setSearchResultsLoading: React.Dispatch<React.SetStateAction<boolean>>
	searchResultsCount: number | undefined
	setSearchResultsCount: React.Dispatch<
		React.SetStateAction<number | undefined>
	>
}
