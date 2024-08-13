import {
	Badge,
	Box,
	Button,
	ButtonIcon,
	DateRangePreset,
	IconSolidArrowsExpand,
	IconSolidChartSquareBar,
	IconSolidChartSquareLine,
	IconSolidDocumentReport,
	IconSolidDotsHorizontal,
	IconSolidDuplicate,
	IconSolidExternalLink,
	IconSolidLoading,
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
import { ReferenceArea, Tooltip as RechartsTooltip } from 'recharts'
import { CategoricalChartState } from 'recharts/types/chart/types'

import { loadingIcon } from '@/components/Button/style.css'
import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useGetMetricsLazyQuery } from '@/graph/generated/hooks'
import { GetMetricsQuery } from '@/graph/generated/operations'
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
export const BUCKET_MIN_KEY = 'BucketMin'
export const BUCKET_MAX_KEY = 'BucketMax'
export const NO_GROUP_PLACEHOLDER = '<empty>'
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
	bucketByWindow?: number
	limit?: number
	limitFunctionType?: MetricAggregator
	limitMetric?: string
	viewConfig: TConfig
	disabled?: boolean
	onClone?: () => void
	onDelete?: () => void
	onExpand?: () => void
	onEdit?: () => void
	setTimeRange?: SetTimeRange
	loadExemplars?: LoadExemplars
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
	setTimeRange?: SetTimeRange
	loadExemplars?: LoadExemplars
}

export interface SeriesInfo {
	series: string[]
	spotlight?: number | undefined
	strokeColors?: string[] | Map<string, string>
}

export interface AxisConfig {
	showXAxis?: boolean
	showYAxis?: boolean
	showGrid?: boolean
}

export type LoadExemplars = (
	bucketMin: number | undefined,
	bucketMax: number | undefined,
	group: string | undefined,
) => void

export type SetTimeRange = (startDate: Date, endDate: Date) => void

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

