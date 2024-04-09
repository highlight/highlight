import { Box, Button, Text } from '@highlight-run/ui/components'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'

import TimeRangePicker from '@/components/TimeRangePicker/TimeRangePicker'
import { useGetVisualizationQuery } from '@/graph/generated/hooks'
import useDataTimeRange from '@/hooks/useDataTimeRange'
import { useProjectId } from '@/hooks/useProjectId'
import Graph, { getViewConfig } from '@/pages/Graphing/components/Graph'
import { useParams } from '@/util/react-router/useParams'

import * as style from './Dashboard.css'

export const ExpandedGraph = () => {
	const { dashboard_id, graph_id } = useParams<{
		dashboard_id: string
		graph_id: string
	}>()

	const { projectId } = useProjectId()

	const { data } = useGetVisualizationQuery({
		variables: { id: dashboard_id! },
	})

	const { timeRange } = useDataTimeRange()

	const navigate = useNavigate()

	const g = data?.visualization.graphs.find((g) => g.id === graph_id)
	if (g === undefined) {
		return null
	}

	return (
		<>
			<Helmet>
				<title>Edit Metric View</title>
			</Helmet>
			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
			>
				<Box
					background="white"
					borderRadius="6"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="medium"
				>
					<Box
						width="full"
						cssClass={style.editGraphHeader}
						borderBottom="dividerWeak"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						paddingLeft="12"
						paddingRight="8"
						py="6"
					>
						<Text size="small" weight="medium">
							{data?.visualization.name}
						</Text>
						<Box display="flex" gap="4">
							<Button
								emphasis="low"
								kind="secondary"
								onClick={() => {
									navigate(`../${dashboard_id}`)
								}}
							>
								Cancel
							</Button>
							<TimeRangePicker />
						</Box>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						height="full"
					>
						<Box
							display="flex"
							position="relative"
							width="full"
							height="full"
							px="12"
							py="16"
						>
							<Graph
								title={g.title}
								viewConfig={getViewConfig(
									g.type,
									g.display,
									g.nullHandling,
								)}
								productType={g.productType}
								projectId={projectId}
								startDate={timeRange.start_date}
								endDate={timeRange.end_date}
								query={g.query}
								metric={g.metric}
								functionType={g.functionType}
								bucketByKey={g.bucketByKey ?? undefined}
								bucketCount={g.bucketCount ?? undefined}
								groupByKey={g.groupByKey ?? undefined}
								limit={g.limit ?? undefined}
								limitFunctionType={
									g.limitFunctionType ?? undefined
								}
								limitMetric={g.limitMetric ?? undefined}
							/>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
