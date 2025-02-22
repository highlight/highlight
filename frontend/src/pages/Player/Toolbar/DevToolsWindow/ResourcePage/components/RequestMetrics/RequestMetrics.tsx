import { useGetMetricsQuery } from '@graph/hooks'
import { MetricAggregator, MetricBucketBy, ProductType } from '@graph/schemas'
import { LineChart } from '@/pages/Graphing/components/LineChart'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getGraphQLResolverName } from '@pages/Player/utils/utils'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React from 'react'
import styles from './RequestMetrics.module.css'
import { TIMESTAMP_KEY, useGraphData } from '@pages/Graphing/components/Graph'

interface Props {
	resource: NetworkResource
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
