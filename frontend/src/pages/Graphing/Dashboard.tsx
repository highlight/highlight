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
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	Form,
	IconSolidChartBar,
	IconSolidCheveronRight,
	IconSolidPlus,
	IconSolidTemplate,
	presetStartDate,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { message } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'

import {
	useDeleteGraphMutation,
	useGetVisualizationQuery,
	useUpsertVisualizationMutation,
} from '@/graph/generated/hooks'
import { GetVisualizationQuery } from '@/graph/generated/operations'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { DashboardCard } from '@/pages/Graphing/components/DashboardCard'
import { EmptyDashboardCallout } from '@/pages/Graphing/components/EmptyDashboardCallout'
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
	const { data } = useGetVisualizationQuery({
		variables: { id: dashboard_id! },
	})

	useEffect(() => {
		if (data !== undefined) {
			setName(data.visualization.name)
			setGraphs(data.visualization.graphs)
		}
	}, [data])

	const [upsertViz] = useUpsertVisualizationMutation()

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: DEFAULT_TIME_PRESETS,
			initialPreset: DEFAULT_TIME_PRESETS[2],
		})

	const navigate = useNavigate()

	const [deleteGraph] = useDeleteGraphMutation()

	const noGraphs = graphs?.length === 0

	return (
		<>
			<Helmet>
				<title>Dashboard</title>
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
										Metrics
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
											if (data !== undefined) {
												setName(
													data?.visualization.name,
												)
												setGraphs(
													data?.visualization.graphs,
												)
											}
											setEditing(false)
											message.success(
												'Canceled dashboard changes',
											)
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
												optimisticResponse: {
													upsertVisualization:
														dashboard_id!,
												},
												update(cache) {
													const vizId =
														cache.identify({
															id: dashboard_id,
															__typename:
																'Visualization',
														})
													const graphs =
														graphIds?.map(
															(gId) => ({
																__ref: cache.identify(
																	{
																		id: gId,
																		__typename:
																			'Graph',
																	},
																),
															}),
														)
													cache.modify({
														id: vizId,
														fields: {
															name() {
																return name
															},
															graphs() {
																return graphs
															},
														},
													})
												},
											})
												.then(() => {
													message.success(
														'Dashboard updated',
													)
												})
												.catch(() =>
													message.error(
														'Failed to update dashboard',
													),
												)
											setEditing(false)
										}}
									>
										Save
									</Button>
								</>
							) : (
								<>
									<DateRangePicker
										emphasis="low"
										kind="secondary"
										selectedValue={{
											startDate,
											endDate,
											selectedPreset,
										}}
										onDatesChange={updateSearchTime}
										presets={DEFAULT_TIME_PRESETS}
										minDate={presetStartDate(
											DEFAULT_TIME_PRESETS[5],
										)}
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
											navigate({
												pathname: 'new',
												search: location.search,
											})
										}}
									>
										Add graph
									</Button>
								</>
							)}
						</Box>
					</Box>
					{noGraphs ? (
						<EmptyDashboardCallout />
					) : (
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
												const isTemp =
													g.id.startsWith('temp-')
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
															projectId={
																projectId
															}
															selectedPreset={
																selectedPreset
															}
															startDate={
																startDate
															}
															endDate={endDate}
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
																g.limit ??
																undefined
															}
															limitFunctionType={
																g.limitFunctionType ??
																undefined
															}
															limitMetric={
																g.limitMetric ??
																undefined
															}
															onDelete={
																isTemp
																	? undefined
																	: () => {
																			deleteGraph(
																				{
																					variables:
																						{
																							id: g.id,
																						},
																					optimisticResponse:
																						{
																							deleteGraph:
																								true,
																						},
																					update(
																						cache,
																					) {
																						const vizId =
																							cache.identify(
																								{
																									id: dashboard_id,
																									__typename:
																										'Visualization',
																								},
																							)
																						const graphId =
																							cache.identify(
																								{
																									id: g.id,
																									__typename:
																										'Graph',
																								},
																							)
																						cache.modify(
																							{
																								id: vizId,
																								fields: {
																									graphs(
																										existing: any[] = [],
																									) {
																										const filtered =
																											existing.filter(
																												(
																													e: any,
																												) =>
																													e.__ref !==
																													graphId,
																											)
																										return filtered
																									},
																								},
																							},
																						)
																					},
																				},
																			)
																				.then(
																					() =>
																						message.success(
																							'Metric view deleted',
																						),
																				)
																				.catch(
																					() =>
																						message.error(
																							'Failed to delete metric view',
																						),
																				)
																	  }
															}
															onExpand={
																isTemp
																	? undefined
																	: () => {
																			navigate(
																				{
																					pathname: `view/${g.id}`,
																					search: location.search,
																				},
																			)
																	  }
															}
															onEdit={
																isTemp
																	? undefined
																	: () => {
																			navigate(
																				{
																					pathname: `edit/${g.id}`,
																					search: location.search,
																				},
																			)
																	  }
															}
															disabled={editing}
															setTimeRange={
																updateSearchTime
															}
														/>
													</DashboardCard>
												)
											})}
										</SortableContext>
									</DndContext>
								</Box>
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</>
	)
}
