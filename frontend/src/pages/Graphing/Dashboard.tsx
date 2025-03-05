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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'

import { toast } from '@components/Toaster'
import {
	useDeleteGraphMutation,
	useGetVisualizationQuery,
	useUpsertVisualizationMutation,
} from '@/graph/generated/hooks'
import { GetVisualizationQuery } from '@/graph/generated/operations'
import {
	MetricAggregator,
	Graph as TGraph,
	ThresholdCondition,
	ThresholdType,
} from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { DashboardCard } from '@/pages/Graphing/components/DashboardCard'
import { EmptyDashboardCallout } from '@/pages/Graphing/components/EmptyDashboardCallout'
import Graph, { useGetViewConfig } from '@/pages/Graphing/components/Graph'
import { useParams } from '@/util/react-router/useParams'
import { DashboardSettingsModal } from '@/pages/Graphing/components/DashboardSettingsModal'
import { VariablesBar } from '@/pages/Graphing/components/VariablesBar'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { loadFunnelStep } from '@pages/Graphing/util'
import { GraphContextProvider, useGraphContext } from './context/GraphContext'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { exportGraph } from '@pages/Graphing/hooks/exportGraph'
import { useGraphTime } from '@/pages/Graphing/hooks/useGraphTime'
import {
	AlertSettings,
	DEFAULT_COOLDOWN,
	DEFAULT_WINDOW,
	SETTINGS_PARAM,
} from '@/pages/Alerts/AlertForm'
import { Editor } from '@/pages/Graphing/constants'
import { GraphSettings } from '@/pages/Graphing/GraphingEditor'
import { btoaSafe, copyToClipboard } from '@/util/string'

import * as style from './Dashboard.css'

export const HeaderDivider = () => <Box cssClass={style.headerDivider} />

type DashboardCellProps = {
	g: TGraph
	startDate: Date
	endDate: Date
	timePreset?: DateRangePreset
	updateSearchTime: (start: Date, end: Date, preset?: DateRangePreset) => void
}

const DashboardCell = ({
	g,
	startDate,
	endDate,
	timePreset,
	updateSearchTime,
}: DashboardCellProps) => {
	const { projectId } = useProjectId()
	const { dashboard_id } = useParams<{
		dashboard_id: string
	}>()

	const graphContext = useGraphContext()

	const isTemp = g.id.startsWith('temp-')
	const [deleteGraph] = useDeleteGraphMutation()

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

	const funnelSteps = useMemo(
		() => (g.funnelSteps ?? []).map(loadFunnelStep),
		[g.funnelSteps],
	)

	const handleClone = useCallback(() => {
		const graphInput = {
			productType: g.productType,
			viewType: g.type,
			lineNullHandling: g.nullHandling,
			lineDisplay: g.display,
			barDisplay: g.display,
			funnelDisplay: g.display,
			tableNullHandling: g.nullHandling,
			query: g.query,
			metricViewTitle: `${g.title} copy`,
			groupByEnabled: !!g.groupByKeys?.length,
			groupByKeys: g.groupByKeys,
			limitFunctionType: g.limitFunctionType,
			limit: g.limit,
			funnelSteps: (g.funnelSteps ?? []).map(loadFunnelStep),
			bucketByEnabled: !!g.bucketByKey,
			bucketByKey: g.bucketByKey,
			bucketCount: g.bucketCount,
			bucketInterval: g.bucketInterval,
			bucketBySetting: g.bucketInterval ? 'Interval' : 'Count',
			expressions: g.expressions,
			editor: g.sql ? Editor.SqlEditor : Editor.QueryBuilder,
			sql: g.sql,
		} as GraphSettings

		navigate({
			pathname: `/${projectId}/dashboards/new`,
			search: `settings=${btoaSafe(JSON.stringify(graphInput))}`,
		})
	}, [g, navigate, projectId])

	const handleDelete = useCallback(() => {
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
							const filtered = existing.filter(
								(e: any) => e.__ref !== graphId,
							)
							return filtered
						},
					},
				})
			},
		})
			.then(() => toast.success('Graph deleted'))
			.catch(() => toast.error('Failed to delete graph'))
	}, [dashboard_id, deleteGraph, g.id])

	const handleCreateAlert = useCallback(() => {
		const func = g.expressions.at(0)?.aggregator ?? MetricAggregator.Count
		const col = g.expressions.at(0)?.column ?? ''
		const groupByKey = g.groupByKeys?.at(0) ?? undefined
		const settings: AlertSettings = {
			productType: g.productType,
			functionType: func,
			functionColumn: col,
			query: g.query,
			alertName: g.title,
			groupByEnabled: groupByKey !== undefined,
			groupByKey: groupByKey ?? '',
			thresholdValue: 1,
			thresholdCondition: ThresholdCondition.Above,
			thresholdType: ThresholdType.Constant,
			thresholdWindow: g.bucketInterval ?? DEFAULT_WINDOW,
			thresholdCooldown: g.bucketInterval ?? DEFAULT_COOLDOWN,
			destinations: [],
			editor: Editor.QueryBuilder,
			sql: undefined,
		}

		const settingsEncoded = btoaSafe(JSON.stringify(settings))

		let search = ''
		if (timePreset !== undefined) {
			search += `relative_time=${presetValue(timePreset)}&`
		}
		search += `${SETTINGS_PARAM}=${settingsEncoded}`

		navigate({
			pathname: `/${projectId}/alerts/new`,
			search,
		})
	}, [g, navigate, projectId, timePreset])

	const handleExpand = () => {
		navigate({
			pathname: `view/${g.id}`,
			search: location.search,
		})
	}

	const handleEdit = () => {
		navigate({
			pathname: `edit/${g.id}`,
			search: location.search,
		})
	}

	return (
		<DashboardCard
			id={g.id}
			key={g.id}
			onClone={isTemp ? undefined : handleClone}
			onDelete={isTemp ? undefined : handleDelete}
			onCreateAlert={handleCreateAlert}
			onExpand={isTemp ? undefined : handleExpand}
			onEdit={isTemp ? undefined : handleEdit}
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
				sql={g.sql ?? undefined}
				expressions={g.expressions}
				bucketByKey={g.bucketByKey ?? undefined}
				bucketByWindow={g.bucketInterval ?? undefined}
				bucketCount={g.bucketCount ?? undefined}
				groupByKeys={g.groupByKeys ?? undefined}
				limit={g.limit ?? undefined}
				limitFunctionType={g.limitFunctionType ?? undefined}
				limitMetric={g.limitMetric ?? undefined}
				funnelSteps={funnelSteps}
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

	const handleShare = () => {
		copyToClipboard(window.location.href, { onCopyText: 'Copied link!' })
	}

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
								<Button
									emphasis="low"
									kind="secondary"
									onClick={handleShare}
								>
									Share
								</Button>
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
														timePreset={
															selectedPreset
														}
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
