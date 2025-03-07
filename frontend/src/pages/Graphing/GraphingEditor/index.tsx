import { Box, presetValue } from '@highlight-run/ui/components'
import React, {
	PropsWithChildren,
	useCallback,
	useId,
	useMemo,
	useState,
} from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { omit } from 'lodash'

import { toast } from '@components/Toaster'
import { FunnelDisplay } from '@pages/Graphing/components/types'
import { useParams } from '@util/react-router/useParams'
import {
	useDeleteGraphMutation,
	useGetVisualizationQuery,
	useUpsertGraphMutation,
} from '@/graph/generated/hooks'
import {
	Graph as GraphType,
	GraphInput,
	MetricAggregator,
	ThresholdCondition,
	ThresholdType,
} from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { BarDisplay } from '@/pages/Graphing/components/BarChart'
import Graph, {
	TIMESTAMP_KEY,
	useGetViewConfig,
	View,
} from '@/pages/Graphing/components/Graph'
import {
	LineDisplay,
	LineNullHandling,
} from '@/pages/Graphing/components/LineChart'
import { TableNullHandling } from '@/pages/Graphing/components/Table'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { VariablesBar } from '@/pages/Graphing/components/VariablesBar'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { loadFunnelStep } from '@pages/Graphing/util'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import TemplateMenu from '@/pages/Graphing/TemplateMenu'
import { useGraphTime } from '@/pages/Graphing/hooks/useGraphTime'
import { ActionBar } from '@/pages/Graphing/components/ActionBar'
import {
	AlertSettings,
	DEFAULT_COOLDOWN,
	DEFAULT_WINDOW,
} from '@/pages/Alerts/AlertForm'
import { exportGraph } from '@/pages/Graphing/hooks/exportGraph'
import { btoaSafe } from '@/util/string'

import {
	GraphingEditorContextProvider,
	useGraphingEditorContext,
} from './GraphingEditorContext'
import { useGraphEditor } from './useGraphEditor'
import { GraphContextProvider } from '../context/GraphContext'
import {
	BucketBySetting,
	DEFAULT_BUCKET_COUNT,
	DEFAULT_BUCKET_INTERVAL,
	Editor,
	FUNCTION_TYPES,
	SETTINGS_PARAM,
} from '../constants'
import { GraphHeader } from './GraphHeader'
import { FormPanel } from './FormPanel'
import * as style from './GraphingEditor.css'

const BackgroundPattern = () => {
	return (
		<svg width="100%" height="100%">
			<defs>
				<pattern
					id="polka-dots"
					x="0"
					y="0"
					width="14"
					height="14"
					patternUnits="userSpaceOnUse"
				>
					<circle fill="#e4e2e4" cx="7" cy="7" r="1" />
				</pattern>
			</defs>

			<rect
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="url(#polka-dots)"
			/>
		</svg>
	)
}

export const GraphBackgroundWrapper = ({ children }: PropsWithChildren) => {
	return (
		<Box display="flex" position="relative" height="full" width="full">
			<Box
				position="absolute"
				width="full"
				height="full"
				cssClass={style.graphBackground}
			>
				<BackgroundPattern />
			</Box>

			<Box cssClass={style.graphWrapper} shadow="small">
				<Box
					border="divider"
					borderRadius="8"
					width="full"
					height="full"
				>
					{children}
				</Box>
			</Box>
		</Box>
	)
}

const getBucketByKey = (
	bucketBySetting: BucketBySetting,
	bucketByKey: string,
): string | undefined => {
	switch (bucketBySetting) {
		case 'Count':
			return bucketByKey
		case 'Interval':
			return TIMESTAMP_KEY
	}
}

export const GraphingEditor: React.FC = () => {
	const { graph_id, dashboard_id } = useParams<{
		dashboard_id: string
		graph_id: string
	}>()
	const isEdit = graph_id !== undefined
	const graphingEditorContext = useGraphEditor()

	return (
		<>
			<Helmet>
				<title>{isEdit ? 'Edit' : 'Create'} Graph</title>
			</Helmet>
			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				overflow="hidden"
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
					<GraphingEditorContextProvider
						value={graphingEditorContext}
					>
						<GraphingEditorImpl
							isEdit={isEdit}
							graph_id={graph_id}
							dashboard_id={dashboard_id}
						/>
					</GraphingEditorContextProvider>
				</Box>
			</Box>
		</>
	)
}

type Props = {
	isEdit: boolean
	dashboard_id?: string
	graph_id?: string
}

