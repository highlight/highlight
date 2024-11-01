import {
	Badge,
	Box,
	Button,
	ButtonIcon,
	DateRangePreset,
	IconSolidChartSquareBar,
	IconSolidChartSquareLine,
	IconSolidDocumentReport,
	IconSolidExternalLink,
	IconSolidLoading,
	IconSolidLocationMarker,
	IconSolidTable,
	presetStartDate,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import {
	FunnelChart,
	FunnelChartConfig,
} from '@pages/Graphing/components/FunnelChart'
import { FunnelDisplay } from '@pages/Graphing/components/types'
import clsx from 'clsx'
import _ from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Area, Tooltip as RechartsTooltip, ReferenceArea } from 'recharts'
import { CategoricalChartState } from 'recharts/types/chart/types'

import { loadingIcon } from '@/components/Button/style.css'
import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import {
	GetMetricsQueryResult,
	useGetMetricsLazyQuery,
} from '@/graph/generated/hooks'
import { GetMetricsQuery } from '@/graph/generated/operations'
import {
	Maybe,
	MetricAggregator,
	PredictionSettings,
	ProductType,
} from '@/graph/generated/schemas'
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

import { EventSelectionStep } from '@pages/Graphing/util'
import { useGraphContext } from '../context/GraphContext'
import { TIME_METRICS } from '@pages/Graphing/constants'

export type View = 'Line chart' | 'Bar chart' | 'Funnel chart' | 'Table'

export const VIEW_OPTIONS = [
	{
		value: 'Line chart',
		name: 'Line chart',
		icon: <IconSolidChartSquareLine size={16} />,
	},
	{
		value: 'Bar chart',
		name: 'Bar chart / histogram',
		icon: <IconSolidChartSquareBar size={16} />,
	},
	{
		value: 'Funnel chart',
		name: 'Funnel chart',
		icon: <IconSolidLocationMarker size={16} key="funnel chart" />,
	},
	{
		value: 'Table',
		name: 'Table',
		icon: <IconSolidTable size={16} />,
	},
]

export const TIMESTAMP_KEY = 'Timestamp'
export const GROUP_KEY = 'Group'
export const PERCENT_KEY = 'Percent'
export const QUERY_KEY = 'Query'
export const BUCKET_MIN_KEY = 'BucketMin'
export const BUCKET_MAX_KEY = 'BucketMax'
export const YHAT_UPPER_KEY = 'yhat_upper'
export const YHAT_LOWER_KEY = 'yhat_lower'
export const YHAT_UPPER_REGION_KEY = 'yhat_upper_region'
export const YHAT_LOWER_REGION_KEY = 'yhat_lower_region'
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
	| FunnelChartConfig
	| TableConfig
	| ListConfig

