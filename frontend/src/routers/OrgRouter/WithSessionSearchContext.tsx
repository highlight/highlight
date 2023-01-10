import { BackendSearchQuery } from '@context/BaseSearchContext'
import { SearchParamsInput } from '@graph/schemas'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { SearchContextProvider } from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { useState } from 'react'
import { useLocalStorage } from 'react-use'

const WithSessionSearchContext: React.FC<React.PropsWithChildren<unknown>> = ({
	children,
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const [showStarredSessions, setShowStarredSessions] =
		useState<boolean>(false)
	const [searchParams, setSearchParams] = useState<SearchParamsInput>(
		EmptySessionsSearchParams,
	)
	const [searchResultsLoading, setSearchResultsLoading] =
		useState<boolean>(false)
	const [searchResultsCount, setSearchResultsCount] = useState<number>(0)
	const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false)

	const [page, setPage] = useState<number>()

	const [selectedSegment, setSelectedSegment, removeSelectedSegment] =
		useLocalStorage<{ name: string; id: string } | undefined>(
			`highlightSegmentPickerForPlayerSelectedSegmentId-${project_id}`,
			undefined,
		)

	const [backendSearchQuery, setBackendSearchQuery] =
		useState<BackendSearchQuery>(undefined)

	const [existingParams, setExistingParams] = useState<SearchParamsInput>(
		EmptySessionsSearchParams,
	)

	const sessionSearchContext = {
		searchParams,
		setSearchParams,
		existingParams,
		setExistingParams,
		showStarredSessions,
		setShowStarredSessions,
		selectedSegment,
		setSelectedSegment,
		removeSelectedSegment,
		backendSearchQuery,
		setBackendSearchQuery,
		isQuickSearchOpen,
		setIsQuickSearchOpen,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
	}

	return (
		<SearchContextProvider value={sessionSearchContext}>
			{children}
		</SearchContextProvider>
	)
}

export default WithSessionSearchContext
