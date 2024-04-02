import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	EmptySearchResults,
	SearchResultsKind,
} from '@components/EmptySearchResults/EmptySearchResults'
import { Series } from '@components/Histogram/Histogram'
import LoadingBox from '@components/LoadingBox'
import {
	DEFAULT_PAGE_SIZE,
	RESET_PAGE_MS,
	STARTING_PAGE,
} from '@components/Pagination/Pagination'
import SearchPagination from '@components/SearchPagination/SearchPagination'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import {
	useGetBillingDetailsForProjectQuery,
	useGetSessionsClickhouseLazyQuery,
	useGetSessionsClickhouseQuery,
	useGetSessionsHistogramClickhouseQuery,
} from '@graph/hooks'
import {
	GetSessionsClickhouseQuery,
	GetSessionsClickhouseQueryVariables,
} from '@graph/operations'
import {
	ClickhouseQuery,
	Maybe,
	PlanType,
	ProductType,
	Session,
} from '@graph/schemas'
import { Box } from '@highlight-run/ui/components'
import { SessionFeedCard } from '@pages/Sessions/SessionsFeedV3/SessionFeedCard/SessionFeedCard'
import SessionQueryBuilder from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { useClientIntegration } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { usePollQuery } from '@util/search'
import { roundFeedDate } from '@util/time'
import clsx from 'clsx'
import moment from 'moment'
import React, { useCallback, useEffect, useRef } from 'react'

import { AdditionalFeedResults } from '@/components/FeedResults/FeedResults'
import { QueryBuilderState } from '@/components/QueryBuilder/QueryBuilder'
import { OverageCard } from '@/pages/Sessions/SessionsFeedV3/OverageCard/OverageCard'
import { styledVerticalScrollbar } from '@/style/common.css'

import usePlayerConfiguration from '../../Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '../../Player/ReplayerContext'
import {
	showLiveSessions,
	useSearchContext,
} from '../SearchContext/SearchContext'
import * as style from './SessionFeedV3.css'
import { SessionFeedConfigurationContextProvider } from './SessionQueryBuilder/context/SessionFeedConfigurationContext'
import { useSessionFeedConfiguration } from './SessionQueryBuilder/hooks/useSessionFeedConfiguration'

export const SessionsHistogram: React.FC<{ readonly?: boolean }> = React.memo(
	({ readonly }) => {
		const { project_id } = useParams<{
			project_id: string
		}>()
		const {
			histogramBucketSize,
			searchQuery,
			setSearchTime,
			startDate,
			endDate,
		} = useSearchContext()

		const { loading, data } = useGetSessionsHistogramClickhouseQuery({
			variables: {
				project_id: project_id!,
				query: JSON.parse(searchQuery),
				histogram_options: {
					bucket_size: histogramBucketSize,
					time_zone:
						Intl.DateTimeFormat().resolvedOptions().timeZone ??
						'UTC',
					bounds: {
						start_date: roundFeedDate(
							startDate.toISOString(),
						).format(),
						end_date: roundFeedDate(endDate.toISOString()).format(),
					},
				},
			},
			skip: !histogramBucketSize || !project_id,
			fetchPolicy: 'network-only',
		})

		const histogram: {
			seriesList: Series[]
			bucketTimes: number[]
		} = {
			seriesList: [],
			bucketTimes: [],
		}
		if (data?.sessions_histogram_clickhouse) {
			histogram.bucketTimes =
				data?.sessions_histogram_clickhouse.bucket_times.map(
					(startTime) => new Date(startTime).valueOf(),
				)
			histogram.seriesList = [
				{
					label: 'sessions',
					color: 'n11',
					counts: data?.sessions_histogram_clickhouse
						.sessions_without_errors,
				},
				{
					label: 'w/errors',
					color: 'p11',
					counts: data?.sessions_histogram_clickhouse
						.sessions_with_errors,
				},
			]
		}

		return (
			<SearchResultsHistogram
				seriesList={histogram.seriesList}
				bucketTimes={histogram.bucketTimes}
				bucketSize={histogramBucketSize}
				loading={loading}
				updateTimeRange={setSearchTime}
				barGap={2.4}
				readonly={readonly}
			/>
		)
	},
)

