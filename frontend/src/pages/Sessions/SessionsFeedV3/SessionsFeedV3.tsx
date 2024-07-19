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
	useGetSessionsHistogramQuery,
	useGetWorkspaceSettingsQuery,
} from '@graph/hooks'
import { SavedSegmentEntityType } from '@graph/schemas'
import { Maybe, ProductType, Session } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	IconSolidLogout,
	Stack,
} from '@highlight-run/ui/components'
import { SessionFeedCard } from '@pages/Sessions/SessionsFeedV3/SessionFeedCard/SessionFeedCard'
import { SessionReport } from '@pages/Sessions/SessionsFeedV3/SessionReport'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { useParams } from '@util/react-router/useParams'
import { roundFeedDate } from '@util/time'
import clsx from 'clsx'
import React from 'react'

import { AdditionalFeedResults } from '@/components/FeedResults/FeedResults'
import { useSearchContext } from '@/components/Search/SearchContext'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import useFeatureFlag, { Feature } from '@/hooks/useFeatureFlag/useFeatureFlag'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { OverageCard } from '@/pages/Sessions/SessionsFeedV3/OverageCard/OverageCard'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { styledVerticalScrollbar } from '@/style/common.css'

import { SessionFeedConfigurationContextProvider } from './context/SessionFeedConfigurationContext'
import { useSessionFeedConfiguration } from './hooks/useSessionFeedConfiguration'
import { SessionFeedConfigDropdown } from './SessionFeedConfigDropdown'
import * as style from './SessionFeedV3.css'

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
	const { currentWorkspace } = useApplicationContext()
	const sessionFeedConfiguration = useSessionFeedConfiguration()
	const aiQueryBuilderFlag = useFeatureFlag(Feature.AiQueryBuilder)
	const {
		loading,
		totalCount,
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
		pollingExpired,
	} = useSearchContext()

	const { showBanner } = useGlobalContext()
	const showHistogram = totalCount >= 0

	const { setShowLeftPanel } = usePlayerConfiguration()

	const actions = () => {
		return (
			<Stack direction="row" gap="2">
				<Box marginLeft="auto" display="flex" gap="0">
					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="low"
						icon={<IconSolidLogout size={14} />}
						onClick={() => setShowLeftPanel(false)}
					/>
				</Box>
				<SessionReport />
				<SessionFeedConfigDropdown />
			</Stack>
		)
	}

	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id || !aiQueryBuilderFlag,
	})

	const { presets, minDate } = useRetentionPresets(ProductType.Sessions)

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
					presets={presets}
					minDate={minDate}
					selectedPreset={selectedPreset}
					productType={ProductType.Sessions}
					timeMode="fixed-range"
					savedSegmentType={SavedSegmentEntityType.Session}
					actions={actions}
					resultCount={totalCount}
					loading={loading}
					creatables={{
						sample: {
							label: 'New Random Seed',
							value: [...Array(16)]
								.map(() =>
									Math.floor(Math.random() * 16).toString(16),
								)
								.join(''),
						},
					}}
					enableAIMode={
						workspaceSettings?.workspaceSettings?.ai_query_builder
					}
					aiSupportedSearch={aiQueryBuilderFlag}
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
					pollingExpired={pollingExpired}
				/>
				<Box
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