export const useGraphCallbacks = (
	xAxisMetric: string,
	yAxisMetric: string,
	yAxisFunction: string,
	setTimeRange?: SetTimeRange,
	loadExemplars?: LoadExemplars,
) => {
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

	const chartRef = useRef<HTMLDivElement>(null)
	const tooltipRef = useRef<HTMLDivElement>(null)

	const [mouseMoveState, setMouseMoveState] =
		useState<CategoricalChartState>()
	const [frozenTooltip, setFrozenTooltip] = useState<CategoricalChartState>()

	const allowDrag = setTimeRange !== undefined

	const onMouseDown = allowDrag
		? (e: CategoricalChartState) => {
				if (frozenTooltip || !loadExemplars) {
					return
				}

				const tooltipRect = tooltipRef.current?.getBoundingClientRect()
				const chartRect = chartRef.current?.getBoundingClientRect()
				if (
					chartRect !== undefined &&
					tooltipRect !== undefined &&
					frozenTooltip === undefined
				) {
					e.chartX = tooltipRect.x - chartRect.x
					e.chartY = tooltipRect.y - chartRect.y
					e.activePayload = e.activePayload?.filter(
						(v) => ![undefined, null].includes(v.value),
					)

					if (e.activePayload && e.activePayload.length > 0) {
						setFrozenTooltip(e)
					}
				}

				if (e.activeLabel !== undefined && !frozenTooltip) {
					setRefAreaStart(Number(e.activeLabel))
				}
		  }
		: undefined

	const onMouseMove = allowDrag
		? (e: CategoricalChartState) => {
				if (frozenTooltip) {
					return
				}

				setMouseMoveState(e)

				if (refAreaStart !== undefined && e.activeLabel !== undefined) {
					setRefAreaEnd(Number(e.activeLabel))
				}
		  }
		: undefined

	const onMouseUp = allowDrag
		? () => {
				if (frozenTooltip) {
					return
				}

				if (
					refAreaStart !== undefined &&
					refAreaEnd !== undefined &&
					refAreaStart !== refAreaEnd &&
					xAxisMetric === TIMESTAMP_KEY
				) {
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

	const onMouseLeave = () => {
		setFrozenTooltip(undefined)
		setRefAreaStart(undefined)
		setRefAreaEnd(undefined)
	}

	const tooltip = (
		<RechartsTooltip
			content={getCustomTooltip(
				xAxisMetric,
				yAxisMetric,
				yAxisFunction,
				frozenTooltip,
				tooltipRef,
				onMouseLeave,
				loadExemplars,
			)}
			cursor={
				frozenTooltip
					? false
					: { stroke: '#C8C7CB', strokeDasharray: 4 }
			}
			isAnimationActive={false}
			wrapperStyle={{
				zIndex: 100,
				pointerEvents: 'auto',
				...(frozenTooltip && { visibility: 'visible' }),
				...(frozenTooltip && {
					transform: `translate(${frozenTooltip.chartX}px, ${frozenTooltip.chartY}px)`,
				}),
			}}
			payload={frozenTooltip?.activePayload}
			active={frozenTooltip ? true : undefined}
		/>
	)

	const tooltipCanFreeze =
		loadExemplars &&
		!frozenTooltip &&
		mouseMoveState?.activePayload?.find(
			(p) => ![undefined, null].includes(p.value),
		)

	return {
		referenceArea,
		tooltip,
		chartRef,
		tooltipCanFreeze,
		onMouseDown,
		onMouseMove,
		onMouseUp,
		onMouseLeave,
	}
}

export const getColor = (
	idx: number,
	key: string,
	colorOverride?: string[] | Map<string, string>,
): string => {
	const defaultColor = strokeColors[idx % strokeColors.length]
	if (colorOverride === undefined) {
		return defaultColor
	}
	if ('at' in colorOverride) {
		return colorOverride.at(idx) ?? defaultColor
	}
	return colorOverride.get(key) ?? defaultColor
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

const DEFAULT_TIME_METRIC = 'ns'

const timeMetrics = {
	active_length: 'ms',
	length: 'ms',
	duration: 'ns',
	Jank: 'ms',
	FCP: 'ms',
	FID: 'ms',
	LCP: 'ms',
	TTFB: 'ms',
	INP: 'ms',
}

export const getTickFormatter = (metric: string, data?: any[] | undefined) => {
	if (metric === 'Timestamp') {
		if (data === undefined) {
			return (value: any) =>
				moment(value * 1000).format('MMM D, h:mm:ss A')
		}

		const start = data.at(0).Timestamp * 1000
		const end = data.at(data.length - 1).Timestamp * 1000
		const diffMinutes = moment(end).diff(start, 'minutes')
		if (diffMinutes < 15) {
			return (value: any) => moment(value * 1000).format('HH:mm:ss')
		} else if (diffMinutes < 12 * 60) {
			return (value: any) => moment(value * 1000).format('HH:mm')
		} else {
			return (value: any) => moment(value * 1000).format('MM/DD')
		}
	} else if (Object.hasOwn(timeMetrics, metric)) {
		return (value: any) => {
			let startUnit =
				timeMetrics[metric as keyof typeof timeMetrics] ??
				DEFAULT_TIME_METRIC
			let lastUnit = startUnit
			for (const entry of durationUnitMap) {
				if (startUnit !== '') {
					if (startUnit === entry[1]) {
						startUnit = ''
					}
					continue
				}
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
			if (result === '') {
				result = NO_GROUP_PLACEHOLDER
			}
			return result
		}
	} else {
		return (value: any) => formatNumber(value)
	}
}

const getCustomTooltip =
	(
		xAxisMetric: string,
		yAxisMetric: string,
		yAxisFunction: string,
		frozenTooltip?: CategoricalChartState | undefined,
		tooltipRef?: React.MutableRefObject<HTMLDivElement | null>,
		onMouseLeave?: () => void,
		loadExemplars?: LoadExemplars,
	) =>
	({ active, payload, label }: any) => {
		if (frozenTooltip !== undefined) {
			active = true
			payload = frozenTooltip.activePayload
			label = frozenTooltip.activeLabel
		}

		const isValid = active && payload && payload.length
		return (
			<Box
				cssClass={style.tooltipWrapper}
				ref={tooltipRef}
				onMouseLeave={onMouseLeave}
			>
				<Text
					lines="1"
					size="xxSmall"
					weight="medium"
					color="default"
					cssClass={style.tooltipText}
				>
					{isValid && getTickFormatter(xAxisMetric)(label)}
				</Text>
				{payload.map((p: any, idx: number) => (
					<Box
						display="flex"
						key={idx}
						justifyContent="space-between"
						gap="4"
						cssClass={style.tooltipRow}
					>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							gap="4"
						>
							<Box
								style={{
									backgroundColor: p.color,
								}}
								cssClass={style.tooltipDot}
							></Box>
							<Badge
								size="small"
								shape="basic"
								label={
									isValid &&
									getTickFormatter(yAxisMetric)(p.value)
								}
							>
								<Text
									lines="1"
									size="xSmall"
									weight="medium"
									color="default"
									cssClass={style.tooltipText}
								></Text>
							</Badge>
							<Text
								lines="1"
								size="xSmall"
								weight="medium"
								color="default"
								cssClass={style.tooltipText}
							>
								{p.name ? p.name : yAxisFunction}
							</Text>
						</Box>
						{frozenTooltip && (
							<ButtonIcon
								icon={<IconSolidExternalLink size={16} />}
								size="minimal"
								shape="square"
								emphasis="low"
								kind="secondary"
								cssClass={style.exemplarButton}
								onClick={() => {
									loadExemplars &&
										loadExemplars(
											p.payload[BUCKET_MIN_KEY],
											p.payload[BUCKET_MAX_KEY],
											p.dataKey || p.payload[GROUP_KEY],
										)
								}}
							/>
						)}
					</Box>
				))}
			</Box>
		)
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

export const useGraphData = (
	metrics: GetMetricsQuery | undefined,
	xAxisMetric: string,
) => {
	return useMemo(() => {
		let data: any[] | undefined
		if (metrics?.metrics.buckets) {
			if (xAxisMetric !== GROUP_KEY) {
				data = []
				for (let i = 0; i < metrics.metrics.bucket_count; i++) {
					data.push({})
				}

				const hasGroups =
					metrics.metrics.buckets.find((b) => b.group.length) !==
					undefined

				for (const b of metrics.metrics.buckets) {
					const seriesKey = hasGroups
						? b.group.join(' ') || NO_GROUP_PLACEHOLDER
						: b.metric_type
					data[b.bucket_id][xAxisMetric] =
						(b.bucket_min + b.bucket_max) / 2
					data[b.bucket_id][seriesKey] = b.metric_value
					data[b.bucket_id][BUCKET_MIN_KEY] = b.bucket_min
					data[b.bucket_id][BUCKET_MAX_KEY] = b.bucket_max
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
}

export const useGraphSeries = (
	data: any[] | undefined,
	xAxisMetric: string,
) => {
	const series = useMemo(() => {
		const excluded = [xAxisMetric, BUCKET_MIN_KEY, BUCKET_MAX_KEY]
		return _.uniq(data?.flatMap((d) => Object.keys(d))).filter(
			(key) => !excluded.includes(key),
		)
	}, [data, xAxisMetric])
	return series
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
	bucketByWindow,
	bucketCount,
	limit,
	limitFunctionType,
	limitMetric,
	title,
	viewConfig,
	disabled,
	onClone,
	onDelete,
	onExpand,
	onEdit,
	setTimeRange,
	selectedPreset,
	children,
}: React.PropsWithChildren<ChartProps<ViewConfig>>) => {
	const [graphHover, setGraphHover] = useState(false)
	const queriedBucketCount = bucketByKey !== undefined ? bucketCount : 1
	const showMenu =
		onDelete !== undefined || onExpand !== undefined || onEdit !== undefined

	const pollTimeout = useRef<number>()
	const [pollInterval, setPollInterval] = useState<number>(0)
	const [fetchStart, setFetchStart] = useState<Date>()
	const [fetchEnd, setFetchEnd] = useState<Date>()

	const { set } = useRelatedResource()

	const loadExemplars = (
		bucketMin: number | undefined,
		bucketMax: number | undefined,
		group: string | undefined,
	) => {
		let relatedResourceType: 'logs' | 'errors' | 'sessions' | 'traces'
		switch (productType) {
			case ProductType.Errors:
				relatedResourceType = 'errors'
				break
			case ProductType.Logs:
				relatedResourceType = 'logs'
				break
			case ProductType.Sessions:
				relatedResourceType = 'sessions'
				break
			case ProductType.Traces:
				relatedResourceType = 'traces'
				break
			default:
				return
		}

		let relatedResourceQuery = query
		if (groupByKey !== undefined) {
			if (relatedResourceQuery !== '') {
				relatedResourceQuery += ' '
			}
			if (group !== NO_GROUP_PLACEHOLDER && group !== '') {
				relatedResourceQuery += `${groupByKey}="${group}"`
			} else {
				relatedResourceQuery += `${groupByKey} not exists`
			}
		}
		if (![undefined, TIMESTAMP_KEY].includes(bucketByKey)) {
			if (relatedResourceQuery !== '') {
				relatedResourceQuery += ' '
			}
			relatedResourceQuery += `${bucketByKey}>=${bucketMin} ${bucketByKey}<${bucketMax}`
		}

		let startDateStr = moment(startDate).toISOString()
		let endDateStr = moment(endDate).toISOString()
		if (bucketByKey === TIMESTAMP_KEY && bucketMin && bucketMax) {
			startDateStr = new Date(bucketMin * 1000).toISOString()
			endDateStr = new Date(bucketMax * 1000).toISOString()
		}

		set({
			type: relatedResourceType,
			query: relatedResourceQuery,
			startDate: startDateStr,
			endDate: endDateStr,
		})
	}

	const [
		getMetrics,
		{ data: newMetrics, called, loading, previousData: previousMetrics },
	] = useGetMetricsLazyQuery()

	const metrics = loading ? previousMetrics : newMetrics

	const rebaseFetchTime = useCallback(() => {
		if (!selectedPreset) {
			setPollInterval(0)
			setFetchStart(startDate)
			setFetchEnd(endDate)
			return
		}

		const newStartFetch = presetStartDate(selectedPreset)
		const newPollInterval =
			moment().diff(newStartFetch, 'hours') >= 4
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

		const useLongerRounding =
			moment(fetchEnd).diff(fetchStart, 'hours') >= 4

		const overage = useLongerRounding ? moment(fetchStart).minute() % 5 : 0
		const start = moment(fetchStart)
			.startOf('minute')
			.subtract(overage, 'minute')
		const end = moment(fetchEnd)
			.startOf('minute')
			.subtract(overage, 'minute')

		getMetrics({
			variables: {
				product_type: productType,
				project_id: projectId,
				params: {
					date_range: {
						start_date: start.format(TIME_FORMAT),
						end_date: end.format(TIME_FORMAT),
					},
					query: query,
				},
				column: metric,
				metric_types: [functionType],
				group_by: groupByKey !== undefined ? [groupByKey] : [],
				bucket_by:
					bucketByKey !== undefined ? bucketByKey : TIMESTAMP_KEY,
				bucket_window: bucketByWindow,
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
		bucketByWindow,
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

	const data = useGraphData(metrics, xAxisMetric)
	const series = useGraphSeries(data, xAxisMetric)

	const [spotlight, setSpotlight] = useState<number | undefined>()

	// Reset spotlight when `series` is updated
	useEffect(() => {
		setSpotlight(undefined)
	}, [series])

	let isEmpty = true
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
				{!loading && (
					<Badge
						size="medium"
						shape="basic"
						variant="gray"
						label="No data found"
						iconStart={<IconSolidDocumentReport />}
					/>
				)}
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
						setTimeRange={setTimeRange}
						loadExemplars={loadExemplars}
						showGrid
					>
						{children}
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
						setTimeRange={setTimeRange}
						loadExemplars={loadExemplars}
						showGrid
					>
						{children}
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

	const showLegend =
		viewConfig.showLegend &&
		series.join('') !== yAxisFunction &&
		series.join('') !== ''
	return (
		<Box
			position="relative"
			width="full"
			height="full"
			display="flex"
			flexDirection="column"
			gap="8"
			justifyContent="space-between"
			onMouseEnter={() => {
				setGraphHover(true)
			}}
			onMouseLeave={() => {
				setGraphHover(false)
			}}
		>
			<Box
				display="flex"
				flexDirection="row"
				justifyContent="space-between"
			>
				<Text size="small" color="default" cssClass={style.titleText}>
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
						{(onDelete || onClone) && (
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
									{onClone && (
										<Menu.Item
											onClick={(e) => {
												e.stopPropagation()
												onClone()
											}}
										>
											<Box
												display="flex"
												alignItems="center"
												gap="4"
											>
												<IconSolidDuplicate />
												Clone metric view
											</Box>
										</Menu.Item>
									)}
									{onDelete && (
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
									)}
								</Menu.List>
							</Menu>
						)}
					</Box>
				)}
			</Box>
			{called && (
				<Box
					height="full"
					maxHeight="screen"
					key={series.join(';')} // Hacky but recharts' ResponsiveContainer has issues when this height changes so just rerender the whole thing
					cssClass={clsx({ [style.disabled]: disabled })}
					position="relative"
				>
					{loading && (
						<Stack
							position="absolute"
							width="full"
							height="full"
							alignItems="center"
							justifyContent="center"
							cssClass={style.loadingOverlay}
						>
							<Badge
								size="medium"
								shape="basic"
								variant="gray"
								label="Loading"
								iconStart={
									<IconSolidLoading
										className={loadingIcon}
										color={vars.theme.static.content.weak}
									/>
								}
							/>
						</Stack>
					)}
					{innerChart}
				</Box>
			)}
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
													backgroundColor: isActive(
														spotlight,
														idx,
													)
														? getColor(
																idx,
																key,
																strokeColors,
														  )
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
														isActive(spotlight, idx)
															? undefined
															: 'n8'
													}
													align="left"
												>
													{key ||
														NO_GROUP_PLACEHOLDER}
												</Text>
											</Box>
										</>
									}
								>
									{key || NO_GROUP_PLACEHOLDER}
								</Tooltip>
							</Button>
						)
					})}
				</Box>
			)}
		</Box>
	)
}

export default Graph
