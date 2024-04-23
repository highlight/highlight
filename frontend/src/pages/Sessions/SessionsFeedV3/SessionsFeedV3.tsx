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
import SearchPagination, {
	PAGE_SIZE,
} from '@components/SearchPagination/SearchPagination'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import {
	useGetBillingDetailsForProjectQuery,
	useGetSessionsHistogramQuery,
} from '@graph/hooks'
import { SavedSegmentEntityType } from '@graph/schemas'
import { Maybe, PlanType, ProductType, Session } from '@graph/schemas'
import {
	Box,
	DEFAULT_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import { SessionFeedCard } from '@pages/Sessions/SessionsFeedV3/SessionFeedCard/SessionFeedCard'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { useClientIntegration } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { roundFeedDate } from '@util/time'
import clsx from 'clsx'
import React, { useCallback, useEffect } from 'react'

import { AdditionalFeedResults } from '@/components/FeedResults/FeedResults'
import { useSearchContext } from '@/components/Search/SearchContext'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { OverageCard } from '@/pages/Sessions/SessionsFeedV3/OverageCard/OverageCard'
import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './SessionFeedV3.css'
import { SessionFeedConfigurationContextProvider } from './SessionQueryBuilder/context/SessionFeedConfigurationContext'
import { useSessionFeedConfiguration } from './SessionQueryBuilder/hooks/useSessionFeedConfiguration'
import { showLiveSessions } from './utils'

export const SessionsHistogram: React.FC<{ readonly?: boolean }> = React.memo(
	({ readonly }) => {
		const { project_id } = useParams<{
			project_id: string
		}>()

		const {
			query,
			histogramBucketSize,
			startDate,
			endDate,
			updateSearchTime,
		} = useSearchContext()

		const { loading, data } = useGetSessionsHistogramQuery({
			variables: {
				project_id: project_id!,
				params: {
					query,
					date_range: {
						start_date: roundFeedDate(
							startDate!.toISOString(),
						).format(),
						end_date: roundFeedDate(
							endDate!.toISOString(),
						).format(),
					},
				},
				histogram_options: {
					bucket_size: histogramBucketSize!,
					time_zone:
						Intl.DateTimeFormat().resolvedOptions().timeZone ??
						'UTC',
					bounds: {
						start_date: roundFeedDate(
							startDate!.toISOString(),
						).format(),
						end_date: roundFeedDate(
							endDate!.toISOString(),
						).format(),
					},
				},
			},
			skip: !histogramBucketSize || !project_id || !startDate || !endDate,
			fetchPolicy: 'network-only',
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

		return (
			<SearchResultsHistogram
				seriesList={histogram.seriesList}
				bucketTimes={histogram.bucketTimes}
				bucketSize={histogramBucketSize}
				loading={loading}
				updateTimeRange={updateSearchTime!}
				barGap={2.4}
				readonly={readonly}
			/>
		)
	},
)

export const SessionFeedV3 = React.memo(() => {
	const { project_id } = useParams<{ project_id: string }>()
	const sessionFeedConfiguration = useSessionFeedConfiguration()

	const {
		loading,
		totalCount,
		query,
		onSubmit,
		startDate,
		endDate,
		selectedPreset,
		results,
		moreResults,
		resetMoreResults,
		page,
		setPage,
		rebaseSearchTime,
		updateSearchTime,
	} = useSearchContext()

	const { integrated } = useClientIntegration()
	const { showBanner } = useGlobalContext()
	const showHistogram = totalCount >= 0

	const { data: billingDetails } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: project_id! },
		skip: !project_id || project_id === DEMO_PROJECT_ID,
	})

	const enableLiveSessions = useCallback(() => {
		if (query) {
			// TODO(spenny): check for duplicate keys?
			const newQuery = `${query} processed=(true OR false)`
			onSubmit(newQuery.trim())
		}
	}, [query, onSubmit])

	useEffect(() => {
		// We're showing live sessions for new users.
		// The assumption here is if a project is on the free plan and the project has less than 15 sessions than there must be live sessions.
		// We show live sessions along with the processed sessions so the user isn't confused on why sessions are not showing up in the feed.
		if (
			billingDetails?.billingDetailsForProject &&
			integrated &&
			project_id !== DEMO_PROJECT_ID &&
			project_id !== DEMO_WORKSPACE_PROXY_APPLICATION_ID &&
			!showLiveSessions(query) &&
			billingDetails.billingDetailsForProject.plan.type ===
				PlanType.Free &&
			billingDetails.billingDetailsForProject.meter < 15
		) {
			enableLiveSessions()
		}
	}, [
		billingDetails?.billingDetailsForProject,
		enableLiveSessions,
		integrated,
		project_id,
		query,
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
					[style.searchPanelWithBanner]: showBanner,
				})}
				background="n2"
			>
				<SearchForm
					startDate={startDate!}
					endDate={endDate!}
					onDatesChange={updateSearchTime!}
					presets={DEFAULT_TIME_PRESETS}
					minDate={presetStartDate(DEFAULT_TIME_PRESETS[5])}
					selectedPreset={selectedPreset}
					productType={ProductType.Sessions}
					timeMode="fixed-range"
					savedSegmentType={SavedSegmentEntityType.Session}
					// TODO(spenny): action
					// actions={actions}
					resultCount={totalCount}
					loading={loading}
					hideCreateAlert
					isPanelView
				/>
				{showHistogram && (
					<Box borderBottom="secondary" paddingBottom="8" px="8">
						<SessionsHistogram />
					</Box>
				)}
				<AdditionalFeedResults
					maxResults={PAGE_SIZE}
					more={moreResults}
					type="sessions"
					onClick={() => {
						resetMoreResults()
						rebaseSearchTime!()
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
					{loading ? (
						<LoadingBox />
					) : (
						<>
							<OverageCard productType={ProductType.Sessions} />
							{totalCount === 0 ? (
								<EmptySearchResults
									kind={SearchResultsKind.Sessions}
								/>
							) : (
								<>
									{results?.map(
										(s: Maybe<Session>) =>
											s && (
												<SessionFeedCard
													key={s.secure_id}
													session={s}
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
					totalCount={totalCount}
					pageSize={PAGE_SIZE}
					loading={loading}
				/>
			</Box>
		</SessionFeedConfigurationContextProvider>
	)
})
