import {
	Box,
	DEFAULT_TIME_PRESETS,
	IconSolidLoading,
	presetStartDate,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useParams } from '@util/react-router/useParams'
import { sumBy } from 'lodash'
import moment from 'moment'
import React, { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import { loadingIcon } from '@/components/Button/style.css'
import {
	RelatedTrace,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import {
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
import { useGetTracesMetricsQuery } from '@/graph/generated/hooks'
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
import LogsHistogram from '@/pages/LogsPage/LogsHistogram/LogsHistogram'
import { LatencyChart } from '@/pages/Traces/LatencyChart'
import { TracesList } from '@/pages/Traces/TracesList'
import { useGetTraces } from '@/pages/Traces/useGetTraces'
import analytics from '@/util/analytics'
import { formatNumber } from '@/util/numbers'

import * as styles from './TracesPage.css'

export type TracesOutletContext = Partial<Trace>[]

export const TracesPage: React.FC = () => {
	const { projectId } = useNumericProjectId()
	const navigate = useNavigate()
	const {
		trace_id,
		span_id,
		trace_cursor: traceCursor,
	} = useParams<{ trace_id: string; span_id: string; trace_cursor: string }>()
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [sortColumn] = useQueryParam(SORT_COLUMN, StringParam)
	const [sortDirection] = useQueryParam(SORT_DIRECTION, StringParam)
	const {
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
		rebaseSearchTime,
	} = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: FixedRangePreset,
	})
	const minDate = presetStartDate(DEFAULT_TIME_PRESETS[5])
	const timeMode: TIME_MODE = 'fixed-range' // TODO: Support permalink mode

	const {
		traceEdges,
		moreTraces,
		clearMoreTraces,
		loading,
		loadingAfter,
		fetchMoreForward,
	} = useGetTraces({
		query,
		projectId,
		traceCursor,
		startDate,
		endDate,
		skipPolling: !selectedPreset,
		sortColumn,
		sortDirection: sortDirection as SortDirection,
	})

	const { data: metricsData, loading: metricsLoading } =
		useGetTracesMetricsQuery({
			variables: {
				project_id: projectId!,
				column: MetricColumn.Duration,
				group_by: [],
				params: {
					query,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(endDate).format(TIME_FORMAT),
					},
				},
				metric_types: [
					MetricAggregator.Count,
					MetricAggregator.Avg,
					MetricAggregator.P50,
					MetricAggregator.P90,
				],
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

	const histogramBuckets = metricsData?.traces_metrics.buckets
		.filter(
			(b) =>
				b.metric_type === MetricAggregator.Count &&
				b.metric_value !== undefined &&
				b.metric_value !== null,
		)
		.map((b) => ({
			bucketId: b.bucket_id,
			counts: [{ level: 'traces', count: b.metric_value! }],
		}))

	const totalCount = sumBy(
		metricsData?.traces_metrics.buckets.filter(
			(b) => b.metric_type === MetricAggregator.Count,
		),
		(b) => b.metric_value ?? 0,
	)

	const metricsBuckets: {
		avg: number | undefined
		p50: number | undefined
		p90: number | undefined
	}[] = []
	for (let i = 0; i < metricsData?.traces_metrics.bucket_count; i++) {
		metricsBuckets.push({ avg: undefined, p50: undefined, p90: undefined })
	}

	metricsData?.traces_metrics.buckets.forEach((b) => {
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
				spanID: edge.node.spanID,
			})),
		})
	}, [panelPagination, resource, setPanelPagination, traceEdges])

	// Temporary workaround to preserve functionality for linking to a trace.
	// Eventually we can delete both of these useEffects + params in the router.
	useEffect(() => {
		if (trace_id) {
			set({
				type: 'trace',
				id: trace_id,
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

	return (
		<SearchContext initialQuery={query} onSubmit={setQuery}>
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
						startDate={startDate}
						endDate={endDate}
						presets={DEFAULT_TIME_PRESETS}
						minDate={minDate}
						selectedPreset={selectedPreset}
						timeMode={timeMode}
						hideCreateAlert
						onDatesChange={updateSearchTime}
						productType={ProductType.Traces}
						savedSegmentType={SavedSegmentEntityType.Trace}
						textAreaRef={textAreaRef}
					/>
					<Box
						display="flex"
						borderBottom="dividerWeak"
						justifyContent="space-between"
						style={{ height: 85 }}
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
								px="10"
								mb="4"
								gap="10"
								style={{ height: 28 }}
							>
								{metricsLoading ? (
									<HistogramLoading />
								) : (
									<>
										<Text size="xSmall" color="weak">
											{formatNumber(totalCount)} Trace
											{totalCount !== 1 ? 's' : ''}
										</Text>
										<Box
											borderRight="dividerWeak"
											style={{ width: 0, height: 20 }}
										/>
										<Text size="xSmall" color="weak">
											{selectedPreset ? (
												<>
													{moment(startDate).format(
														'M/D/YY h:mm:ss A',
													)}{' '}
													to Now
												</>
											) : (
												<>
													{moment(startDate).format(
														'M/D/YY h:mm:ss',
													)}{' '}
													to{' '}
													{moment(endDate).format(
														'h:mm:ss A',
													)}
												</>
											)}
										</Text>
									</>
								)}
							</Box>
							<LogsHistogram
								startDate={startDate}
								endDate={endDate}
								onDatesChange={updateSearchTime}
								histogramBuckets={histogramBuckets}
								bucketCount={
									metricsData?.traces_metrics.bucket_count
								}
								loading={metricsLoading}
								barColor="#6F6E77"
							/>
						</Box>
						<Box
							width="full"
							px="10"
							py="4"
							cssClass={styles.chart}
							position="relative"
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
							<LatencyChart
								loading={metricsLoading}
								metricsBuckets={metricsBuckets}
							/>
						</Box>
					</Box>

					<TracesList
						loading={loading}
						numMoreTraces={moreTraces}
						traceEdges={traceEdges}
						handleAdditionalTracesDateChange={rebaseSearchTime}
						resetMoreTraces={clearMoreTraces}
						fetchMoreWhenScrolled={fetchMoreWhenScrolled}
						loadingAfter={loadingAfter}
						textAreaRef={textAreaRef}
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
