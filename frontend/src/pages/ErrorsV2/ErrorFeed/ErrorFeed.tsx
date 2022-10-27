import { Pagination, STARTING_PAGE } from '@components/Pagination/Pagination'
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import { Skeleton } from '@components/Skeleton/Skeleton'
import { useGetErrorGroupsOpenSearchQuery } from '@graph/hooks'
import { ErrorGroup, ErrorResults, Maybe } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import ErrorQueryBuilder from '@pages/Error/components/ErrorQueryBuilder/ErrorQueryBuilder'
import SegmentPickerForErrors from '@pages/Error/components/SegmentPickerForErrors/SegmentPickerForErrors'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { ErrorFeedCard } from '@pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import ErrorFeedHistogram from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import useLocalStorage from '@rehooks/local-storage'
import { gqlSanitize } from '@util/gqlSanitize'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'

import * as style from './ErrorFeed.css'

const PAGE_SIZE = 10

const ErrorFeed = () => {
	const {
		backendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
	} = useErrorSearchContext()

	useEffect(() => {
		if (backendSearchQuery) {
			setSearchResultsLoading(true)
		}
	}, [backendSearchQuery, page, setSearchResultsLoading])

	const { project_id: projectId } = useParams<{ project_id: string }>()

	const [errorCount, setErrorCount] = useLocalStorage<number>(
		`errorsCount-project-${projectId}`,
		0,
	)

	const totalPages = Math.ceil(errorCount / PAGE_SIZE)

	const useCachedErrors = errorCount > PAGE_SIZE

	const [fetchedData, setFetchedData] = useState<ErrorResults>({
		error_groups: [],
		totalCount: 0,
	})

	useGetErrorGroupsOpenSearchQuery({
		variables: {
			query: backendSearchQuery?.searchQuery || '',
			count: PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id: projectId,
		},
		onCompleted: (r) => {
			const results = r?.error_groups_opensearch
			if (results) {
				setFetchedData(gqlSanitize(results))
				setErrorCount(results.totalCount)
			}
			setSearchResultsLoading(false)
		},
		skip: !backendSearchQuery,
		fetchPolicy: useCachedErrors ? 'cache-first' : 'no-cache',
	})

	const showHistogram = searchResultsLoading || errorCount > 0
	return (
		<>
			<Box py="small" px="medium" borderBottom="neutral">
				<SegmentPickerForErrors />
				<ErrorQueryBuilder />
			</Box>
			{showHistogram && (
				<Box
					borderBottom="neutral"
					paddingTop="large"
					paddingBottom="tiny"
					px="medium"
				>
					<ErrorFeedHistogram useCachedErrors={useCachedErrors} />
				</Box>
			)}
			<Box padding="small" cssClass={style.content}>
				{searchResultsLoading ? (
					<Skeleton
						height={80}
						count={3}
						style={{
							borderRadius: 8,
							marginBottom: 2,
						}}
					/>
				) : (
					<>
						{!fetchedData.error_groups.length ? (
							<SearchEmptyState item="errors" />
						) : (
							fetchedData.error_groups?.map(
								(eg: Maybe<ErrorGroup>, ind: number) => (
									<ErrorFeedCard
										key={ind}
										errorGroup={eg}
										urlParams={`?page=${
											page || STARTING_PAGE
										}`}
									/>
								),
							)
						)}
					</>
				)}
			</Box>
			<Box
				borderTop="neutral"
				paddingTop="small"
				paddingBottom="medium"
				px="large"
			>
				<Pagination
					page={page}
					setPage={setPage}
					totalPages={totalPages}
					className={style.pagination}
				/>
			</Box>
		</>
	)
}

export default ErrorFeed