export interface ChartProps<TConfig> {
	id?: string
	title: string
	productType: ProductType
	projectId: string
	startDate: Date
	endDate: Date
	selectedPreset?: DateRangePreset
	query: string
	metric: string
	functionType: MetricAggregator
	groupByKeys?: string[]
	bucketByKey?: string
	bucketCount?: number
	bucketByWindow?: number
	limit?: number
	limitFunctionType?: MetricAggregator
	limitMetric?: string
	funnelSteps?: EventSelectionStep[]
	viewConfig: TConfig
	disabled?: boolean
	height?: number
	setTimeRange?: SetTimeRange
	loadExemplars?: LoadExemplars
	minYAxisMax?: number
	maxYAxisMin?: number
	variables?: Map<string, string[]>
	predictionSettings?: PredictionSettings
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

export interface VizId {
	visualizationId: string | undefined
}

export interface AxisConfig {
	showXAxis?: boolean
	showYAxis?: boolean
	showGrid?: boolean
	minYAxisMax?: number
	maxYAxisMin?: number
}

export type LoadExemplars = (
	bucketMin: number | undefined,
	bucketMax: number | undefined,
	group: string | undefined,
	stepQuery?: string,
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

export interface TooltipSettings {
	dashed?: boolean
	funnelMode?: true
}

export const useGraphCallbacks = (
	xAxisMetric: string,
	yAxisMetric: string,
	yAxisFunction: string,
	setTimeRange?: SetTimeRange,
	loadExemplars?: LoadExemplars,
	tooltipSettings?: TooltipSettings,
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

	const [frozenTooltip, setFrozenTooltip] = useState<CategoricalChartState>()

	const allowDrag = setTimeRange !== undefined

	const onMouseDown = allowDrag
		? (e: CategoricalChartState) => {
				if (frozenTooltip) {
					return
				}

				const tooltipRect = tooltipRef.current?.getBoundingClientRect()
				const chartRect = chartRef.current?.getBoundingClientRect()
				if (
					chartRect !== undefined &&
					tooltipRect !== undefined &&
					frozenTooltip === undefined &&
					loadExemplars
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
				if (refAreaStart !== undefined && e.activeLabel !== undefined) {
					setRefAreaEnd(Number(e.activeLabel))
					setFrozenTooltip(undefined)
				}
			}
		: undefined

	const onMouseUp = allowDrag
		? () => {
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
				tooltipSettings?.funnelMode,
			)}
			cursor={
				frozenTooltip
					? false
					: {
							stroke: '#C8C7CB',
							strokeDasharray: tooltipSettings?.dashed
								? 4
								: undefined,
						}
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

	const tooltipCanFreeze = loadExemplars && !frozenTooltip

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
]

const DEFAULT_TIME_METRIC = 'ns'

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
	} else if (Object.hasOwn(TIME_METRICS, metric)) {
		return (value: any) => {
			let startUnit =
				TIME_METRICS[metric as keyof typeof TIME_METRICS] ??
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
			return `${value.toFixed(lastUnit === 'h' ? 1 : 0)}${lastUnit}`
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
		funnelMode?: true,
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
				{payload
					.filter(
						(p: any) =>
							![
								YHAT_LOWER_REGION_KEY,
								YHAT_UPPER_REGION_KEY,
							].includes(p.dataKey),
					)
					// sort the tooltip to show the keys with largest value first
					.sort(
						(p1: any, p2: any) => (p2.value ?? 0) - (p1.value ?? 0),
					)
					.map((p: any, idx: number) => (
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
								{funnelMode ? (
									<Text
										lines="1"
										size="xSmall"
										weight="medium"
										color="default"
										cssClass={style.tooltipText}
									>
										{(p.payload[PERCENT_KEY] * 100).toFixed(
											1,
										)}
										%
									</Text>
								) : (
									<Text
										lines="1"
										size="xxSmall"
										weight="medium"
										color="default"
										cssClass={style.tooltipText}
									>
										{p.name ? p.name : yAxisFunction}
									</Text>
								)}
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
												p.dataKey ||
													p.payload[GROUP_KEY],
												p.payload[QUERY_KEY],
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
	} else if (viewType === 'Funnel chart') {
		viewConfig = {
			type: viewType,
			showLegend: true,
			display: display as FunnelDisplay,
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
		if (metrics?.metrics?.buckets) {
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
						? b.group.join(', ') || NO_GROUP_PLACEHOLDER
						: b.metric_type
					data[b.bucket_id][xAxisMetric] =
						(b.bucket_min + b.bucket_max) / 2
					data[b.bucket_id][seriesKey] = b.metric_value
					data[b.bucket_id][BUCKET_MIN_KEY] = b.bucket_min
					data[b.bucket_id][BUCKET_MAX_KEY] = b.bucket_max

					if (b.yhat_upper) {
						data[b.bucket_id][YHAT_UPPER_KEY] = {
							[seriesKey]: b.yhat_upper,
						}
						if (!hasGroups) {
							data[b.bucket_id][YHAT_UPPER_REGION_KEY] =
								b.yhat_upper - (b.yhat_lower ?? 0)
						}
					}

					if (b.yhat_lower) {
						data[b.bucket_id][YHAT_LOWER_KEY] = {
							[seriesKey]: b.yhat_lower,
						}
						if (!hasGroups) {
							data[b.bucket_id][YHAT_LOWER_REGION_KEY] =
								b.yhat_lower
						}
					}
				}
			} else {
				data = []
				for (const b of metrics.metrics.buckets) {
					data.push({
						[GROUP_KEY]: b.group.join(', '),
						'': b.metric_value,
					})
				}
			}
		}
		return data
	}, [metrics?.metrics.bucket_count, metrics?.metrics.buckets, xAxisMetric])
}

export const useFunnelData = (
	results: GetMetricsQuery[] | undefined,
	funnelSteps: EventSelectionStep[] | undefined,
) => {
	return useMemo(() => {
		if (!results?.length || !results[0]?.metrics) return
		const buckets: {
			[key: number]: { value: number; percent: number }
		} = {}
		let groups = new Set<string>(
			results[0].metrics.buckets.map((b) => b.group[0]),
		)
		results.forEach((r, idx) => {
			if (r?.metrics?.buckets) {
				const resultGroups = new Set<string>(
					r.metrics.buckets.map((b) => b.group[0]),
				)
				r.metrics.buckets.forEach((b) => {
					const group = b?.group[0]
					const prev = buckets[idx - 1]?.value ?? 0
					const stepValue = groups.has(group)
						? (b?.metric_value ?? 0)
						: 0
					const value = (buckets[idx]?.value ?? 0) + stepValue
					buckets[idx] = {
						value,
						percent: prev > 0 ? value / prev : 1,
					}
				})
				groups = groups.intersection(resultGroups)
			}
		})

		return Object.values(buckets).map((r, idx) => {
			const query = funnelSteps?.at(idx)?.query || ''
			const key = funnelSteps?.at(idx)?.title || query
			return {
				[GROUP_KEY]: key,
				[PERCENT_KEY]: r.percent,
				[QUERY_KEY]: query,
				[key]: r.value,
			}
		})
	}, [funnelSteps, results])
}

export const useGraphSeries = (
	data: any[] | undefined,
	xAxisMetric: string,
) => {
	return useMemo(() => {
		const excluded = [
			xAxisMetric,
			BUCKET_MIN_KEY,
			BUCKET_MAX_KEY,
			YHAT_UPPER_KEY,
			YHAT_LOWER_KEY,
			YHAT_LOWER_REGION_KEY,
			YHAT_UPPER_REGION_KEY,
			PERCENT_KEY,
			QUERY_KEY,
		]
		return _.uniq(data?.flatMap((d) => Object.keys(d))).filter(
			(key) => !excluded.includes(key),
		)
	}, [data, xAxisMetric])
}

const POLL_INTERVAL_VALUE = 1000 * 60
const LONGER_POLL_INTERVAL_VALUE = 1000 * 60 * 5

const replaceQueryVariables = (
	text: string,
	vars: Map<string, string[]> | undefined,
) => {
	vars?.forEach((values, key) => {
		let replacementText = ''
		if (values.length === 1) {
			replacementText = values[0]
		} else if (values.length > 1) {
			replacementText = `(${values.join(' OR ')})`
		}
		text = text?.replaceAll(`$${key}`, replacementText)
	})
	return text
}

const matchParamVariables = (
	text: string | string[],
	vars: Map<string, string[]> | undefined,
): string[] => {
	if (Array.isArray(text)) {
		const results: string[] = []
		text.forEach((t) => {
			const values = vars?.get(t)
			if (values !== undefined) {
				results.push(...values)
			} else {
				results.push(t)
			}
		})
		return results
	} else {
		const values = vars?.get(text)
		if (values !== undefined) {
			return values
		} else {
			return [text]
		}
	}
}

const Graph = ({
	productType,
	projectId,
	startDate,
	endDate,
	query,
	metric,
	functionType,
	groupByKeys,
	bucketByKey,
	bucketByWindow,
	bucketCount,
	limit,
	limitFunctionType,
	limitMetric,
	funnelSteps,
	title,
	id,
	viewConfig,
	disabled,
	height,
	setTimeRange,
	selectedPreset,
	variables,
	minYAxisMax,
	maxYAxisMin,
	predictionSettings,
	children,
}: React.PropsWithChildren<ChartProps<ViewConfig>>) => {
	const { setGraphData } = useGraphContext()
	const queriedBucketCount = bucketByKey !== undefined ? bucketCount : 1

	const pollTimeout = useRef<number>()
	const [pollInterval, setPollInterval] = useState<number>(0)
	const [fetchStart, setFetchStart] = useState<Date>()
	const [fetchEnd, setFetchEnd] = useState<Date>()
	const [results, setResults] = useState<GetMetricsQuery[]>()
	const [loading, setLoading] = useState<boolean>(true)

	const { set } = useRelatedResource()

	const loadExemplars = (
		bucketMin: number | undefined,
		bucketMax: number | undefined,
		groups: string | undefined,
		stepQuery: string | undefined,
	) => {
		let relatedResourceType:
			| 'logs'
			| 'errors'
			| 'sessions'
			| 'traces'
			| 'events'
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
			case ProductType.Metrics:
				relatedResourceType = 'sessions'
				break
			case ProductType.Events:
				relatedResourceType = 'events'
				groupByKeys = undefined
				break
			default:
				return
		}

		let relatedResourceQuery = replaceQueryVariables(
			stepQuery || query,
			variables,
		)
		if (groupByKeys !== undefined && groupByKeys.length > 0) {
			groups?.split(', ').forEach((group, idx) => {
				if (!groupByKeys) {
					return
				}
				if (group !== NO_GROUP_PLACEHOLDER && group !== '') {
					relatedResourceQuery += ` ${groupByKeys[idx]}="${group}"`
				} else {
					relatedResourceQuery += ` ${groupByKeys[idx]} not exists`
				}
			})
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
			startDateStr = (
				bucketMin ? new Date(bucketMin * 1000) : startDate
			).toISOString()
			endDateStr = (
				bucketMax ? new Date(bucketMax * 1000) : endDate
			).toISOString()
		}

		set({
			type: relatedResourceType,
			query: relatedResourceQuery,
			startDate: startDateStr,
			endDate: endDateStr,
		})
	}

	const [getMetrics, { called }] = useGetMetricsLazyQuery()

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

	const xAxisMetric = bucketByKey !== undefined ? bucketByKey : GROUP_KEY
	const yAxisMetric = functionType === MetricAggregator.Count ? '' : metric
	const yAxisFunction = functionType

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

		const getMetricsVariables = {
			product_type: productType,
			project_id: projectId,
			params: {
				date_range: {
					start_date: start.format(TIME_FORMAT),
					end_date: end.format(TIME_FORMAT),
				},
				query: replaceQueryVariables(query, variables),
			},
			column: matchParamVariables(yAxisMetric, variables).at(0) ?? '',
			metric_types: [functionType],
			group_by:
				groupByKeys !== undefined
					? matchParamVariables(groupByKeys, variables)
					: [],
			bucket_by:
				bucketByKey !== undefined
					? (matchParamVariables(bucketByKey, variables).at(0) ?? '')
					: TIMESTAMP_KEY,
			bucket_window: bucketByWindow,
			bucket_count: queriedBucketCount,
			limit: limit,
			limit_aggregator: limitFunctionType,
			limit_column: limitMetric
				? matchParamVariables(limitMetric, variables).at(0)
				: undefined,
			prediction_settings: predictionSettings,
		}

		setLoading(true)
		let getMetricsPromises: Promise<GetMetricsQueryResult>[] = []
		if (funnelSteps?.length) {
			for (const step of funnelSteps) {
				getMetricsPromises.push(
					getMetrics({
						variables: {
							...getMetricsVariables,
							params: {
								...getMetricsVariables.params,
								query: step.query,
							},
						},
					}),
				)
			}
		} else {
			getMetricsPromises = [
				getMetrics({ variables: getMetricsVariables }),
			]
		}
		Promise.all(getMetricsPromises)
			.then((results: GetMetricsQueryResult[]) => {
				setResults(results.filter((r) => r.data).map((r) => r.data!))
			})
			.finally(() => {
				setLoading(false)
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
		groupByKeys,
		limit,
		limitFunctionType,
		limitMetric,
		funnelSteps,
		yAxisMetric,
		productType,
		projectId,
		queriedBucketCount,
		query,
		variables,
		predictionSettings,
	])

	const graphData = useGraphData(results?.at(0), xAxisMetric)
	const funnelData = useFunnelData(results, funnelSteps)
	const data = viewConfig.type === 'Funnel chart' ? funnelData : graphData
	const series = useGraphSeries(data, xAxisMetric)

	const [spotlight, setSpotlight] = useState<number | undefined>()

	useEffect(() => {
		if (id && data) {
			setGraphData((graphData) => ({ ...graphData, [id]: data }))
		}
	}, [data, id, setGraphData])

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
				{!loading && called && (
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
						minYAxisMax={minYAxisMax}
						maxYAxisMin={maxYAxisMin}
						showGrid
					>
						{children}
						<Area
							isAnimationActive={false}
							dataKey={YHAT_LOWER_REGION_KEY}
							strokeWidth="2px"
							fill="#FFFFFF"
							stroke="#555555"
							fillOpacity={0.1}
							stackId={-1}
							connectNulls
							activeDot={<></>}
						/>
						<Area
							isAnimationActive={false}
							dataKey={YHAT_UPPER_REGION_KEY}
							strokeWidth="2px"
							fill="#555555"
							stroke="#555555"
							fillOpacity={0.1}
							stackId={-1}
							connectNulls
							activeDot={<></>}
						/>
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
			case 'Funnel chart':
				if (viewConfig.display === 'Bar Chart') {
					innerChart = (
						<BarChart
							data={data}
							xAxisMetric={xAxisMetric}
							yAxisMetric={yAxisMetric}
							yAxisFunction={yAxisFunction}
							viewConfig={{
								shadeToPrevious: true,
								showLegend: true,
								type: 'Bar chart',
								display: 'Stacked',
								tooltipSettings: { funnelMode: true },
							}}
							series={series}
							spotlight={spotlight}
							setTimeRange={setTimeRange}
							loadExemplars={loadExemplars}
							showGrid
						>
							{children}
						</BarChart>
					)
				} else if (viewConfig.display === 'Line Chart') {
					innerChart = (
						<LineChart
							data={data}
							xAxisMetric={xAxisMetric}
							yAxisMetric={yAxisMetric}
							yAxisFunction={yAxisFunction}
							viewConfig={{
								showLegend: true,
								type: 'Line chart',
								display: 'Stacked area',
								tooltipSettings: { funnelMode: true },
							}}
							series={series}
							spotlight={spotlight}
							setTimeRange={setTimeRange}
							loadExemplars={loadExemplars}
							showGrid
						>
							{children}
						</LineChart>
					)
				} else if (viewConfig.display === 'Vertical Funnel') {
					innerChart = (
						<FunnelChart
							data={data}
							xAxisMetric={xAxisMetric}
							yAxisMetric={yAxisMetric}
							yAxisFunction={yAxisFunction}
							viewConfig={viewConfig}
							series={series}
							spotlight={spotlight}
							setTimeRange={setTimeRange}
						>
							{children}
						</FunnelChart>
					)
				}
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
						loadExemplars={loadExemplars}
						visualizationId={id}
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
		>
			<Box
				display="flex"
				flexDirection="row"
				justifyContent="space-between"
			>
				<Text size="small" color="default" cssClass={style.titleText}>
					{title || 'Untitled metric view'}
				</Text>
			</Box>
			{
				<Box
					style={{ height: height ?? '100%' }}
					key={series.join(';')} // Hacky but recharts' ResponsiveContainer has issues when this height changes so just rerender the whole thing
					cssClass={clsx({
						[style.disabled]: disabled,
					})}
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
			}
			{loading &&
				groupByKeys !== undefined &&
				groupByKeys.length > 0 &&
				viewConfig.showLegend && (
					<Box position="relative" cssClass={style.legendLoading} />
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
