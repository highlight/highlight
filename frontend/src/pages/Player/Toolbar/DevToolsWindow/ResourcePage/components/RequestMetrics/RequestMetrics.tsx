import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
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
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/ResourcePage'
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
			project_id,
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
		variables: { project_id },
	})

	const duration = resource.responseEnd - resource.startTime
	const filter = graphQlOperation
		? { tag: 'graphql_operation', value: graphQlOperation }
		: { tag: 'url', value: resource.name }

	const dashboardWithMetric = dashboardsData?.dashboard_definitions.find(
		(dashboard) => findDashboardMetric(dashboard, 'latency', filter),
	)

	// If it's a GraphQL request, add a filter to the param.
	const urlParams = new URLSearchParams(
		`addToDashboard=latency&filterTag=${filter.tag}&filterValue=${filter.value}`,
	)

	const dashboardItems = dashboardsData?.dashboard_definitions
		.filter((dd) => dd?.name !== 'Home')
		.map((dd) => ({
			label: (
				<Link
					to={`/${project_id}/dashboards/${
						dd?.id
					}?${urlParams.toString()}`}
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
			<div>
				{dashboardWithMetric ? (
					<ButtonLink
						trackingId="viewDashboardFromNetworkRequestDetails"
						to={`/${project_id}/dashboards/${dashboardWithMetric.id}`}
					>
						View on {dashboardWithMetric.name} Dashboard
					</ButtonLink>
				) : (
					<Dropdown.Button overlay={<Menu items={dashboardItems} />}>
						Add to Dashboard
					</Dropdown.Button>
				)}

				<LineChart
					height={275}
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
		</div>
	)
}

export default RequestMetrics
