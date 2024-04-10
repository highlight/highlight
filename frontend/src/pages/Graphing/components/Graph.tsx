import {
	Box,
	Button,
	IconSolidArrowsExpand,
	IconSolidLink,
	IconSolidPencil,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'

import { useGetMetricsQuery } from '@/graph/generated/hooks'
import { Maybe, MetricAggregator, ProductType } from '@/graph/generated/schemas'
import {
	BarChart,
	BarChartConfig,
	BarDisplay,
} from '@/pages/Graphing/components/BarChart'
import {
	LineChart,
	LineChartConfig,
	LineDisplay,
	LineNullHandling,
} from '@/pages/Graphing/components/LineChart'
import {
	MetricTable,
	TableConfig,
	TableNullHandling,
} from '@/pages/Graphing/components/Table'
import { HistogramLoading } from '@/pages/Traces/TracesPage'

import * as style from './Graph.css'

export type View = 'Line chart' | 'Bar chart' | 'Table'
export const VIEWS: View[] = ['Line chart', 'Bar chart', 'Table']

export const TIMESTAMP_KEY = 'Timestamp'
export const GROUP_KEY = 'Group'
const MAX_LABEL_CHARS = 100

export type PieChartConfig = {
	type: 'Pie chart'
	showLegend: true
}

export type ListConfig = {
	type: 'List'
	showLegend: false
}

export type ViewConfig =
	| LineChartConfig
	| BarChartConfig
	| PieChartConfig
	| TableConfig
	| ListConfig

export interface ChartProps<TConfig> {
	title: string
	productType: ProductType
	projectId: string
	startDate: string
	endDate: string
	query: string
	metric: string
	functionType: MetricAggregator
	groupByKey?: string
	bucketByKey?: string
	bucketCount?: number
	limit?: number
	limitFunctionType?: MetricAggregator
	limitMetric?: string
	viewConfig: TConfig
	onShare?: () => void
	onExpand?: () => void
	onEdit?: () => void
}

export interface InnerChartProps<TConfig> {
	data: any[] | undefined
	xAxisMetric: string
	yAxisMetric: string
	yAxisFunction: string
	title?: string
	loading?: boolean
	viewConfig: TConfig
}

export interface SeriesInfo {
	series: string[]
	spotlight?: number | undefined
}

export const strokeColors = ['#0090FF', '#D6409F']

export const getColor = (idx: number): string => {
	return strokeColors[idx % strokeColors.length]
}

const formatNumber = (n: number | null) => {
	if (n === null) {
		return 'null'
	}
	if (n < 10000) {
		return parseFloat(n.toPrecision(4)).toString()
	}
	const k = 1000
	const sizes = ['', 'K', 'M', 'B', 'T']
	const i = Math.max(
		Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length),
		0,
	)
	const res = n / Math.pow(k, i)
	return parseFloat(res.toPrecision(3)) + sizes[i]
}

const durationUnitMap: [number, string][] = [
	[1, 'ns'],
	[1000, 'µs'],
	[1000, 'ms'],
	[1000, 's'],
	[60, 'm'],
	[60, 'h'],
	[24, 'd'],
]

export const getTickFormatter = (metric: string, bucketCount?: number) => {
	if (metric === 'Timestamp') {
		return (value: any) => moment(value * 1000).format('HH:mm')
	} else if (metric === 'duration') {
		return (value: any) => {
			let lastUnit = 'ns'
			for (const entry of durationUnitMap) {
				if (value / entry[0] < 1) {
					break
				}
				value /= entry[0]
				lastUnit = entry[1]
			}
			return `${value.toFixed(0)}${lastUnit}`
		}
	} else if (metric === GROUP_KEY) {
		const maxChars = Math.max(MAX_LABEL_CHARS / (bucketCount || 1), 10)
		return (value: any) => {
			let result = value.toString() as string
			if (result.length > maxChars) {
				result = result.substring(0, maxChars - 3) + '...'
			}
			return result
		}
	} else {
		return (value: any) => formatNumber(value)
	}
}

export const getCustomTooltip =
	(xAxisMetric: any, yAxisMetric: any) =>
	({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<Box cssClass={style.tooltipWrapper}>
					<Text
						size="xxSmall"
						weight="medium"
						color="default"
						cssClass={style.tooltipText}
					>
						{getTickFormatter(xAxisMetric)(label)}
					</Text>
					{payload.map((p: any, idx: number) => (
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							key={idx}
						>
							<Box
								style={{
									backgroundColor:
										strokeColors[idx % strokeColors.length],
								}}
								cssClass={style.tooltipDot}
							></Box>
							<Text
								size="xxSmall"
								weight="medium"
								color="default"
								cssClass={style.tooltipText}
							>
								{getTickFormatter(yAxisMetric)(p.value)}
							</Text>
						</Box>
					))}
				</Box>
			)
		}

		return null
	}

