import {
	Bar,
	BarChart as RechartsBarChart,
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
	GROUP_KEY,
	isActive,
	SeriesInfo,
	strokeColors,
} from '@/pages/Graphing/components/Graph'

export type BarDisplay = 'Grouped' | 'Stacked'
export const BAR_DISPLAY: BarDisplay[] = ['Grouped', 'Stacked']

export type BarChartConfig = {
	type: 'Bar chart'
	showLegend: true
	display?: BarDisplay
}

const RoundedBar = (props: any) => {
	const { fill, x, y, width, height } = props
	return (
		<g>
			<rect
				rx={5}
				x={x}
				y={y}
				width={width}
				height={Math.max(height - 1, 0)}
				stroke="none"
				fill={fill}
			/>
		</g>
	)
}

export const BarChart = ({
	data,
	xAxisMetric,
	yAxisMetric,
	series,
	spotlight,
	viewConfig,
}: ChartProps<BarChartConfig> & SeriesInfo) => {
	const xAxisTickFormatter = getFormatter(xAxisMetric, data?.length)
	const yAxisTickFormatter = getFormatter(yAxisMetric)

	return (
		<ResponsiveContainer>
			<RechartsBarChart data={data} barCategoryGap={0}>
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
							<Bar
								key={key}
								dataKey={key}
								fill={strokeColors[idx % strokeColors.length]}
								maxBarSize={30}
								isAnimationActive={false}
								stackId={
									viewConfig.display === 'Stacked' ? 1 : idx
								}
								shape={RoundedBar}
							/>
						)
					})}
			</RechartsBarChart>
		</ResponsiveContainer>
	)
}
