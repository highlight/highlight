import DataCard from '@components/DataCard/DataCard'
import LineChart from '@components/LineChart/LineChart'
import {
	useGetDashboardDefinitionsQuery,
	useGetMetricsTimelineQuery,
} from '@graph/hooks'
import {
	MetricAggregator,
	MetricTagFilterOp,
	NetworkRequestAttribute,
} from '@graph/schemas'
import { LINE_COLORS } from '@pages/Dashboards/components/DashboardCard/DashboardCard'
import { findDashboardMetric } from '@pages/Dashboards/pages/Dashboard/DashboardPage'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getGraphQLResolverName } from '@pages/Player/utils/utils'
import { useParams } from '@util/react-router/useParams'
import { Dropdown, Menu } from 'antd'
import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'

import styles from './RequestMetrics.module.scss'

interface Props {
	resource: NetworkResource
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

	const duration = resource.responseEnd - resource.startTime
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
