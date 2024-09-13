import {
	Badge,
	Box,
	DEFAULT_TIME_PRESETS,
	IconSolidInformationCircle,
	IconSolidLoading,
	presetStartDate,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useParams } from '@util/react-router/useParams'
import { sumBy } from 'lodash'
import moment from 'moment'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import { loadingIcon } from '@/components/Button/style.css'
import {
	RelatedTrace,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import {
	AiSuggestion,
	SearchContext,
	SORT_COLUMN,
	SORT_DIRECTION,
} from '@/components/Search/SearchContext'
import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import {
	FixedRangePreset,
	QueryParam,
	SearchForm,
} from '@/components/Search/SearchForm/SearchForm'
import {
	useGetAiQuerySuggestionLazyQuery,
	useGetMetricsQuery,
	useGetWorkspaceSettingsQuery,
} from '@/graph/generated/hooks'
import {
	MetricAggregator,
	MetricColumn,
	ProductType,
	SavedSegmentEntityType,
	SortDirection,
	Trace,
} from '@/graph/generated/schemas'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { TIMESTAMP_KEY } from '@/pages/Graphing/components/Graph'
import LogsHistogram from '@/pages/LogsPage/LogsHistogram/LogsHistogram'
import { TracesList } from '@/pages/Traces/TracesList'
import { useGetTraces } from '@/pages/Traces/useGetTraces'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import analytics from '@/util/analytics'
import { formatNumber } from '@/util/numbers'

import * as styles from './TracesPage.css'

export type TracesOutletContext = Partial<Trace>[]

export const TracesPage: React.FC = () => {
	const { projectId } = useNumericProjectId()
	const { currentWorkspace } = useApplicationContext()
	const navigate = useNavigate()
	const {
		trace_id,
		timestamp,
		span_id,
		trace_cursor: traceCursor,
	} = useParams<{
		trace_id: string
		timestamp: string
		span_id: string
		trace_cursor: string
	}>()
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [sortColumn] = useQueryParam(SORT_COLUMN, StringParam)
	const [sortDirection] = useQueryParam(SORT_DIRECTION, StringParam)
	const [aiMode, setAiMode] = useState(false)
	const searchTimeContext = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: FixedRangePreset,
	})
	const minDate = presetStartDate(DEFAULT_TIME_PRESETS[5])
	const timeMode: TIME_MODE = 'fixed-range' // TODO: Support permalink mode
	const skipPolling = !searchTimeContext.selectedPreset || !!sortColumn

	const {
		traceEdges,
		moreTraces,
		pollingExpired,
		clearMoreTraces,
		loading,
		loadingAfter,
		fetchMoreForward,
		sampled,
	} = useGetTraces({
		query,
		projectId,
		traceCursor,
		startDate: searchTimeContext.startDate,
		endDate: searchTimeContext.endDate,
		skipPolling,
		sortColumn: sortColumn || undefined,
		sortDirection: sortDirection as SortDirection,
	})

	const [
		getAiQuerySuggestion,
		{ data: aiData, error: aiError, loading: aiLoading },
	] = useGetAiQuerySuggestionLazyQuery({
		fetchPolicy: 'network-only',
	})

	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})

	const { data: metricsData, loading: metricsLoading } = useGetMetricsQuery({
		variables: {
			product_type: ProductType.Traces,
			project_id: projectId!,
			column: MetricColumn.Duration,
			group_by: [],
			params: {
				query,
				date_range: {
					start_date: moment(searchTimeContext.startDate).format(
						TIME_FORMAT,
					),
					end_date: moment(searchTimeContext.endDate).format(
						TIME_FORMAT,
					),
				},
			},
			metric_types: [
				MetricAggregator.Count,
				MetricAggregator.Avg,
				MetricAggregator.P50,
				MetricAggregator.P90,
			],
			bucket_by: TIMESTAMP_KEY,
			bucket_count: 45,
		},
		skip: !projectId,
		fetchPolicy: 'cache-and-network',
	})

	const fetchMoreWhenScrolled = React.useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } =
					containerRefElement
				//once the user has scrolled within 100px of the bottom of the table, fetch more data if there is any
				if (scrollHeight - scrollTop - clientHeight < 100) {
					fetchMoreForward()
				}
			}
		},
		[fetchMoreForward],
	)

	const totalCount = sumBy(
		metricsData?.metrics.buckets.filter(
			(b) => b.metric_type === MetricAggregator.Count,
		),
		(b) => b.metric_value ?? 0,
	)

	const metricsBuckets: {
		avg: number | undefined
		p50: number | undefined
		p90: number | undefined
	}[] = []
	for (let i = 0; i < metricsData?.metrics.bucket_count; i++) {
		metricsBuckets.push({ avg: undefined, p50: undefined, p90: undefined })
	}

	metricsData?.metrics.buckets.forEach((b) => {
		if (b.metric_value === undefined || b.metric_value === null) {
			return
		}
		switch (b.metric_type) {
			case MetricAggregator.Avg:
				metricsBuckets[b.bucket_id].avg = b.metric_value / 1_000_000
				break
			case MetricAggregator.P50:
				metricsBuckets[b.bucket_id].p50 = b.metric_value / 1_000_000
				break
			case MetricAggregator.P90:
				metricsBuckets[b.bucket_id].p90 = b.metric_value / 1_000_000
				break
		}
	})

	useEffect(() => analytics.page('Traces'), [])

	const { resource, panelPagination, set, setPanelPagination } =
		useRelatedResource()
	useEffect(() => {
		if (!resource || !!panelPagination || !traceEdges.length) {
			return
		}

		const trace = resource as RelatedTrace

		const currentInded = traceEdges.findIndex(
			(edge) => edge.node.spanID === trace.spanID,
		)

		setPanelPagination({
			currentIndex: currentInded,
			resources: traceEdges.map((edge) => ({
				type: 'trace',
				id: edge.node.traceID,
				timestamp: edge.node.timestamp,
				spanID: edge.node.spanID,
			})),
		})
	}, [panelPagination, resource, setPanelPagination, traceEdges])

	// Temporary workaround to preserve functionality for linking to a trace.
	// Eventually we can delete both of these useEffects + params in the router.
	useEffect(() => {
		if (trace_id && timestamp) {
			set({
				type: 'trace',
				id: trace_id,
				timestamp: timestamp,
				spanID: span_id,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!resource) {
			navigate({
				pathname: `/${projectId}/traces`,
				search: location.search,
			})
		}
	}, [navigate, projectId, resource])

	const onAiSubmit = (aiQuery: string) => {
		if (projectId && aiQuery.length) {
			getAiQuerySuggestion({
				variables: {
					query: aiQuery,
					project_id: projectId,
					product_type: ProductType.Traces,
					time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				},
			})
		}
	}

	const aiSuggestion = useMemo(() => {
		const { query, date_range = {} } = aiData?.ai_query_suggestion ?? {}

		return {
			query,
			dateRange: {
				startDate: date_range.start_date
					? new Date(date_range.start_date)
					: undefined,
				endDate: date_range.end_date
					? new Date(date_range.end_date)
					: undefined,
			},
		} as AiSuggestion
	}, [aiData])

	return (
		<SearchContext
			initialQuery={query}
			onSubmit={setQuery}
			aiMode={aiMode}
			setAiMode={setAiMode}
			onAiSubmit={onAiSubmit}
			aiSuggestion={aiSuggestion}
			aiSuggestionLoading={aiLoading}
			aiSuggestionError={aiError}
			{...searchTimeContext}
		>
			<Helmet>
				<title>Traces</title>
			</Helmet>

			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				flexDirection="column"
				height="full"
				position="relative"
			>
				<Box
					backgroundColor="white"
					border="dividerWeak"
					borderRadius="6"
					height="full"
					shadow="medium"
					overflow="hidden"
				>
					<SearchForm
						startDate={searchTimeContext.startDate}
						endDate={searchTimeContext.endDate}
						presets={DEFAULT_TIME_PRESETS}
						minDate={minDate}
						selectedPreset={searchTimeContext.selectedPreset}
						timeMode={timeMode}
						hideCreateAlert
						onDatesChange={searchTimeContext.updateSearchTime}
						productType={ProductType.Traces}
						savedSegmentType={SavedSegmentEntityType.Trace}
						textAreaRef={textAreaRef}
						enableAIMode={
							workspaceSettings?.workspaceSettings
								?.ai_query_builder
						}
						aiSupportedSearch
					/>
					<Box
						display="flex"
						borderBottom="dividerWeak"
						justifyContent="space-between"
					>
						<Box
							width="full"
							borderRight="dividerWeak"
							position="relative"
						>
							<Box
								alignItems="center"
								display="flex"
								flexDirection="row"
								px="8"
								pt="4"
								pb="6"
								gap="8"
							>
								{metricsLoading ? (
									<Box py="4">
										<HistogramLoading />
									</Box>
								) : (
									<>
										<Badge
											size="medium"
											shape="basic"
											variant="outlineGray"
											label={`
												${sampled ? '~' : ''}${formatNumber(totalCount)} Trace${
													totalCount !== 1 ? 's' : ''
												}
											`}
											iconEnd={
												sampled ? (
													<Tooltip
														trigger={
															<IconSolidInformationCircle />
														}
													>
														<Box p="4">
															<Text color="weak">
																Data is sampled
																when custom
																sorting is
																applied, so
																results are
																approximate.
															</Text>
														</Box>
													</Tooltip>
												) : undefined
											}
										/>
										<Text size="xSmall" color="weak">
											{searchTimeContext.selectedPreset ? (
												<>
													{moment(
														searchTimeContext.startDate,
													).format(
														'M/D/YY h:mm:ss A',
													)}{' '}
													to Now
												</>
											) : (
												<>
													{moment(
														searchTimeContext.startDate,
													).format(
														'M/D/YY h:mm:ss',
													)}{' '}
													to{' '}
													{moment(
														searchTimeContext.endDate,
													).format('h:mm:ss A')}
												</>
											)}
										</Text>
									</>
								)}
							</Box>
							<LogsHistogram
								startDate={searchTimeContext.startDate}
								endDate={searchTimeContext.endDate}
								onDatesChange={
									searchTimeContext.updateSearchTime
								}
								metrics={metricsData}
								loading={metricsLoading}
								series={[MetricAggregator.Count]}
							/>
						</Box>
						<Box
							width="full"
							cssClass={styles.chart}
							position="relative"
						>
							<Box
								alignItems="center"
								display="flex"
								flexDirection="row"
								px="10"
								mb="4"
								gap="10"
								style={{ height: 28 }}
							>
								{metricsLoading ? (
									<HistogramLoading
										cssClass={styles.chartText}
										style={{
											top: 6,
										}}
									/>
								) : (
									<Text
										cssClass={styles.chartText}
										size="xSmall"
										color="weak"
									>
										Latency
									</Text>
								)}
							</Box>

							<LogsHistogram
								startDate={searchTimeContext.startDate}
								endDate={searchTimeContext.endDate}
								onDatesChange={
									searchTimeContext.updateSearchTime
								}
								metrics={metricsData}
								loading={metricsLoading}
								series={[
									MetricAggregator.P90,
									MetricAggregator.P50,
									MetricAggregator.Avg,
								]}
								lineChart
							/>
						</Box>
					</Box>

					<TracesList
						loading={loading}
						numMoreTraces={moreTraces}
						traceEdges={traceEdges}
						handleAdditionalTracesDateChange={
							searchTimeContext.rebaseSearchTime
						}
						resetMoreTraces={clearMoreTraces}
						fetchMoreWhenScrolled={fetchMoreWhenScrolled}
						loadingAfter={loadingAfter}
						textAreaRef={textAreaRef}
						pollingExpired={pollingExpired}
					/>
				</Box>
			</Box>
		</SearchContext>
	)
}

export const HistogramLoading: React.FC<{
	cssClass?: string
	style?: React.CSSProperties
}> = ({ cssClass, style }) => {
	return (
		<Box
			alignItems="center"
			display="flex"
			flexDirection="row"
			gap="4"
			cssClass={cssClass}
			style={style}
		>
			<IconSolidLoading
				className={loadingIcon}
				color={vars.theme.static.content.weak}
			/>
			<Text size="xSmall" color="weak">
				Loading
			</Text>
		</Box>
	)
}
