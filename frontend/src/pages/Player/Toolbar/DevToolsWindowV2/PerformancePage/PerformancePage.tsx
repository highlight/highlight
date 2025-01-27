import { Box } from '@highlight-run/ui/components'
import Graph, { TIMESTAMP_KEY } from '@pages/Graphing/components/Graph'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import React from 'react'

import { useParams } from '@util/react-router/useParams'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { GraphContextProvider } from '@/pages/Graphing/context/GraphContext'

const PerformanceGraph = React.memo(
	({ metricName, color }: { metricName: string; color?: string }) => {
		const { session, sessionMetadata } = useReplayerContext()
		const { project_id } = useParams<{ project_id: string }>()
		return (
			<Box width="full" height="full" p="16">
				<Graph
					projectId={project_id!}
					productType={ProductType.Metrics}
					query={`secure_session_id=${session?.secure_id} AND metric_name=${metricName}`}
					startDate={new Date(sessionMetadata.startTime)}
					endDate={new Date(sessionMetadata.endTime)}
					groupByKeys={['metric_name']}
					bucketByKey={TIMESTAMP_KEY}
					bucketCount={60}
					limit={1_000}
					title={metricName}
					expressions={[
						{ aggregator: MetricAggregator.Avg, column: 'value' },
					]}
					viewConfig={{
						type: 'Line chart',
						display: 'Line',
						showLegend: true,
						nullHandling: 'Connected',
					}}
					syncId="session"
				/>
			</Box>
		)
	},
)

const PerformancePage = React.memo(() => {
	const graphContext = useGraphData()
	return (
		<GraphContextProvider value={graphContext}>
			<Box width="full" height="full" display="flex">
				<PerformanceGraph metricName="usedJSHeapSize" color="#0090FF" />
				<PerformanceGraph metricName="fps" color="#D6409F" />
				<PerformanceGraph metricName="Jank" color="#744ED4" />
			</Box>
		</GraphContextProvider>
	)
})

export default PerformancePage
