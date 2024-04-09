import { Box, Button, IconSolidPlus, Text } from '@highlight-run/ui/components'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'

import TimeRangePicker from '@/components/TimeRangePicker/TimeRangePicker'
import { useGetVisualizationQuery } from '@/graph/generated/hooks'
import useDataTimeRange from '@/hooks/useDataTimeRange'
import { useProjectId } from '@/hooks/useProjectId'
import Graph, { getViewConfig } from '@/pages/Graphing/components/Graph'
import { useParams } from '@/util/react-router/useParams'

import * as style from './Dashboard.css'

export const Dashboard = () => {
	const { dashboard_id } = useParams<{
		dashboard_id: string
	}>()

	const { projectId } = useProjectId()
	const { data } = useGetVisualizationQuery({
		variables: { id: dashboard_id! },
	})

	const { timeRange } = useDataTimeRange()

	const navigate = useNavigate()

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
							<Button emphasis="low" kind="secondary">
								Share
							</Button>
							<TimeRangePicker />
							<Button
								emphasis="low"
								kind="secondary"
								iconLeft={<IconSolidPlus />}
								onClick={() => {
									navigate('new')
								}}
							>
								Add graph
							</Button>
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
						>
							<Box cssClass={style.graphGrid}>
								{data?.visualization.graphs.map((g, idx) => {
									return (
										<Box
											key={idx}
											px="16"
											py="12"
											cssClass={style.graphDivider}
										>
											<Graph
												title={g.title}
												viewConfig={getViewConfig(
													g.type,
													g.display ?? undefined,
													g.nullHandling ?? undefined,
												)}
												productType={g.productType}
												projectId={projectId}
												startDate={timeRange.start_date}
												endDate={timeRange.end_date}
												query={g.query}
												metric={g.metric}
												functionType={g.functionType}
												bucketByKey={
													g.bucketByKey ?? undefined
												}
												bucketCount={
													g.bucketCount ?? undefined
												}
												groupByKey={
													g.groupByKey ?? undefined
												}
												limit={g.limit ?? undefined}
												limitFunctionType={
													g.limitFunctionType ??
													undefined
												}
												limitMetric={
													g.limitMetric ?? undefined
												}
												onShare={() => {}}
												onExpand={() => {
													navigate(`view/${g.id}`)
												}}
												onEdit={() => {
													navigate(`edit/${g.id}`)
												}}
											/>
										</Box>
									)
								})}
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
