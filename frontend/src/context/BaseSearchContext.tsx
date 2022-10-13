import { DateHistogramBucketSize } from '@graph/schemas'
import moment from 'moment'

export type BackendSearchQuery =
	| undefined
	| {
			searchQuery: string
			childSearchQuery?: string
			startDate: moment.Moment
			endDate: moment.Moment
			histogramBucketSize: DateHistogramBucketSize
	  }

export type BaseSearchContext<T> = {
	/** Local changes to the segment parameters that might not be persisted to the database. */
	searchParams: T
	setSearchParams: React.Dispatch<React.SetStateAction<T>>
	/** The parameters that are persisted to the database. These params are saved to a segment. */
	existingParams: T
	setExistingParams: React.Dispatch<React.SetStateAction<T>>
	segmentName: string | null
	setSegmentName: React.Dispatch<React.SetStateAction<string | null>>
	/** The query sent to the backend */
	backendSearchQuery: BackendSearchQuery
	setBackendSearchQuery: React.Dispatch<
		React.SetStateAction<BackendSearchQuery>
	>
	page?: number
	setPage: React.Dispatch<React.SetStateAction<number | undefined>>
	searchResultsLoading: boolean
	setSearchResultsLoading: React.Dispatch<React.SetStateAction<boolean>>
	query?: string
}
