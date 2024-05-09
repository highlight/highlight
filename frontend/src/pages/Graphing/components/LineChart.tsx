import { vars } from '@highlight-run/ui/vars'
import { useMemo } from 'react'
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

import {
	CustomXAxisTick,
	CustomYAxisTick,
	getColor,
	getCustomTooltip,
	getTickFormatter,
	GROUP_KEY,
	InnerChartProps,
	isActive,
	SeriesInfo,
} from '@/pages/Graphing/components/Graph'

export type LineNullHandling = 'Hidden' | 'Connected' | 'Zero'
export const LINE_NULL_HANDLING: LineNullHandling[] = [
	'Hidden',
	'Connected',
	'Zero',
]

export type LineDisplay = 'Line' | 'Stacked area'
export const LINE_DISPLAY: LineDisplay[] = ['Line', 'Stacked area']

export type LineChartConfig = {
	type: 'Line chart'
	showLegend: true
	display?: LineDisplay
	nullHandling?: LineNullHandling
}

export const LineChart = ({
	data,
	xAxisMetric,
	yAxisMetric,
	series,
	spotlight,
	viewConfig,
	onMouseDown,
	onMouseMove,
	onMouseUp,
	children,
}: React.PropsWithChildren<InnerChartProps<LineChartConfig> & SeriesInfo>) => {
	const xAxisTickFormatter = getTickFormatter(xAxisMetric, data)
	const yAxisTickFormatter = getTickFormatter(yAxisMetric, data)

	// Fill nulls as a copy of data
	const filledData = useMemo(() => {
		const filled = data?.slice()
		if (viewConfig.nullHandling === 'Zero' && filled !== undefined) {
			for (let i = 0; i < filled.length; i++) {
				filled[i] = { ...filled[i] }
				for (const s of series) {
					filled[i][s] = filled[i][s] ?? 0
				}
			}
		}
		return filled
	}, [data, viewConfig.nullHandling, series])

	return (
		<ResponsiveContainer height="100%" width="100%">
			<AreaChart
				data={filledData}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
			>
				{children}
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
					type={xAxisMetric === GROUP_KEY ? 'category' : 'number'}
					domain={['dataMin', 'dataMax']}
				/>

				<Tooltip
					content={getCustomTooltip(xAxisMetric, yAxisMetric)}
					cursor={{ stroke: '#C8C7CB', strokeDasharray: 4 }}
					isAnimationActive={false}
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
					stroke={vars.theme.static.divider.weak}
				/>

				{series.length > 0 &&
					series.map((key, idx) => {
						if (!isActive(spotlight, idx)) {
							return null
						}

						const CustomizedDot = (props: any) => {
							if (
								(viewConfig.nullHandling !== 'Hidden' &&
									viewConfig.nullHandling !== undefined) ||
								data === undefined
							) {
								return null
							}

							const { cx, cy, stroke, index } = props

							const hasPrev =
								index === 0 ||
								![null, undefined].includes(
									data[index - 1][key],
								)
							const hasCur = ![null, undefined].includes(
								data[index][key],
							)
							const hasNext =
								index === data.length - 1 ||
								![null, undefined].includes(
									data[index + 1][key],
								)

							// Draw a dot if discontinuous at this point
							if (hasCur && (!hasPrev || !hasNext)) {
								return (
									<svg x={cx - 2} y={cy - 2}>
										<g transform="translate(2 2)">
											<circle r="2" fill={stroke} />
										</g>
									</svg>
								)
							}

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
								fill={getColor(idx)}
								stroke={getColor(idx)}
								fillOpacity={
									viewConfig.display === 'Stacked area'
										? 0.1
										: 0
								}
								connectNulls={
									viewConfig.nullHandling === 'Connected'
								}
								dot={<CustomizedDot />}
							/>
						)
					})}
			</AreaChart>
		</ResponsiveContainer>
	)
}
