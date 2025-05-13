import { Box } from '@highlight-run/ui/components'
import Graph, { TIMESTAMP_KEY } from '@pages/Graphing/components/Graph'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import React from 'react'

import { useParams } from '@util/react-router/useParams'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { GraphContextProvider } from '@/pages/Graphing/context/GraphContext'

type PerformanceGraphProps = {
	metricName: string
	title: string
	sessionSecureId?: string
	startTime: number
	endTime: number
}

const PerformanceGraph = React.memo(
	({
		metricName,
		title,
		sessionSecureId,
		startTime,
		endTime,
	}: PerformanceGraphProps) => {
		const { project_id } = useParams<{ project_id: string }>()
		return (
			<Box width="full" height="full" p="16">
				<Graph
					projectId={project_id!}
					productType={ProductType.Metrics}
					query={`secure_session_id=${sessionSecureId} AND metric_name=${metricName}`}
					startDate={new Date(startTime)}
					endDate={new Date(endTime)}
					groupByKeys={['metric_name']}
					bucketByKey={TIMESTAMP_KEY}
					bucketCount={60}
					limit={1_000}
					title={title}
					expressions={[
						{ aggregator: MetricAggregator.Avg, column: 'value' },
					]}
					viewConfig={{
						type: 'Line chart',
						display: 'Line',
						showLegend: false,
						nullHandling: 'Connected',
					}}
					syncId="session"
				/>
			</Box>
		)
	},
)

const PerformancePage = () => {
	const graphContext = useGraphData()
	const { session, sessionMetadata } = useReplayerContext()

	const sessionProps = {
		sessionSecureId: session?.secure_id,
		startTime: sessionMetadata.startTime,
		endTime: sessionMetadata.endTime,
	}

	return (
		<GraphContextProvider value={graphContext}>
			<Box width="full" height="full" display="flex">
				<PerformanceGraph
					metricName="usedJSHeapSize"
					title="Browser Memory Usage"
					{...sessionProps}
				/>
				<PerformanceGraph
					metricName="fps"
					title="Render FPS"
					{...sessionProps}
				/>
				<PerformanceGraph
					metricName="Jank"
					title="Render Jank"
					{...sessionProps}
				/>
			</Box>
		</GraphContextProvider>
	)
}

export default PerformancePage
