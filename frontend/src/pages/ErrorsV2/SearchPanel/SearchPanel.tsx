import {
	EmptySearchResults,
	SearchResultsKind,
} from '@components/EmptySearchResults/EmptySearchResults'
import { AdditionalFeedResults } from '@components/FeedResults/FeedResults'
import LoadingBox from '@components/LoadingBox'
import { QueryBuilderState } from '@components/QueryBuilder/QueryBuilder'
import SearchPagination, {
	PAGE_SIZE,
} from '@components/SearchPagination/SearchPagination'
import {
	useGetErrorGroupsOpenSearchLazyQuery,
	useGetErrorGroupsOpenSearchQuery,
} from '@graph/hooks'
import { ErrorGroup, Maybe, ProductType } from '@graph/schemas'
import { Box, getNow, resetRelativeDates } from '@highlight-run/ui'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { ErrorFeedCard } from '@pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import ErrorFeedHistogram from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import useErrorPageConfiguration from '@pages/ErrorsV2/utils/ErrorPageUIConfiguration'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { gqlSanitize } from '@util/gql'
import log from '@util/log'
import { useParams } from '@util/react-router/useParams'
import { POLL_INTERVAL } from '@util/search'
import clsx from 'clsx'
import moment from 'moment/moment'
import React, { useEffect, useState } from 'react'

import { OverageCard } from '@/pages/Sessions/SessionsFeedV3/OverageCard/OverageCard'
import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './SearchPanel.css'

const SearchPanel = () => {
	const { showLeftPanel } = useErrorPageConfiguration()
	const { showBanner } = useGlobalContext()
	const {
		backendSearchQuery,
		searchQuery,
		setSearchQuery,
		page,
		setPage,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
		setSearchResultSecureIds,
	} = useErrorSearchContext()
	const [moreErrors, setMoreErrors] = useState<number>(0)

	const { project_id: projectId } = useParams<{ project_id: string }>()

	const { data: fetchedData, loading } = useGetErrorGroupsOpenSearchQuery({
		variables: {
			query: backendSearchQuery?.searchQuery || '',
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
			const results = r?.error_groups_opensearch
			setSearchResultsCount(results.totalCount)
			setSearchResultSecureIds(
				results.error_groups.map((eg) => eg.secure_id),
			)
		},
		skip: !backendSearchQuery || !projectId,
	})

	const [moreDataQuery] = useGetErrorGroupsOpenSearchLazyQuery({
		fetchPolicy: 'network-only',
	})

	useEffect(() => {
		// setup a polling interval for sessions after the current date range
		let timeout: number
		const poll = async () => {
			let query = JSON.parse(backendSearchQuery?.searchQuery || '')
			const lte =
				query?.bool?.must[1]?.has_child?.query?.bool?.must[0]?.bool
					?.should[0]?.range?.timestamp?.lte
			// if the query end date is close to 'now',
			// then we are using a default relative time range.
			// otherwise, we are using a custom date range and should not poll
			if (Math.abs(moment(lte).diff(getNow(), 'minutes')) >= 1) {
				log(
					'ErrorsV2/SearchPanel.tsx',
					'skipping polling for custom time selection',
					{ lte, now: getNow().toISOString() },
				)
				timeout = setTimeout(poll, POLL_INTERVAL) as unknown as number
				return
			}
			query = {
				...query,
				bool: {
					...query.bool,
					must: [
						...query.bool.must.slice(0, query.bool.must.length - 1),
						{
							has_child: {
								type: 'child',
								query: {
									bool: {
										must: [
											{
												bool: {
													should: [
														{
															range: {
																timestamp: {
																	gte: new Date(
																		Date.parse(
																			lte,
																		),
																	).toISOString(),
																},
															},
														},
													],
												},
											},
											{
												bool: {
													must: [],
												},
											},
										],
									},
								},
							},
						},
					],
				},
			}
			const variables = {
				query: JSON.stringify(query),
				count: PAGE_SIZE,
				page: 1,
				project_id: projectId!,
			}
			timeout = setTimeout(poll, POLL_INTERVAL) as unknown as number
			const result = await moreDataQuery({ variables })
			if (
				result?.data?.error_groups_opensearch.totalCount !== undefined
			) {
				setMoreErrors(result.data.error_groups_opensearch.totalCount)
			}
		}
		timeout = setTimeout(poll, POLL_INTERVAL) as unknown as number
		return () => clearTimeout(timeout)
	}, [backendSearchQuery?.searchQuery, moreDataQuery, page, projectId])

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
			<AdditionalFeedResults
				more={moreErrors}
				type="errors"
				onClick={() => {
					resetRelativeDates()
					setMoreErrors(0)
					const currentState = JSON.parse(
						searchQuery,
					) as QueryBuilderState
					const newRules = currentState.rules.filter(
						(rule) => rule[0] !== 'error-field_timestamp',
					)
					setSearchQuery(
						JSON.stringify({
							isAnd: currentState.isAnd,
							rules: newRules,
						}),
					)
				}}
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