export const SessionFeedV3 = React.memo(() => {
	const { setSessionResults, sessionResults } = useReplayerContext()
	const { project_id, session_secure_id } = useParams<{
		project_id: string
		session_secure_id: string
	}>()
	const sessionFeedConfiguration = useSessionFeedConfiguration()
	const { autoPlaySessions, showDetailedSessionView } =
		usePlayerConfiguration()

	const totalPages = useRef<number>(0)
	const {
		searchQuery,
		setSearchQuery,
		selectedPreset,
		endDate,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
		rebaseTime,
	} = useSearchContext()
	const { integrated } = useClientIntegration()
	const { showLeftPanel } = usePlayerConfiguration()
	const { showBanner } = useGlobalContext()
	const searchParamsChanged = useRef<Date>()
	const showHistogram = searchResultsCount !== 0

	const { data: billingDetails } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: project_id! },
		skip: !project_id || project_id === DEMO_PROJECT_ID,
	})

	const addSessions = (response: GetSessionsClickhouseQuery) => {
		if (response?.sessions_clickhouse) {
			setSessionResults({
				...response.sessions_clickhouse,
				sessions: response.sessions_clickhouse.sessions.map((s) => ({
					...s,
					payload_updated_at: new Date().toISOString(),
				})),
			})
			totalPages.current = Math.ceil(
				response?.sessions_clickhouse.totalCount / DEFAULT_PAGE_SIZE,
			)
			setSearchResultsCount(response?.sessions_clickhouse.totalCount)
		}
		setSearchResultsLoading(false)
	}

	const { loading } = useGetSessionsClickhouseQuery({
		variables: {
			query: JSON.parse(searchQuery),
			count: DEFAULT_PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id: project_id!,
			sort_desc: sessionFeedConfiguration.sortOrder === 'Descending',
		},
		onCompleted: addSessions,
		skip: !project_id,
		fetchPolicy: 'network-only',
	})

	const [moreDataQuery] = useGetSessionsClickhouseLazyQuery({
		fetchPolicy: 'network-only',
	})

	const { numMore: moreSessions, reset: resetMoreSessions } = usePollQuery<
		GetSessionsClickhouseQuery,
		GetSessionsClickhouseQueryVariables
	>({
		variableFn: useCallback(() => {
			const clickhouseQuery: ClickhouseQuery = JSON.parse(searchQuery)
			clickhouseQuery.dateRange = {
				start_date: endDate.toISOString(),
				end_date: moment().toDate().toISOString(),
			}

			return {
				query: clickhouseQuery,
				count: DEFAULT_PAGE_SIZE,
				page: 1,
				project_id: project_id!,
				sort_desc: sessionFeedConfiguration.sortOrder === 'Descending',
			}
		}, [
			endDate,
			project_id,
			sessionFeedConfiguration.sortOrder,
			searchQuery,
		]),
		moreDataQuery,
		getResultCount: useCallback(
			(result) => result?.data?.sessions_clickhouse.totalCount,
			[],
		),
		skip: !selectedPreset,
	})

	// Used to determine if we need to show the loading skeleton.
	// The loading skeleton should only be shown on the first load and when searchParams changes.
	// It should not show when loading more sessions via infinite scroll.
	useEffect(() => {
		setSearchResultsLoading(loading)
	}, [loading, setSearchResultsLoading])

	useEffect(() => {
		// we just loaded the page for the first time
		if (
			searchParamsChanged.current &&
			new Date().getTime() - searchParamsChanged.current.getTime() >
				RESET_PAGE_MS
		) {
			// the search query actually changed, reset the page
			setPage(STARTING_PAGE)
		}
		searchParamsChanged.current = new Date()
	}, [searchQuery, setPage])

	const enableLiveSessions = useCallback(() => {
		if (searchQuery) {
			// Replace any 'custom_processed' values with ['true', 'false']
			const processedRule = ['custom_processed', 'is', 'true', 'false']
			const currentState = JSON.parse(searchQuery) as QueryBuilderState
			const newRules = currentState.rules.map((rule) =>
				rule[0] === processedRule[0] ? processedRule : rule,
			)
			setSearchQuery(
				JSON.stringify({
					...currentState,
					rules: newRules,
				}),
			)
		}
	}, [searchQuery, setSearchQuery])

	useEffect(() => {
		// We're showing live sessions for new users.
		// The assumption here is if a project is on the free plan and the project has less than 15 sessions than there must be live sessions.
		// We show live sessions along with the processed sessions so the user isn't confused on why sessions are not showing up in the feed.
		if (
			billingDetails?.billingDetailsForProject &&
			integrated &&
			project_id !== DEMO_PROJECT_ID &&
			project_id !== DEMO_WORKSPACE_PROXY_APPLICATION_ID &&
			!showLiveSessions(searchQuery)
		) {
			if (
				billingDetails.billingDetailsForProject.plan.type ===
					PlanType.Free &&
				billingDetails.billingDetailsForProject.meter < 15
			) {
				enableLiveSessions()
			}
		}
	}, [
		billingDetails?.billingDetailsForProject,
		enableLiveSessions,
		integrated,
		project_id,
		searchQuery,
	])

	return (
		<SessionFeedConfigurationContextProvider
			value={sessionFeedConfiguration}
		>
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
				<SessionQueryBuilder />
				{showHistogram && (
					<Box borderBottom="secondary" paddingBottom="8" px="8">
						<SessionsHistogram />
					</Box>
				)}
				<AdditionalFeedResults
					more={moreSessions}
					type="sessions"
					onClick={() => {
						resetMoreSessions()
						rebaseTime()
					}}
				/>
				<Box
					paddingTop="4"
					padding="8"
					overflowX="hidden"
					overflowY="auto"
					height="full"
					cssClass={styledVerticalScrollbar}
				>
					{searchResultsLoading ? (
						<LoadingBox />
					) : (
						<>
							<OverageCard productType={ProductType.Sessions} />
							{searchResultsCount === 0 ? (
								<EmptySearchResults
									kind={SearchResultsKind.Sessions}
								/>
							) : (
								<>
									{sessionResults.sessions?.map(
										(s: Maybe<Session>, ind: number) =>
											s && (
												<SessionFeedCard
													key={ind}
													session={s}
													selected={
														session_secure_id ===
														s?.secure_id
													}
													showDetailedSessionView={
														showDetailedSessionView
													}
													autoPlaySessions={
														autoPlaySessions
													}
													configuration={{
														countFormat:
															sessionFeedConfiguration.countFormat,
														datetimeFormat:
															sessionFeedConfiguration.datetimeFormat,
													}}
												/>
											),
									)}
								</>
							)}
						</>
					)}
				</Box>
				<SearchPagination
					page={page}
					setPage={setPage}
					totalCount={searchResultsCount ?? 0}
					pageSize={DEFAULT_PAGE_SIZE}
				/>
			</Box>
		</SessionFeedConfigurationContextProvider>
	)
})
