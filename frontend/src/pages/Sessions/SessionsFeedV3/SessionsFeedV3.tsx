import {
	DEMO_WORKSPACE_APPLICATION_ID,
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
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import SearchPagination from '@components/SearchPagination/SearchPagination'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import LimitedSessionCard from '@components/Upsell/LimitedSessionsCard/LimitedSessionsCard'
import {
	useGetBillingDetailsForProjectQuery,
	useGetSessionsHistogramQuery,
	useGetSessionsOpenSearchQuery,
} from '@graph/hooks'
import { GetSessionsOpenSearchQuery } from '@graph/operations'
import {
	DateHistogramBucketSize,
	Maybe,
	PlanType,
	Session,
} from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import { SessionFeedCard } from '@pages/Sessions/SessionsFeedV3/SessionFeedCard/SessionFeedCard'
import {
	QueryBuilderState,
	updateQueriedTimeRange,
} from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/QueryBuilder/QueryBuilder'
import SessionQueryBuilder, {
	TIME_RANGE_FIELD,
} from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { useIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { roundDateToMinute, serializeAbsoluteTimeRange } from '@util/time'
import clsx from 'clsx'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { styledVerticalScrollbar } from 'style/common.css'

import usePlayerConfiguration from '../../Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '../../Player/ReplayerContext'
import {
	showLiveSessions,
	useSearchContext,
} from '../SearchContext/SearchContext'
import * as style from './SessionFeedV3.css'
import { SessionFeedConfigurationContextProvider } from './SessionQueryBuilder/context/SessionFeedConfigurationContext'
import { useSessionFeedConfiguration } from './SessionQueryBuilder/hooks/useSessionFeedConfiguration'

interface SessionsHistogramProps {
	projectHasManySessions: boolean
}

export const SessionsHistogram: React.FC<SessionsHistogramProps> = React.memo(
	({ projectHasManySessions }: SessionsHistogramProps) => {
		const { project_id } = useParams<{
			project_id: string
		}>()
		const { searchParams, setSearchParams, backendSearchQuery } =
			useSearchContext()

		const { loading, data } = useGetSessionsHistogramQuery({
			variables: {
				project_id: project_id!,
				query: backendSearchQuery?.searchQuery as string,
				histogram_options: {
					bucket_size:
						backendSearchQuery?.histogramBucketSize as DateHistogramBucketSize,
					time_zone:
						Intl.DateTimeFormat().resolvedOptions().timeZone ??
						'UTC',
					bounds: {
						start_date: roundDateToMinute(
							backendSearchQuery?.startDate.toISOString() ?? null,
						).format(),
						end_date: roundDateToMinute(
							backendSearchQuery?.endDate.toISOString() ?? null,
						).format(),
					},
				},
			},
			skip: !backendSearchQuery || !project_id,
			fetchPolicy: projectHasManySessions ? 'cache-first' : 'no-cache',
		})

		const histogram: {
			seriesList: Series[]
			bucketTimes: number[]
		} = {
			seriesList: [],
			bucketTimes: [],
		}
		if (data?.sessions_histogram) {
			histogram.bucketTimes = data?.sessions_histogram.bucket_times.map(
				(startTime) => new Date(startTime).valueOf(),
			)
			histogram.seriesList = [
				{
					label: 'sessions',
					color: 'n11',
					counts: data?.sessions_histogram.sessions_without_errors,
				},
				{
					label: 'w/errors',
					color: 'p11',
					counts: data?.sessions_histogram.sessions_with_errors,
				},
			]
		}

		const updateTimeRange = useCallback(
			(newStartTime: Date, newEndTime: Date) => {
				const newSearchParams = {
					...searchParams,
					query: updateQueriedTimeRange(
						searchParams.query || '',
						TIME_RANGE_FIELD,
						serializeAbsoluteTimeRange(newStartTime, newEndTime),
					),
				}
				setSearchParams(newSearchParams)
			},
			[searchParams, setSearchParams],
		)

		return (
			<SearchResultsHistogram
				seriesList={histogram.seriesList}
				bucketTimes={histogram.bucketTimes}
				bucketSize={backendSearchQuery?.histogramBucketSize}
				loading={loading}
				updateTimeRange={updateTimeRange}
				barGap={2.4}
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
		showStarredSessions,
		searchParams,
		setSearchParams,
		backendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
	} = useSearchContext()
	const { integrated } = useIntegrated()
	const { showLeftPanel } = usePlayerConfiguration()
	const { showBanner } = useGlobalContext()
	const searchParamsChanged = useRef<Date>()
	const projectHasManySessions = searchResultsCount > DEFAULT_PAGE_SIZE
	const showHistogram = searchResultsLoading || searchResultsCount > 0

	const { data: billingDetails } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	// Used to determine if we need to show the loading skeleton.
	// The loading skeleton should only be shown on the first load and when searchParams changes.
	// It should not show when loading more sessions via infinite scroll.
	useEffect(() => {
		setSearchResultsLoading(true)
	}, [backendSearchQuery, page, setSearchResultsLoading])

	const addSessions = (response: GetSessionsOpenSearchQuery) => {
		if (response?.sessions_opensearch) {
			setSessionResults({
				...response.sessions_opensearch,
				sessions: response.sessions_opensearch.sessions.map((s) => ({
					...s,
					payload_updated_at: new Date().toISOString(),
				})),
			})
			totalPages.current = Math.ceil(
				response?.sessions_opensearch.totalCount / DEFAULT_PAGE_SIZE,
			)
			setSearchResultsCount(response?.sessions_opensearch.totalCount)
		}
		setSearchResultsLoading(false)
	}

	const { loading } = useGetSessionsOpenSearchQuery({
		variables: {
			query: backendSearchQuery?.searchQuery || '',
			count: DEFAULT_PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id: project_id!,
			sort_desc: sessionFeedConfiguration.sortOrder === 'Descending',
		},
		onCompleted: addSessions,
		skip: !backendSearchQuery || !project_id,
		fetchPolicy: projectHasManySessions ? 'cache-first' : 'no-cache',
	})

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
	}, [searchParams, setPage])

	const enableLiveSessions = useCallback(() => {
		if (!searchParams.query) {
			setSearchParams({
				...searchParams,
				show_live_sessions: true,
			})
		} else {
			// Replace any 'custom_processed' values with ['true', 'false']
			const processedRule = ['custom_processed', 'is', 'true', 'false']
			const currentState = JSON.parse(
				searchParams.query,
			) as QueryBuilderState
			const newRules = currentState.rules.map((rule) =>
				rule[0] === processedRule[0] ? processedRule : rule,
			)
			setSearchParams({
				...searchParams,
				query: JSON.stringify({
					isAnd: currentState.isAnd,
					rules: newRules,
				}),
			})
		}
	}, [searchParams, setSearchParams])

	useEffect(() => {
		// We're showing live sessions for new users.
		// The assumption here is if a project is on the free plan and the project has less than 15 sessions than there must be live sessions.
		// We show live sessions along with the processed sessions so the user isn't confused on why sessions are not showing up in the feed.
		if (
			billingDetails?.billingDetailsForProject &&
			integrated &&
			project_id !== DEMO_WORKSPACE_APPLICATION_ID &&
			project_id !== DEMO_WORKSPACE_PROXY_APPLICATION_ID &&
			!showLiveSessions(searchParams)
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
		searchParams,
		setSearchParams,
	])

	const filteredSessions = useMemo(() => {
		if (loading) {
			return sessionResults.sessions
		}
		if (searchParams.hide_viewed) {
			return sessionResults.sessions.filter((session) => !session?.viewed)
		}
		return sessionResults.sessions
	}, [loading, searchParams.hide_viewed, sessionResults.sessions])

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
						<SessionsHistogram
							projectHasManySessions={projectHasManySessions}
						/>
					</Box>
				)}
				<Box
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
							{searchResultsCount === 0 ? (
								showStarredSessions ? (
									<SearchEmptyState
										item="sessions"
										customTitle="Your project doesn't have starred sessions."
										customDescription={
											'Starring a session is like bookmarking a website. ' +
											'It gives you a way to tag a session that you want to look at again. ' +
											'You can star a session by clicking the star icon next to the user details ' +
											"in the session's right panel."
										}
									/>
								) : (
									<EmptySearchResults
										kind={SearchResultsKind.Sessions}
									/>
								)
							) : (
								<>
									<LimitedSessionCard />
									{filteredSessions?.map(
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
					totalCount={searchResultsCount}
					pageSize={DEFAULT_PAGE_SIZE}
				/>
			</Box>
		</SessionFeedConfigurationContextProvider>
	)
})
