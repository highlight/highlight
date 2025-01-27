import { Box } from '@highlight-run/ui/components'
import { TIMESTAMP_KEY, useGraphData } from '@pages/Graphing/components/Graph'
import { LineChart } from '@pages/Graphing/components/LineChart'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import React from 'react'

import { TIME_FORMAT } from '@components/Search/SearchForm/constants'
import { useParams } from '@util/react-router/useParams'
import { useGetMetricsQuery } from '@/graph/generated/hooks'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import moment from 'moment'

const Graph = React.memo(
	({ metricName, color }: { metricName: string; color?: string }) => {
		const { session, sessionMetadata } = useReplayerContext()
		const { project_id } = useParams<{ project_id: string }>()

		const start = moment(sessionMetadata.startTime)
		const end = moment(sessionMetadata.endTime)
		const { data: metricsData } = useGetMetricsQuery({
			variables: {
				product_type: ProductType.Metrics,
				project_id: project_id!,
				params: {
					date_range: {
						start_date: start.format(TIME_FORMAT),
						end_date: end.format(TIME_FORMAT),
					},
					query: `secure_session_id=${session?.secure_id} AND metric_name=${metricName}`,
				},
				group_by: ['metric_name'],
				bucket_by: TIMESTAMP_KEY,
				bucket_count: 60,
				limit: 1_000,
				expressions: [
					{ aggregator: MetricAggregator.Avg, column: 'value' },
				],
			},
		})

		const data = useGraphData(metricsData, TIMESTAMP_KEY) ?? []

		if (!data?.length) return null
		return (
			<Box width="full" height="full" p="16">
				<Box
					width="full"
					height="full"
					p="16"
					key=";" // Hacky but recharts' ResponsiveContainer has issues when this height changes so just rerender the whole thing
				>
					<LineChart
						data={data}
						xAxisMetric={TIMESTAMP_KEY}
						viewConfig={{
							type: 'Line chart',
							display: 'Line',
							showLegend: true,
							nullHandling: 'Connected',
						}}
						strokeColors={color ? [color] : undefined}
						syncId="session"
					/>
				</Box>
			</Box>
		)
	},
)

const PerformancePage = React.memo(() => {
	return (
		<Box width="full" height="full" display="flex" gap="4">
			<Graph metricName="usedJSHeapSize" color="#0090FF" />
			<Graph metricName="fps" color="#D6409F" />
			<Graph metricName="Jank" color="#744ED4" />
		</Box>
	)
})

export default PerformancePage
