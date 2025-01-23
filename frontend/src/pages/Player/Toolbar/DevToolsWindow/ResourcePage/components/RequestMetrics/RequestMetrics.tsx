import {
	useGetDashboardDefinitionsQuery,
	useGetMetricsQuery,
} from '@graph/hooks'
import {
	DashboardDefinition,
	DashboardMetricConfig,
	Maybe,
	MetricAggregator,
	MetricBucketBy,
	ProductType,
} from '@graph/schemas'
import { LineChart } from '@/pages/Graphing/components/LineChart'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getGraphQLResolverName } from '@pages/Player/utils/utils'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'
import styles from './RequestMetrics.module.css'
import { TIMESTAMP_KEY, useGraphData } from '@pages/Graphing/components/Graph'

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
	const [dateRange, _] = React.useState<{
		start: moment.Moment
		end: moment.Moment
	}>({
		start: moment().subtract(1, 'hour'),
		end: moment(),
	})

	const { data } = useGetMetricsQuery({
		variables: {
			product_type: ProductType.Traces,
			project_id: project_id!,
			params: {
				date_range: {
					start_date: dateRange.start.toISOString(true),
					end_date: dateRange.end.toISOString(true),
				},
				query: `http.url="${resource.name}" graphql.operation.name="${graphQlOperation}"`,
			},
			expressions: [
				{ aggregator: MetricAggregator.P50, column: 'duration' },
			],
			group_by: [],
			bucket_by: MetricBucketBy.Timestamp,
			bucket_window: 60,
		},
		fetchPolicy: 'cache-first',
	})

	const chartData = useGraphData(data, TIMESTAMP_KEY)

	const { data: dashboardsData } = useGetDashboardDefinitionsQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	const metricConfig = {
		name: 'latency',
		description: `Latency (${graphQlOperation || resource.name})`,
		// TODO(vkorolik)
		filters: [],
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

	if (!data?.metrics?.buckets) {
		return null
	}

	return (
		<div className={styles.requestMetrics}>
			<div className={styles.chartContainer}>
				<LineChart
					data={chartData}
					xAxisMetric={TIMESTAMP_KEY}
					viewConfig={{
						type: 'Line chart',
						showLegend: false,
					}}
					showGrid
				/>
			</div>
		</div>
	)
}

export default RequestMetrics
