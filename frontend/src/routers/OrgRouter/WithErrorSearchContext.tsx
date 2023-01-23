import { BackendSearchQuery } from '@context/BaseSearchContext'
import { ErrorSearchParamsInput } from '@graph/schemas'
import { ErrorSearchContextProvider } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { EmptyErrorsSearchParams } from '@pages/Errors/ErrorsPage'
import { useParams } from '@util/react-router/useParams'
import { QueryBuilderStateParam } from '@util/url/params'
import { useState } from 'react'
import { useLocalStorage } from 'react-use'
import { useQueryParams } from 'use-query-params'

const WithErrorSearchContext: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const [searchParamsToUrlParams] = useQueryParams({
		query: QueryBuilderStateParam,
	})

	const searchParamsDefaultState = searchParamsToUrlParams.query
		? searchParamsToUrlParams
		: EmptyErrorsSearchParams

	// TODO: remove this in favor of selectedSegment after updating the session search query builder
	const [segmentName, setSegmentName] = useState<string | null>(null)

	const [searchParams, setSearchParams] = useState<ErrorSearchParamsInput>(
		searchParamsDefaultState,
	)
	const [searchResultsLoading, setSearchResultsLoading] =
		useState<boolean>(true)

	const [searchResultsCount, setSearchResultsCount] = useState<number>(0)
	const [searchResultSecureIds, setSearchResultSecureIds] = useState<
		string[]
	>([])

	const [existingParams, setExistingParams] =
		useState<ErrorSearchParamsInput>(searchParamsDefaultState)

	const [backendSearchQuery, setBackendSearchQuery] =
		useState<BackendSearchQuery>(undefined)

	const [page, setPage] = useState<number>()

	const [selectedSegment, setSelectedSegment, removeSelectedSegment] =
		useLocalStorage<{ name: string; id: string } | undefined>(
			`highlightSegmentPickerForErrorsSelectedSegmentId-${project_id}`,
			undefined,
		)

	const errorSearchContext = {
		searchParams,
		setSearchParams,
		existingParams,
		setExistingParams,
		segmentName,
		setSegmentName,
		selectedSegment,
		setSelectedSegment,
		removeSelectedSegment,
		backendSearchQuery,
		setBackendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
		searchResultSecureIds,
		setSearchResultSecureIds,
	}

	return (
		<ErrorSearchContextProvider value={errorSearchContext}>
			{children}
		</ErrorSearchContextProvider>
	)
}

export default WithErrorSearchContext
