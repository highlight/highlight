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
import { FREQUENCIES } from '@/pages/Alerts/AlertConfigurationCard/AlertConfigurationConstants'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { VariablesBar } from '@/pages/Graphing/components/VariablesBar'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { omit } from 'lodash'
import { EventSelectionStep, loadFunnelStep } from '@pages/Graphing/util'

type BucketBy = 'None' | 'Interval' | 'Count'
const BUCKET_BY_OPTIONS: BucketBy[] = ['None', 'Interval', 'Count']

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
					px="16"
					py="12"
					width="full"
					height="full"
					border="divider"
					borderRadius="8"
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
				g.bucketInterval
					? 'Interval'
					: g.bucketCount
						? 'Count'
						: 'None',
			)
		},
	})

	const { projectId } = useProjectId()

	const [productType, setProductType] = useState(productOptions[0].value)
	const [viewType, setViewType] = useState(VIEW_OPTIONS[0].value)
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

	const [bucketBySetting, setBucketBySetting] = useState(BUCKET_BY_OPTIONS[2])
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
		}
	}, [viewType])

	useEffect(() => {
		if (productType !== ProductType.Events) {
			setViewType(VIEW_OPTIONS[0].value)
		}
	}, [productType])

	const { values } = useGraphingVariables(dashboard_id!)

	const variableKeys = Array.from(values).map(([key]) => {
		return `$${key}`
	})

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
										bucketBySetting === 'Interval'
											? Number(bucketInterval)
											: undefined
									}
									groupByKeys={
										groupByEnabled ? groupByKeys : undefined
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
										groupByEnabled ? limitMetric : undefined
									}
									funnelSteps={funnelSteps}
									setTimeRange={updateSearchTime}
									variables={values}
								/>
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
											value={metricViewTitle}
											onChange={(e) => {
												setMetricViewTitle(
													e.target.value,
												)
											}}
											cssClass={style.input}
										/>
									</LabeledRow>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Source"
										name="source"
										tooltip="The resource being queried, one of the four highlight.io resources."
									>
										<OptionDropdown<ProductType>
											options={productOptions.filter(
												(p) =>
													p.value ===
														ProductType.Events ||
													viewType !== 'Funnel chart',
											)}
											selection={productType}
											setSelection={setProductType}
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
													v.value !== 'Funnel chart',
											)}
											selection={viewType}
											setSelection={(option: string) => {
												setViewType(option)
											}}
										/>
									</LabeledRow>
									{viewType === 'Line chart' && (
										<LineChartSettings
											nullHandling={lineNullHandling}
											setNullHandling={
												setLineNullHandling
											}
											lineDisplay={lineDisplay}
											setLineDisplay={setLineDisplay}
										/>
									)}
									{viewType === 'Bar chart' && (
										<BarChartSettings
											barDisplay={barDisplay}
											setBarDisplay={setBarDisplay}
										/>
									)}
									{viewType === 'Funnel chart' && (
										<FunnelChartSettings
											funnelDisplay={funnelDisplay}
											setFunnelDisplay={setFunnelDisplay}
										/>
									)}
									{viewType === 'Table' && (
										<TableSettings
											nullHandling={tableNullHandling}
											setNullHandling={
												setTableNullHandling
											}
										/>
									)}
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									{productType === ProductType.Events ? (
										viewType === 'Funnel chart' ? (
											<EventSteps
												steps={funnelSteps}
												setSteps={setFunnelSteps}
												startDate={startDate}
												endDate={endDate}
											/>
										) : (
											<EventSelection
												initialQuery={query}
												setQuery={setQuery}
												startDate={startDate}
												endDate={endDate}
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
													initialQuery={query}
													onSubmit={setQuery}
												>
													<Search
														startDate={
															new Date(startDate)
														}
														endDate={
															new Date(endDate)
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
											selection={functionType}
											setSelection={setFunctionType}
											disabled={
												viewType === 'Funnel chart'
											}
										/>
										<Combobox
											selection={fetchedMetric}
											setSelection={setMetric}
											searchConfig={searchOptionsConfig}
											disabled={
												functionType ===
													MetricAggregator.Count ||
												viewType === 'Funnel chart'
											}
											onlyNumericKeys={
												functionType !==
												MetricAggregator.CountDistinct
											}
											defaultKeys={variableKeys}
											placeholder={
												functionType ===
												MetricAggregator.Count
													? 'Rows'
													: undefined
											}
										/>
									</LabeledRow>
									<LabeledRow
										label="Group by"
										name="groupBy"
										enabled={groupByEnabled}
										setEnabled={setGroupByEnabled}
										disabled={viewType === 'Funnel chart'}
										tooltip="A categorical field for grouping results into separate series."
									>
										<Combobox
											selection={groupByKeys}
											setSelection={setGroupByKeys}
											searchConfig={searchOptionsConfig}
											defaultKeys={variableKeys}
											disabled={
												viewType === 'Funnel chart'
											}
										/>
									</LabeledRow>
									{groupByEnabled && (
										<Box
											display="flex"
											flexDirection="row"
											gap="4"
										>
											<LabeledRow
												label="Limit"
												name="limit"
												tooltip="The maximum number of groups to include."
											>
												<Input
													type="number"
													name="limit"
													placeholder="Enter limit"
													value={limit}
													onChange={(e) => {
														setLimit(e.target.value)
													}}
													cssClass={style.input}
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
														limitFunctionType
													}
													setSelection={
														setLimitFunctionType
													}
												/>
												<Combobox
													selection={
														fetchedLimitMetric
													}
													setSelection={
														setLimitMetric
													}
													searchConfig={
														searchOptionsConfig
													}
													disabled={
														limitFunctionType ===
														MetricAggregator.Count
													}
													onlyNumericKeys
													defaultKeys={variableKeys}
													placeholder={
														limitFunctionType ===
														MetricAggregator.Count
															? 'Rows'
															: undefined
													}
												/>
											</LabeledRow>
										</Box>
									)}
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									{viewType === 'Funnel chart' ? null : (
										<LabeledRow
											label="Bucket by"
											name="bucketBy"
											tooltip="The method for determining the bucket sizes - can be a fixed interval or fixed count."
										>
											<TagSwitchGroup
												options={BUCKET_BY_OPTIONS}
												defaultValue={bucketBySetting}
												onChange={(
													o: string | number,
												) => {
													setBucketBySetting(
														o as BucketBy,
													)
												}}
												cssClass={style.tagSwitch}
											/>
										</LabeledRow>
									)}
									{bucketBySetting === 'Count' && (
										<>
											<LabeledRow
												label="Bucket field"
												name="bucketField"
												tooltip="A numeric field for bucketing results along the X-axis. Timestamp for time series charts, numeric fields for histograms, can be disabled to aggregate all results within the time range."
											>
												<Combobox
													selection={bucketByKey}
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
												/>
											</LabeledRow>
											<LabeledRow
												label="Buckets"
												name="bucketCount"
												tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets."
											>
												<Input
													type="number"
													name="bucketCount"
													placeholder="Enter bucket count"
													value={bucketCount}
													onChange={(e) => {
														setBucketCount(
															e.target.value,
														)
													}}
													cssClass={style.input}
												/>
											</LabeledRow>
										</>
									)}
									{bucketBySetting === 'Interval' && (
										<LabeledRow
											label="Bucket interval"
											name="bucketInterval"
											tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets."
										>
											<Select
												options={FREQUENCIES}
												value={bucketInterval}
												onValueChange={(o) => {
													setBucketInterval(o.value)
												}}
											/>
										</LabeledRow>
									)}
								</SidebarSection>
							</Form>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
