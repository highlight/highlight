import {
	Badge,
	Box,
	Button,
	Form,
	IconSolidCheveronDown,
	Input,
	Label,
	Menu,
	Text,
} from '@highlight-run/ui/components'
import { Divider } from 'antd'
import moment from 'moment'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useDebounce, usePrevious } from 'react-use'

import { cmdKey } from '@/components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import Switch from '@/components/Switch/Switch'
import { useGetKeysQuery, useGetMetricsQuery } from '@/graph/generated/hooks'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import Graph, {
	LINE_DISPLAY,
	LineDisplay,
	NULL_HANDLING,
	NullHandling,
	View,
	VIEWS,
} from '@/pages/Graphing/components/Graph'

import * as style from './GraphingEditor.css'

const TIMESTAMP_KEY = 'Timestamp'
const DEFAULT_BUCKET_COUNT = 50

const PRODUCTS: ProductType[] = [
	ProductType.Logs,
	ProductType.Traces,
	ProductType.Sessions,
	ProductType.Errors,
]

const FUNCTION_TYPES: MetricAggregator[] = [
	MetricAggregator.Count,
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
}: {
	options: string[]
	selection: string
	setSelection: (option: T) => void
}) => {
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
					<Box>{selection}</Box>
					<IconSolidCheveronDown />
				</Box>
			</Menu.Button>
			<Menu.List>
				{options.map((p) => (
					<Menu.Item
						key={p}
						onClick={() => {
							setSelection(p as T)
						}}
					>
						{p}
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
	nullHandling: NullHandling
	setNullHandling: (option: NullHandling) => void
	lineDisplay: LineDisplay
	setLineDisplay: (option: LineDisplay) => void
}) => (
	<>
		<LabeledRow label="Line display" name="lineDisplay">
			<OptionDropdown
				options={LINE_DISPLAY}
				selection={lineDisplay}
				setSelection={setLineDisplay}
			/>
		</LabeledRow>
		<LabeledRow label="Nulls" name="nullHandling">
			<OptionDropdown
				options={NULL_HANDLING}
				selection={nullHandling}
				setSelection={setNullHandling}
			/>
		</LabeledRow>
	</>
)

export const GraphingEditor = () => {
	const { projectId } = useProjectId()
	const [endDate] = useState(moment().toISOString())
	const [startDate] = useState(moment().subtract(4, 'hours').toISOString())

	const [productType, setProductType] = useState(PRODUCTS[0])
	const [viewType, setViewType] = useState(VIEWS[0])
	const [functionType, setFunctionType] = useState(FUNCTION_TYPES[0])
	const [nullHandling, setNullHandling] = useState(NULL_HANDLING[0])
	const [lineDisplay, setLineDisplay] = useState(LINE_DISPLAY[0])
	const [query, setQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		500,
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

	const [bucketByEnabled, setBucketByEnabled] = useState(false)
	const [bucketByKey, setBucketByKey] = useState('')
	const [bucketCount, setBucketCount] = useState(DEFAULT_BUCKET_COUNT)

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

	const { data: metrics, loading: metricsLoading } = useGetMetricsQuery({
		variables: {
			product_type: productType,
			project_id: projectId,
			params: {
				date_range: {
					start_date: startDate,
					end_date: endDate,
				},
				query: debouncedQuery,
			},
			column: metric,
			metric_types: [functionType],
			group_by: groupByEnabled ? [groupByKey] : [],
			bucket_by: bucketByEnabled ? bucketByKey : TIMESTAMP_KEY,
			bucket_count: bucketByEnabled ? bucketCount : DEFAULT_BUCKET_COUNT,
			limit: limit,
			limit_aggregator: limitFunctionType,
			limit_column: limitMetric,
		},
	})

	// Retain previous data - in case of loading, keep returning old data
	let metricsToUse = usePrevious(metrics)
	if (metrics !== undefined) {
		metricsToUse = metrics
	}

	let data: any[] | undefined
	if (metricsToUse?.metrics.buckets) {
		data = []
		for (let i = 0; i < bucketCount; i++) {
			data.push({})
		}

		const seriesKeys = new Set<string>()
		for (const b of metricsToUse.metrics.buckets) {
			const seriesKey = b.group.join(' ')
			seriesKeys.add(seriesKey)
			data[b.bucket_id][bucketByKey] = (b.bucket_min + b.bucket_max) / 2
			data[b.bucket_id][seriesKey] = b.metric_value
		}

		if (nullHandling === 'Zero') {
			for (let i = 0; i < bucketCount; i++) {
				for (const key of seriesKeys) {
					data[i][key] = data[i][key] ?? 0
				}
			}
		}
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
							Edit Metric View
						</Text>
						<Box display="flex" gap="4">
							<Button emphasis="low" kind="secondary">
								Cancel
							</Button>
							<Button>
								Create metric view&nbsp;
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
						height="full"
					>
						<Box
							display="flex"
							position="relative"
							width="full"
							height="full"
						>
							<Box
								position="absolute"
								width="full"
								height="full"
								cssClass={style.graphBackground}
							>
								<EditorBackground />
							</Box>

							<Graph
								data={data}
								loading={metricsLoading}
								title={metricViewTitle}
								xAxisMetric={bucketByKey}
								yAxisMetric={metric}
								viewConfig={{
									type: 'Line chart',
									display: lineDisplay,
									nullHandling: nullHandling,
								}}
							/>
						</Box>
						<Box
							display="flex"
							borderLeft="dividerWeak"
							height="full"
							cssClass={style.editGraphSidebar}
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
											placeholder="Enter name displayed as the title"
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
										/>
									</LabeledRow>
									{viewType === 'Line chart' && (
										<LineChartSettings
											nullHandling={nullHandling}
											setNullHandling={setNullHandling}
											lineDisplay={lineDisplay}
											setLineDisplay={setLineDisplay}
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
												options={numericKeys}
												selection={metric}
												setSelection={setMetric}
											/>
										)}
									</LabeledRow>
									<LabeledRow label="Filters" name="query">
										<Input
											type="text"
											name="query"
											placeholder="Enter search filters"
											value={query}
											onChange={(e) => {
												setQuery(e.target.value)
											}}
											cssClass={style.input}
										/>
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
