import { vars } from '@highlight-run/ui/vars'
import { useMemo } from 'react'
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'

import {
	AxisConfig,
	CustomXAxisTick,
	CustomYAxisTick,
	getColor,
	getTickFormatter,
	InnerChartProps,
	isActive,
	SeriesInfo,
	useGraphCallbacks,
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
	showLegend: boolean
	display?: LineDisplay
	nullHandling?: LineNullHandling
}

export const LineChart = ({
	data,
	xAxisMetric,
	yAxisMetric,
	yAxisFunction,
	series,
	spotlight,
	viewConfig,
	setTimeRange,
	loadExemplars,
	children,
	showXAxis,
	showYAxis,
	showGrid,
	strokeColors,
}: React.PropsWithChildren<
	InnerChartProps<LineChartConfig> & SeriesInfo & AxisConfig
>) => {
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

	const {
		referenceArea,
		tooltip,
		chartRef,
		tooltipCanFreeze,
		onMouseDown,
		onMouseMove,
		onMouseUp,
		onMouseLeave,
	} = useGraphCallbacks(
		xAxisMetric,
		yAxisMetric,
		yAxisFunction,
		setTimeRange,
		loadExemplars,
		{ dashed: true },
	)

	return (
		<ResponsiveContainer height="100%" width="100%" ref={chartRef}>
			<AreaChart
				data={filledData}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
				onMouseLeave={onMouseLeave}
				style={tooltipCanFreeze ? { cursor: 'pointer' } : undefined}
			>
				{referenceArea}
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
					domain={['dataMin', 'dataMax']}
					hide={showXAxis === false}
				/>

				{tooltip}

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
					hide={showYAxis === false}
				/>

				{showGrid && (
					<CartesianGrid
						strokeDasharray=""
						vertical={false}
						stroke={vars.theme.static.divider.weak}
					/>
				)}

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

						const ActiveDot = (props: any) => {
							const { cx, cy, fill } = props

							if (cy === null) {
								return
							}

							return (
								<svg x={cx - 3} y={cy - 3}>
									<g transform="translate(3 3)">
										<circle r="3" fill={fill} />
									</g>
								</svg>
							)
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
								fill={getColor(idx, key, strokeColors)}
								stroke={getColor(idx, key, strokeColors)}
								fillOpacity={
									viewConfig.display === 'Stacked area'
										? 0.1
										: 0
								}
								connectNulls={
									viewConfig.nullHandling === 'Connected'
								}
								activeDot={<ActiveDot />}
								dot={<CustomizedDot />}
							/>
						)
					})}
			</AreaChart>
		</ResponsiveContainer>
	)
}
