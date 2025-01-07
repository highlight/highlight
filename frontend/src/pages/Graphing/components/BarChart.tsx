import { memo, useId } from 'react'
import {
	Bar,
	CartesianGrid,
	BarChart as RechartsBarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'

import {
	AxisConfig,
	CustomXAxisTick,
	CustomYAxisTick,
	getColor,
	getSeriesKey,
	getTickFormatter,
	InnerChartProps,
	isActive,
	SeriesInfo,
	TooltipSettings,
	useGraphCallbacks,
	useGraphSeries,
} from '@/pages/Graphing/components/Graph'
import { syncTimestamp } from '@/pages/Graphing/components/utils'

export type BarDisplay = 'Grouped' | 'Stacked'
export const BAR_DISPLAY: BarDisplay[] = ['Grouped', 'Stacked']

export type BarChartConfig = {
	type: 'Bar chart'
	showLegend: boolean
	shadeToPrevious?: true
	display?: BarDisplay
	tooltipSettings?: TooltipSettings
}

const RoundedBar = (id: string, isLast: boolean) => (props: any) => {
	const { fill, x, y, width, height } = props
	// TODO(vkorolik) use shadeToPrevious
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

const BarChartImpl = ({
	data,
	xAxisMetric,
	spotlight,
	strokeColors,
	viewConfig,
	setTimeRange,
	loadExemplars,
	children,
	showXAxis,
	showYAxis,
	showGrid,
	syncId,
}: React.PropsWithChildren<
	InnerChartProps<BarChartConfig> & SeriesInfo & AxisConfig
>) => {
	const series = useGraphSeries(data, xAxisMetric)

	const xAxisTickFormatter = getTickFormatter(xAxisMetric, data)
	const yAxisTickFormatter = getTickFormatter(
		series.at(0)?.column ?? '',
		data,
	)

	// used to give svg masks an id unique to the page
	const id = useId()

	const {
		referenceArea,
		tooltip,
		chartRef,
		tooltipCanFreeze,
		onMouseDown,
		onMouseMove,
		onMouseUp,
		onMouseLeave,
		onMouseOver,
	} = useGraphCallbacks(
		xAxisMetric,
		setTimeRange,
		loadExemplars,
		viewConfig?.tooltipSettings,
	)

	return (
		<span onMouseOver={onMouseOver}>
			<ResponsiveContainer ref={chartRef}>
				<RechartsBarChart
					data={data}
					syncId={syncId}
					syncMethod={syncTimestamp}
					barCategoryGap={1}
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
							stroke="var(--color-gray-200)"
						/>
					)}

					{series.length > 0 &&
						series.map((s, idx) => {
							if (!isActive(spotlight, idx)) {
								return null
							}

							const isLastBar =
								viewConfig.display !== 'Stacked' ||
								spotlight === idx ||
								idx === series.length - 1

							const seriesKey = getSeriesKey(s)

							return (
								<Bar
									key={seriesKey}
									dataKey={`${seriesKey}.value`}
									name={s.name}
									fill={getColor(
										idx,
										seriesKey,
										strokeColors,
									)}
									isAnimationActive={false}
									stackId={
										viewConfig.display === 'Stacked'
											? 1
											: idx
									}
									shape={RoundedBar(id, isLastBar)}
								/>
							)
						})}
				</RechartsBarChart>
			</ResponsiveContainer>
		</span>
	)
}

export const BarChart = memo(BarChartImpl)
