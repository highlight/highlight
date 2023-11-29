import {
	EmptySearchResults,
	SearchResultsKind,
} from '@components/EmptySearchResults/EmptySearchResults'
import { AdditionalFeedResults } from '@components/FeedResults/FeedResults'
import LoadingBox from '@components/LoadingBox'
import SearchPagination, {
	PAGE_SIZE,
} from '@components/SearchPagination/SearchPagination'
import {
	useGetErrorGroupsClickhouseLazyQuery,
	useGetErrorGroupsClickhouseQuery,
} from '@graph/hooks'
import {
	GetErrorGroupsClickhouseQuery,
	GetErrorGroupsClickhouseQueryVariables,
} from '@graph/operations'
import { ClickhouseQuery, ErrorGroup, Maybe, ProductType } from '@graph/schemas'
import { Box, getNow } from '@highlight-run/ui/components'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { ErrorFeedCard } from '@pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import ErrorFeedHistogram from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import useErrorPageConfiguration from '@pages/ErrorsV2/utils/ErrorPageUIConfiguration'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { gqlSanitize } from '@util/gql'
import { useParams } from '@util/react-router/useParams'
import { usePollQuery } from '@util/search'
import clsx from 'clsx'
import moment from 'moment/moment'
import React, { useCallback, useEffect, useState } from 'react'

import { OverageCard } from '@/pages/Sessions/SessionsFeedV3/OverageCard/OverageCard'
import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './SearchPanel.css'

const SearchPanel = () => {
	const { showLeftPanel } = useErrorPageConfiguration()
	const { showBanner } = useGlobalContext()
	const {
		searchQuery,
		backendSearchQuery,
		page,
		setPage,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
		setSearchResultSecureIds,
	} = useErrorSearchContext()
	const { project_id: projectId } = useParams<{ project_id: string }>()

	const { data: fetchedData, loading } = useGetErrorGroupsClickhouseQuery({
		variables: {
			query: JSON.parse(searchQuery),
			count: PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id: projectId!,
		},
		onError: () => {
			setSearchResultsLoading(false)
			setSearchResultsCount(0)
			setSearchResultSecureIds([])
		},
		onCompleted: (r) => {
			setSearchResultsLoading(false)
			const results = r?.error_groups_clickhouse
			setSearchResultsCount(results.totalCount)
			setSearchResultSecureIds(
				results.error_groups.map((eg) => eg.secure_id),
			)
		},
		skip: !backendSearchQuery || !projectId,
		fetchPolicy: 'network-only',
	})

	const [moreDataQuery] = useGetErrorGroupsClickhouseLazyQuery({
		fetchPolicy: 'network-only',
	})

	const { numMore: moreErrors, reset: resetMoreErrors } = usePollQuery<
		GetErrorGroupsClickhouseQuery,
		GetErrorGroupsClickhouseQueryVariables
	>({
		variableFn: useCallback(() => {
			const query = JSON.parse(backendSearchQuery?.searchQuery || '')
			const lte =
				query?.bool?.must[1]?.has_child?.query?.bool?.must[0]?.bool
					?.should[0]?.range?.timestamp?.lte
			// if the query end date is close to 'now',
			// then we are using a default relative time range.
			// otherwise, we are using a custom date range and should not poll
			if (Math.abs(moment(lte).diff(getNow(), 'minutes')) >= 1) {
				return
			}
			const clickhouseQuery: ClickhouseQuery = JSON.parse(searchQuery)
			const newRules = clickhouseQuery.rules.filter(
				(r) => r[0] !== 'error-field_timestamp',
			)
			const startDate = new Date(Date.parse(lte))
			const endDate = new Date(Date.parse(lte) + 7 * 24 * 60 * 60 * 1000)
			newRules.push([
				'error-field_timestamp',
				'between_date',
				startDate.toISOString() + '_' + endDate.toISOString(),
			])
			clickhouseQuery.rules = newRules

			return {
				query: clickhouseQuery,
				count: PAGE_SIZE,
				page: 1,
				project_id: projectId!,
			}
		}, [backendSearchQuery?.searchQuery, projectId, searchQuery]),
		moreDataQuery,
		getResultCount: useCallback(
			(result) => result?.data?.error_groups_clickhouse.totalCount,
			[],
		),
	})

	useEffect(() => {
		setSearchResultsLoading(loading)
	}, [loading, setSearchResultsLoading])

	useEffect(() => {
		setSearchResultsCount(undefined)
	}, [backendSearchQuery?.searchQuery, setSearchResultsCount])

	const showHistogram = searchResultsCount !== 0

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

	const errorGroups = fetchedData?.error_groups_clickhouse
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
			<AdditionalFeedResults
				more={moreErrors}
				type="errors"
				onClick={resetMoreErrors}
			/>
			<Box
				paddingTop="4"
				padding="8"
				overflowX="hidden"
				overflowY="auto"
				cssClass={[style.content, styledVerticalScrollbar]}
			>
				{loading ? (
					<LoadingBox />
				) : (
					<>
						<OverageCard productType={ProductType.Errors} />
						{searchResultsCount === 0 || !errorGroups ? (
							<EmptySearchResults
								kind={SearchResultsKind.Errors}
							/>
						) : (
							gqlSanitize(errorGroups).error_groups.map(
								(eg: Maybe<ErrorGroup>, ind: number) => (
									<ErrorFeedCard key={ind} errorGroup={eg} />
								),
							)
						)}
					</>
				)}
			</Box>
			<SearchPagination
				page={page}
				setPage={setPage}
				totalCount={searchResultsCount ?? 0}
				pageSize={PAGE_SIZE}
			/>
		</Box>
	)
}

export default SearchPanel
