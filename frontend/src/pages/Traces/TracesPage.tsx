import { Box, defaultPresets, Text } from '@highlight-run/ui'
import _ from 'lodash'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Outlet } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'

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
	useGetTracesMetricsQuery,
	useGetTracesQuery,
} from '@/graph/generated/hooks'
import { SortDirection, TracesMetricType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import LogsHistogram from '@/pages/LogsPage/LogsHistogram/LogsHistogram'
import { LatencyChart } from '@/pages/Traces/LatencyChart'
import { TracesList } from '@/pages/Traces/TracesList'
import { formatNumber } from '@/util/numbers'

import * as styles from './TracesPage.css'

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
				group_by: [],
				params: {
					query: serverQuery,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(endDate).format(TIME_FORMAT),
					},
				},
				metric_types: [
					TracesMetricType.Count,
					TracesMetricType.P50,
					TracesMetricType.P90,
				],
			},
			skip: !projectId,
		})

	const histogramBuckets = metricsData?.traces_metrics.buckets
		.filter((b) => b.metric_type === TracesMetricType.Count)
		.map((b) => ({
			bucketId: b.bucket_id,
			counts: [{ level: 'traces', count: b.metric_value }],
		}))

	const totalCount = _.sumBy(
		metricsData?.traces_metrics.buckets.filter(
			(b) => b.metric_type === TracesMetricType.Count,
		),
		(b) => b.metric_value,
	)

	const metricsBuckets: {
		p50: number | undefined
		p90: number | undefined
	}[] = []
	for (let i = 0; i < metricsData?.traces_metrics.bucket_count; i++) {
		metricsBuckets.push({ p50: undefined, p90: undefined })
	}

	metricsData?.traces_metrics.buckets.forEach((b) => {
		switch (b.metric_type) {
			case TracesMetricType.P50:
				metricsBuckets[b.bucket_id].p50 = b.metric_value / 1_000_000
				break
			case TracesMetricType.P90:
				metricsBuckets[b.bucket_id].p90 = b.metric_value / 1_000_000
				break
		}
	})

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
					<Box display="flex" borderBottom="dividerWeak">
						<Box
							width="full"
							padding="8"
							paddingBottom="4"
							borderRight="dividerWeak"
						>
							<Box
								display="flex"
								flexDirection="row"
								gap="4"
								paddingBottom="4"
							>
								<Text size="xSmall">Traces</Text>
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
						>
							<Text cssClass={styles.chartText} size="xSmall">
								Latency
							</Text>
							<LatencyChart metricsBuckets={metricsBuckets} />
						</Box>
					</Box>

					<TracesList traces={data?.traces} loading={loading} />
				</Box>
			</Box>

			<Outlet />
		</>
	)
}
