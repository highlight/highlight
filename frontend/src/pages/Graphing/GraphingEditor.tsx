import {
	Badge,
	Box,
	Button,
	Form,
	IconSolidCheveronDown,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	IconSolidSparkles,
	Input,
	Label,
	Menu,
	Stack,
	TagSwitchGroup,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { Divider, message } from 'antd'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'react-use'

import { cmdKey } from '@/components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import Switch from '@/components/Switch/Switch'
import TimeRangePicker from '@/components/TimeRangePicker/TimeRangePicker'
import {
	useGetKeysQuery,
	useGetVisualizationQuery,
	useUpsertGraphMutation,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import {
	GraphInput,
	MetricAggregator,
	ProductType,
} from '@/graph/generated/schemas'
import useDataTimeRange from '@/hooks/useDataTimeRange'
import { useProjectId } from '@/hooks/useProjectId'
import { BAR_DISPLAY, BarDisplay } from '@/pages/Graphing/components/BarChart'
import Graph, {
	getViewConfig,
	TIMESTAMP_KEY,
	View,
	VIEW_ICONS,
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

import * as style from './GraphingEditor.css'

const DEFAULT_BUCKET_COUNT = 50

const PRODUCTS: ProductType[] = [
	ProductType.Logs,
	ProductType.Traces,
	ProductType.Sessions,
	ProductType.Errors,
]

const PRODUCT_ICONS = [
	<IconSolidLogs key="logs" />,
	<IconSolidSparkles key="traces" />,
	<IconSolidPlayCircle key="sessions" />,
	<IconSolidLightningBolt key="errors" />,
]

const FUNCTION_TYPES: MetricAggregator[] = [
	MetricAggregator.Count,
	MetricAggregator.CountDistinct,
	MetricAggregator.Min,
	MetricAggregator.Avg,
	MetricAggregator.P50,
	MetricAggregator.P90,
	MetricAggregator.P95,
	MetricAggregator.P99,
	MetricAggregator.Max,
	MetricAggregator.Sum,
]

const SidebarSection = (props: PropsWithChildren) => {
	return (
		<Box p="12" width="full" display="flex" flexDirection="column" gap="12">
			{props.children}
		</Box>
	)
}

const LabeledRow = ({
	label,
	name,
	enabled,
	setEnabled,
	children,
}: PropsWithChildren<{
	label: string
	name: string
	enabled?: boolean
	setEnabled?: (value: boolean) => void
}>) => {
	return (
		<Box width="full" display="flex" flexDirection="column" gap="4">
			<Box display="flex" flexDirection="row" gap="6">
				<Label label={label} name={name} />
				{setEnabled !== undefined && (
					<Switch
						trackingId={`${label}-switch`}
						size="small"
						checked={enabled}
						onChange={(enabled) => {
							setEnabled(enabled)
						}}
					/>
				)}
			</Box>
			{enabled !== false ? (
				<Box display="flex" flexDirection="row" gap="4">
					{children}
				</Box>
			) : null}
		</Box>
	)
}

const OptionDropdown = <T extends string>({
	options,
	selection,
	setSelection,
	icons,
}: {
	options: T[]
	selection: T
	setSelection: (option: T) => void
	icons?: JSX.Element[]
}) => {
	const selectedIndex = options.indexOf(selection)
	const selectedIcon = icons?.at(selectedIndex)
	return (
		<Menu>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="medium"
				cssClass={style.menuButton}
			>
				<Box
					width="full"
					display="flex"
					alignItems="center"
					gap="4"
					justifyContent="space-between"
				>
					<Stack direction="row" alignItems="center" gap="4">
						{selectedIcon}
						{selection}
					</Stack>
					<IconSolidCheveronDown />
				</Box>
			</Menu.Button>
			<Menu.List>
				{options.map((p, idx) => (
					<Menu.Item
						key={p}
						onClick={() => {
							setSelection(p as T)
						}}
					>
						<Stack direction="row" alignItems="center" gap="4">
							{icons?.at(idx)}
							{p}
						</Stack>
					</Menu.Item>
				))}
			</Menu.List>
		</Menu>
	)
}

const EditorBackground = () => {
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
					<circle fill="#c8c7cb" cx="7" cy="7" r="1" />
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

const LineChartSettings = ({
	nullHandling,
	setNullHandling,
	lineDisplay,
	setLineDisplay,
}: {
	nullHandling: LineNullHandling
	setNullHandling: (option: LineNullHandling) => void
	lineDisplay: LineDisplay
	setLineDisplay: (option: LineDisplay) => void
}) => (
	<>
		<LabeledRow label="Line display" name="lineDisplay">
			<TagSwitchGroup
				options={LINE_DISPLAY}
				defaultValue={lineDisplay}
				onChange={(o: string | number) => {
					setLineDisplay(o as LineDisplay)
				}}
				cssClass={style.tagSwitch}
			/>
		</LabeledRow>
		<LabeledRow label="Nulls" name="lineNullHandling">
			<TagSwitchGroup
				options={LINE_NULL_HANDLING}
				defaultValue={nullHandling}
				onChange={(o: string | number) => {
					console.log('setNullHandling', o)
					setNullHandling(o as LineNullHandling)
				}}
				cssClass={style.tagSwitch}
			/>
		</LabeledRow>
	</>
)

const BarChartSettings = ({
	barDisplay,
	setBarDisplay,
}: {
	barDisplay: BarDisplay
	setBarDisplay: (option: BarDisplay) => void
}) => (
	<>
		<LabeledRow label="Bar display" name="barDisplay">
			<TagSwitchGroup
				options={BAR_DISPLAY}
				defaultValue={barDisplay}
				onChange={(o: string | number) => {
					setBarDisplay(o as BarDisplay)
				}}
				cssClass={style.tagSwitch}
			/>
		</LabeledRow>
	</>
)

const TableSettings = ({
	nullHandling,
	setNullHandling,
}: {
	nullHandling: TableNullHandling
	setNullHandling: (option: TableNullHandling) => void
}) => (
	<>
		<LabeledRow label="Nulls" name="tableNullHandling">
			<TagSwitchGroup
				options={TABLE_NULL_HANDLING}
				defaultValue={nullHandling}
				onChange={(o: string | number) => {
					setNullHandling(o as TableNullHandling)
				}}
				cssClass={style.tagSwitch}
			/>
		</LabeledRow>
	</>
)

export const GraphingEditor = () => {
	const { dashboard_id, graph_id } = useParams<{
		dashboard_id: string
		graph_id: string
	}>()

	const isEdit = graph_id !== undefined

	const { timeRange } = useDataTimeRange()

	const [upsertGraph, upsertGraphContext] = useUpsertGraphMutation({
		refetchQueries: [namedOperations.Query.GetVisualization],
	})

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
			title: metricViewTitle,
			type: viewType,
		}

		if (isEdit) {
			graphInput.id = graph_id
		}

		upsertGraph({
			variables: {
				graph: graphInput,
			},
		})
			.then(() => {
				navigate(`../${dashboard_id}`)
				message.success(`Metric view ${isEdit ? 'updated' : 'created'}`)
			})
			.catch(() => {
				message.error('Failed to create metric view')
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
	const [groupByEnabled, setGroupByEnabled] = useState(false)
	const [groupByKey, setGroupByKey] = useState('')

	const [limitFunctionType, setLimitFunctionType] = useState(
		FUNCTION_TYPES[0],
	)
	const [limit, setLimit] = useState(10)
	const [limitMetric, setLimitMetric] = useState('')

	const [bucketByEnabled, setBucketByEnabled] = useState(true)
	const [bucketByKey, setBucketByKey] = useState('')
	const [bucketCount, setBucketCount] = useState(DEFAULT_BUCKET_COUNT)

	const startDate = timeRange.start_date
	const endDate = timeRange.end_date

	const { data: keys } = useGetKeysQuery({
		variables: {
			product_type: productType,
			project_id: projectId,
			date_range: {
				start_date: startDate,
				end_date: endDate,
			},
			query: '',
		},
	})

	const allKeys = useMemo(
		() => keys?.keys.map((k) => k.name).slice(0, 10) ?? [],
		[keys],
	)
	const numericKeys = useMemo(
		() =>
			keys?.keys
				.filter((k) => k.type === 'Numeric')
				.map((k) => k.name)
				.slice(0, 10) ?? [],
		[keys],
	)
	const bucketByKeys = useMemo(
		() => [TIMESTAMP_KEY].concat(numericKeys).slice(0, 10),
		[numericKeys],
	)

	useEffect(() => {
		setGroupByKey(allKeys[0] ?? '')
		setMetric(numericKeys[0] ?? '')
		setLimitMetric(numericKeys[0] ?? '')
		setBucketByKey(bucketByKeys[0] ?? '')
	}, [allKeys, bucketByKeys, numericKeys])

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

	if (metaLoading) {
		return null
	}

	return (
		<>
			<Helmet>
				<title>Edit Metric View</title>
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
							<TimeRangePicker emphasis="low" kind="secondary" />
							<HeaderDivider />
							<Button
								emphasis="low"
								kind="secondary"
								onClick={() => {
									navigate(`../${dashboard_id}`)
								}}
							>
								Cancel
							</Button>
							<Button
								disabled={upsertGraphContext.loading}
								onClick={onSave}
							>
								Save&nbsp;
								<Badge
									variant="outlinePurple"
									shape="basic"
									size="small"
									label={[cmdKey, 'S'].join('+')}
								/>
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
							display="flex"
							position="relative"
							height="full"
							cssClass={style.previewWindow}
						>
							<Box
								position="absolute"
								width="full"
								height="full"
								cssClass={style.graphBackground}
							>
								<EditorBackground />
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
									<Graph
										title={metricViewTitle}
										viewConfig={viewConfig}
										productType={productType}
										projectId={projectId}
										startDate={startDate}
										endDate={endDate}
										query={debouncedQuery}
										metric={metric}
										functionType={functionType}
										bucketByKey={
											bucketByEnabled
												? bucketByKey
												: undefined
										}
										bucketCount={
											bucketByEnabled
												? bucketCount
												: undefined
										}
										groupByKey={
											groupByEnabled
												? groupByKey
												: undefined
										}
										limit={
											groupByEnabled ? limit : undefined
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
									/>
								</Box>
							</Box>
						</Box>
						<Box
							display="flex"
							borderLeft="dividerWeak"
							height="full"
							cssClass={style.editGraphSidebar}
							overflowY="auto"
							overflowX="hidden"
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
											placeholder="Untitled metric view"
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
									<LabeledRow label="Source" name="source">
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
										label="View type"
										name="viewType"
									>
										<OptionDropdown<View>
											options={VIEWS}
											selection={viewType}
											setSelection={setViewType}
											icons={VIEW_ICONS}
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
										label="Function"
										name="function"
									>
										<OptionDropdown<MetricAggregator>
											options={FUNCTION_TYPES}
											selection={functionType}
											setSelection={setFunctionType}
										/>
										{functionType !==
											MetricAggregator.Count && (
											<OptionDropdown<string>
												options={
													functionType ===
													MetricAggregator.CountDistinct
														? allKeys
														: numericKeys
												}
												selection={metric}
												setSelection={setMetric}
											/>
										)}
									</LabeledRow>
									<LabeledRow label="Filters" name="query">
										<Box
											border="divider"
											width="full"
											borderRadius="6"
										>
											<Search
												initialQuery={query}
												query={query}
												setQuery={setQuery}
												startDate={new Date(startDate)}
												endDate={new Date(endDate)}
												productType={productType}
												onFormSubmit={setQuery}
												hideIcon
											/>
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
									>
										<OptionDropdown<string>
											options={allKeys}
											selection={groupByKey}
											setSelection={setGroupByKey}
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
													<OptionDropdown<string>
														options={numericKeys}
														selection={limitMetric}
														setSelection={
															setLimitMetric
														}
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
									>
										<OptionDropdown<string>
											options={bucketByKeys}
											selection={bucketByKey}
											setSelection={setBucketByKey}
										/>
									</LabeledRow>
									{bucketByEnabled && (
										<LabeledRow
											label="Buckets"
											name="bucketCount"
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
