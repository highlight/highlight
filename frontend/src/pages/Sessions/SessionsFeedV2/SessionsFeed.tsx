import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { Series } from '@components/Histogram/Histogram'
import {
	DEFAULT_PAGE_SIZE,
	Pagination,
	RESET_PAGE_MS,
	STARTING_PAGE,
} from '@components/Pagination/Pagination'
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import Tooltip from '@components/Tooltip/Tooltip'
import {
	useGetBillingDetailsForProjectQuery,
	useGetSessionsHistogramQuery,
	useGetSessionsOpenSearchQuery,
} from '@graph/hooks'
import { GetSessionsOpenSearchQuery } from '@graph/operations'
import { DateHistogramBucketSize, PlanType } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import SegmentPickerForPlayer from '@pages/Player/SearchPanel/SegmentPickerForPlayer/SegmentPickerForPlayer'
import {
	QueryBuilderState,
	updateQueriedTimeRange,
} from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder'
import { getUnprocessedSessionsQuery } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/utils/utils'
import SessionFeedConfiguration, {
	formatCount,
} from '@pages/Sessions/SessionsFeedV2/components/SessionFeedConfiguration/SessionFeedConfiguration'
import SessionsQueryBuilder, {
	TIME_RANGE_FIELD,
} from '@pages/Sessions/SessionsFeedV2/components/SessionsQueryBuilder/SessionsQueryBuilder'
import { SessionFeedConfigurationContextProvider } from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext'
import { useSessionFeedConfiguration } from '@pages/Sessions/SessionsFeedV2/hooks/useSessionFeedConfiguration'
import { useIntegrated } from '@util/integrated'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import { roundDateToMinute, serializeAbsoluteTimeRange } from '@util/time'
import { message } from 'antd'
import classNames from 'classnames'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import TextTransition from 'react-text-transition'

import Switch from '../../../components/Switch/Switch'
import LimitedSessionCard from '../../../components/Upsell/LimitedSessionsCard/LimitedSessionsCard'
import usePlayerConfiguration from '../../Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '../../Player/ReplayerContext'
import {
	showLiveSessions,
	useSearchContext,
} from '../SearchContext/SearchContext'
import MinimalSessionCard from './components/MinimalSessionCard/MinimalSessionCard'
import styles from './SessionsFeed.module.scss'

