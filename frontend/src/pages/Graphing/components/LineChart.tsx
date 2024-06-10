import { vars } from '@highlight-run/ui/vars'
import { useMemo, useState } from 'react'
import {
	Area,
	AreaChart,
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
	children,
	showXAxis,
	showYAxis,
	showGrid,
	verboseTooltip,
	strokeColors,
}: React.PropsWithChildren<
	InnerChartProps<LineChartConfig> & SeriesInfo & AxisConfig & TooltipConfig
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
		<ResponsiveContainer height="100%" width="100%">
			<AreaChart
				data={filledData}
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
					cursor={{ stroke: '#C8C7CB', strokeDasharray: 4 }}
					isAnimationActive={false}
					wrapperStyle={{ zIndex: 100 }}
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
								dot={<CustomizedDot />}
							/>
						)
					})}
			</AreaChart>
		</ResponsiveContainer>
	)
}
