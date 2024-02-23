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
	useFormStore,
} from '@highlight-run/ui/components'
import { Divider } from 'antd'
import moment from 'moment'
import { PropsWithChildren, useState } from 'react'
import { Helmet } from 'react-helmet'

import { cmdKey } from '@/components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import Switch from '@/components/Switch/Switch'
import { useGetKeysQuery, useGetMetricsQuery } from '@/graph/generated/hooks'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import Graph from '@/pages/Graphing/components/Graph'

import * as style from './GraphingEditor.css'

const PRODUCTS: ProductType[] = [
	ProductType.Traces,
	ProductType.Logs,
	ProductType.Sessions,
	ProductType.Errors,
]

type View = 'Line chart' | 'Bar chart' | 'Pie chart' | 'Table' | 'List'
const VIEWS: View[] = ['Line chart', 'Bar chart', 'Pie chart', 'Table', 'List']

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
		<Box p="12" width="full" display="flex" flexDirection="column" gap="4">
			{props.children}
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

export const GraphingEditor = () => {
	const { projectId } = useProjectId()
	const [endDate] = useState(moment().toISOString())
	const [startDate] = useState(moment().subtract(4, 'hours').toISOString())
	const [productType, setProductType] = useState(PRODUCTS[0])
	const [viewType, setViewType] = useState(VIEWS[0])
	const [functionType, setFunctionType] = useState(FUNCTION_TYPES[0])
	const [query, setQuery] = useState('')
	const [metric, setMetric] = useState('')
	const [metricViewTitle, setMetricViewTitle] = useState('')
	const [groupByEnabled, setGroupByEnabled] = useState(false)
	const [groupByKeys, setGroupByKeys] = useState<string[]>([])

	const [limitFunctionType, setLimitFunctionType] = useState(
		FUNCTION_TYPES[0],
	)
	const [limit, setLimit] = useState(10)
	const [limitMetric, setLimitMetric] = useState('')

	const [bucketByEnabled, setBucketByEnabled] = useState(true)
	const [bucketByKey, setBucketByKey] = useState('Timestamp')
	const [bucketCount, setBucketCount] = useState(50)

	const formStore = useFormStore({
		defaultValues: {},
	})

	const { data: keys, loading: keysLoading } = useGetKeysQuery({
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

	const { data: metrics, loading: metricsLoading } = useGetMetricsQuery({
		variables: {
			product_type: productType,
			project_id: projectId,
			params: {
				date_range: {
					start_date: startDate,
					end_date: endDate,
				},
				query: query,
			},
			column: metric,
			metric_types: [functionType],
			group_by: groupByKeys,
			bucket_by: bucketByKey,
			limit: limit,
			limit_aggregator: limitFunctionType,
			limit_column: limitMetric,
		},
	})

	const data = metrics?.metrics.buckets.map((b) => {
		const seriesKey = [functionType as string].concat(b.group).join(' ')
		return {
			xAxis: b.bucket_min,
			[seriesKey]: b.metric_value,
		}
	})

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
							<Box position="absolute" width="full" height="full">
								<EditorBackground />
							</Box>
							<Box
								display="flex"
								cssClass={style.graphWrapper}
								shadow="small"
							>
								{data && (
									<Graph
										data={data}
										chartLabel={metricViewTitle}
										xAxisKey="xAxis"
										strokeColor="#000000"
										fillColor="#555555"
									/>
								)}
							</Box>
						</Box>
						<Box
							display="flex"
							borderLeft="dividerWeak"
							height="full"
							cssClass={style.editGraphSidebar}
						>
							<Form
								store={formStore}
								className={style.editGraphSidebar}
							>
								<SidebarSection>
									<Label
										label="Metric view title"
										name="title"
									/>
									<Input
										type="text"
										name="title"
										placeholder="Enter name displayed as the title"
										value={metricViewTitle}
										onChange={(e) => {
											setMetricViewTitle(e.target.value)
										}}
									/>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<Label label="Source" name="source" />
									<OptionDropdown<ProductType>
										options={PRODUCTS}
										selection={productType}
										setSelection={setProductType}
									/>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<Label label="View type" name="viewType" />
									<OptionDropdown<View>
										options={VIEWS}
										selection={viewType}
										setSelection={setViewType}
									/>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<Label label="Function" name="function" />
									<Box
										display="flex"
										flexDirection="row"
										gap="4"
										marginBottom="8"
									>
										<OptionDropdown<MetricAggregator>
											options={FUNCTION_TYPES}
											selection={functionType}
											setSelection={setFunctionType}
										/>
										<Input
											type="text"
											name="column"
											placeholder="Enter metric"
											value={metric}
											onChange={(e) => {
												setMetric(e.target.value)
											}}
										/>
									</Box>
									<Label label="Filters" name="query" />
									<Input
										type="text"
										name="query"
										placeholder="Enter search filters"
										value={query}
										onChange={(e) => {
											setQuery(e.target.value)
										}}
									/>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<Box
										display="flex"
										flexDirection="row"
										gap="6"
									>
										<Label
											label="Group by"
											name="groupBy"
										/>
										<Switch
											trackingId="groupByEnabled"
											size="small"
											checked={groupByEnabled}
											onChange={(enabled) => {
												setGroupByEnabled(enabled)
											}}
										/>
									</Box>
									{groupByEnabled && (
										<>
											<Box marginBottom="8">
												<Input
													type="text"
													name="groupBy"
													placeholder="Enter grouping keys"
													value={groupByKeys.join(
														' ',
													)}
													onChange={(e) => {
														setGroupByKeys(
															e.target.value.split(
																' ',
															),
														)
													}}
												/>
											</Box>
											<Box
												display="flex"
												flexDirection="row"
												gap="4"
											>
												<Box
													display="flex"
													flexDirection="column"
													gap="4"
												>
													<Label
														label="Limit"
														name="limit"
													/>
													<Input
														type="number"
														name="limit"
														placeholder="Enter limit"
														value={limit}
														onChange={(e) => {
															setLimit(
																Number(
																	e.target
																		.value,
																),
															)
														}}
													/>
												</Box>
												<Box
													display="flex"
													flexDirection="column"
													gap="4"
												>
													<Label
														label="By"
														name="limitBy"
													/>
													<Box
														display="flex"
														flexDirection="row"
														gap="4"
													>
														<OptionDropdown<MetricAggregator>
															options={
																FUNCTION_TYPES
															}
															selection={
																limitFunctionType
															}
															setSelection={
																setLimitFunctionType
															}
														/>
														<Input
															type="text"
															name="limitMetric"
															placeholder="Enter limit metric"
															value={limitMetric}
															onChange={(e) => {
																setLimitMetric(
																	e.target
																		.value,
																)
															}}
														/>
													</Box>
												</Box>
											</Box>
										</>
									)}
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<Box
										display="flex"
										flexDirection="row"
										gap="6"
									>
										<Label
											label="Bucket by"
											name="bucketBy"
										/>
										<Switch
											trackingId="bucketByEnabled"
											size="small"
											checked={bucketByEnabled}
											onChange={(enabled) => {
												setBucketByEnabled(enabled)
											}}
										/>
									</Box>
									{bucketByEnabled && (
										<>
											<Box marginBottom="8">
												<Input
													type="text"
													name="bucketBy"
													placeholder="Enter bucketing key"
													value={bucketByKey}
													onChange={(e) => {
														setBucketByKey(
															e.target.value,
														)
													}}
												/>
											</Box>
											<Label
												label="Buckets"
												name="bucketCount"
											/>
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
											/>
										</>
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
