import { toast } from '@components/Toaster'
import {
	Box,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	Form,
	IconSolidClock,
	Input,
	Select,
	TagSwitchGroup,
	Text,
} from '@highlight-run/ui/components'
import { FUNNEL_DISPLAY, FunnelDisplay } from '@pages/Graphing/components/types'
import { useParams } from '@util/react-router/useParams'
import { Divider } from 'antd'
import React, {
	PropsWithChildren,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'react-use'

import { Button } from '@/components/Button'
import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import {
	useGetVisualizationQuery,
	useUpsertGraphMutation,
	useDeleteGraphMutation,
} from '@/graph/generated/hooks'
import {
	GraphInput,
	MetricAggregator,
	ProductType,
	Graph as GraphType,
} from '@/graph/generated/schemas'
import useFeatureFlag, { Feature } from '@/hooks/useFeatureFlag/useFeatureFlag'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { BAR_DISPLAY, BarDisplay } from '@/pages/Graphing/components/BarChart'
import Graph, {
	getViewConfig,
	TIMESTAMP_KEY,
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
import { HeaderDivider } from '@/pages/Graphing/Dashboard'

import { Combobox } from './Combobox'
import {
	DEFAULT_BUCKET_COUNT,
	DEFAULT_BUCKET_INTERVAL,
	FUNCTION_TYPES,
	PRODUCT_OPTIONS,
	PRODUCT_OPTIONS_WITH_EVENTS,
} from './constants'
import * as style from './GraphingEditor.css'
import { LabeledRow } from './LabeledRow'
import { OptionDropdown } from './OptionDropdown'
import {
	FunnelChartSettings,
	BarChartSettings,
	LineChartSettings,
	TableSettings,
} from './Settings'
import { EventSteps } from '@pages/Graphing/EventSelection/EventSteps'
import { EventSelection } from '@pages/Graphing/EventSelection'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { VariablesBar } from '@/pages/Graphing/components/VariablesBar'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { omit } from 'lodash'
import {
	BUCKET_FREQUENCIES,
	EventSelectionStep,
	loadFunnelStep,
} from '@pages/Graphing/util'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { GraphContextProvider } from './context/GraphContext'
import TemplateMenu from '@/pages/Graphing/TemplateMenu'

type BucketBy = 'None' | 'Interval' | 'Count'
const BUCKET_BY_OPTIONS: BucketBy[] = ['None', 'Interval', 'Count']

const MAX_BUCKET_SIZE = 100
const MAX_LIMIT_SIZE = 100
const NO_LIMIT = 1_000_000_000_000

const SidebarSection = (props: PropsWithChildren) => {
	return (
		<Box p="12" width="full" display="flex" flexDirection="column" gap="12">
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
		default:
			return undefined
	}
}

export const GraphingEditor: React.FC = () => {
	const { dashboard_id, graph_id } = useParams<{
		dashboard_id: string
		graph_id: string
	}>()

	const eventSearchEnabled = useFeatureFlag(Feature.EventSearch)
	const productOptions = useMemo(() => {
		if (!eventSearchEnabled) {
			return PRODUCT_OPTIONS
		}
		return PRODUCT_OPTIONS_WITH_EVENTS
	}, [eventSearchEnabled])

	const [showTemplates, setShowTemplates] = useState(false)

	const isEdit = graph_id !== undefined

	const { presets, minDate } = useRetentionPresets()

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: presets,
			initialPreset: DEFAULT_TIME_PRESETS[2],
		})

	const [upsertGraph, upsertGraphContext] = useUpsertGraphMutation()
	const [deleteGraph] = useDeleteGraphMutation()

	const tempId = useId()

	const navigate = useNavigate()
	const redirectToDashboard = () => {
		navigate({
			pathname: `../${dashboard_id}`,
			search: location.search,
		})
	}

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
			visualizationId: dashboard_id!,
			bucketByKey: getBucketByKey(bucketBySetting, bucketByKey) ?? null,
			bucketCount:
				bucketBySetting === 'Count' ? Number(bucketCount) : null,
			bucketInterval:
				bucketBySetting === 'Interval' ? Number(bucketInterval) : null,
			display,
			functionType,
			groupByKeys: groupByEnabled ? groupByKeys : null,
			limit: groupByEnabled ? Number(limit) : null,
			limitFunctionType: groupByEnabled ? limitFunctionType : null,
			limitMetric: groupByEnabled ? fetchedLimitMetric : null,
			funnelSteps:
				viewType === 'Funnel chart'
					? funnelSteps.map((s) => omit(s, 'event'))
					: [],
			metric: fetchedMetric,
			nullHandling,
			productType,
			query: debouncedQuery,
			title: metricViewTitle || tempMetricViewTitle?.current,
			type: viewType,
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
					id: dashboard_id,
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
				toast.success(`Metric view ${isEdit ? 'updated' : 'created'}`)
				redirectToDashboard()
			})
			.catch(() => {
				toast.error('Failed to create metric view')
			})
	}

	const onDelete = () => {
		if (!isEdit) {
			return
		}

		deleteGraph({
			variables: {
				id: graph_id,
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
				toast.success('Metric view deleted')
				redirectToDashboard()
			})
			.catch(() => toast.error('Failed to delete metric view'))
	}

	const applyGraph = (g: GraphType) => {
		const viewType = g.type as View
		setProductType(g.productType)
		setViewType(viewType)
		setFunctionType(g.functionType)

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
		setMetric(g.metric)
		setMetricViewTitle(g.title)
		setGroupByEnabled((g.groupByKeys ?? []).length > 0)
		setGroupByKeys(g.groupByKeys ?? [])
		setLimitFunctionType(g.limitFunctionType ?? FUNCTION_TYPES[0])
		setLimit(g.limit ?? 10)
		setLimitMetric(g.limitMetric ?? '')
		setFunnelSteps((g.funnelSteps ?? []).map(loadFunnelStep))
		setBucketByKey(g.bucketByKey ?? '')
		setBucketCount(g.bucketCount ?? DEFAULT_BUCKET_COUNT)
		setBucketInterval(g.bucketInterval ?? DEFAULT_BUCKET_INTERVAL)
		setBucketBySetting(
			g.bucketInterval ? 'Interval' : g.bucketCount ? 'Count' : 'None',
		)
	}

	useGetVisualizationQuery({
		variables: {
			id: dashboard_id!,
		},
		onCompleted: (data) => {
			setCompleted(true)

			const g = data.visualization.graphs.find((g) => g.id === graph_id)
			if (g === undefined) {
				return
			}

			applyGraph(g)
		},
	})

	const { projectId } = useProjectId()
	const graphContext = useGraphData()

	const [productType, setProductTypeImpl] = useState(productOptions[0].value)
	const setProductType = (pt: ProductType) => {
		if (productType !== ProductType.Events && viewType === 'Funnel chart') {
			setViewType(VIEW_OPTIONS[0].value as View)
		}
		setProductTypeImpl(pt)
	}

	const [viewType, setViewTypeImpl] = useState(VIEW_OPTIONS[0].value)
	const setViewType = (vt: View) => {
		if (vt === 'Funnel chart') {
			setBucketBySetting('None')
			setFunctionType(MetricAggregator.CountDistinct)
			// once events have other session attributes, we can support per-user aggregation
			setMetric('secure_session_id')
			setGroupByEnabled(true)
			setGroupByKeys(['secure_session_id'])
			setLimit(Number.MAX_VALUE)
		} else if (viewType === 'Table') {
			setLimit(NO_LIMIT)
		}
		setViewTypeImpl(vt)
	}

	const [lineNullHandling, setLineNullHandling] = useState(
		LINE_NULL_HANDLING[0],
	)
	const [tableNullHandling, setTableNullHandling] = useState(
		TABLE_NULL_HANDLING[0],
	)
	const [lineDisplay, setLineDisplay] = useState(LINE_DISPLAY[0])
	const [barDisplay, setBarDisplay] = useState(BAR_DISPLAY[0])
	const [funnelDisplay, setFunnelDisplay] = useState(FUNNEL_DISPLAY[0])

	const [query, setQuery] = useState('')
	const [funnelSteps, setFunnelSteps] = useState<EventSelectionStep[]>([])
	const [debouncedQuery, setDebouncedQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		300,
		[query],
	)

	const [functionType, setFunctionType] = useState(FUNCTION_TYPES[0])
	const [metric, setMetric] = useState('')

	const fetchedMetric = useMemo(() => {
		return functionType === MetricAggregator.Count ? '' : metric
	}, [functionType, metric])

	const [metricViewTitle, setMetricViewTitle] = useState('')
	const tempMetricViewTitle = useRef<string>('')
	const [groupByEnabled, setGroupByEnabled] = useState(false)
	const [groupByKeys, setGroupByKeys] = useState<string[]>([])

	const [limitFunctionType, setLimitFunctionType] = useState(
		FUNCTION_TYPES[0],
	)
	const [limit, setLimit] = useState<number | string>(10)
	const [limitMetric, setLimitMetric] = useState('')
	const fetchedLimitMetric = useMemo(() => {
		return limitFunctionType === MetricAggregator.Count ? '' : limitMetric
	}, [limitFunctionType, limitMetric])

	const [bucketBySetting, setBucketBySetting] = useState(BUCKET_BY_OPTIONS[1])
	const [bucketByKey, setBucketByKey] = useState(TIMESTAMP_KEY)
	const [bucketCount, setBucketCount] = useState<number | string>(
		DEFAULT_BUCKET_COUNT,
	)
	const [bucketInterval, setBucketInterval] = useState<number | string>(
		DEFAULT_BUCKET_INTERVAL,
	)

	const [completed, setCompleted] = useState(!isEdit)

	tempMetricViewTitle.current = useMemo(() => {
		let newViewTitle = ''
		const stringifiedFunctionType = functionType?.toString() ?? ''
		newViewTitle = metricViewTitle || stringifiedFunctionType || ''
		if (
			newViewTitle === stringifiedFunctionType &&
			stringifiedFunctionType
		) {
			newViewTitle += fetchedMetric ? `(${fetchedMetric})` : ''
		}
		newViewTitle = newViewTitle
			? `${newViewTitle} Of ${productType?.toString() ?? ''}`
			: newViewTitle
		return newViewTitle
	}, [fetchedMetric, functionType, metricViewTitle, productType])

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
	const viewConfig = getViewConfig(viewType, display, nullHandling)

	const searchOptionsConfig = useMemo(() => {
		return {
			productType,
			startDate,
			endDate,
		}
	}, [endDate, productType, startDate])

	useEffect(() => {
		if (viewType === 'Funnel chart') {
			setBucketBySetting('None')
			setFunctionType(MetricAggregator.CountDistinct)
			// once events have other session attributes, we can support per-user aggregation
			setMetric('secure_session_id')
			setGroupByEnabled(true)
			setGroupByKeys(['secure_session_id'])
			setLimit(NO_LIMIT)
		} else if (viewType === 'Table') {
			setLimit(NO_LIMIT)
		}
	}, [viewType])

	const { values } = useGraphingVariables(dashboard_id!)

	const variableKeys = Array.from(values).map(([key]) => {
		return `$${key}`
	})

	const [graphPreview, setGraphPreview] = useState<GraphType | undefined>(
		undefined,
	)
	const isPreview = graphPreview !== undefined || showTemplates

	const settings = {
		productType,
		viewType,
		functionType,
		lineNullHandling,
		lineDisplay,
		barDisplay,
		funnelDisplay,
		tableNullHandling,
		query,
		fetchedMetric,
		metricViewTitle,
		groupByEnabled,
		groupByKeys,
		limitFunctionType,
		limit,
		funnelSteps,
		bucketByKey,
		bucketCount,
		bucketInterval,
		bucketBySetting,
		fetchedLimitMetric,
	}

	if (graphPreview !== undefined) {
		const viewType = graphPreview.type as View

		settings.productType = graphPreview.productType
		settings.viewType = viewType
		settings.functionType = graphPreview.functionType

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
		settings.fetchedMetric =
			graphPreview.functionType === MetricAggregator.Count
				? ''
				: graphPreview.metric
		console.log('fetchedMetric', settings.fetchedMetric)
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
		settings.bucketByKey = graphPreview.bucketByKey ?? '10'
		settings.bucketCount = graphPreview.bucketCount ?? DEFAULT_BUCKET_COUNT
		settings.bucketInterval =
			graphPreview.bucketInterval ?? DEFAULT_BUCKET_INTERVAL
		settings.bucketBySetting = graphPreview.bucketInterval
			? 'Interval'
			: graphPreview.bucketCount
				? 'Count'
				: 'None'
	}

	if (!completed) {
		return null
	}

	return (
		<>
			<Helmet>
				<title>{isEdit ? 'Edit' : 'Create'} Metric View</title>
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
							{isEdit ? 'Edit' : 'Create'} metric view
						</Text>
						<Box display="flex" gap="4">
							<Button
								trackingId="showTemplates"
								emphasis="medium"
								kind="secondary"
								onClick={() => setShowTemplates(true)}
							>
								Templates
							</Button>
							<HeaderDivider />
							<DateRangePicker
								iconLeft={<IconSolidClock size={14} />}
								emphasis="medium"
								kind="secondary"
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
								trackingId="MetricViewCancel"
								emphasis="low"
								kind="secondary"
								onClick={redirectToDashboard}
							>
								Cancel
							</Button>
							{isEdit && (
								<Button
									trackingId="MetricViewDelete"
									kind="danger"
									onClick={onDelete}
								>
									Delete metric view
								</Button>
							)}
							<Button
								trackingId="MetricViewSave"
								disabled={upsertGraphContext.loading}
								onClick={onSave}
							>
								Save&nbsp;
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
								width="full"
								display="flex"
								flexDirection="column"
								justifyContent="space-between"
							>
								<VariablesBar dashboardId={dashboard_id!} />
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
												title={
													metricViewTitle ||
													tempMetricViewTitle?.current
												}
												viewConfig={viewConfig}
												productType={productType}
												projectId={projectId}
												startDate={startDate}
												selectedPreset={selectedPreset}
												endDate={endDate}
												query={debouncedQuery}
												metric={metric}
												functionType={functionType}
												bucketByKey={getBucketByKey(
													bucketBySetting,
													bucketByKey,
												)}
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
											/>
										</Box>
									)}
								</GraphBackgroundWrapper>
							</Box>
							<Box
								display="flex"
								borderLeft="dividerWeak"
								height="full"
								cssClass={style.editGraphSidebar}
								overflowY="auto"
								overflowX="hidden"
								flexShrink={0}
							>
								<Form className={style.editGraphSidebar}>
									<SidebarSection>
										<LabeledRow
											label="Metric view title"
											name="title"
										>
											<Input
												type="text"
												name="title"
												placeholder={
													tempMetricViewTitle?.current ||
													'Untitled metric view'
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
									</SidebarSection>
									<Divider className="m-0" />
									<SidebarSection>
										<LabeledRow
											label="Source"
											name="source"
											tooltip="The resource being queried, one of the five highlight.io resources."
										>
											<OptionDropdown<ProductType>
												options={productOptions.filter(
													(p) =>
														p.value ===
															ProductType.Events ||
														viewType !==
															'Funnel chart',
												)}
												selection={settings.productType}
												setSelection={(s) => {
													s !==
														settings.productType &&
														setProductType(s)
												}}
												disabled={isPreview}
											/>
										</LabeledRow>
									</SidebarSection>
									<Divider className="m-0" />
									<SidebarSection>
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
									</SidebarSection>
									<Divider className="m-0" />
									<SidebarSection>
										{settings.productType ===
										ProductType.Events ? (
											settings.viewType ===
											'Funnel chart' ? (
												<EventSteps
													steps={settings.funnelSteps}
													setSteps={setFunnelSteps}
													startDate={startDate}
													endDate={endDate}
													// disabled={isPreview}
												/>
											) : (
												<EventSelection
													initialQuery={
														settings.query
													}
													setQuery={setQuery}
													startDate={startDate}
													endDate={endDate}
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
														onSubmit={setQuery}
														disabled={isPreview}
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
									</SidebarSection>
									<Box px="12">
										<Divider className="m-0" />
									</Box>
									<SidebarSection>
										<LabeledRow
											label="Function"
											name="function"
											tooltip="Determines how data points are aggregated. If the function requires a numeric field as input, one can be chosen."
										>
											<OptionDropdown
												options={FUNCTION_TYPES}
												selection={
													settings.functionType
												}
												setSelection={setFunctionType}
												disabled={
													settings.viewType ===
														'Funnel chart' ||
													isPreview
												}
											/>
											<Combobox
												selection={
													settings.fetchedMetric
												}
												setSelection={setMetric}
												searchConfig={
													searchOptionsConfig
												}
												disabled={
													settings.functionType ===
														MetricAggregator.Count ||
													settings.viewType ===
														'Funnel chart' ||
													isPreview
												}
												onlyNumericKeys={
													settings.functionType !==
													MetricAggregator.CountDistinct
												}
												defaultKeys={variableKeys}
												placeholder={
													settings.functionType ===
													MetricAggregator.Count
														? 'Rows'
														: undefined
												}
											/>
										</LabeledRow>
										<LabeledRow
											label="Group by"
											name="groupBy"
											enabled={settings.groupByEnabled}
											setEnabled={setGroupByEnabled}
											disabled={
												settings.viewType ===
													'Funnel chart' || isPreview
											}
											tooltip="A categorical field for grouping results into separate series."
										>
											<Combobox
												selection={settings.groupByKeys}
												setSelection={setGroupByKeys}
												searchConfig={
													searchOptionsConfig
												}
												defaultKeys={variableKeys}
												disabled={
													settings.viewType ===
														'Funnel chart' ||
													isPreview
												}
											/>
										</LabeledRow>
										{settings.groupByEnabled &&
										viewType !== 'Table' &&
										viewType !== 'Funnel chart' ? (
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
														value={settings.limit}
														onChange={(e) => {
															const value =
																Math.min(
																	viewType ===
																		'Table'
																		? NO_LIMIT
																		: MAX_LIMIT_SIZE,
																	parseInt(
																		e.target
																			.value,
																	),
																)
															setLimit(value)
														}}
														cssClass={style.input}
														disabled={isPreview}
													/>
												</LabeledRow>
												<LabeledRow
													label="By"
													name="limitBy"
													tooltip="The function used to determine which groups are included."
												>
													<OptionDropdown
														options={FUNCTION_TYPES}
														selection={
															settings.limitFunctionType
														}
														setSelection={
															setLimitFunctionType
														}
														disabled={isPreview}
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
									<Divider className="m-0" />
									<SidebarSection>
										{settings.viewType ===
										'Funnel chart' ? null : (
											<LabeledRow
												label="Bucket by"
												name="bucketBy"
												tooltip="The method for determining the bucket sizes - can be a fixed interval or fixed count."
											>
												<TagSwitchGroup
													options={BUCKET_BY_OPTIONS}
													defaultValue={
														settings.bucketBySetting
													}
													onChange={(
														o: string | number,
													) => {
														setBucketBySetting(
															o as BucketBy,
														)
													}}
													cssClass={style.tagSwitch}
													disabled={isPreview}
												/>
											</LabeledRow>
										)}
										{settings.bucketBySetting ===
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
														disabled={isPreview}
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
														onChange={(e) => {
															const newValue =
																Math.min(
																	MAX_BUCKET_SIZE,
																	parseInt(
																		e.target
																			.value,
																	),
																)

															setBucketCount(
																newValue,
															)
														}}
														cssClass={style.input}
														disabled={isPreview}
													/>
												</LabeledRow>
											</>
										)}
										{settings.bucketBySetting ===
											'Interval' && (
											<LabeledRow
												label="Bucket interval"
												name="bucketInterval"
												tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets."
											>
												<Select
													options={BUCKET_FREQUENCIES}
													value={
														settings.bucketInterval
													}
													onValueChange={(o) => {
														setBucketInterval(
															o.value,
														)
													}}
													disabled={isPreview}
												/>
											</LabeledRow>
										)}
									</SidebarSection>
								</Form>
							</Box>
						</Box>
					</GraphContextProvider>
				</Box>
			</Box>
		</>
	)
}
