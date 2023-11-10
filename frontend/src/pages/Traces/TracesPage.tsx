import { Box, defaultPresets, getNow, Text } from '@highlight-run/ui'
import _ from 'lodash'
import moment from 'moment'
import React, { useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { Outlet } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'

import LoadingBox from '@/components/LoadingBox'
import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import {
	EndDateParam,
	FixedRangeStartDateParam,
	QueryParam,
	SearchForm,
} from '@/components/Search/SearchForm/SearchForm'
import {
	buildSearchQueryForServer,
	parseSearchQuery,
} from '@/components/Search/SearchForm/utils'
import {
	useGetTracesKeysQuery,
	useGetTracesKeyValuesLazyQuery,
	useGetTracesLazyQuery,
	useGetTracesMetricsQuery,
	useGetTracesQuery,
} from '@/graph/generated/hooks'
import {
	GetTracesQuery,
	GetTracesQueryVariables,
} from '@/graph/generated/operations'
import {
	MetricAggregator,
	SortDirection,
	Trace,
	TracesMetricColumn,
} from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import LogsHistogram from '@/pages/LogsPage/LogsHistogram/LogsHistogram'
import { LatencyChart } from '@/pages/Traces/LatencyChart'
import { TracesList } from '@/pages/Traces/TracesList'
import { formatNumber } from '@/util/numbers'
import { usePollQuery } from '@/util/search'

import * as styles from './TracesPage.css'

export type TracesOutletContext = Partial<Trace>[]

export const TracesPage: React.FC = () => {
	const { projectId } = useProjectId()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [startDate, setStartDate] = useQueryParam(
		'start_date',
		FixedRangeStartDateParam,
	)
	const [endDate, setEndDate] = useQueryParam('end_date', EndDateParam)
	const queryTerms = parseSearchQuery(query)
	const serverQuery = buildSearchQueryForServer(queryTerms)
	const minDate = defaultPresets[5].startDate
	const timeMode: TIME_MODE = 'fixed-range' // TODO: Support permalink mode

	const handleDatesChange = (newStartDate: Date, newEndDate: Date) => {
		setStartDate(newStartDate)
		setEndDate(newEndDate)
	}

	const handleAdditionTracesDateChange = () => {
		handleDatesChange(defaultPresets[0].startDate, getNow().toDate())
	}

	const { data, loading } = useGetTracesQuery({
		variables: {
			project_id: projectId,
			params: {
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: serverQuery,
			},
			direction: SortDirection.Desc,
		},
	})

	const { data: metricsData, loading: metricsLoading } =
		useGetTracesMetricsQuery({
			variables: {
				project_id: projectId!,
				column: TracesMetricColumn.Duration,
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

	const [moreDataQuery] = useGetTracesLazyQuery({
		fetchPolicy: 'network-only',
	})

	const { numMore: numMoreTraces, reset: resetMoreTraces } = usePollQuery<
		GetTracesQuery,
		GetTracesQueryVariables
	>({
		variableFn: useCallback(
			() => ({
				project_id: projectId!,
				direction: SortDirection.Desc,
				params: {
					query: serverQuery,
					date_range: {
						start_date: moment(endDate).format(TIME_FORMAT),
						end_date: moment(endDate)
							.add(1, 'hour')
							.format(TIME_FORMAT),
					},
				},
			}),
			[endDate, projectId, serverQuery],
		),
		moreDataQuery,
		getResultCount: useCallback((result) => {
			if (result?.data?.traces.edges.length !== undefined) {
				return result?.data?.traces.edges.length
			}
		}, []),
	})

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
		if (!data?.traces) {
			return []
		}

		return data.traces.edges.map((edge) => edge.node)
	}, [data?.traces])

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
						presets={defaultPresets}
						minDate={minDate}
						timeMode={timeMode}
						hideCreateAlert
						onFormSubmit={setQuery}
						onDatesChange={handleDatesChange}
						fetchKeys={useGetTracesKeysQuery}
						fetchValuesLazyQuery={useGetTracesKeyValuesLazyQuery}
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
									<Text size="xSmall">Traces</Text>
								)}
								{!metricsLoading && (
									<Text size="xSmall" color="weak">
										{formatNumber(totalCount)} total
									</Text>
								)}
							</Box>
							<LogsHistogram
								startDate={startDate}
								endDate={endDate}
								onDatesChange={handleDatesChange}
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
						numMoreTraces={numMoreTraces}
						traces={data?.traces}
						handleAdditionalTracesDateChange={
							handleAdditionTracesDateChange
						}
						resetMoreTraces={resetMoreTraces}
					/>
				</Box>
			</Box>

			<Outlet context={outletContext} />
		</>
	)
}
