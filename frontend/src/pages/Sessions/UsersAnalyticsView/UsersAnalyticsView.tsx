import { Box, Text } from '@highlight-run/ui/components'
import Graph, { ChartProps, ViewConfig } from '@pages/Graphing/components/Graph'
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

import { useSearchContext } from '@/components/Search/SearchContext'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { GraphContextProvider } from '@/pages/Graphing/context/GraphContext'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'

export const UsersAnalyticsView: React.FC = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const { startDate, endDate, initialQuery } = useSearchContext()
	const graphContext = useGraphData()

	// Configure the table view
	const viewConfig: ViewConfig = useMemo(
		() => ({
			type: 'Table',
			showLegend: false,
			nullHandling: 'Hidden',
		}),
		[],
	)

	// Configure the metric expressions for user analytics
	const expressions = useMemo(
		() => [
			{
				aggregator: MetricAggregator.Count,
				column: '', // Count of sessions
			},
			{
				aggregator: MetricAggregator.Sum,
				column: 'active_length',
			},
			{
				aggregator: MetricAggregator.Sum,
				column: 'length',
			},
		],
		[],
	)

	if (!project_id || !startDate || !endDate) {
		return (
			<Box padding="12">
				<Text>Loading...</Text>
			</Box>
		)
	}

	const graphProps: ChartProps<ViewConfig> = {
		productType: ProductType.Sessions,
		projectId: project_id,
		startDate,
		endDate,
		query: initialQuery,
		groupByKeys: ['identifier'],
		bucketByKey: undefined, // No bucketing - just group by identifier
		viewConfig,
		expressions,
		limit: 100, // Show top 100 users
		limitFunctionType: MetricAggregator.Count,
		limitMetric: undefined,
	}

	return (
		<GraphContextProvider value={graphContext}>
			<Box
				display="flex"
				flexDirection="column"
				height="full"
				width="full"
				padding="12"
				gap="12"
			>
				<Box>
					<Text size="large" weight="bold">
						User Analytics
					</Text>
					<Text size="small" color="weak">
						Aggregated session stats by user identifier
					</Text>
				</Box>
				<Box
					style={{ height: 'calc(100vh - 200px)' }}
					width="full"
					overflow="auto"
				>
					<Graph {...graphProps} />
				</Box>
			</Box>
		</GraphContextProvider>
	)
}