const GraphingEditorImpl: React.FC<Props> = ({
	isEdit,
	dashboard_id,
	graph_id,
}) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const { presets } = useRetentionPresets()
	const tempId = useId()
	const graphId = graph_id || tempId
	const {
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
		rebaseSearchTime,
	} = useGraphTime(presets)
	const graphContext = useGraphData()

	const {
		initialSettings,
		settings,
		graphPreview,
		setGraphPreview,
		setEditor,
		dashboardIdSetting,
		setMetricViewTitle,
		tempMetricViewTitle,
		setProductType,
		setViewType,
		setLineNullHandling,
		setTableNullHandling,
		setLineDisplay,
		setBarDisplay,
		setFunnelDisplay,
		setSql,
		sqlInternal,
		setSqlInternal,
		setQuery,
		debouncedQuery,
		setDebouncedQuery,
		setGroupByEnabled,
		setGroupByKeys,
		setLimitFunctionType,
		setLimit,
		limitMetric,
		setLimitMetric,
		setBucketByEnabled,
		setBucketBySetting,
		setBucketByKey,
		setBucketCount,
		setBucketInterval,
		setExpressions,
		setFunnelSteps,
	} = useGraphingEditorContext()

	const [upsertGraph, upsertGraphContext] = useUpsertGraphMutation()
	const [deleteGraph] = useDeleteGraphMutation()

	const [showTemplates, setShowTemplates] = useState(false)
	const [completed, setCompleted] = useState(!isEdit)

	const currentDashboardId = useMemo(() => {
		return dashboard_id ?? dashboardIdSetting ?? ''
	}, [dashboard_id, dashboardIdSetting])

	const displaySettings = useMemo(() => {
		let display: string | undefined
		let nullHandling: string | undefined
		if (settings.viewType === 'Line chart') {
			display = settings.lineDisplay
			nullHandling = settings.lineNullHandling
		} else if (settings.viewType === 'Bar chart') {
			display = settings.barDisplay
		} else if (settings.viewType === 'Funnel chart') {
			display = settings.funnelDisplay
		} else if (settings.viewType === 'Table') {
			nullHandling = settings.tableNullHandling
		}

		return {
			display,
			nullHandling,
		}
	}, [
		settings.barDisplay,
		settings.funnelDisplay,
		settings.lineDisplay,
		settings.lineNullHandling,
		settings.tableNullHandling,
		settings.viewType,
	])

	const viewConfig = useGetViewConfig(
		settings.viewType,
		displaySettings.display,
		displaySettings.nullHandling,
	)
	const { values } = useGraphingVariables(currentDashboardId)

	useGetVisualizationQuery({
		variables: {
			id: currentDashboardId,
		},
		onCompleted: (data) => {
			setCompleted(true)

			const g = data.visualization.graphs.find((g) => g.id === graph_id)
			if (g === undefined || initialSettings !== undefined) {
				return
			}

			applyGraph(g)
		},
	})

	const applyGraph = (g: GraphType) => {
		const viewType = g.type as View
		setProductType(g.productType)
		setViewType(viewType)
		setExpressions(g.expressions)

		if (viewType === 'Line chart') {
			setLineNullHandling(g.nullHandling as LineNullHandling)
			setLineDisplay(g.display as LineDisplay)
		} else if (viewType === 'Bar chart') {
			setBarDisplay(g.display as BarDisplay)
		} else if (viewType === 'Funnel chart') {
			setFunnelDisplay(g.display as FunnelDisplay)
		} else if (viewType === 'Table') {
			setTableNullHandling(g.nullHandling as TableNullHandling)
		}

		setQuery(g.query)
		setDebouncedQuery(g.query)
		setMetricViewTitle(g.title)
		setGroupByEnabled((g.groupByKeys ?? []).length > 0)
		setGroupByKeys(g.groupByKeys ?? [])
		setLimitFunctionType(g.limitFunctionType ?? FUNCTION_TYPES[0])
		setLimit(g.limit ?? 10)
		setLimitMetric(g.limitMetric ?? '')
		setFunnelSteps((g.funnelSteps ?? []).map(loadFunnelStep))
		setBucketByEnabled(!!g.bucketByKey)
		setBucketByKey(g.bucketByKey ?? TIMESTAMP_KEY)
		setBucketCount(g.bucketCount ?? DEFAULT_BUCKET_COUNT)
		setBucketInterval(g.bucketInterval ?? DEFAULT_BUCKET_INTERVAL)
		setBucketBySetting(g.bucketInterval ? 'Interval' : 'Count')
		setEditor(!!g.sql ? Editor.SqlEditor : Editor.QueryBuilder)
		setSqlInternal(g.sql ?? '')
		setSql(g.sql ?? '')
	}

	const redirectToDashboard = useCallback(() => {
		const params = new URLSearchParams(location.search)
		params.delete(SETTINGS_PARAM)
		navigate({
			pathname: `../${currentDashboardId}`,
			search: params.toString(),
		})
	}, [currentDashboardId, navigate])

	const onSave = useCallback(() => {
		let display: string | undefined
		let nullHandling: string | undefined

		switch (settings.viewType) {
			case 'Line chart':
				display = settings.lineDisplay
				nullHandling = settings.lineNullHandling
				break
			case 'Bar chart':
				display = settings.barDisplay
				break
			case 'Funnel chart':
				display = settings.funnelDisplay
				break
			case 'Table':
				nullHandling = settings.tableNullHandling
				break
		}

		const graphInput: GraphInput = {
			visualizationId: currentDashboardId,
			bucketByKey: settings.bucketByEnabled
				? getBucketByKey(settings.bucketBySetting, settings.bucketByKey)
				: null,
			bucketCount:
				settings.bucketBySetting === 'Count'
					? Number(settings.bucketCount)
					: null,
			bucketInterval:
				settings.bucketBySetting === 'Interval'
					? Number(settings.bucketInterval)
					: null,
			display,
			groupByKeys: settings.groupByEnabled ? settings.groupByKeys : null,
			limit: settings.groupByEnabled ? Number(settings.limit) : null,
			limitFunctionType: settings.groupByEnabled
				? settings.limitFunctionType
				: null,
			limitMetric: settings.groupByEnabled
				? settings.fetchedLimitMetric
				: null,
			funnelSteps:
				settings.viewType === 'Funnel chart'
					? settings.funnelSteps.map((s) => omit(s, 'event'))
					: [],
			nullHandling,
			productType: settings.productType,
			query: debouncedQuery,
			title: settings.metricViewTitle || tempMetricViewTitle,
			type: settings.viewType,
			expressions: settings.expressions,
			sql: settings.editor === Editor.SqlEditor ? sqlInternal : null,
		}

		if (isEdit) {
			graphInput.id = graph_id
		}

		upsertGraph({
			variables: {
				graph: graphInput,
			},
			optimisticResponse: {
				upsertGraph: {
					...graphInput,
					id: graphInput.id ?? `temp-${tempId}`,
					__typename: 'Graph',
				},
			},
			update(cache, result) {
				if (isEdit) {
					return
				}
				const vizId = cache.identify({
					id: currentDashboardId,
					__typename: 'Visualization',
				})
				const graphId = cache.identify({
					id: result.data?.upsertGraph.id,
					__typename: 'Graph',
				})
				cache.modify({
					id: vizId,
					fields: {
						graphs(existing = []) {
							return existing.concat([{ __ref: graphId }])
						},
					},
				})
			},
		})
			.then(() => {
				toast.success(`Graph ${isEdit ? 'updated' : 'created'}`)
				redirectToDashboard()
			})
			.catch(() => {
				toast.error('Failed to create graph')
			})
	}, [
		currentDashboardId,
		debouncedQuery,
		graph_id,
		isEdit,
		redirectToDashboard,
		settings.barDisplay,
		settings.bucketByEnabled,
		settings.bucketByKey,
		settings.bucketBySetting,
		settings.bucketCount,
		settings.bucketInterval,
		settings.editor,
		settings.expressions,
		settings.fetchedLimitMetric,
		settings.funnelDisplay,
		settings.funnelSteps,
		settings.groupByEnabled,
		settings.groupByKeys,
		settings.limit,
		settings.limitFunctionType,
		settings.lineDisplay,
		settings.lineNullHandling,
		settings.metricViewTitle,
		settings.productType,
		settings.tableNullHandling,
		settings.viewType,
		sqlInternal,
		tempId,
		tempMetricViewTitle,
		upsertGraph,
	])

	const onDelete = useCallback(() => {
		if (!isEdit) {
			return
		}

		deleteGraph({
			variables: {
				id: graph_id!,
			},
			optimisticResponse: {
				deleteGraph: true,
			},
			update(cache) {
				const vizId = cache.identify({
					id: currentDashboardId,
					__typename: 'Visualization',
				})
				const graphId = cache.identify({
					id: graph_id,
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
			.then(() => {
				toast.success('Graph deleted')
				redirectToDashboard()
			})
			.catch(() => toast.error('Failed to delete graph'))
	}, [currentDashboardId, deleteGraph, graph_id, isEdit, redirectToDashboard])

	const handleDownload = useCallback(() => {
		return exportGraph(
			graphId,
			settings.metricViewTitle,
			graphContext.graphData.current
				? graphContext.graphData.current[graphId]
				: [],
		)
	}, [graphContext.graphData, graphId, settings.metricViewTitle])

	const handleClone = useCallback(() => {
		const updatedSettings = {
			...settings,
			metricViewTitle: `${settings.metricViewTitle} copy`,
		}

		navigate({
			pathname: `/${projectId}/dashboards/new`,
			search: `settings=${btoaSafe(JSON.stringify(updatedSettings))}`,
		})
	}, [navigate, projectId, settings])

	const handleCreateAlert = useCallback(() => {
		const alertSettings: AlertSettings = {
			productType: settings.productType,
			functionType: settings.limitFunctionType ?? MetricAggregator.Count,
			functionColumn: settings.fetchedLimitMetric,
			query: settings.query,
			alertName: settings.metricViewTitle,
			groupByEnabled: !!settings.groupByKeys?.length,
			groupByKey: settings.groupByKeys?.at(0) ?? '',
			thresholdValue: 1,
			thresholdCondition: ThresholdCondition.Above,
			thresholdType: ThresholdType.Constant,
			thresholdWindow: DEFAULT_WINDOW,
			thresholdCooldown: settings.bucketInterval ?? DEFAULT_COOLDOWN,
			destinations: [],
			editor: Editor.QueryBuilder,
			sql: undefined,
		}

		const alertSettingsEncoded = btoaSafe(JSON.stringify(alertSettings))

		let search = ''
		if (selectedPreset !== undefined) {
			search += `relative_time=${presetValue(selectedPreset)}&`
		}
		search += `${SETTINGS_PARAM}=${alertSettingsEncoded}`

		navigate({
			pathname: `/${projectId}/alerts/new`,
			search,
		})
	}, [settings, selectedPreset, navigate, projectId])

	const toggleTemplates = useCallback(() => {
		setShowTemplates(!showTemplates)
	}, [showTemplates])

	if (!completed) {
		return null
	}

	return (
		<>
			<GraphHeader
				isEdit={isEdit}
				loading={upsertGraphContext.loading}
				onSave={onSave}
			/>
			<GraphContextProvider value={graphContext}>
				<Box
					display="flex"
					flexDirection="row"
					justifyContent="space-between"
					cssClass={style.editGraphPanel}
				>
					<Box
						display="flex"
						flexDirection="column"
						justifyContent="space-between"
						cssClass={style.editGraphPreview}
					>
						<ActionBar
							toggleTemplates={toggleTemplates}
							handleRefresh={rebaseSearchTime}
							dateRangeValue={{
								startDate,
								endDate,
								selectedPreset,
							}}
							updateSearchTime={updateSearchTime}
							onDownload={handleDownload}
							onClone={handleClone}
							onDelete={isEdit ? onDelete : undefined}
							onCreateAlert={handleCreateAlert}
						/>
						<VariablesBar dashboardId={currentDashboardId} />
						<GraphBackgroundWrapper>
							{showTemplates ? (
								<TemplateMenu
									previewTemplate={(template) => {
										setGraphPreview(template)
									}}
									applyTemplate={(template) => {
										if (template !== undefined) {
											applyGraph(template)
										}
										setGraphPreview(undefined)
										setShowTemplates(false)
									}}
									onClose={() => {
										setGraphPreview(undefined)
										setShowTemplates(false)
									}}
								/>
							) : (
								<Box px="16" py="12" width="full" height="full">
									<Graph
										id={graphId}
										title={
											settings.metricViewTitle ||
											tempMetricViewTitle
										}
										viewConfig={viewConfig}
										productType={settings.productType}
										projectId={projectId}
										startDate={startDate}
										endDate={endDate}
										sql={
											settings.editor === Editor.SqlEditor
												? settings.sql
												: undefined
										}
										query={debouncedQuery}
										bucketByKey={
											settings.bucketByEnabled
												? getBucketByKey(
														settings.bucketBySetting,
														settings.bucketByKey,
													)
												: undefined
										}
										bucketCount={
											settings.bucketBySetting === 'Count'
												? Number(settings.bucketCount)
												: undefined
										}
										bucketByWindow={
											settings.bucketBySetting ===
											'Interval'
												? Number(
														settings.bucketInterval,
													)
												: undefined
										}
										groupByKeys={
											settings.groupByEnabled
												? settings.groupByKeys
												: undefined
										}
										limit={
											settings.groupByEnabled
												? Number(settings.limit)
												: undefined
										}
										limitFunctionType={
											settings.groupByEnabled
												? settings.limitFunctionType
												: undefined
										}
										limitMetric={
											settings.groupByEnabled
												? limitMetric
												: undefined
										}
										funnelSteps={settings.funnelSteps}
										setTimeRange={updateSearchTime}
										variables={values}
										expressions={settings.expressions}
									/>
								</Box>
							)}
						</GraphBackgroundWrapper>
					</Box>
					<FormPanel
						startDate={startDate}
						endDate={endDate}
						currentDashboardId={currentDashboardId}
						isPreview={graphPreview !== undefined || showTemplates}
						loading={upsertGraphContext.loading}
					/>
				</Box>
			</GraphContextProvider>
		</>
	)
}
