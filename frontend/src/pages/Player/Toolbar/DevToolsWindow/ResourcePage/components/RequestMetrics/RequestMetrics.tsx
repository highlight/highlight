import DataCard from '@components/DataCard/DataCard'
import LineChart from '@components/LineChart/LineChart'
import {
	useGetDashboardDefinitionsQuery,
	useGetMetricsTimelineQuery,
} from '@graph/hooks'
import {
	DashboardDefinition,
	DashboardMetricConfig,
	Maybe,
	MetricAggregator,
	MetricTagFilterOp,
	NetworkRequestAttribute,
} from '@graph/schemas'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getGraphQLResolverName } from '@pages/Player/utils/utils'
import { useParams } from '@util/react-router/useParams'
import { Dropdown, Menu } from 'antd'
import moment from 'moment'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

import styles from './RequestMetrics.module.css'

const LINE_COLORS = {
	[MetricAggregator.Min]: 'var(--color-gray-200)',
	[MetricAggregator.Max]: 'var(--color-red-500)',
	[MetricAggregator.P99]: 'var(--color-red-400)',
	[MetricAggregator.P95]: 'var(--color-orange-500)',
	[MetricAggregator.P90]: 'var(--color-green-600)',
	[MetricAggregator.P50]: 'var(--color-blue-400)',
	[MetricAggregator.Avg]: 'var(--color-gray-400)',
	[MetricAggregator.Count]: 'var(--color-green-500)',
	[MetricAggregator.CountDistinctKey]: 'var(--color-green-700)',
	[MetricAggregator.Sum]: 'var(--color-purple-700)',
}

interface Props {
	resource: NetworkResource
}

const findDashboardMetric = (
	dashboard: Maybe<DashboardDefinition>,
	metricConfig: DashboardMetricConfig,
) => {
	return dashboard?.metrics.find((metric) => {
		let isMatch = metric.name === metricConfig.name

		if (isMatch && metricConfig.filters) {
			isMatch = metricConfig.filters?.every((f) =>
				metric.filters?.some(
					(fi) => fi.tag === f.tag && fi.value === f.value,
				),
			)
		}

		return isMatch ? metric : false
	})
}

const RequestMetrics: React.FC<Props> = ({ resource }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const graphQlOperation = getGraphQLResolverName(resource)

	const filters = [
		{
			tag: 'url',
			op: MetricTagFilterOp.Equals,
			value: resource.name,
		},
	]

	if (graphQlOperation) {
		filters.push({
			tag: 'graphql_operation',
			op: MetricTagFilterOp.Equals,
			value: graphQlOperation,
		})
	}

	const { data } = useGetMetricsTimelineQuery({
		variables: {
			project_id: project_id!,
			metric_name: NetworkRequestAttribute.Latency,
			params: {
				aggregator: MetricAggregator.P50,
				date_range: {
					end_date: moment().format(),
					start_date: moment().subtract(1, 'hour').format(),
				},
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				resolution_minutes: 1,
				units: 'ms',
				filters,
			},
		},
		fetchPolicy: 'cache-first',
	})

	const { data: dashboardsData } = useGetDashboardDefinitionsQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	const duration = useMemo(() => {
		if (resource?.responseEndAbs && resource?.startTimeAbs) {
			return resource.responseEndAbs - resource.startTimeAbs
		}
		// used in highlight.run <8.8.0 for websocket events and <7.5.4 for requests
		return resource.responseEnd - resource.startTime
	}, [resource])

	const metricConfig = {
		name: 'latency',
		description: `Latency (${graphQlOperation || resource.name})`,
		filters,
	}

	const dashboardWithMetric = dashboardsData?.dashboard_definitions.find(
		(dashboard) => findDashboardMetric(dashboard, metricConfig),
	)

	const dashboardItems = dashboardsData?.dashboard_definitions
		.filter((dd) => dd?.name !== 'Home')
		.map((dd) => ({
			label: (
				<Link
					to={{
						pathname: `/${project_id}/dashboards/${dd?.id}`,
					}}
					state={{ metricConfig }}
				>
					{dd?.name}
				</Link>
			),
			key: dd?.id || 0,
		}))

	if (!data?.metrics_timeline.length) {
		return null
	}

	return (
		<div className={styles.requestMetrics}>
			<DataCard
				title={
					<>
						<h2>Request Metrics</h2>

						{dashboardWithMetric ? (
							<Link
								to={`/${project_id}/dashboards/${dashboardWithMetric.id}`}
							>
								View on Dashboard
							</Link>
						) : (
							<Dropdown.Button
								size="small"
								overlay={<Menu items={dashboardItems} />}
							>
								Add to Dashboard
							</Dropdown.Button>
						)}
					</>
				}
				fullWidth
			>
				<div className={styles.chartContainer}>
					<LineChart
						data={(data?.metrics_timeline || []).map((x) => ({
							date: x?.date,
							[MetricAggregator.P50]: x?.value,
						}))}
						xAxisDataKeyName="date"
						xAxisTickFormatter={(tickItem) =>
							moment(tickItem).format('h:mm')
						}
						xAxisProps={{
							domain: ['dataMin', 'dataMax'],
						}}
						lineColorMapping={LINE_COLORS}
						yAxisLabel="ms"
						referenceLines={[
							{
								label: 'This Request',
								value: duration,
								color: 'var(--color-red-500)',
							},
						]}
					/>
				</div>
			</DataCard>
		</div>
	)
}

export default RequestMetrics