export const SessionsHistogram: React.FC = React.memo(() => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { searchParams, setSearchParams, backendSearchQuery } =
		useSearchContext()

	const { loading, data } = useGetSessionsHistogramQuery({
		variables: {
			project_id,
			query: backendSearchQuery?.searchQuery as string,
			histogram_options: {
				bucket_size:
					backendSearchQuery?.histogramBucketSize as DateHistogramBucketSize,
				time_zone:
					Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
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
		skip: !backendSearchQuery,
		fetchPolicy: 'cache-first',
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
				color: 'n9',
				counts: data?.sessions_histogram.sessions_without_errors,
			},
			{
				label: 'errors',
				color: 'blueLB100',
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
		/>
	)
})

export const SessionFeed = React.memo(() => {
	const { setSessionResults, sessionResults } = useReplayerContext()
	const { project_id, session_secure_id } = useParams<{
		project_id: string
		session_secure_id: string
	}>()
	const sessionFeedConfiguration = useSessionFeedConfiguration()
	const {
		autoPlaySessions,
		setAutoPlaySessions,
		setAutoPlayVideo,
		setShowDetailedSessionView,
		showDetailedSessionView,
	} = usePlayerConfiguration()

	const [
		sessionFeedIsInTopScrollPosition,
		setSessionFeedIsInTopScrollPosition,
	] = useState(true)

	const totalPages = useRef<number>(0)
	const {
		searchParams,
		showStarredSessions,
		setSearchParams,
		backendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
	} = useSearchContext()
	const { integrated } = useIntegrated()
	const searchParamsChanged = useRef<Date>()
	const projectHasManySessions = sessionResults.totalCount > DEFAULT_PAGE_SIZE

	const { data: billingDetails } = useGetBillingDetailsForProjectQuery({
		variables: { project_id },
	})
	const { data: unprocessedSessionsOpenSearch } =
		useGetSessionsOpenSearchQuery({
			variables: {
				project_id,
				count: DEFAULT_PAGE_SIZE,
				page: 1,
				query: getUnprocessedSessionsQuery(
					backendSearchQuery?.searchQuery || '',
				),
				sort_desc: sessionFeedConfiguration.sortOrder === 'Descending',
			},
			skip: !backendSearchQuery,
			pollInterval: 5000,
			fetchPolicy: 'network-only',
		})

	// Used to determine if we need to show the loading skeleton.
	// The loading skeleton should only be shown on the first load and when searchParams changes.
	// It should not show when loading more sessions via infinite scroll.
	useEffect(() => {
		setSearchResultsLoading(true)
	}, [backendSearchQuery, page, setSearchResultsLoading])

	// Get the unprocessedSessionsCount from either the SQL or OpenSearch query
	const unprocessedSessionsCount: number | undefined =
		unprocessedSessionsOpenSearch?.sessions_opensearch?.totalCount

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
		}
		setSearchResultsLoading(false)
	}

	const { loading, called } = useGetSessionsOpenSearchQuery({
		variables: {
			query: backendSearchQuery?.searchQuery || '',
			count: DEFAULT_PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id,
			sort_desc: sessionFeedConfiguration.sortOrder === 'Descending',
		},
		onCompleted: addSessions,
		skip: !backendSearchQuery,
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

	const onFeedScrollListener = (
		e: React.UIEvent<HTMLElement> | undefined,
	) => {
		setSessionFeedIsInTopScrollPosition(e?.currentTarget.scrollTop === 0)
	}

	return (
		<SessionFeedConfigurationContextProvider
			value={sessionFeedConfiguration}
		>
			<div className={styles.filtersContainer}>
				<SegmentPickerForPlayer />
				<SessionsQueryBuilder />
			</div>
			{(loading || sessionResults.totalCount > 0) && (
				<Box paddingTop="16" paddingBottom="6" px="8">
					<SessionsHistogram />
				</Box>
			)}
			<div className={styles.fixedContent}>
				<div className={styles.resultCount}>
					{sessionResults.totalCount === -1 ? (
						<Skeleton width="100px" />
					) : (
						<div className={styles.resultCountValueContainer}>
							<span className={styles.countContainer}>
								<Tooltip
									title={`${sessionResults.totalCount.toLocaleString()} sessions`}
								>
									<TextTransition
										inline
										text={`${formatCount(
											sessionResults.totalCount,
											sessionFeedConfiguration.countFormat,
										)}`}
									/>
									{' sessions '}
								</Tooltip>
								{!!unprocessedSessionsCount &&
									unprocessedSessionsCount > 0 &&
									!showLiveSessions(searchParams) && (
										<button
											className={
												styles.liveSessionsCountButton
											}
											onClick={() => {
												message.success(
													'Showing live sessions',
												)
												enableLiveSessions()
											}}
										>
											(
											{formatCount(
												unprocessedSessionsCount,
												sessionFeedConfiguration.countFormat,
											)}{' '}
											live)
										</button>
									)}
							</span>
							<div className={styles.sessionFeedActions}>
								<Switch
									label="Autoplay"
									checked={autoPlaySessions}
									onChange={(checked) => {
										setAutoPlaySessions(checked)
										if (checked) setAutoPlayVideo(checked)
									}}
									trackingId="SessionFeedAutoplay"
								/>
								<Switch
									label="Details"
									checked={showDetailedSessionView}
									onChange={(checked) => {
										setShowDetailedSessionView(checked)
									}}
									trackingId="SessionFeedShowDetails"
								/>
								<SessionFeedConfiguration
									configuration={sessionFeedConfiguration}
									sessionCount={sessionResults.totalCount}
									sessionQuery={
										backendSearchQuery?.searchQuery || ''
									}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
			<div className={styles.feedContent}>
				<div
					className={classNames(styles.feedLine, {
						[styles.hasScrolled]: !sessionFeedIsInTopScrollPosition,
					})}
				/>
				<div
					onScroll={onFeedScrollListener}
					className={classNames(styles.feedItems, {
						[styles.hasScrolled]: !sessionFeedIsInTopScrollPosition,
					})}
				>
					{searchResultsLoading ? (
						<Skeleton
							height={!showDetailedSessionView ? 74 : 125}
							count={3}
							style={{
								borderRadius: 8,
								marginBottom: 14,
							}}
						/>
					) : (
						<>
							{!sessionResults.sessions.length &&
							called &&
							!loading ? (
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
									<SearchEmptyState item="sessions" />
								)
							) : (
								<>
									{!isOnPrem && <LimitedSessionCard />}
									{filteredSessions.map((u) => (
										<MinimalSessionCard
											session={u}
											key={u?.secure_id}
											selected={
												session_secure_id ===
												u?.secure_id
											}
											urlParams={`?page=${
												page || STARTING_PAGE
											}`}
											autoPlaySessions={autoPlaySessions}
											showDetailedSessionView={
												showDetailedSessionView
											}
											configuration={{
												countFormat:
													sessionFeedConfiguration.countFormat,
												datetimeFormat:
													sessionFeedConfiguration.datetimeFormat,
											}}
										/>
									))}
								</>
							)}
						</>
					)}
				</div>
			</div>
			<Pagination
				page={page}
				setPage={setPage}
				totalPages={totalPages.current}
			/>
		</SessionFeedConfigurationContextProvider>
	)
})
