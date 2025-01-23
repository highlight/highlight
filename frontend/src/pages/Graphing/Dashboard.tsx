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
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	IconSolidChartBar,
	IconSolidCheveronRight,
	IconSolidClock,
	IconSolidCog,
	IconSolidPlus,
	parsePreset,
	presetStartDate,
	presetValue,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'
import { useCallback, useEffect, useId, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'

import {
	useDeleteGraphMutation,
	useGetVisualizationQuery,
	useUpsertGraphMutation,
	useUpsertVisualizationMutation,
} from '@/graph/generated/hooks'
import { GetVisualizationQuery } from '@/graph/generated/operations'
import { GraphInput, Graph as TGraph } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { DashboardCard } from '@/pages/Graphing/components/DashboardCard'
import { EmptyDashboardCallout } from '@/pages/Graphing/components/EmptyDashboardCallout'
import Graph, { useGetViewConfig } from '@/pages/Graphing/components/Graph'
import { useParams } from '@/util/react-router/useParams'

import * as style from './Dashboard.css'
import { DashboardSettingsModal } from '@/pages/Graphing/components/DashboardSettingsModal'
import { VariablesBar } from '@/pages/Graphing/components/VariablesBar'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { loadFunnelStep } from '@pages/Graphing/util'
import { GraphContextProvider, useGraphContext } from './context/GraphContext'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { exportGraph } from '@pages/Graphing/hooks/exportGraph'
import { useGraphTime } from '@/pages/Graphing/hooks/useGraphTime'

export const HeaderDivider = () => <Box cssClass={style.headerDivider} />

type DashboardCellProps = {
	g: TGraph
	startDate: Date
	endDate: Date
	updateSearchTime: (start: Date, end: Date, preset?: DateRangePreset) => void
}

const DashboardCell = ({
	g,
	startDate,
	endDate,
	updateSearchTime,
}: DashboardCellProps) => {
	const { projectId } = useProjectId()
	const { dashboard_id } = useParams<{
		dashboard_id: string
	}>()

	const graphContext = useGraphContext()

	const isTemp = g.id.startsWith('temp-')
	const [deleteGraph] = useDeleteGraphMutation()
	const [upsertGraph] = useUpsertGraphMutation()
	const tempId = useId()

	const { values } = useGraphingVariables(dashboard_id!)

	const navigate = useNavigate()

	const onDownload = useCallback(
		(g: TGraph) => {
			return exportGraph(
				g.id,
				g.title,
				graphContext.graphData.current
					? graphContext.graphData.current[g.id]
					: [],
			)
		},
		[graphContext.graphData],
	)

	const viewConfig = useGetViewConfig(
		g.type,
		g.display ?? undefined,
		g.nullHandling ?? undefined,
	)

	return (
		<DashboardCard
			id={g.id}
			key={g.id}
			onClone={
				isTemp
					? undefined
					: () => {
							const graphInput: GraphInput = {
								visualizationId: dashboard_id!,
								afterGraphId: g.id,
								bucketByKey: g.bucketByKey,
								bucketCount: g.bucketCount,
								bucketInterval: g.bucketInterval,
								display: g.display,
								groupByKeys: g.groupByKeys,
								limit: g.limit,
								limitFunctionType: g.limitFunctionType,
								limitMetric: g.limitMetric,
								funnelSteps: g.funnelSteps,
								nullHandling: g.nullHandling,
								productType: g.productType,
								query: g.query,
								title: g.title,
								type: g.type,
								expressions: g.expressions,
							}

							upsertGraph({
								variables: {
									graph: graphInput,
								},
								optimisticResponse: {
									upsertGraph: {
										...graphInput,
										id: `temp-${tempId}`,
										__typename: 'Graph',
									},
								},
								update(cache, result) {
									const vizId = cache.identify({
										id: dashboard_id,
										__typename: 'Visualization',
									})
									const afterGraphId = cache.identify({
										id: g.id,
										__typename: 'Graph',
									})
									const graphId = cache.identify({
										id: result.data?.upsertGraph.id,
										__typename: 'Graph',
									})
									cache.modify({
										id: vizId,
										fields: {
											graphs(existing = []) {
												const idx = existing.findIndex(
													(e: any) =>
														e.__ref ===
														afterGraphId,
												)
												const clone = [...existing]
												clone.splice(idx, 0, {
													__ref: graphId,
												})
												return clone
											},
										},
									})
								},
							})
								.then(() => {
									toast.success(`Metric view cloned`)
								})
								.catch(() => {
									toast.error('Failed to clone metric view')
								})
						}
			}
			onDelete={
				isTemp
					? undefined
					: () => {
							deleteGraph({
								variables: {
									id: g.id,
								},
								optimisticResponse: {
									deleteGraph: true,
								},
								update(cache) {
									const vizId = cache.identify({
										id: dashboard_id,
										__typename: 'Visualization',
									})
									const graphId = cache.identify({
										id: g.id,
										__typename: 'Graph',
									})
									cache.modify({
										id: vizId,
										fields: {
											graphs(existing = []) {
												const filtered =
													existing.filter(
														(e: any) =>
															e.__ref !== graphId,
													)
												return filtered
											},
										},
									})
								},
							})
								.then(() =>
									toast.success('Metric view deleted'),
								)
								.catch(() =>
									toast.error('Failed to delete metric view'),
								)
						}
			}
			onExpand={
				isTemp
					? undefined
					: () => {
							navigate({
								pathname: `view/${g.id}`,
								search: location.search,
							})
						}
			}
			onEdit={
				isTemp
					? undefined
					: () => {
							navigate({
								pathname: `edit/${g.id}`,
								search: location.search,
							})
						}
			}
			onDownload={() => onDownload(g)}
		>
			<Graph
				id={g.id}
				title={g.title}
				viewConfig={viewConfig}
				productType={g.productType}
				projectId={projectId}
				startDate={startDate}
				endDate={endDate}
				query={g.query}
				expressions={g.expressions}
				bucketByKey={g.bucketByKey ?? undefined}
				bucketByWindow={g.bucketInterval ?? undefined}
				bucketCount={g.bucketCount ?? undefined}
				groupByKeys={g.groupByKeys ?? undefined}
				limit={g.limit ?? undefined}
				limitFunctionType={g.limitFunctionType ?? undefined}
				limitMetric={g.limitMetric ?? undefined}
				funnelSteps={(g.funnelSteps ?? []).map(loadFunnelStep)}
				setTimeRange={updateSearchTime}
				variables={values}
				height={280}
				syncId={dashboard_id}
			/>
		</DashboardCard>
	)
}

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

	const graphContext = useGraphData()

	const [showSettingsModal, setShowSettingsModal] = useState(false)

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

	const [defaultTimePreset, setDefaultTimePreset] = useState(
		DEFAULT_TIME_PRESETS[2],
	)
	useEffect(() => {
		if (data) {
			setGraphs(data.visualization.graphs)
			const preset = data.visualization.timePreset
			if (preset) {
				const parsed = parsePreset(preset)
				updateSearchTime(presetStartDate(parsed), new Date(), parsed)
				setDefaultTimePreset(parsed)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	const [upsertViz] = useUpsertVisualizationMutation()

	const { presets, minDate } = useRetentionPresets()

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useGraphTime(presets)

	const navigate = useNavigate()

	const noGraphs = graphs?.length === 0

	return (
		<>
			<Helmet>
				<title>Dashboard</title>
			</Helmet>
			<DashboardSettingsModal
				showModal={showSettingsModal}
				onHideModal={() => {
					setShowSettingsModal(false)
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
										Dashboards
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
									defaultPreset={defaultTimePreset}
									setDefaultPreset={(preset) => {
										const timePreset = presetValue(preset)
										upsertViz({
											variables: {
												visualization: {
													projectId,
													id: dashboard_id,
													timePreset,
												},
											},
											optimisticResponse: {
												upsertVisualization:
													dashboard_id!,
											},
											update(cache) {
												const vizId = cache.identify({
													id: dashboard_id,
													__typename: 'Visualization',
												})
												cache.modify({
													id: vizId,
													fields: {
														timePreset() {
															return timePreset
														},
													},
												})
											},
										})
											.then(() => {
												toast.success(
													'Dashboard updated',
												)
											})
											.catch(() =>
												toast.error(
													'Failed to update dashboard',
												),
											)
									}}
								/>
								<HeaderDivider />
								<Button
									emphasis="medium"
									kind="secondary"
									iconLeft={<IconSolidCog size={14} />}
									onClick={() => {
										setShowSettingsModal(true)
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
							flexDirection="column"
							justifyContent="space-between"
							height="full"
							cssClass={style.dashboardContent}
						>
							<VariablesBar dashboardId={dashboard_id!} />
							<Box
								display="flex"
								position="relative"
								width="full"
								height="full"
							>
								<Box cssClass={clsx(style.graphGrid)}>
									<GraphContextProvider value={graphContext}>
										<DndContext
											sensors={sensors}
											collisionDetection={closestCenter}
											onDragEnd={handleDragEnd}
										>
											<SortableContext
												items={graphs ?? []}
												strategy={rectSortingStrategy}
											>
												{graphs?.map((g) => (
													<DashboardCell
														key={g.id}
														g={g}
														startDate={startDate}
														endDate={endDate}
														updateSearchTime={
															updateSearchTime
														}
													/>
												))}
											</SortableContext>
										</DndContext>
									</GraphContextProvider>
								</Box>
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</>
	)
}
