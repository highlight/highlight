import {
	EmptySearchResults,
	SearchResultsKind,
} from '@components/EmptySearchResults/EmptySearchResults'
import SearchPagination, {
	DEFAULT_PAGE_SIZE,
	START_PAGE,
} from '@components/SearchPagination/SearchPagination'
import { Skeleton } from '@components/Skeleton/Skeleton'
import { useGetErrorGroupsOpenSearchQuery } from '@graph/hooks'
import { ErrorGroup, ErrorResults, Maybe } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { ErrorFeedCard } from '@pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import ErrorFeedHistogram from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import { gqlSanitize } from '@util/gqlSanitize'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import * as style from './SearchPanel.css'

const PAGE_SIZE = DEFAULT_PAGE_SIZE

const SearchPanel = () => {
	const { showLeftPanel } = useErrorPageConfiguration()
	const { showBanner } = useGlobalContext()
	const {
		backendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
		setSearchResultSecureIds,
	} = useErrorSearchContext()

	const { project_id: projectId } = useParams<{ project_id: string }>()

	const useCachedErrors = searchResultsCount > PAGE_SIZE

	const [fetchedData, setFetchedData] = useState<ErrorResults>({
		error_groups: [],
		totalCount: 0,
	})

	const { loading } = useGetErrorGroupsOpenSearchQuery({
		variables: {
			query: backendSearchQuery?.searchQuery || '',
			count: PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id: projectId,
		},
		onError: () => {
			setSearchResultsLoading(false)
			setSearchResultsCount(0)
			setSearchResultSecureIds([])
		},
		onCompleted: (r) => {
			setSearchResultsLoading(false)
			const results = r?.error_groups_opensearch
			setFetchedData(gqlSanitize(results))
			setSearchResultsCount(results.totalCount)
			setSearchResultSecureIds(
				results.error_groups.map((eg) => eg.secure_id),
			)
		},
		skip: !backendSearchQuery,
		fetchPolicy: useCachedErrors ? 'cache-first' : 'no-cache',
	})

	useEffect(() => {
		setSearchResultsLoading(loading)
	}, [loading, setSearchResultsLoading])

	const showHistogram = searchResultsLoading || searchResultsCount > 0

	const [, setSyncButtonDisabled] = useState<boolean>(false)

	useEffect(() => {
		if (!searchResultsLoading) {
			const timer = setTimeout(() => {
				setSyncButtonDisabled(false)
			}, 3000)
			return () => {
				clearTimeout(timer)
			}
		} else {
			setSyncButtonDisabled(true)
		}
	}, [searchResultsLoading])

	return (
		<Box
			display="flex"
			flex="fixed"
			flexDirection="column"
			borderRight="secondary"
			position="relative"
			cssClass={clsx(style.searchPanel, {
				[style.searchPanelHidden]: !showLeftPanel,
				[style.searchPanelWithBanner]: showBanner,
			})}
			background="n2"
		>
			<ErrorQueryBuilder />
			{showHistogram && (
				<Box
					borderBottom="secondary"
					paddingTop="10"
					paddingBottom="12"
					px="8"
				>
					<ErrorFeedHistogram />
				</Box>
			)}
			<Box
				padding="6"
				overflowX="hidden"
				overflowY="auto"
				cssClass={style.content}
			>
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
						{searchResultsCount === 0 ? (
							<EmptySearchResults
								kind={SearchResultsKind.Errors}
							/>
						) : (
							fetchedData.error_groups?.map(
								(eg: Maybe<ErrorGroup>, ind: number) => (
									<ErrorFeedCard
										key={ind}
										errorGroup={eg}
										urlParams={`?page=${
											page || START_PAGE
										}`}
									/>
								),
							)
						)}
					</>
				)}
			</Box>
			<SearchPagination
				page={page}
				setPage={setPage}
				totalCount={searchResultsCount}
				pageSize={PAGE_SIZE}
			/>
		</Box>
	)
}

export default SearchPanel
