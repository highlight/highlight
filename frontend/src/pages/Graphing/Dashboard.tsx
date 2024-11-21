import { toast } from '@components/Toaster'
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
	IconSolidChartBar,
	IconSolidCheveronRight,
	IconSolidClock,
	IconSolidCog,
	IconSolidPlus,
	parsePreset,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'
import { useEffect, useId, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'

import {
	useDeleteGraphMutation,
	useGetVisualizationQuery,
	useUpsertGraphMutation,
	useUpsertVisualizationMutation,
} from '@/graph/generated/hooks'
import { GetVisualizationQuery } from '@/graph/generated/operations'
import { GraphInput } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { DashboardCard } from '@/pages/Graphing/components/DashboardCard'
import { EmptyDashboardCallout } from '@/pages/Graphing/components/EmptyDashboardCallout'
import Graph, { getViewConfig } from '@/pages/Graphing/components/Graph'
import { useParams } from '@/util/react-router/useParams'

import * as style from './Dashboard.css'
import { DashboardSettingsModal } from '@/pages/Graphing/components/DashboardSettingsModal'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'

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

	const [showModal, setShowModal] = useState(false)

	const [graphs, setGraphs] =
		useState<GetVisualizationQuery['visualization']['graphs']>()
	const handleDragEnd = (event: any) => {
		const { active, over } = event

		if (active.id !== over.id) {
			if (graphs === undefined) {
				return undefined
			}

			const oldIndex = graphs.findIndex((g) => g.id === active.id)
			const newIndex = graphs.findIndex((g) => g.id === over.id)

			const newGraphs = arrayMove(graphs, oldIndex, newIndex)
			setGraphs(newGraphs)

			const graphIds = newGraphs?.map((g) => g.id)
			upsertViz({
				variables: {
					visualization: {
						projectId,
						id: dashboard_id,
						graphIds: graphIds,
					},
				},
				optimisticResponse: {
					upsertVisualization: dashboard_id!,
				},
				update(cache) {
					const vizId = cache.identify({
						id: dashboard_id,
						__typename: 'Visualization',
					})
					const graphs = graphIds?.map((gId) => ({
						__ref: cache.identify({
							id: gId,
							__typename: 'Graph',
						}),
					}))
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
					toast.success('Dashboard updated')
				})
				.catch(() => toast.error('Failed to update dashboard'))
		}
	}

	const { projectId } = useProjectId()
	const { data } = useGetVisualizationQuery({
		variables: { id: dashboard_id! },
	})

	const [upsertViz] = useUpsertVisualizationMutation()

	const { presets, minDate } = useRetentionPresets()

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: presets,
			initialPreset: DEFAULT_TIME_PRESETS[2],
		})

	useEffect(() => {
		if (data) {
			setGraphs(data.visualization.graphs)
			const preset = data.visualization.timePreset
			if (preset) {
				updateSearchTime(new Date(), new Date(), parsePreset(preset))
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	const navigate = useNavigate()

	const [deleteGraph] = useDeleteGraphMutation()
	const [upsertGraph] = useUpsertGraphMutation()
	const tempId = useId()

	const noGraphs = graphs?.length === 0

	return (
		<>
			<Helmet>
				<title>Dashboard</title>
			</Helmet>
			<DashboardSettingsModal
				showModal={showModal}
				onHideModal={() => {
					setShowModal(false)
				}}
				dashboardId={dashboard_id!}
				settings={data?.visualization}
			/>
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

							<Text size="small" weight="medium" color="default">
								{data?.visualization.name}
							</Text>
						</Stack>
						<Box display="flex" gap="4">
							<>
								<DateRangePicker
									emphasis="medium"
									kind="secondary"
									iconLeft={<IconSolidClock size={14} />}
									selectedValue={{
										startDate,
										endDate,
										selectedPreset,
									}}
									onDatesChange={updateSearchTime}
									presets={presets}
									minDate={minDate}
								/>
								<HeaderDivider />
								<Button
									emphasis="medium"
									kind="secondary"
									iconLeft={<IconSolidCog size={14} />}
									onClick={() => {
										setShowModal(true)
									}}
								>
									Settings
								</Button>
								<Button
									emphasis="medium"
									kind="secondary"
									iconLeft={<IconSolidPlus size={14} />}
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
								<Box cssClass={clsx(style.graphGrid)}>
									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragEnd={handleDragEnd}
									>
										<SortableContext
											items={graphs ?? []}
											strategy={rectSortingStrategy}
										>
											{graphs?.map((g) => {
												const isTemp =
													g.id.startsWith('temp-')
												return (
													<DashboardCard
														id={g.id}
														key={g.id}
														onClone={
															isTemp
																? undefined
																: () => {
																		const graphInput: GraphInput =
																			{
																				visualizationId:
																					dashboard_id!,
																				afterGraphId:
																					g.id,
																				bucketByKey:
																					g.bucketByKey,
																				bucketCount:
																					g.bucketCount,
																				display:
																					g.display,
																				functionType:
																					g.functionType,
																				groupByKey:
																					g.groupByKey,
																				limit: g.limit,
																				limitFunctionType:
																					g.limitFunctionType,
																				limitMetric:
																					g.limitMetric,
																				metric: g.metric,
																				nullHandling:
																					g.nullHandling,
																				productType:
																					g.productType,
																				query: g.query,
																				title: g.title,
																				type: g.type,
																			}

																		upsertGraph(
																			{
																				variables:
																					{
																						graph: graphInput,
																					},
																				optimisticResponse:
																					{
																						upsertGraph:
																							{
																								...graphInput,
																								id: `temp-${tempId}`,
																								__typename:
																									'Graph',
																							},
																					},
																				update(
																					cache,
																					result,
																				) {
																					const vizId =
																						cache.identify(
																							{
																								id: dashboard_id,
																								__typename:
																									'Visualization',
																							},
																						)
																					const afterGraphId =
																						cache.identify(
																							{
																								id: g.id,
																								__typename:
																									'Graph',
																							},
																						)
																					const graphId =
																						cache.identify(
																							{
																								id: result
																									.data
																									?.upsertGraph
																									.id,
																								__typename:
																									'Graph',
																							},
																						)
																					cache.modify(
																						{
																							id: vizId,
																							fields: {
																								graphs(
																									existing = [],
																								) {
																									const idx =
																										existing.findIndex(
																											(
																												e: any,
																											) =>
																												e.__ref ===
																												afterGraphId,
																										)
																									const clone =
																										[
																											...existing,
																										]
																									clone.splice(
																										idx,
																										0,
																										{
																											__ref: graphId,
																										},
																									)
																									return clone
																								},
																							},
																						},
																					)
																				},
																			},
																		)
																			.then(
																				() => {
																					toast.success(
																						`Metric view cloned`,
																					)
																				},
																			)
																			.catch(
																				() => {
																					toast.error(
																						'Failed to clone metric view',
																					)
																				},
																			)
																	}
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
																									existing = [],
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
																					toast.success(
																						'Metric view deleted',
																					),
																			)
																			.catch(
																				() =>
																					toast.error(
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
															bucketByWindow={
																g.bucketInterval ??
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
															setTimeRange={
																updateSearchTime
															}
															height={280}
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
