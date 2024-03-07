import { Box, Button, Text, Tooltip } from '@highlight-run/ui/components'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'

import { HistogramLoading } from '@/pages/Traces/TracesPage'

import * as style from './Graph.css'

export type View = 'Line chart' | 'Bar chart' | 'Pie chart' | 'Table' | 'List'
export const VIEWS: View[] = [
	'Line chart',
	'Bar chart',
	'Pie chart',
	'Table',
	'List',
]

export type NullHandling = 'Hidden' | 'Connected' | 'Zero'
export const NULL_HANDLING: NullHandling[] = ['Hidden', 'Connected', 'Zero']

export type LineDisplay = 'Line' | 'Stacked area'
export const LINE_DISPLAY: LineDisplay[] = ['Line', 'Stacked area']

export type LineChartConfig = {
	type: 'Line chart'
	display?: LineDisplay
	nullHandling?: NullHandling
}

export type ViewConfig = LineChartConfig

interface Props<TConfig> {
	data: any[] | undefined
	xAxisMetric: string
	yAxisMetric: string
	title?: string
	loading?: boolean
	viewConfig: TConfig
}

interface SeriesInfo {
	series: string[]
	spotlight: number | undefined
}

const strokeColors = ['#0090FF', '#D6409F']

const durationUnitMap: [number, string][] = [
	[1, 'ns'],
	[1000, 'µs'],
	[1000, 'ms'],
	[1000, 's'],
	[60, 'm'],
	[60, 'h'],
	[24, 'd'],
]

const formatNumber = (n: number) => {
	const k = 1000
	const sizes = ['', 'K', 'M', 'B', 'T']
	const i = Math.max(
		Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length),
		0,
	)
	const res = n / Math.pow(k, i)
	return parseFloat(res.toPrecision(2)) + sizes[i]
}

const getFormatter = (metric: string) => {
	if (metric === 'Timestamp') {
		return (value: number) => moment(value * 1000).format('HH:mm')
	} else if (metric === 'duration') {
		return (value: number) => {
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
	} else {
		return (value: number) => formatNumber(value)
	}
}

const CustomYAxisTick = ({
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
			fill="#C8C7CB"
			textAnchor="start"
			orientation="left"
		>
			{tickFormatter(payload.value, payload.index)}
		</text>
	</g>
)

const CustomXAxisTick = ({
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
			fill="#C8C7CB"
			textAnchor="middle"
			orientation="bottom"
		>
			{tickFormatter(payload.value, payload.index)}
		</text>
	</g>
)

const isActive = (spotlight: number | undefined, idx: number) =>
	spotlight === undefined || spotlight === idx

const LineChart = ({
	data,
	xAxisMetric,
	yAxisMetric,
	series,
	spotlight,
	viewConfig,
}: Props<LineChartConfig> & SeriesInfo) => {
	const xAxisTickFormatter = getFormatter(xAxisMetric)
	const yAxisTickFormatter = getFormatter(yAxisMetric)
	return (
		<ResponsiveContainer>
			<AreaChart data={data}>
				<XAxis
					dataKey={xAxisMetric}
					fontSize={10}
					tick={(props: any) => (
						<CustomXAxisTick
							x={props.x}
							y={props.y}
							payload={props.payload}
							tickFormatter={xAxisTickFormatter}
						/>
					)}
					tickFormatter={xAxisTickFormatter}
					tickLine={{ visibility: 'hidden' }}
					axisLine={{ visibility: 'hidden' }}
					height={12}
					type="number"
					domain={['auto', 'auto']}
				/>

				<YAxis
					fontSize={10}
					tickLine={{ visibility: 'hidden' }}
					axisLine={{ visibility: 'hidden' }}
					tick={(props: any) => (
						<CustomYAxisTick
							y={props.y}
							payload={props.payload}
							tickFormatter={yAxisTickFormatter}
						/>
					)}
					tickFormatter={yAxisTickFormatter}
					tickCount={7}
					width={32}
					type="number"
				/>

				<CartesianGrid
					strokeDasharray=""
					vertical={false}
					stroke="var(--color-gray-200)"
				/>

				{series.length > 0 &&
					series.map((key, idx) => {
						if (!isActive(spotlight, idx)) {
							return null
						}

						return (
							<Area
								isAnimationActive={false}
								key={key}
								dataKey={key}
								stackId={
									viewConfig.display === 'Stacked area'
										? 1
										: idx
								}
								strokeWidth="2px"
								stroke={strokeColors[idx % strokeColors.length]}
								fill={strokeColors[idx % strokeColors.length]}
								fillOpacity={
									viewConfig.display === 'Stacked area'
										? 0.1
										: 0
								}
								connectNulls={
									viewConfig.nullHandling === 'Connected'
								}
							/>
						)
					})}
			</AreaChart>
		</ResponsiveContainer>
	)
}

const Graph = ({
	data,
	xAxisMetric,
	yAxisMetric,
	title,
	loading,
	viewConfig,
}: Props<ViewConfig>) => {
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
					viewConfig={viewConfig}
					series={series}
					spotlight={spotlight}
				/>
			)
	}

	const showLegend = series.join('') !== ''

	return (
		<Box cssClass={style.graphWrapper} shadow="small">
			<Box
				px="16"
				py="12"
				width="full"
				height="full"
				border="divider"
				borderRadius="8"
			>
				<Box
					position="relative"
					width="full"
					height="full"
					display="flex"
					flexDirection="column"
					justifyContent="space-between"
				>
					{loading && (
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
						<Box>
							<Text
								size="small"
								weight="medium"
								cssClass={style.titleText}
							>
								{title || 'Untitled metric view'}
							</Text>
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
															cssClass={
																style.legendDot
															}
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
																{key ||
																	'<empty>'}
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
			</Box>
		</Box>
	)
}

export default Graph
