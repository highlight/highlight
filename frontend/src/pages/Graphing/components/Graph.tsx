import {
	Badge,
	Box,
	Button,
	DateRangePreset,
	IconSolidArrowsExpand,
	IconSolidChartSquareBar,
	IconSolidChartSquareLine,
	IconSolidDocumentReport,
	IconSolidDotsHorizontal,
	IconSolidPencil,
	IconSolidTable,
	IconSolidTrash,
	Menu,
	presetStartDate,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'
import _ from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReferenceArea } from 'recharts'
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useGetMetricsLazyQuery } from '@/graph/generated/hooks'
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
export const VIEW_ICONS = [
	<IconSolidChartSquareLine size={16} key="line chart" />,
	<IconSolidChartSquareBar size={16} key="bar chart" />,
	<IconSolidTable size={16} key="table" />,
]
export const VIEW_LABELS = ['Line chart', 'Bar chart / histogram', 'Table']

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
	startDate: Date
	endDate: Date
	selectedPreset?: DateRangePreset
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
	disabled?: boolean
	onDelete?: () => void
	onExpand?: () => void
	onEdit?: () => void
	setTimeRange?: (startDate: Date, endDate: Date) => void
}

export interface InnerChartProps<TConfig> {
	data: any[] | undefined
	xAxisMetric: string
	yAxisMetric: string
	yAxisFunction: string
	title?: string
	loading?: boolean
	viewConfig: TConfig
	disabled?: boolean
	onMouseDown?: CategoricalChartFunc
	onMouseMove?: CategoricalChartFunc
	onMouseUp?: CategoricalChartFunc
}

export interface SeriesInfo {
	series: string[]
	spotlight?: number | undefined
	strokeColors?: string[]
}

const strokeColors = [
	'#0090FF',
	'#D6409F',
	'#744ED4',
	'#F76B15',
	'#BDEE63',
	'#29A383',
	'#E5484D',
	'#FFE629',
	'#46A758',
	'#3E63DD',
]

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

