import { useId } from 'react'
import {
	Bar,
	BarChart as RechartsBarChart,
	BarProps,
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

export type BarDisplay = 'Grouped' | 'Stacked'
export const BAR_DISPLAY: BarDisplay[] = ['Grouped', 'Stacked']

export type BarChartConfig = {
	type: 'Bar chart'
	showLegend: true
	display?: BarDisplay
}

const RoundedBar = (id: string, isLast: boolean) => (props: BarProps) => {
	const { fill, x, y, width, height } = props
	return (
		<>
			<rect
				x={x}
				y={y}
				width={width}
				height={Math.max((height ?? 0) - 1.5, 0)}
				stroke="none"
				fill={fill}
				clipPath={`url(#barmask-${id}-${x})`}
			/>
			{isLast && (
				<clipPath id={`barmask-${id}-${x}`}>
					<rect
						rx={Math.min((width ?? 0) / 3, 5)}
						x={x}
						y={y}
						width={width}
						height="10000"
						fill="white"
					/>
				</clipPath>
			)}
		</>
	)
}

export const BarChart = ({
	data,
	xAxisMetric,
	yAxisMetric,
	series,
	spotlight,
	strokeColors,
	viewConfig,
	onMouseDown,
	onMouseMove,
	onMouseUp,
	children,
}: React.PropsWithChildren<InnerChartProps<BarChartConfig> & SeriesInfo>) => {
	const xAxisTickFormatter = getTickFormatter(xAxisMetric, data)
	const yAxisTickFormatter = getTickFormatter(yAxisMetric, data)

	// used to give svg masks an id unique to the page
	const id = useId()

	return (
		<ResponsiveContainer>
			<RechartsBarChart
				data={data}
				barCategoryGap={1}
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
					domain={['auto', 'auto']}
				/>

				<Tooltip
					content={getCustomTooltip(xAxisMetric, yAxisMetric)}
					cursor={{ fill: '#C8C7CB', fillOpacity: 0.5 }}
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
					stroke="var(--color-gray-200)"
				/>

				{series.length > 0 &&
					series.map((key, idx) => {
						if (!isActive(spotlight, idx)) {
							return null
						}

						const isLastBar =
							viewConfig.display !== 'Stacked' ||
							spotlight === idx ||
							idx === series.length - 1

						return (
							<Bar
								key={key}
								dataKey={key}
								fill={strokeColors?.at(idx) ?? getColor(idx)}
								maxBarSize={30}
								isAnimationActive={false}
								stackId={
									viewConfig.display === 'Stacked' ? 1 : idx
								}
								shape={RoundedBar(id, isLastBar)}
							/>
						)
					})}
			</RechartsBarChart>
		</ResponsiveContainer>
	)
}
