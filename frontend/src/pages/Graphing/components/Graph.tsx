import { Box, Button, Text, Tooltip } from '@highlight-run/ui/components'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'

import { BarChart, BarChartConfig } from '@/pages/Graphing/components/BarChart'
import {
	LineChart,
	LineChartConfig,
} from '@/pages/Graphing/components/LineChart'
import { MetricTable, TableConfig } from '@/pages/Graphing/components/Table'
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

export const getFormatter = (metric: string, bucketCount?: number) => {
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
			fill="#C8C7CB"
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
			fill="#C8C7CB"
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

const Graph = ({
	data,
	xAxisMetric,
	yAxisMetric,
	yAxisFunction,
	title,
	loading,
	viewConfig,
}: ChartProps<ViewConfig>) => {
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
								color="default"
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