export const getTickFormatter = (metric: string, data?: any[] | undefined) => {
	if (metric === 'Timestamp') {
		if (data === undefined) {
			return (value: any) => moment(value * 1000).format('MM/DD HH:mm:SS')
		}

		const start = data.at(0).Timestamp * 1000
		const end = data.at(data.length - 1).Timestamp * 1000
		const diffMinutes = moment(end).diff(start, 'minutes')
		if (diffMinutes < 15) {
			return (value: any) => moment(value * 1000).format('HH:mm:SS')
		} else if (diffMinutes < 12 * 60) {
			return (value: any) => moment(value * 1000).format('HH:mm')
		} else {
			return (value: any) => moment(value * 1000).format('MM/DD')
		}
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
	} else if (metric === 'percent') {
		return (value: any) => {
			return `${value.toFixed(1)}%`
		}
	} else if (metric === GROUP_KEY) {
		const maxChars = Math.max(MAX_LABEL_CHARS / (data?.length || 1), 10)
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
									backgroundColor: p.color,
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
			className={style.tickText}
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
			className={style.tickText}
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

const POLL_INTERVAL_VALUE = 1000 * 60
const LONGER_POLL_INTERVAL_VALUE = 1000 * 60 * 5

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
	disabled,
	onDelete,
	onExpand,
	onEdit,
	setTimeRange,
	selectedPreset,
}: ChartProps<ViewConfig>) => {
	const [graphHover, setGraphHover] = useState(false)
	const queriedBucketCount = bucketByKey !== undefined ? bucketCount : 1
	const showMenu =
		onDelete !== undefined || onExpand !== undefined || onEdit !== undefined

	const pollTimeout = useRef<number>()
	const [pollInterval, setPollInterval] = useState<number>(0)
	const [fetchStart, setFetchStart] = useState<Date>()
	const [fetchEnd, setFetchEnd] = useState<Date>()

	const [getMetrics, { data: metrics, called }] = useGetMetricsLazyQuery()

	const rebaseFetchTime = useCallback(() => {
		if (!selectedPreset) {
			setPollInterval(0)
			setFetchStart(startDate)
			setFetchEnd(endDate)
			return
		}

		const newStartFetch = presetStartDate(selectedPreset)
		const newPollInterval =
			moment().diff(newStartFetch, 'hours') > 5
				? LONGER_POLL_INTERVAL_VALUE
				: POLL_INTERVAL_VALUE

		setPollInterval(newPollInterval)
		setFetchStart(newStartFetch)
		setFetchEnd(moment().toDate())
	}, [selectedPreset, startDate, endDate])

	// set the fetch dates and poll interval when selected date changes
	useEffect(() => {
		rebaseFetchTime()
	}, [rebaseFetchTime])

	// fetch new metrics when varaibles change (including polled fetch time)
	useEffect(() => {
		if (!fetchStart || !fetchEnd) {
			return
		}

		getMetrics({
			variables: {
				product_type: productType,
				project_id: projectId,
				params: {
					date_range: {
						start_date: moment(fetchStart)
							.startOf('minute')
							.format(TIME_FORMAT),
						end_date: moment(fetchEnd)
							.startOf('minute')
							.format(TIME_FORMAT),
					},
					query: query,
				},
				column: metric,
				metric_types: [functionType],
				group_by: groupByKey !== undefined ? [groupByKey] : [],
				bucket_by:
					bucketByKey !== undefined ? bucketByKey : TIMESTAMP_KEY,
				bucket_count: queriedBucketCount,
				limit: limit,
				limit_aggregator: limitFunctionType,
				limit_column: limitMetric,
			},
		}).then(() => {
			// create another poll timeout if pollInterval is set
			if (pollInterval) {
				pollTimeout.current = setTimeout(
					rebaseFetchTime,
					pollInterval,
				) as unknown as number
			}
		})

		return () => {
			if (!!pollTimeout.current) {
				clearTimeout(pollTimeout.current)
				pollTimeout.current = undefined
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		bucketByKey,
		fetchEnd,
		fetchStart,
		functionType,
		getMetrics,
		groupByKey,
		limit,
		limitFunctionType,
		limitMetric,
		metric,
		productType,
		projectId,
		queriedBucketCount,
		query,
	])

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

	const [refAreaStart, setRefAreaStart] = useState<number | undefined>()
	const [refAreaEnd, setRefAreaEnd] = useState<number | undefined>()

	const referenceArea =
		refAreaStart && refAreaEnd ? (
			<ReferenceArea
				x1={refAreaStart}
				x2={refAreaEnd}
				strokeOpacity={0.3}
			/>
		) : null

	const allowDrag =
		setTimeRange !== undefined && xAxisMetric === TIMESTAMP_KEY

	const onMouseDown: CategoricalChartFunc | undefined = allowDrag
		? (e) => {
				if (e.activeLabel !== undefined) {
					setRefAreaStart(Number(e.activeLabel))
				}
		  }
		: undefined

	const onMouseMove: CategoricalChartFunc | undefined = allowDrag
		? (e) => {
				if (refAreaStart !== undefined && e.activeLabel !== undefined) {
					setRefAreaEnd(Number(e.activeLabel))
				}
		  }
		: undefined

	const onMouseUp: CategoricalChartFunc | undefined = allowDrag
		? () => {
				if (refAreaStart !== undefined && refAreaEnd !== undefined) {
					const startDate = Math.min(refAreaStart, refAreaEnd)
					const endDate = Math.max(refAreaStart, refAreaEnd)

					setTimeRange(
						new Date(startDate * 1000),
						new Date(endDate * 1000),
					)
				}
				setRefAreaStart(undefined)
				setRefAreaEnd(undefined)
		  }
		: undefined

	let isEmpty = data !== undefined
	for (const d of data ?? []) {
		for (const v of Object.values(d)) {
			if (!!v) {
				isEmpty = false
			}
		}
	}

	let innerChart: JSX.Element | null = null
	if (isEmpty) {
		innerChart = (
			<Stack
				width="full"
				height="full"
				alignItems="center"
				justifyContent="center"
			>
				<Badge
					size="medium"
					shape="basic"
					variant="gray"
					label="No data found"
					iconStart={<IconSolidDocumentReport />}
				/>
			</Stack>
		)
	} else {
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
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
					>
						{referenceArea}
					</LineChart>
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
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
					>
						{referenceArea}
					</BarChart>
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
						disabled={disabled}
					/>
				)
				break
		}
	}

	const showLegend = viewConfig.showLegend && series.join('') !== ''
	return (
		<Box
			position="relative"
			width="full"
			height="full"
			display="flex"
			flexDirection="column"
			gap="4"
			justifyContent="space-between"
			onMouseEnter={() => {
				setGraphHover(true)
			}}
			onMouseLeave={() => {
				setGraphHover(false)
			}}
		>
			{!called && (
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
			<Box display="flex" flexDirection="column">
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
					{showMenu && graphHover && !disabled && called && (
						<Box
							cssClass={clsx(style.titleText, {
								[style.hiddenMenu]: !graphHover,
							})}
						>
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
							{onDelete !== undefined && (
								<Menu>
									<Menu.Button
										size="medium"
										emphasis="low"
										kind="secondary"
										iconLeft={<IconSolidDotsHorizontal />}
										onClick={(e: any) => {
											e.stopPropagation()
										}}
									/>
									<Menu.List>
										<Menu.Item
											onClick={(e) => {
												e.stopPropagation()
												onDelete()
											}}
										>
											<Box
												display="flex"
												alignItems="center"
												gap="4"
											>
												<IconSolidTrash />
												Delete metric view
											</Box>
										</Menu.Item>
									</Menu.List>
								</Menu>
							)}
						</Box>
					)}
				</Box>
				{showLegend && (
					<Box position="relative" cssClass={style.legendWrapper}>
						{series.map((key, idx) => {
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
																? getColor(idx)
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
				)}
			</Box>
			{called && (
				<Box
					height="full"
					maxHeight="screen"
					key={series.join(';')} // Hacky but recharts' ResponsiveContainer has issues when this height changes so just rerender the whole thing
					cssClass={clsx({ [style.disabled]: disabled })}
				>
					{innerChart}
				</Box>
			)}
		</Box>
	)
}

export default Graph
