import {
	EmptySearchResults,
	SearchResultsKind,
} from '@components/EmptySearchResults/EmptySearchResults'
import LoadingBox from '@components/LoadingBox'
import SearchPagination, {
	PAGE_SIZE,
	START_PAGE,
} from '@components/SearchPagination/SearchPagination'
import { useGetErrorGroupsOpenSearchQuery } from '@graph/hooks'
import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { ErrorFeedCard } from '@pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import ErrorFeedHistogram from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import { gqlSanitize } from '@util/gql'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { styledVerticalScrollbar } from 'style/common.css'

import * as style from './SearchPanel.css'

const SearchPanel = () => {
	const { showLeftPanel } = useErrorPageConfiguration()
	const { showBanner } = useGlobalContext()
	const {
		backendSearchQuery,
		page,
		setPage,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
		setSearchResultSecureIds,
	} = useErrorSearchContext()

	const { project_id: projectId } = useParams<{ project_id: string }>()

	const useCachedErrors = searchResultsCount > PAGE_SIZE

	const { data: fetchedData, loading } = useGetErrorGroupsOpenSearchQuery({
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

	const showHistogram = loading || searchResultsCount > 0

	const [, setSyncButtonDisabled] = useState<boolean>(false)

	useEffect(() => {
		if (!loading) {
			const timer = setTimeout(() => {
				setSyncButtonDisabled(false)
			}, 3000)
			return () => {
				clearTimeout(timer)
			}
		} else {
			setSyncButtonDisabled(true)
		}
	}, [loading])

	const errorGroups = fetchedData?.error_groups_opensearch
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
				<Box borderBottom="secondary" paddingBottom="8" px="8">
					<ErrorFeedHistogram />
				</Box>
			)}
			<Box
				padding="8"
				overflowX="hidden"
				overflowY="auto"
				cssClass={[style.content, styledVerticalScrollbar]}
			>
				{loading ? (
					<LoadingBox />
				) : (
					<>
						{searchResultsCount === 0 || !errorGroups ? (
							<EmptySearchResults
								kind={SearchResultsKind.Errors}
							/>
						) : (
							gqlSanitize(errorGroups).error_groups.map(
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
