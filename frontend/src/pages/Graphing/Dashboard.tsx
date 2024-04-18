import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	arrayMove,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import {
	Box,
	Button,
	Form,
	IconSolidChartBar,
	IconSolidCheveronRight,
	IconSolidPlus,
	IconSolidTemplate,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { message } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'

import TimeRangePicker from '@/components/TimeRangePicker/TimeRangePicker'
import {
	useDeleteGraphMutation,
	useGetVisualizationQuery,
	useUpsertVisualizationMutation,
} from '@/graph/generated/hooks'
import {
	GetVisualizationQuery,
	namedOperations,
} from '@/graph/generated/operations'
import useDataTimeRange from '@/hooks/useDataTimeRange'
import { useProjectId } from '@/hooks/useProjectId'
import { DashboardCard } from '@/pages/Graphing/components/DashboardCard'
import Graph, { getViewConfig } from '@/pages/Graphing/components/Graph'
import { useParams } from '@/util/react-router/useParams'

import * as style from './Dashboard.css'

export const HeaderDivider = () => <Box cssClass={style.headerDivider} />

export const Dashboard = () => {
	const { dashboard_id } = useParams<{
		dashboard_id: string
	}>()

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	const [editing, setEditing] = useState(false)
	const [name, setName] = useState('')
	const [graphs, setGraphs] =
		useState<GetVisualizationQuery['visualization']['graphs']>()
	const handleDragEnd = (event: any) => {
		const { active, over } = event

		if (active.id !== over.id) {
			setGraphs((graphs) => {
				if (graphs === undefined) {
					return undefined
				}

				const oldIndex = graphs.findIndex((g) => g.id === active.id)
				const newIndex = graphs.findIndex((g) => g.id === over.id)

				return arrayMove(graphs, oldIndex, newIndex)
			})
		}
	}

	const { projectId } = useProjectId()
	const { refetch: refetchViz } = useGetVisualizationQuery({
		variables: { id: dashboard_id! },
		onCompleted: (d) => {
			setName(d.visualization.name)
			setGraphs(d.visualization.graphs)
		},
	})

	const [upsertViz] = useUpsertVisualizationMutation({
		refetchQueries: [namedOperations.Query.GetVisualizations],
	})

	const { timeRange } = useDataTimeRange()

	const navigate = useNavigate()

	const [deleteGraph] = useDeleteGraphMutation({
		refetchQueries: [namedOperations.Query.GetVisualization],
	})

	return (
		<>
			<Helmet>
				<title>{name}</title>
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
						<Stack direction="row" alignItems="center" gap="4">
							<Link to="..">
								<Stack>
									<Tag
										shape="basic"
										size="medium"
										kind="secondary"
										iconLeft={<IconSolidChartBar />}
									>
										Dashboards
									</Tag>
								</Stack>
							</Link>
							<IconSolidCheveronRight
								color={vars.theme.static.content.weak}
							/>
							{editing ? (
								<Form autoComplete="off">
									<Form.Input
										name="name"
										value={name}
										onChange={(e) => {
											setName(e.target.value)
										}}
										placeholder="Untitled dashboard"
									></Form.Input>
								</Form>
							) : (
								<Text
									size="small"
									weight="medium"
									color="default"
								>
									{name}
								</Text>
							)}
						</Stack>
						<Box display="flex" gap="4">
							{editing ? (
								<>
									<Button
										emphasis="low"
										kind="secondary"
										onClick={() => {
											refetchViz()
												.then((d) => {
													setName(
														d.data.visualization
															.name,
													)
													setGraphs(
														d.data.visualization
															.graphs,
													)
													setEditing(false)
													message.success(
														'Reverted dashboard changes',
													)
												})
												.catch(() => {
													setEditing(false)
													message.error(
														'Failed to refetch dashboard',
													)
												})
										}}
									>
										Cancel
									</Button>
									<Button
										emphasis="high"
										kind="primary"
										onClick={() => {
											const graphIds = graphs?.map(
												(g) => g.id,
											)
											upsertViz({
												variables: {
													visualization: {
														projectId,
														id: dashboard_id,
														name,
														graphIds: graphIds,
													},
												},
											})
												.then(() => {
													setEditing(false)
													message.success(
														'Dashboard updated',
													)
												})
												.catch(() =>
													message.error(
														'Failed to update dashboard',
													),
												)
										}}
									>
										Save
									</Button>
								</>
							) : (
								<>
									<Button emphasis="low" kind="secondary">
										Share
									</Button>
									<TimeRangePicker
										emphasis="low"
										kind="secondary"
									/>
									<HeaderDivider />
									<Button
										emphasis="low"
										kind="secondary"
										iconLeft={<IconSolidTemplate />}
										onClick={() => {
											setEditing(true)
										}}
									>
										Edit dashboard
									</Button>
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
								</>
							)}
						</Box>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						height="full"
						cssClass={style.dashboardContent}
					>
						<Box
							display="flex"
							position="relative"
							width="full"
							height="full"
						>
							<Box
								cssClass={clsx(style.graphGrid, {
									[style.gridEditing]: editing,
								})}
							>
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={handleDragEnd}
								>
									<SortableContext
										items={graphs ?? []}
										strategy={rectSortingStrategy}
										disabled={!editing}
									>
										{graphs?.map((g) => {
											return (
												<DashboardCard
													id={g.id}
													key={g.id}
													editing={editing}
												>
													<Graph
														title={g.title}
														viewConfig={getViewConfig(
															g.type,
															g.display ??
																undefined,
															g.nullHandling ??
																undefined,
														)}
														productType={
															g.productType
														}
														projectId={projectId}
														startDate={
															timeRange.start_date
														}
														endDate={
															timeRange.end_date
														}
														query={g.query}
														metric={g.metric}
														functionType={
															g.functionType
														}
														bucketByKey={
															g.bucketByKey ??
															undefined
														}
														bucketCount={
															g.bucketCount ??
															undefined
														}
														groupByKey={
															g.groupByKey ??
															undefined
														}
														limit={
															g.limit ?? undefined
														}
														limitFunctionType={
															g.limitFunctionType ??
															undefined
														}
														limitMetric={
															g.limitMetric ??
															undefined
														}
														onDelete={() => {
															deleteGraph({
																variables: {
																	id: g.id,
																},
															})
																.then(() =>
																	message.success(
																		'Metric view deleted',
																	),
																)
																.catch(() =>
																	message.error(
																		'Failed to delete metric view',
																	),
																)
														}}
														onExpand={() => {
															navigate(
																`view/${g.id}`,
															)
														}}
														onEdit={() => {
															navigate(
																`edit/${g.id}`,
															)
														}}
														disabled={editing}
													/>
												</DashboardCard>
											)
										})}
									</SortableContext>
								</DndContext>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
