import {
	Box,
	DEFAULT_TIME_PRESETS,
	presetStartDate,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import _ from 'lodash'
import moment from 'moment'
import React, { useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { Outlet } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'

import LoadingBox from '@/components/LoadingBox'
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
	buildSearchQueryForServer,
	parseSearchQuery,
} from '@/components/Search/SearchForm/utils'
import {
	useGetTracesKeysLazyQuery,
	useGetTracesKeyValuesLazyQuery,
	useGetTracesMetricsQuery,
} from '@/graph/generated/hooks'
import {
	MetricAggregator,
	MetricColumn,
	Trace,
} from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import LogsHistogram from '@/pages/LogsPage/LogsHistogram/LogsHistogram'
import { LatencyChart } from '@/pages/Traces/LatencyChart'
import { TracesList } from '@/pages/Traces/TracesList'
import { useGetTraces } from '@/pages/Traces/useGetTraces'
import { formatNumber } from '@/util/numbers'

import * as styles from './TracesPage.css'

export type TracesOutletContext = Partial<Trace>[]

export const TracesPage: React.FC = () => {
	const { projectId } = useProjectId()
	const { trace_cursor: traceCursor } = useParams<{
		trace_cursor: string
	}>()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const {
		startDate,
		endDate,
		datePickerValue,
		updateSearchTime,
		rebaseSearchTime,
	} = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: FixedRangePreset,
	})
	const queryTerms = parseSearchQuery(query)
	const serverQuery = buildSearchQueryForServer(queryTerms)
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
		skipPolling: !datePickerValue.selectedPreset,
	})

	const { data: metricsData, loading: metricsLoading } =
		useGetTracesMetricsQuery({
			variables: {
				project_id: projectId!,
				column: MetricColumn.Duration,
				group_by: [],
				params: {
					query: serverQuery,
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
		.filter((b) => b.metric_type === MetricAggregator.Count)
		.map((b) => ({
			bucketId: b.bucket_id,
			counts: [{ level: 'traces', count: b.metric_value }],
		}))

	const totalCount = _.sumBy(
		metricsData?.traces_metrics.buckets.filter(
			(b) => b.metric_type === MetricAggregator.Count,
		),
		(b) => b.metric_value,
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

	const outletContext = useMemo<TracesOutletContext>(() => {
		if (!traceEdges) {
			return []
		}

		return traceEdges.map((edge) => edge.node)
	}, [traceEdges])

	return (
		<>
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
						initialQuery={query ?? ''}
						startDate={startDate}
						endDate={endDate}
						presets={DEFAULT_TIME_PRESETS}
						minDate={minDate}
						datePickerValue={datePickerValue}
						timeMode={timeMode}
						hideCreateAlert
						onFormSubmit={setQuery}
						onDatesChange={updateSearchTime}
						fetchKeysLazyQuery={useGetTracesKeysLazyQuery}
						fetchValuesLazyQuery={useGetTracesKeyValuesLazyQuery}
						savedSegmentType="Trace"
					/>
					<Box
						display="flex"
						borderBottom="dividerWeak"
						style={{ height: 92 }}
					>
						<Box
							width="full"
							padding="8"
							paddingBottom="4"
							borderRight="dividerWeak"
							position="relative"
						>
							<Box
								display="flex"
								flexDirection="row"
								gap="4"
								paddingBottom="4"
							>
								{metricsLoading ? (
									<LoadingBox
										height="auto"
										width="auto"
										position="absolute"
										size="xSmall"
										style={{ top: 0, left: 0, zIndex: 1 }}
									/>
								) : (
									<>
										<Text size="xSmall" color="strong">
											Traces
										</Text>
										<Text size="xSmall" color="weak">
											{formatNumber(totalCount)} total
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
								noPadding
							/>
						</Box>
						<Box
							width="full"
							padding="8"
							paddingBottom="4"
							cssClass={styles.chart}
							position="relative"
						>
							{metricsLoading ? (
								<LoadingBox
									height="auto"
									width="auto"
									position="absolute"
									size="xSmall"
									style={{ top: 0, left: 0, zIndex: 1 }}
								/>
							) : (
								<Text cssClass={styles.chartText} size="xSmall">
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
					/>
				</Box>
			</Box>

			<Outlet context={outletContext} />
		</>
	)
}