export const CustomYAxisTick = ({
	y,
	payload,
	tickFormatter,
}: {
	y: any
	payload: any
	tickFormatter: (value: any, index: number) => string
}) => (
	<g transform={`translate(${0},${y})`}>
		<text
			x={0}
			y={0}
			fontSize={10}
			fill={vars.theme.static.content.weak}
			textAnchor="start"
			orientation="left"
		>
			{tickFormatter(payload.value, payload.index)}
		</text>
	</g>
)

export const CustomXAxisTick = ({
	x,
	y,
	payload,
	tickFormatter,
}: {
	x: any
	y: any
	payload: any
	tickFormatter: (value: any, index: number) => string
}) => (
	<g transform={`translate(${x},${y})`}>
		<text
			x={0}
			y={0}
			dy={4}
			fontSize={10}
			fill={vars.theme.static.content.weak}
			textAnchor="middle"
			orientation="bottom"
			width={30}
		>
			{tickFormatter(payload.value, payload.index)}
		</text>
	</g>
)

export const isActive = (spotlight: number | undefined, idx: number) =>
	spotlight === undefined || spotlight === idx

export const getViewConfig = (
	viewType: string,
	display?: Maybe<string>,
	nullHandling?: Maybe<string>,
): ViewConfig => {
	let viewConfig: ViewConfig
	if (viewType === 'Line chart') {
		viewConfig = {
			type: viewType,
			showLegend: true,
			display: display as LineDisplay,
			nullHandling: nullHandling as LineNullHandling,
		}
	} else if (viewType === 'Bar chart') {
		viewConfig = {
			type: viewType,
			showLegend: true,
			display: display as BarDisplay,
		}
	} else if (viewType === 'Table') {
		viewConfig = {
			type: viewType,
			showLegend: false,
			nullHandling: nullHandling as TableNullHandling,
		}
	} else {
		viewConfig = {
			type: 'Line chart',
			showLegend: true,
		}
	}
	return viewConfig
}

