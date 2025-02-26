import {
	Box,
	DEFAULT_TIME_PRESETS,
	IconSolidLoading,
	presetStartDate,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'
import { SortingState } from '@tanstack/react-table'

import { loadingIcon } from '@/components/Button/style.css'
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
import {
	useGetMetricsQuery,
	useGetWorkspaceSettingsQuery,
} from '@/graph/generated/hooks'
import {
	MetricAggregator,
	ProductType,
	SavedSegmentEntityType,
} from '@/graph/generated/schemas'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import analytics from '@/util/analytics'

import { MetricsTable } from './MetricsTable/MetricsTable'

// Define the metric structure based on what's shown in the screenshot
interface Metric {
	name: string
	lastConfigured: Date
	metricType: string
	serviceName: string
	dataPoints: number
}

export const MetricsPage: React.FC = () => {
	const { projectId } = useNumericProjectId()
	const { currentWorkspace } = useApplicationContext()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [_sortColumn] = useQueryParam(SORT_COLUMN, StringParam)
	const [_sortDirection] = useQueryParam(SORT_DIRECTION, StringParam)
	const [metrics, setMetrics] = useState<Metric[]>([])
	const [loading, setLoading] = useState(true)
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'dataPoints',
			desc: true,
		},
	])

	const searchTimeContext = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: FixedRangePreset,
	})
	const minDate = presetStartDate(DEFAULT_TIME_PRESETS[5])
	const timeMode: TIME_MODE = 'fixed-range'

	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})

	// Use the existing metrics query to get a sample of metrics data
	// This will help us extract unique metric names and their properties
	const { data: metricsData, loading: metricsLoading } = useGetMetricsQuery({
		variables: {
			product_type: ProductType.Metrics,
			project_id: projectId!,
			group_by: ['metric_name', 'service_name'],
			params: {
				query: query || '',
				date_range: {
					start_date: moment(searchTimeContext.startDate).format(
						TIME_FORMAT,
					),
					end_date: moment(searchTimeContext.endDate).format(
						TIME_FORMAT,
					),
				},
			},
			bucket_by: 'None',
			expressions: [
				{
					aggregator: MetricAggregator.Count,
					column: 'value',
				},
				{
					aggregator: MetricAggregator.Max,
					column: 'timestamp',
				},
			],
		},
		skip: !projectId,
		fetchPolicy: 'cache-and-network',
	})
	// Process metrics data to extract unique metrics and sort by frequency
	useEffect(() => {
		if (metricsData && !metricsLoading) {
			const uniqueMetrics = new Map<
				string,
				Metric & { metric_value: number; last_timestamp?: number }
			>()

			metricsData.metrics.buckets.forEach((bucket) => {
				if (bucket.group && bucket.group.length >= 2) {
					const metricName = bucket.group[0]
					const serviceName = bucket.group[1]
					const metricValue = bucket.metric_value || 0
					const isCountValue =
						bucket.metric_type === 'Count' &&
						bucket.column === 'value'
					const isTimestampValue =
						bucket.metric_type === 'Max' &&
						bucket.column === 'timestamp'

					if (!uniqueMetrics.has(metricName)) {
						uniqueMetrics.set(metricName, {
							name: metricName,
							lastConfigured: new Date(), // Default placeholder
							metricType: 'server.address', // Default placeholder value
							serviceName,
							metric_value: isCountValue ? metricValue : 0,
							dataPoints: isCountValue ? metricValue : 0,
							last_timestamp: isTimestampValue
								? metricValue
								: undefined,
						})
					} else {
						// Update the existing metric with new data
						const existingMetric = uniqueMetrics.get(metricName)!

						if (
							isCountValue &&
							metricValue > existingMetric.metric_value
						) {
							existingMetric.metric_value = metricValue
							existingMetric.dataPoints = metricValue
							existingMetric.serviceName = serviceName
						}

						if (isTimestampValue) {
							existingMetric.last_timestamp = metricValue
						}

						uniqueMetrics.set(metricName, existingMetric)
					}
				}
			})

			// Convert timestamps to dates and prepare metrics for display
			const processedMetrics = Array.from(uniqueMetrics.values())
				.map((metric) => {
					// Convert timestamp to Date if available
					if (metric.last_timestamp) {
						metric.lastConfigured = new Date(
							metric.last_timestamp * 1000,
						)
					}
					return metric
				})
				.map(({ metric_value: _, last_timestamp: __, ...rest }) => rest) // Remove helper properties

			setMetrics(processedMetrics)
			setLoading(false)
		}
	}, [metricsData, metricsLoading])

	useEffect(() => analytics.page('Metrics'), [])

	return (
		<SearchContext
			initialQuery={query}
			onSubmit={setQuery}
			aiMode={false}
			setAiMode={() => {}}
			onAiSubmit={() => {}}
			{...searchTimeContext}
		>
			<Helmet>
				<title>Metrics</title>
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
					flexDirection="column"
					display="flex"
					flexGrow={1}
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
						onDatesChange={searchTimeContext.updateSearchTime}
						productType={ProductType.Metrics}
						savedSegmentType={SavedSegmentEntityType.Metric}
						enableAIMode={
							workspaceSettings?.workspaceSettings
								?.ai_query_builder
						}
						aiSupportedSearch
					/>

					<Box height="full" overflow="auto">
						{loading ? (
							<Box
								alignItems="center"
								display="flex"
								flexDirection="row"
								gap="4"
								justifyContent="center"
								py="20"
							>
								<IconSolidLoading
									className={loadingIcon}
									color={vars.theme.static.content.weak}
								/>
								<Text size="small" color="weak">
									Loading metrics
								</Text>
							</Box>
						) : (
							<MetricsTable
								metrics={metrics}
								sorting={sorting}
								setSorting={setSorting}
							/>
						)}
					</Box>
				</Box>
			</Box>
		</SearchContext>
	)
}
