import {
	Box,
	Button,
	ButtonIcon,
	Form,
	IconSolidX,
	Input,
	presetValue,
	Select,
	Stack,
	TagSwitchGroup,
	Text,
} from '@highlight-run/ui/components'
import { Divider } from 'antd'
import React, {
	PropsWithChildren,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useState,
} from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDebounce } from 'react-use'
import { omit } from 'lodash'

import { toast } from '@components/Toaster'
import { FUNNEL_DISPLAY, FunnelDisplay } from '@pages/Graphing/components/types'
import { useParams } from '@util/react-router/useParams'
import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import {
	useDeleteGraphMutation,
	useGetVisualizationQuery,
	useGetVisualizationsQuery,
	useUpsertGraphMutation,
} from '@/graph/generated/hooks'
import {
	Graph as GraphType,
	GraphInput,
	MetricAggregator,
	MetricExpression,
	ProductType,
	ThresholdCondition,
	ThresholdType,
} from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { BAR_DISPLAY, BarDisplay } from '@/pages/Graphing/components/BarChart'
import Graph, {
	TIMESTAMP_KEY,
	useGetViewConfig,
	View,
	VIEW_OPTIONS,
} from '@/pages/Graphing/components/Graph'
import {
	LINE_DISPLAY,
	LINE_NULL_HANDLING,
	LineDisplay,
	LineNullHandling,
} from '@/pages/Graphing/components/LineChart'
import {
	TABLE_NULL_HANDLING,
	TableNullHandling,
} from '@/pages/Graphing/components/Table'
import { EventSteps } from '@pages/Graphing/EventSelection/EventSteps'
import { EventSelection } from '@pages/Graphing/EventSelection'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { VariablesBar } from '@/pages/Graphing/components/VariablesBar'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import {
	BUCKET_FREQUENCIES,
	EventSelectionStep,
	loadFunnelStep,
} from '@pages/Graphing/util'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { GraphContextProvider } from './context/GraphContext'
import TemplateMenu from '@/pages/Graphing/TemplateMenu'
import { Panel } from '@/pages/Graphing/components/Panel'
import { useGraphTime } from '@/pages/Graphing/hooks/useGraphTime'
import { DEFAULT_SQL, SqlEditor } from '@/pages/Graphing/components/SqlEditor'
import { ActionBar } from '@/pages/Graphing/components/ActionBar'
import {
	AlertSettings,
	DEFAULT_COOLDOWN,
	DEFAULT_WINDOW,
} from '@/pages/Alerts/AlertForm'
import { exportGraph } from '@/pages/Graphing/hooks/exportGraph'
import { atobSafe, btoaSafe } from '@/util/string'

import { Combobox } from './Combobox'
import {
	DEFAULT_BUCKET_COUNT,
	DEFAULT_BUCKET_INTERVAL,
	EDITOR_OPTIONS,
	Editor,
	FUNCTION_TYPES,
	PRODUCT_OPTIONS,
} from './constants'
import * as style from './GraphingEditor.css'
import { LabeledRow } from './LabeledRow'
import { OptionDropdown } from './OptionDropdown'
import {
	BarChartSettings,
	FunnelChartSettings,
	LineChartSettings,
	TableSettings,
} from './Settings'

type BucketBy = 'Interval' | 'Count'
const BUCKET_BY_OPTIONS: BucketBy[] = ['Interval', 'Count']

const MAX_BUCKET_SIZE = 100
const MAX_LIMIT_SIZE = 100
const NO_LIMIT = 1_000_000_000_000
const SETTINGS_PARAM = 'settings'

const SidebarSection = (props: PropsWithChildren) => {
	return (
		<Box
			p="6"
			width="full"
			display="flex"
			flexDirection="column"
			gap="12"
			border="divider"
			borderRadius="6"
		>
			{props.children}
		</Box>
	)
}

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
	bucketBySetting: BucketBy,
	bucketByKey: string,
): string | undefined => {
	switch (bucketBySetting) {
		case 'Count':
			return bucketByKey
		case 'Interval':
			return TIMESTAMP_KEY
	}
}

type BucketBySetting = 'Interval' | 'Count'

