import { useId, useState } from 'react'
import {
	Bar,
	BarChart as RechartsBarChart,
	BarProps,
	CartesianGrid,
	ReferenceArea,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart'

import {
	AxisConfig,
	CustomXAxisTick,
	CustomYAxisTick,
	getColor,
	getCustomTooltip,
	getTickFormatter,
	InnerChartProps,
	isActive,
	SeriesInfo,
	TIMESTAMP_KEY,
	TooltipConfig,
} from '@/pages/Graphing/components/Graph'

export type BarDisplay = 'Grouped' | 'Stacked'
export const BAR_DISPLAY: BarDisplay[] = ['Grouped', 'Stacked']

export type BarChartConfig = {
	type: 'Bar chart'
	showLegend: boolean
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
	yAxisFunction,
	series,
	spotlight,
	strokeColors,
	viewConfig,
	setTimeRange,
	children,
	showXAxis,
	showYAxis,
	showGrid,
	verboseTooltip,
}: React.PropsWithChildren<
	InnerChartProps<BarChartConfig> & SeriesInfo & AxisConfig & TooltipConfig
>) => {
	const xAxisTickFormatter = getTickFormatter(xAxisMetric, data)
	const yAxisTickFormatter = getTickFormatter(yAxisMetric, data)

	// used to give svg masks an id unique to the page
	const id = useId()

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

	const allowDrag =
		setTimeRange !== undefined && xAxisMetric === TIMESTAMP_KEY

	const onMouseDown: CategoricalChartFunc | undefined = allowDrag
		? (e) => {
				if (e.activeLabel !== undefined) {
					setRefAreaStart(Number(e.activeLabel))
				}
		  }
		: undefined

	const onMouseMove: CategoricalChartFunc | undefined = allowDrag
		? (e) => {
				if (refAreaStart !== undefined && e.activeLabel !== undefined) {
					setRefAreaEnd(Number(e.activeLabel))
				}
		  }
		: undefined

	const onMouseUp: CategoricalChartFunc | undefined = allowDrag
		? () => {
				if (refAreaStart !== undefined && refAreaEnd !== undefined) {
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

	return (
		<ResponsiveContainer>
			<RechartsBarChart
				data={data}
				barCategoryGap={1}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
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

				<Tooltip
					content={getCustomTooltip(
						xAxisMetric,
						yAxisMetric,
						yAxisFunction,
						verboseTooltip,
					)}
					wrapperStyle={{ zIndex: 100 }}
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
								fill={getColor(idx, key, strokeColors)}
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
