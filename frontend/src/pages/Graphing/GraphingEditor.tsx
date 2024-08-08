import { toast } from '@components/Toaster'
import {
	Box,
	Button,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	Form,
	IconSolidClock,
	Input,
	presetStartDate,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { Divider } from 'antd'
import React, {
	PropsWithChildren,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'react-use'

import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import {
	useGetVisualizationQuery,
	useUpsertGraphMutation,
} from '@/graph/generated/hooks'
import {
	GraphInput,
	MetricAggregator,
	ProductType,
} from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { BAR_DISPLAY, BarDisplay } from '@/pages/Graphing/components/BarChart'
import Graph, {
	getViewConfig,
	TIMESTAMP_KEY,
	View,
	VIEW_ICONS,
	VIEW_LABELS,
	VIEWS,
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
	FUNCTION_TYPES,
	PRODUCT_ICONS,
	PRODUCTS,
} from './constants'
import * as style from './GraphingEditor.css'
import { LabeledRow } from './LabeledRow'
import { OptionDropdown } from './OptionDropdown'
import { BarChartSettings, LineChartSettings, TableSettings } from './Settings'

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

export const GraphingEditor: React.FC = () => {
	const { dashboard_id, graph_id } = useParams<{
		dashboard_id: string
		graph_id: string
	}>()

	const isEdit = graph_id !== undefined

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: DEFAULT_TIME_PRESETS,
			initialPreset: DEFAULT_TIME_PRESETS[2],
		})

	const [upsertGraph, upsertGraphContext] = useUpsertGraphMutation()

	const tempId = useId()

	const navigate = useNavigate()

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
			case 'Table':
				nullHandling = tableNullHandling
				break
		}

		const graphInput: GraphInput = {
			visualizationId: dashboard_id!,
			bucketByKey: bucketByEnabled ? bucketByKey : null,
			bucketCount: bucketByEnabled ? bucketCount : null,
			display,
			functionType,
			groupByKey: groupByEnabled ? groupByKey : null,
			limit: groupByEnabled ? limit : null,
			limitFunctionType: groupByEnabled ? limitFunctionType : null,
			limitMetric: groupByEnabled ? limitMetric : null,
			metric,
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
						graphs(existing: any[] = []) {
							return existing.concat([{ __ref: graphId }])
						},
					},
				})
			},
		})
			.then(() => {
				toast.success(`Metric view ${isEdit ? 'updated' : 'created'}`)
			})
			.catch(() => {
				toast.error('Failed to create metric view')
			})

		navigate({
			pathname: `../${dashboard_id}`,
			search: location.search,
		})
	}

	const { loading: metaLoading } = useGetVisualizationQuery({
		variables: {
			id: dashboard_id!,
		},
		skip: !isEdit,
		onCompleted: (data) => {
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
			} else if (viewType === 'Table') {
				setTableNullHandling(g.nullHandling as TableNullHandling)
			}

			setQuery(g.query)
			setDebouncedQuery(g.query)
			setMetric(g.metric)
			setMetricViewTitle(g.title)
			setGroupByEnabled(g.groupByKey !== null)
			setGroupByKey(g.groupByKey ?? '')
			setLimitFunctionType(g.limitFunctionType ?? FUNCTION_TYPES[0])
			setLimit(g.limit ?? 10)
			setLimitMetric(g.limitMetric ?? '')
			setBucketByEnabled(g.bucketByKey !== null)
			setBucketByKey(g.bucketByKey ?? '')
			setBucketCount(g.bucketCount ?? DEFAULT_BUCKET_COUNT)
		},
	})

	const { projectId } = useProjectId()

	const [productType, setProductType] = useState(PRODUCTS[0])
	const [viewType, setViewType] = useState(VIEWS[0])
	const [functionType, setFunctionType] = useState(FUNCTION_TYPES[0])
	const [lineNullHandling, setLineNullHandling] = useState(
		LINE_NULL_HANDLING[0],
	)
	const [tableNullHandling, setTableNullHandling] = useState(
		TABLE_NULL_HANDLING[0],
	)
	const [lineDisplay, setLineDisplay] = useState(LINE_DISPLAY[0])
	const [barDisplay, setBarDisplay] = useState(BAR_DISPLAY[0])

	const [query, setQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		300,
		[query],
	)

	const [metric, setMetric] = useState('')
	const [metricViewTitle, setMetricViewTitle] = useState('')
	const tempMetricViewTitle = useRef<string>('')
	const [groupByEnabled, setGroupByEnabled] = useState(false)
	const [groupByKey, setGroupByKey] = useState('')

	const [limitFunctionType, setLimitFunctionType] = useState(
		FUNCTION_TYPES[0],
	)
	const [limit, setLimit] = useState(10)
	const [limitMetric, setLimitMetric] = useState('')

	const [bucketByEnabled, setBucketByEnabled] = useState(true)
	const [bucketByKey, setBucketByKey] = useState(TIMESTAMP_KEY)
	const [bucketCount, setBucketCount] = useState(DEFAULT_BUCKET_COUNT)

	tempMetricViewTitle.current = useMemo(() => {
		let newViewTitle = ''
		const stringifiedFunctionType = functionType?.toString() ?? ''
		newViewTitle = metricViewTitle || stringifiedFunctionType || ''
		if (
			newViewTitle === stringifiedFunctionType &&
			stringifiedFunctionType
		) {
			newViewTitle += metric ? `(${metric})` : ''
		}
		newViewTitle = newViewTitle
			? `${newViewTitle} Of ${productType?.toString() ?? ''}`
			: newViewTitle
		return newViewTitle
	}, [functionType, metric, metricViewTitle, productType])

	let display: string | undefined
	let nullHandling: string | undefined
	if (viewType === 'Line chart') {
		display = lineDisplay
		nullHandling = lineNullHandling
	} else if (viewType === 'Bar chart') {
		display = barDisplay
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

	if (metaLoading) {
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
								presets={DEFAULT_TIME_PRESETS}
								minDate={presetStartDate(
									DEFAULT_TIME_PRESETS[5],
								)}
							/>
							<HeaderDivider />
							<Button
								emphasis="low"
								kind="secondary"
								onClick={() => {
									navigate({
										pathname: `../${dashboard_id}`,
										search: location.search,
									})
								}}
							>
								Cancel
							</Button>
							<Button
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
						height="full"
					>
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
								bucketByKey={
									bucketByEnabled ? bucketByKey : undefined
								}
								bucketCount={
									bucketByEnabled ? bucketCount : undefined
								}
								groupByKey={
									groupByEnabled ? groupByKey : undefined
								}
								limit={groupByEnabled ? limit : undefined}
								limitFunctionType={
									groupByEnabled
										? limitFunctionType
										: undefined
								}
								limitMetric={
									groupByEnabled ? limitMetric : undefined
								}
								setTimeRange={updateSearchTime}
							/>
						</GraphBackgroundWrapper>
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
										label="View type"
										name="viewType"
									>
										<OptionDropdown<View>
											options={VIEWS}
											selection={viewType}
											setSelection={setViewType}
											icons={VIEW_ICONS}
											labels={VIEW_LABELS}
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
									<LabeledRow
										label="Source"
										name="source"
										tooltip="The resource being queried, one of the four highlight.io resources."
									>
										<OptionDropdown<ProductType>
											options={PRODUCTS}
											selection={productType}
											setSelection={setProductType}
											icons={PRODUCT_ICONS}
										/>
									</LabeledRow>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Function"
										name="function"
										tooltip="Determines how data points are aggregated. If the function requires a numeric field as input, one can be chosen."
									>
										<OptionDropdown<MetricAggregator>
											options={FUNCTION_TYPES}
											selection={functionType}
											setSelection={setFunctionType}
										/>
										{functionType !==
											MetricAggregator.Count && (
											<Combobox
												selection={metric}
												setSelection={setMetric}
												label="metric"
												searchConfig={
													searchOptionsConfig
												}
												onlyNumericKeys={
													functionType !==
													MetricAggregator.CountDistinct
												}
											/>
										)}
									</LabeledRow>
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
													endDate={new Date(endDate)}
													productType={productType}
													hideIcon
												/>
											</SearchContext>
										</Box>
									</LabeledRow>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Group by"
										name="groupBy"
										enabled={groupByEnabled}
										setEnabled={setGroupByEnabled}
										tooltip="A categorical field for grouping results into separate series."
									>
										<Combobox
											selection={groupByKey}
											setSelection={setGroupByKey}
											label="groupBy"
											searchConfig={searchOptionsConfig}
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
														setLimit(
															Number(
																e.target.value,
															),
														)
													}}
													cssClass={style.input}
												/>
											</LabeledRow>
											<LabeledRow
												label="By"
												name="limitBy"
												tooltip="The function used to determine which groups are included."
											>
												<OptionDropdown<MetricAggregator>
													options={FUNCTION_TYPES}
													selection={
														limitFunctionType
													}
													setSelection={
														setLimitFunctionType
													}
												/>
												{limitFunctionType !==
													MetricAggregator.Count && (
													<Combobox
														selection={limitMetric}
														setSelection={
															setLimitMetric
														}
														label="limitMetric"
														searchConfig={
															searchOptionsConfig
														}
														onlyNumericKeys
													/>
												)}
											</LabeledRow>
										</Box>
									)}
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Bucket by"
										name="bucketBy"
										enabled={bucketByEnabled}
										setEnabled={setBucketByEnabled}
										tooltip="A numeric field for bucketing results along the X-axis. Timestamp for time series charts, numeric fields for histograms, can be disabled to aggregate all results within the time range."
									>
										<Combobox
											selection={bucketByKey}
											setSelection={setBucketByKey}
											label="bucketBy"
											searchConfig={searchOptionsConfig}
											defaultKeys={[TIMESTAMP_KEY]}
											onlyNumericKeys
										/>
									</LabeledRow>
									{bucketByEnabled && (
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
														Number(e.target.value),
													)
												}}
												cssClass={style.input}
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