export type GraphSettings = {
	productType: ProductType
	viewType: View
	functionType: MetricAggregator
	lineNullHandling: LineNullHandling
	lineDisplay: LineDisplay
	barDisplay: BarDisplay
	funnelDisplay: FunnelDisplay
	tableNullHandling: TableNullHandling
	query: string
	fetchedMetric: string
	metricViewTitle: string
	groupByEnabled: boolean
	groupByKeys: string[]
	limitFunctionType: MetricAggregator
	limit: number
	funnelSteps: EventSelectionStep[]
	bucketByEnabled: boolean
	bucketByKey: string
	bucketCount: number
	bucketInterval: number
	bucketBySetting: BucketBySetting
	fetchedLimitMetric: string
	expressions: MetricExpression[]
	editor: Editor
	sql: string
}

export const GraphingEditor: React.FC = () => {
	const { dashboard_id, graph_id } = useParams<{
		dashboard_id: string
		graph_id: string
	}>()

	const [showTemplates, setShowTemplates] = useState(false)
	const [dashboardIdSetting, setDashboardIdSetting] = useState<
		string | undefined
	>()

	const currentDashboardId = dashboard_id ?? dashboardIdSetting ?? ''
	const isEdit = graph_id !== undefined
	const tempId = useId()
	const graphId = graph_id || tempId

	const { presets } = useRetentionPresets()

	const {
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
		rebaseSearchTime,
	} = useGraphTime(presets)

	const [upsertGraph, upsertGraphContext] = useUpsertGraphMutation()
	const [deleteGraph] = useDeleteGraphMutation()

	const navigate = useNavigate()
	const redirectToDashboard = useCallback(() => {
		const params = new URLSearchParams(location.search)
		params.delete(SETTINGS_PARAM)
		navigate({
			pathname: `../${currentDashboardId}`,
			search: params.toString(),
		})
	}, [currentDashboardId, navigate])

	const { projectId } = useProjectId()

	const { data: dashboardsData, loading: dashboardsLoading } =
		useGetVisualizationsQuery({
			variables: {
				project_id: projectId,
				input: '',
				count: 100,
				offset: 0,
			},
			skip: dashboard_id !== undefined,
			onCompleted: (data) => {
				setDashboardIdSetting(data.visualizations.results.at(0)?.id)
			},
		})

	const onSave = () => {
		let display: string | undefined
		let nullHandling: string | undefined

		switch (viewType) {
			case 'Line chart':
				display = lineDisplay
				nullHandling = lineNullHandling
				break
			case 'Bar chart':
				display = barDisplay
				break
			case 'Funnel chart':
				display = funnelDisplay
				break
			case 'Table':
				nullHandling = tableNullHandling
				break
		}

		const graphInput: GraphInput = {
			visualizationId: currentDashboardId,
			bucketByKey: bucketByEnabled
				? getBucketByKey(bucketBySetting, bucketByKey)
				: null,
			bucketCount:
				bucketBySetting === 'Count' ? Number(bucketCount) : null,
			bucketInterval:
				bucketBySetting === 'Interval' ? Number(bucketInterval) : null,
			display,
			groupByKeys: groupByEnabled ? groupByKeys : null,
			limit: groupByEnabled ? Number(limit) : null,
			limitFunctionType: groupByEnabled ? limitFunctionType : null,
			limitMetric: groupByEnabled ? fetchedLimitMetric : null,
			funnelSteps:
				viewType === 'Funnel chart'
					? funnelSteps.map((s) => omit(s, 'event'))
					: [],
			nullHandling,
			productType,
			query: debouncedQuery,
			title: metricViewTitle || tempMetricViewTitle,
			type: viewType,
			expressions: expressions,
			sql: editor === Editor.SqlEditor ? sqlInternal : null,
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
	}

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
		setSqlInternal(g.sql ?? DEFAULT_SQL)
		setSql(g.sql ?? DEFAULT_SQL)
	}

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

	const graphContext = useGraphData()

	const [searchParams, setSearchParams] = useSearchParams()
	const settingsParam = searchParams.get(SETTINGS_PARAM)
	const [initialSettings] = useState(
		settingsParam !== null
			? (JSON.parse(atobSafe(settingsParam)) as GraphSettings)
			: undefined,
	)

	const [productType, setProductTypeImpl] = useState(
		(searchParams.get('source') as ProductType) ??
			initialSettings?.productType ??
			PRODUCT_OPTIONS[0].value,
	)
	const setProductType = (pt: ProductType) => {
		if (productType !== ProductType.Events && viewType === 'Funnel chart') {
			setViewType(VIEW_OPTIONS[0].value as View)
		}
		if (productType === ProductType.Metrics && pt !== ProductType.Metrics) {
			setExpressions([
				{
					aggregator: FUNCTION_TYPES[0],
					column: '',
				},
			])
		} else if (
			productType !== ProductType.Metrics &&
			pt === ProductType.Metrics
		) {
			setExpressions([
				{
					aggregator: MetricAggregator.Avg,
					column: 'value',
				},
			])
		}
		setProductTypeImpl(pt)
	}

	const [viewType, setViewTypeImpl] = useState(
		initialSettings?.viewType ?? VIEW_OPTIONS[0].value,
	)
	const setViewType = (vt: View) => {
		if (vt === 'Funnel chart') {
			setBucketByEnabled(false)
			// once events have other session attributes, we can support per-user aggregation
			setExpressions([
				{
					aggregator: MetricAggregator.CountDistinct,
					column: 'secure_session_id',
				},
			])
			setGroupByEnabled(true)
			setGroupByKeys(['secure_session_id'])
			setLimit(NO_LIMIT)
		} else if (vt === 'Table') {
			setLimit(NO_LIMIT)
		}
		setViewTypeImpl(vt)
	}

	const [lineNullHandling, setLineNullHandling] = useState(
		initialSettings?.lineNullHandling ?? LINE_NULL_HANDLING[0],
	)
	const [tableNullHandling, setTableNullHandling] = useState(
		initialSettings?.tableNullHandling ?? TABLE_NULL_HANDLING[0],
	)
	const [lineDisplay, setLineDisplay] = useState(
		initialSettings?.lineDisplay ?? LINE_DISPLAY[0],
	)
	const [barDisplay, setBarDisplay] = useState(
		initialSettings?.barDisplay ?? BAR_DISPLAY[0],
	)
	const [funnelDisplay, setFunnelDisplay] = useState(
		initialSettings?.funnelDisplay ?? FUNNEL_DISPLAY[0],
	)

	const [editor, setEditor] = useState(
		initialSettings?.editor ?? Editor.QueryBuilder,
	)
	const [sqlInternal, setSqlInternal] = useState(
		initialSettings?.sql ?? DEFAULT_SQL,
	)
	const [sql, setSql] = useState(sqlInternal)

	const [query, setQuery] = useState(
		searchParams.get('query') ?? initialSettings?.query ?? '',
	)
	const [funnelSteps, setFunnelSteps] = useState<EventSelectionStep[]>(
		initialSettings?.funnelSteps ?? [],
	)
	const [debouncedQuery, setDebouncedQuery] = useState(
		initialSettings?.query ?? '',
	)
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		300,
		[query],
	)

	const [expressions, setExpressions] = useState(
		initialSettings?.expressions ?? [
			{
				aggregator: FUNCTION_TYPES[0],
				column: '',
			},
		],
	)

	const [metricViewTitle, setMetricViewTitle] = useState(
		initialSettings?.metricViewTitle ?? '',
	)
	const [groupByEnabled, setGroupByEnabled] = useState(
		initialSettings?.groupByEnabled ?? false,
	)
	const [groupByKeys, setGroupByKeys] = useState<string[]>(
		initialSettings?.groupByKeys ?? [],
	)

	const [limitFunctionType, setLimitFunctionType] = useState(
		initialSettings?.limitFunctionType ?? FUNCTION_TYPES[0],
	)
	const [limit, setLimit] = useState<number | string>(
		initialSettings?.limit ?? 10,
	)
	const [limitMetric, setLimitMetric] = useState(
		initialSettings?.fetchedLimitMetric ?? '',
	)
	const fetchedLimitMetric = useMemo(() => {
		return limitFunctionType === MetricAggregator.Count ? '' : limitMetric
	}, [limitFunctionType, limitMetric])

	const [bucketByEnabled, setBucketByEnabled] = useState(
		initialSettings?.bucketByEnabled ?? true,
	)
	const [bucketBySetting, setBucketBySetting] = useState(
		initialSettings?.bucketBySetting ?? BUCKET_BY_OPTIONS[0],
	)
	const [bucketByKey, setBucketByKey] = useState(
		initialSettings?.bucketByKey ?? TIMESTAMP_KEY,
	)
	const [bucketCount, setBucketCount] = useState<number>(
		initialSettings?.bucketCount ?? DEFAULT_BUCKET_COUNT,
	)
	const [bucketInterval, setBucketInterval] = useState<number>(
		initialSettings?.bucketInterval ?? DEFAULT_BUCKET_INTERVAL,
	)

	const [completed, setCompleted] = useState(!isEdit)

	let tempMetricViewTitle = expressions.at(0)?.aggregator?.toString() ?? ''
	if (expressions.at(0)?.column) {
		tempMetricViewTitle += `(${expressions.at(0)?.column})`
	}
	tempMetricViewTitle += ` of ${productType?.toString() ?? ''}`

	let display: string | undefined
	let nullHandling: string | undefined
	if (viewType === 'Line chart') {
		display = lineDisplay
		nullHandling = lineNullHandling
	} else if (viewType === 'Bar chart') {
		display = barDisplay
	} else if (viewType === 'Funnel chart') {
		display = funnelDisplay
	} else if (viewType === 'Table') {
		nullHandling = tableNullHandling
	}
	const viewConfig = useGetViewConfig(viewType, display, nullHandling)

	const searchOptionsConfig = useMemo(() => {
		return {
			productType,
			startDate,
			endDate,
		}
	}, [endDate, productType, startDate])

	const { values } = useGraphingVariables(currentDashboardId)

	const variableKeys = Array.from(values).map(([key]) => {
		return `$${key}`
	})

	const [graphPreview, setGraphPreview] = useState<GraphType | undefined>(
		undefined,
	)
	const isPreview = graphPreview !== undefined || showTemplates

	const settings = useMemo(
		() => ({
			productType,
			viewType,
			lineNullHandling,
			lineDisplay,
			barDisplay,
			funnelDisplay,
			tableNullHandling,
			query,
			metricViewTitle,
			groupByEnabled,
			groupByKeys,
			limitFunctionType,
			limit,
			funnelSteps,
			bucketByEnabled,
			bucketByKey,
			bucketCount,
			bucketInterval,
			bucketBySetting,
			fetchedLimitMetric,
			expressions,
			editor,
			sql,
		}),
		[
			barDisplay,
			bucketByEnabled,
			bucketByKey,
			bucketBySetting,
			bucketCount,
			bucketInterval,
			editor,
			expressions,
			fetchedLimitMetric,
			funnelDisplay,
			funnelSteps,
			groupByEnabled,
			groupByKeys,
			limit,
			limitFunctionType,
			lineDisplay,
			lineNullHandling,
			metricViewTitle,
			productType,
			query,
			sql,
			tableNullHandling,
			viewType,
		],
	)

	const settingsEncoded = btoaSafe(JSON.stringify(settings))

	useEffect(() => {
		searchParams.set(SETTINGS_PARAM, settingsEncoded)
		setSearchParams(Object.fromEntries(searchParams.entries()), {
			replace: true,
		})
	}, [searchParams, setSearchParams, settingsEncoded])

	if (graphPreview !== undefined) {
		const viewType = graphPreview.type as View

		settings.editor = Editor.QueryBuilder

		settings.productType = graphPreview.productType
		settings.viewType = viewType

		if (viewType === 'Line chart') {
			settings.lineNullHandling =
				graphPreview.nullHandling as LineNullHandling
			settings.lineDisplay = graphPreview.display as LineDisplay
		} else if (viewType === 'Bar chart') {
			settings.barDisplay = graphPreview.display as BarDisplay
		} else if (viewType === 'Funnel chart') {
			settings.funnelDisplay = graphPreview.display as FunnelDisplay
		} else if (viewType === 'Table') {
			settings.tableNullHandling =
				graphPreview.nullHandling as TableNullHandling
		}

		settings.query = graphPreview.query
		settings.expressions = graphPreview.expressions
		settings.metricViewTitle = graphPreview.title
		settings.groupByEnabled = (graphPreview.groupByKeys ?? []).length > 0
		settings.groupByKeys = graphPreview.groupByKeys ?? []
		settings.limitFunctionType =
			graphPreview.limitFunctionType ?? FUNCTION_TYPES[0]
		settings.limit = graphPreview.limit ?? 10
		settings.fetchedLimitMetric =
			graphPreview.limitFunctionType === MetricAggregator.Count
				? ''
				: (graphPreview.limitMetric ?? '')
		settings.funnelSteps = (graphPreview.funnelSteps ?? []).map(
			loadFunnelStep,
		)
		settings.bucketByEnabled = !!graphPreview.bucketByKey
		settings.bucketByKey = graphPreview.bucketByKey ?? '10'
		settings.bucketCount = graphPreview.bucketCount ?? DEFAULT_BUCKET_COUNT
		settings.bucketInterval =
			graphPreview.bucketInterval ?? DEFAULT_BUCKET_INTERVAL
		settings.bucketBySetting = graphPreview.bucketInterval
			? 'Interval'
			: 'Count'
	}

	const handleDownload = useCallback(() => {
		return exportGraph(
			graphId,
			metricViewTitle,
			graphContext.graphData.current
				? graphContext.graphData.current[graphId]
				: [],
		)
	}, [graphContext.graphData, graphId, metricViewTitle])

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

	const isSqlEditor = settings.editor === Editor.SqlEditor

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
							{isEdit ? 'Edit' : 'Create'} graph
						</Text>
						<Box display="flex" gap="4">
							<Button
								emphasis="low"
								kind="secondary"
								onClick={() => {
									navigate(-1)
								}}
							>
								Cancel
							</Button>
							<Button
								disabled={upsertGraphContext.loading}
								onClick={onSave}
							>
								Save
							</Button>
						</Box>
					</Box>
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
								<VariablesBar
									dashboardId={currentDashboardId}
								/>
								<GraphBackgroundWrapper>
									{showTemplates && (
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
									)}
									{!showTemplates && (
										<Box
											px="16"
											py="12"
											width="full"
											height="full"
										>
											<Graph
												id={graphId}
												title={
													metricViewTitle ||
													tempMetricViewTitle
												}
												viewConfig={viewConfig}
												productType={productType}
												projectId={projectId}
												startDate={startDate}
												endDate={endDate}
												sql={
													isSqlEditor
														? sql
														: undefined
												}
												query={debouncedQuery}
												bucketByKey={
													bucketByEnabled
														? getBucketByKey(
																bucketBySetting,
																bucketByKey,
															)
														: undefined
												}
												bucketCount={
													bucketBySetting === 'Count'
														? Number(bucketCount)
														: undefined
												}
												bucketByWindow={
													bucketBySetting ===
													'Interval'
														? Number(bucketInterval)
														: undefined
												}
												groupByKeys={
													groupByEnabled
														? groupByKeys
														: undefined
												}
												limit={
													groupByEnabled
														? Number(limit)
														: undefined
												}
												limitFunctionType={
													groupByEnabled
														? limitFunctionType
														: undefined
												}
												limitMetric={
													groupByEnabled
														? limitMetric
														: undefined
												}
												funnelSteps={funnelSteps}
												setTimeRange={updateSearchTime}
												variables={values}
												expressions={expressions}
											/>
										</Box>
									)}
								</GraphBackgroundWrapper>
							</Box>
							<Panel>
								<Form>
									<Stack gap="16">
										{dashboard_id === undefined && (
											<LabeledRow
												label="Dashboard"
												name="title"
											>
												<Select
													options={
														dashboardsData?.visualizations.results.map(
															(r) => ({
																name: r.name,
																value: r.id,
																id: r.id,
															}),
														) ?? []
													}
													value={dashboardIdSetting}
													onValueChange={(o) => {
														setDashboardIdSetting(
															o.value,
														)
													}}
													loading={dashboardsLoading}
												/>
											</LabeledRow>
										)}
										<LabeledRow
											label="Graph title"
											name="title"
										>
											<Input
												type="text"
												name="title"
												placeholder={
													tempMetricViewTitle ||
													'Untitled graph'
												}
												value={settings.metricViewTitle}
												onChange={(e) => {
													setMetricViewTitle(
														e.target.value,
													)
												}}
												cssClass={style.input}
												disabled={isPreview}
											/>
										</LabeledRow>
										<Divider className="m-0" />
										<Text weight="bold">Visualization</Text>
										<LabeledRow
											label="View type"
											name="viewType"
										>
											<OptionDropdown
												options={VIEW_OPTIONS.filter(
													(v) =>
														productType ===
															ProductType.Events ||
														v.value !==
															'Funnel chart',
												)}
												selection={settings.viewType}
												setSelection={(s) => {
													s !== settings.viewType &&
														setViewType(s as View)
												}}
												disabled={isPreview}
											/>
										</LabeledRow>
										{settings.viewType === 'Line chart' && (
											<LineChartSettings
												nullHandling={
													settings.lineNullHandling
												}
												setNullHandling={
													setLineNullHandling
												}
												lineDisplay={
													settings.lineDisplay
												}
												setLineDisplay={setLineDisplay}
												disabled={isPreview}
											/>
										)}
										{settings.viewType === 'Bar chart' && (
											<BarChartSettings
												barDisplay={settings.barDisplay}
												setBarDisplay={setBarDisplay}
												disabled={isPreview}
											/>
										)}
										{settings.viewType ===
											'Funnel chart' && (
											<FunnelChartSettings
												funnelDisplay={
													settings.funnelDisplay
												}
												setFunnelDisplay={
													setFunnelDisplay
												}
												disabled={isPreview}
											/>
										)}
										{settings.viewType === 'Table' && (
											<TableSettings
												nullHandling={
													settings.tableNullHandling
												}
												setNullHandling={
													setTableNullHandling
												}
												disabled={isPreview}
											/>
										)}
										<Divider className="m-0" />
										<SidebarSection>
											<Box cssClass={style.editorHeader}>
												<Box
													cssClass={
														style.editorSelect
													}
												>
													<OptionDropdown<Editor>
														options={EDITOR_OPTIONS}
														selection={
															settings.editor
														}
														setSelection={setEditor}
														disabled={isPreview}
													/>
												</Box>
												{isSqlEditor && (
													<Button
														disabled={
															upsertGraphContext.loading ||
															sqlInternal === sql
														}
														onClick={() => {
															setSql(sqlInternal)
														}}
													>
														Update query
													</Button>
												)}
											</Box>
											{isSqlEditor ? (
												<Box
													cssClass={
														style.sqlEditorWrapper
													}
												>
													<SqlEditor
														value={sqlInternal}
														setValue={
															setSqlInternal
														}
														startDate={startDate}
														endDate={endDate}
													/>
												</Box>
											) : (
												<>
													<LabeledRow
														label="Source"
														name="source"
														tooltip="The resource being queried, one of the five highlight.io resources."
													>
														<OptionDropdown<ProductType>
															options={PRODUCT_OPTIONS.filter(
																(p) =>
																	p.value ===
																		ProductType.Events ||
																	viewType !==
																		'Funnel chart',
															)}
															selection={
																settings.productType
															}
															setSelection={(
																s,
															) => {
																s !==
																	settings.productType &&
																	setProductType(
																		s,
																	)
															}}
															disabled={isPreview}
														/>
													</LabeledRow>
													{settings.productType ===
													ProductType.Events ? (
														settings.viewType ===
														'Funnel chart' ? (
															<EventSteps
																steps={
																	settings.funnelSteps
																}
																setSteps={
																	setFunnelSteps
																}
																startDate={
																	startDate
																}
																endDate={
																	endDate
																}
																// disabled={isPreview}
															/>
														) : (
															<EventSelection
																initialQuery={
																	settings.query
																}
																setQuery={
																	setQuery
																}
																startDate={
																	startDate
																}
																endDate={
																	endDate
																}
																// disabled={isPreview}
															/>
														)
													) : (
														<LabeledRow
															label="Filters"
															name="query"
															tooltip="The search query used to filter which data points are included before aggregating."
														>
															<Box
																border="divider"
																width="full"
																borderRadius="6"
															>
																<SearchContext
																	initialQuery={
																		settings.query
																	}
																	onSubmit={
																		setQuery
																	}
																	disabled={
																		isPreview
																	}
																>
																	<Search
																		startDate={
																			new Date(
																				startDate,
																			)
																		}
																		endDate={
																			new Date(
																				endDate,
																			)
																		}
																		productType={
																			productType
																		}
																		hideIcon
																		defaultValueOptions={
																			variableKeys
																		}
																	/>
																</SearchContext>
															</Box>
														</LabeledRow>
													)}
													<LabeledRow
														label="Function"
														name="function"
														tooltip="Determines how data points are aggregated. If the function requires a numeric field as input, one can be chosen."
													>
														<Stack
															width="full"
															gap="12"
														>
															{settings.expressions.map(
																(e, i) => (
																	<Stack
																		direction="row"
																		width="full"
																		gap="4"
																		key={`${e.aggregator}:${e.column}:${i}`}
																	>
																		<OptionDropdown
																			options={
																				FUNCTION_TYPES
																			}
																			selection={
																				e.aggregator
																			}
																			setSelection={(
																				aggregator: MetricAggregator,
																			) => {
																				setExpressions(
																					(
																						expressions,
																					) => {
																						const copy =
																							[
																								...expressions,
																							]
																						copy[
																							i
																						].aggregator =
																							aggregator
																						return copy
																					},
																				)
																			}}
																			disabled={
																				settings.viewType ===
																					'Funnel chart' ||
																				isPreview
																			}
																		/>
																		<Combobox
																			selection={
																				e.column
																			}
																			setSelection={(
																				column: string,
																			) => {
																				setExpressions(
																					(
																						expressions,
																					) => {
																						const copy =
																							[
																								...expressions,
																							]
																						copy[
																							i
																						].column =
																							column
																						return copy
																					},
																				)
																			}}
																			searchConfig={
																				searchOptionsConfig
																			}
																			disabled={
																				e.aggregator ===
																					MetricAggregator.Count ||
																				settings.viewType ===
																					'Funnel chart' ||
																				isPreview
																			}
																			onlyNumericKeys={
																				e.aggregator !==
																				MetricAggregator.CountDistinct
																			}
																			defaultKeys={
																				variableKeys
																			}
																			placeholder={
																				e.aggregator ===
																				MetricAggregator.Count
																					? 'Rows'
																					: undefined
																			}
																		/>
																		{expressions.length >
																			1 && (
																			<ButtonIcon
																				icon={
																					<IconSolidX />
																				}
																				onClick={() => {
																					setExpressions(
																						(
																							expressions,
																						) => {
																							const copy =
																								[
																									...expressions,
																								]
																							copy.splice(
																								i,
																								1,
																							)
																							return copy
																						},
																					)
																				}}
																				kind="secondary"
																				emphasis="low"
																			/>
																		)}
																	</Stack>
																),
															)}
														</Stack>
													</LabeledRow>
													<Button
														kind="secondary"
														onClick={() => {
															setExpressions(
																(
																	expressions,
																) => {
																	return [
																		...expressions,
																		{
																			aggregator:
																				MetricAggregator.Count,
																			column: '',
																		},
																	]
																},
															)
														}}
													>
														Add function
													</Button>
												</>
											)}
										</SidebarSection>
										{!isSqlEditor && (
											<>
												<SidebarSection>
													<LabeledRow
														label="Group by"
														name="groupBy"
														enabled={
															settings.groupByEnabled
														}
														setEnabled={
															setGroupByEnabled
														}
														disabled={
															settings.viewType ===
																'Funnel chart' ||
															isPreview
														}
														tooltip="A categorical field for grouping results into separate series."
													>
														<Combobox
															selection={
																settings.groupByKeys
															}
															setSelection={
																setGroupByKeys
															}
															searchConfig={
																searchOptionsConfig
															}
															defaultKeys={
																variableKeys
															}
															disabled={
																settings.viewType ===
																	'Funnel chart' ||
																isPreview
															}
														/>
													</LabeledRow>
													{settings.groupByEnabled &&
													viewType !== 'Table' &&
													viewType !==
														'Funnel chart' ? (
														<Box
															display="flex"
															flexDirection="row"
															gap="4"
														>
															<LabeledRow
																label="Limit"
																name="limit"
																tooltip="The maximum number of groups to include. Currently, the max is 100."
															>
																<Input
																	type="number"
																	name="limit"
																	placeholder="Enter limit"
																	value={
																		settings.limit
																	}
																	onChange={(
																		e,
																	) => {
																		const value =
																			Math.min(
																				viewType ===
																					'Table'
																					? NO_LIMIT
																					: MAX_LIMIT_SIZE,
																				parseInt(
																					e
																						.target
																						.value,
																				),
																			)
																		setLimit(
																			value,
																		)
																	}}
																	cssClass={
																		style.input
																	}
																	disabled={
																		isPreview
																	}
																/>
															</LabeledRow>
															<LabeledRow
																label="By"
																name="limitBy"
																tooltip="The function used to determine which groups are included."
															>
																<OptionDropdown
																	options={
																		FUNCTION_TYPES
																	}
																	selection={
																		settings.limitFunctionType
																	}
																	setSelection={
																		setLimitFunctionType
																	}
																	disabled={
																		isPreview
																	}
																/>
																<Combobox
																	selection={
																		settings.fetchedLimitMetric
																	}
																	setSelection={
																		setLimitMetric
																	}
																	searchConfig={
																		searchOptionsConfig
																	}
																	disabled={
																		settings.limitFunctionType ===
																			MetricAggregator.Count ||
																		isPreview
																	}
																	onlyNumericKeys
																	defaultKeys={
																		variableKeys
																	}
																	placeholder={
																		settings.limitFunctionType ===
																		MetricAggregator.Count
																			? 'Rows'
																			: undefined
																	}
																/>
															</LabeledRow>
														</Box>
													) : null}
												</SidebarSection>
												{settings.viewType !==
													'Funnel chart' && (
													<SidebarSection>
														<LabeledRow
															label="Bucket by"
															name="bucketBy"
															tooltip="The method for determining the bucket sizes - can be a fixed interval or fixed count."
															enabled={
																settings.bucketByEnabled
															}
															setEnabled={
																setBucketByEnabled
															}
														>
															<TagSwitchGroup
																options={
																	BUCKET_BY_OPTIONS
																}
																defaultValue={
																	settings.bucketBySetting
																}
																onChange={(
																	o:
																		| string
																		| number,
																) => {
																	setBucketBySetting(
																		o as BucketBy,
																	)
																}}
																cssClass={
																	style.tagSwitch
																}
																disabled={
																	isPreview
																}
															/>
														</LabeledRow>
														{settings.bucketByEnabled &&
															settings.bucketBySetting ===
																'Count' && (
																<>
																	<LabeledRow
																		label="Bucket field"
																		name="bucketField"
																		tooltip="A numeric field for bucketing results along the X-axis. Timestamp for time series charts, numeric fields for histograms, can be disabled to aggregate all results within the time range."
																	>
																		<Combobox
																			selection={
																				settings.bucketByKey
																			}
																			setSelection={
																				setBucketByKey
																			}
																			searchConfig={
																				searchOptionsConfig
																			}
																			defaultKeys={[
																				TIMESTAMP_KEY,
																				...variableKeys,
																			]}
																			onlyNumericKeys
																			disabled={
																				isPreview
																			}
																		/>
																	</LabeledRow>
																	<LabeledRow
																		label="Buckets"
																		name="bucketCount"
																		tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets. Currently, the max is 100."
																	>
																		<Input
																			type="number"
																			name="bucketCount"
																			placeholder="Enter bucket count"
																			value={
																				settings.bucketCount
																			}
																			onChange={(
																				e,
																			) => {
																				const newValue =
																					Math.min(
																						MAX_BUCKET_SIZE,
																						parseInt(
																							e
																								.target
																								.value,
																						),
																					)

																				setBucketCount(
																					newValue,
																				)
																			}}
																			cssClass={
																				style.input
																			}
																			disabled={
																				isPreview
																			}
																		/>
																	</LabeledRow>
																</>
															)}
														{settings.bucketByEnabled &&
															settings.bucketBySetting ===
																'Interval' && (
																<LabeledRow
																	label="Bucket interval"
																	name="bucketInterval"
																	tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets."
																>
																	<Select
																		options={
																			BUCKET_FREQUENCIES
																		}
																		value={
																			settings.bucketInterval
																		}
																		onValueChange={(
																			o,
																		) => {
																			setBucketInterval(
																				o.value,
																			)
																		}}
																		disabled={
																			isPreview
																		}
																	/>
																</LabeledRow>
															)}
													</SidebarSection>
												)}
											</>
										)}
									</Stack>
								</Form>
							</Panel>
						</Box>
					</GraphContextProvider>
				</Box>
			</Box>
		</>
	)
}