const Graph = ({
	productType,
	projectId,
	startDate,
	endDate,
	query,
	metric,
	functionType,
	groupByKey,
	bucketByKey,
	bucketCount,
	limit,
	limitFunctionType,
	limitMetric,
	title,
	viewConfig,
	onShare,
	onExpand,
	onEdit,
}: ChartProps<ViewConfig>) => {
	const [graphHover, setGraphHover] = useState(false)
	const queriedBucketCount = bucketByKey !== undefined ? bucketCount : 1
	const showMenu =
		onShare !== undefined || onExpand !== undefined || onEdit !== undefined

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
			group_by: groupByKey !== undefined ? [groupByKey] : [],
			bucket_by: bucketByKey !== undefined ? bucketByKey : TIMESTAMP_KEY,
			bucket_count: queriedBucketCount,
			limit: limit,
			limit_aggregator: limitFunctionType,
			limit_column: limitMetric,
		},
	})

	const xAxisMetric = bucketByKey !== undefined ? bucketByKey : GROUP_KEY
	const yAxisMetric = functionType === MetricAggregator.Count ? '' : metric
	const yAxisFunction = functionType

	const data = useMemo(() => {
		let data: any[] | undefined
		if (metrics?.metrics.buckets) {
			if (xAxisMetric !== GROUP_KEY) {
				data = []
				for (let i = 0; i < metrics.metrics.bucket_count; i++) {
					data.push({})
				}

				const seriesKeys = new Set<string>()
				for (const b of metrics.metrics.buckets) {
					const seriesKey = b.group.join(' ')
					seriesKeys.add(seriesKey)
					data[b.bucket_id][xAxisMetric] =
						(b.bucket_min + b.bucket_max) / 2
					data[b.bucket_id][seriesKey] = b.metric_value
				}
			} else {
				data = []
				for (const b of metrics.metrics.buckets) {
					data.push({
						[GROUP_KEY]: b.group.join(' '),
						'': b.metric_value,
					})
				}
			}
		}
		return data
	}, [metrics?.metrics.bucket_count, metrics?.metrics.buckets, xAxisMetric])

	const series = useMemo(
		() =>
			_.uniq(data?.flatMap((d) => Object.keys(d))).filter(
				(key) => key !== xAxisMetric,
			),
		[data, xAxisMetric],
	)

	const [spotlight, setSpotlight] = useState<number | undefined>()

	// Reset spotlight when `series` is updated
	useEffect(() => {
		setSpotlight(undefined)
	}, [series])

	let innerChart: JSX.Element | null = null
	switch (viewConfig.type) {
		case 'Line chart':
			innerChart = (
				<LineChart
					data={data}
					xAxisMetric={xAxisMetric}
					yAxisMetric={yAxisMetric}
					yAxisFunction={yAxisFunction}
					viewConfig={viewConfig}
					series={series}
					spotlight={spotlight}
				/>
			)
			break
		case 'Bar chart':
			innerChart = (
				<BarChart
					data={data}
					xAxisMetric={xAxisMetric}
					yAxisMetric={yAxisMetric}
					yAxisFunction={yAxisFunction}
					viewConfig={viewConfig}
					series={series}
					spotlight={spotlight}
				/>
			)
			break
		case 'Table':
			innerChart = (
				<MetricTable
					data={data}
					xAxisMetric={xAxisMetric}
					yAxisMetric={yAxisMetric}
					yAxisFunction={yAxisFunction}
					viewConfig={viewConfig}
					series={series}
				/>
			)
			break
	}

	const showLegend = viewConfig.showLegend && series.join('') !== ''
	return (
		<Box
			position="relative"
			width="full"
			height="full"
			display="flex"
			flexDirection="column"
			justifyContent="space-between"
			onMouseEnter={() => {
				setGraphHover(true)
			}}
			onMouseLeave={() => {
				setGraphHover(false)
			}}
		>
			{metricsLoading && (
				<Box
					position="absolute"
					width="full"
					height="full"
					display="flex"
					alignItems="center"
					justifyContent="center"
					cssClass={style.loadingOverlay}
				>
					<HistogramLoading cssClass={style.loadingText} />
				</Box>
			)}
			<Box display="flex" flexDirection="column" gap="4">
				<Box
					display="flex"
					flexDirection="row"
					justifyContent="space-between"
				>
					<Text
						size="small"
						color="default"
						cssClass={style.titleText}
					>
						{title || 'Untitled metric view'}
					</Text>
					{showMenu && graphHover && (
						<Box
							cssClass={
								graphHover
									? style.titleText
									: clsx(style.titleText, style.hiddenMenu)
							}
						>
							{onShare !== undefined && (
								<Button
									size="xSmall"
									emphasis="low"
									kind="secondary"
									iconLeft={<IconSolidLink />}
									onClick={onShare}
								/>
							)}
							{onExpand !== undefined && (
								<Button
									size="xSmall"
									emphasis="low"
									kind="secondary"
									iconLeft={<IconSolidArrowsExpand />}
									onClick={onExpand}
								/>
							)}
							{onEdit !== undefined && (
								<Button
									size="xSmall"
									emphasis="low"
									kind="secondary"
									iconLeft={<IconSolidPencil />}
									onClick={onEdit}
								/>
							)}
						</Box>
					)}
				</Box>
				<Box position="relative" cssClass={style.legendWrapper}>
					{showLegend &&
						series.map((key, idx) => {
							return (
								<Button
									kind="secondary"
									emphasis="low"
									size="xSmall"
									key={key}
									onClick={() => {
										if (spotlight === idx) {
											setSpotlight(undefined)
										} else {
											setSpotlight(idx)
										}
									}}
									cssClass={style.legendTextButton}
								>
									<Tooltip
										delayed
										trigger={
											<>
												<Box
													style={{
														backgroundColor:
															isActive(
																spotlight,
																idx,
															)
																? strokeColors[
																		idx %
																			strokeColors.length
																  ]
																: undefined,
													}}
													cssClass={style.legendDot}
												></Box>
												<Box
													cssClass={
														style.legendTextWrapper
													}
												>
													<Text
														lines="1"
														color={
															isActive(
																spotlight,
																idx,
															)
																? undefined
																: 'n8'
														}
														align="left"
													>
														{key || '<empty>'}
													</Text>
												</Box>
											</>
										}
									>
										{key || '<empty>'}
									</Tooltip>
								</Button>
							)
						})}
				</Box>
			</Box>
			<Box
				height="full"
				maxHeight="screen"
				key={series.join(';')} // Hacky but recharts' ResponsiveContainer has issues when this height changes so just rerender the whole thing
			>
				{innerChart}
			</Box>
		</Box>
	)
}

export default Graph
