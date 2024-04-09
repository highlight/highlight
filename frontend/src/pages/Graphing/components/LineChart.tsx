import { vars } from '@highlight-run/ui/vars'
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
	getCustomTooltip,
	getTickFormatter,
	InnerChartProps,
	isActive,
	SeriesInfo,
	strokeColors,
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
}: InnerChartProps<LineChartConfig> & SeriesInfo) => {
	const xAxisTickFormatter = getTickFormatter(xAxisMetric, data?.length)
	const yAxisTickFormatter = getTickFormatter(yAxisMetric)

	// Fill nulls
	if (viewConfig.nullHandling === 'Zero' && data !== undefined) {
		for (const d of data) {
			for (const s of series) {
				d[s] = d[s] ?? 0
			}
		}
	}

	return (
		<ResponsiveContainer height="100%" width="100%">
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
								stroke={strokeColors[idx % strokeColors.length]}
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
