import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'

import {
	ChartProps,
	CustomXAxisTick,
	CustomYAxisTick,
	getFormatter,
	isActive,
	SeriesInfo,
	strokeColors,
} from '@/pages/Graphing/components/Graph'

export type NullHandling = 'Hidden' | 'Connected' | 'Zero'
export const NULL_HANDLING: NullHandling[] = ['Hidden', 'Connected', 'Zero']

export type LineDisplay = 'Line' | 'Stacked area'
export const LINE_DISPLAY: LineDisplay[] = ['Line', 'Stacked area']

export type LineChartConfig = {
	type: 'Line chart'
	display?: LineDisplay
	nullHandling?: NullHandling
}

export const LineChart = ({
	data,
	xAxisMetric,
	yAxisMetric,
	series,
	spotlight,
	viewConfig,
}: ChartProps<LineChartConfig> & SeriesInfo) => {
	const xAxisTickFormatter = getFormatter(xAxisMetric, data?.length)
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
