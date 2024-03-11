import { colors } from '@highlight-run/ui/colors'
import { themeVars } from '@highlight-run/ui/theme'
import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Area, ComposedChart } from 'recharts'

const SOURCE_POINTS = 100
const DESIRED_POINTS = 12
const SAMPLE_INTERVAL = Math.floor(SOURCE_POINTS / DESIRED_POINTS)
const GRADIENT_COLOR = `#6C37F4`
const LINE_COLOR = colors.p9
const INACTIVE_LINE_COLOR = themeVars.interactive.outline.secondary.enabled
const GRADIENT_ID = `session-activity-graph-v2-colorUv`

interface Props {
	data: { ts: number; value: number }[]
	selected?: boolean
	height?: number
}

const ActivityGraph = React.memo(({ data, selected, height = 20 }: Props) => {
	const points: { ts: number; value: number }[] = []

	let sum = 0
	data.forEach(({ ts, value }, idx) => {
		sum += value
		if (idx % SAMPLE_INTERVAL === 0) {
			points.push({ ts, value: sum / SAMPLE_INTERVAL })
			sum = 0
		}
	})

	return (
		<div style={{ height, cursor: 'pointer' }}>
			<AutoSizer>
				{({ width }: { height: number; width: number }) => (
					<ComposedChart
						// @ts-ignore
						cursor="pointer"
						data={points}
						height={height}
						width={width}
						margin={{
							top: 4,
							right: 0,
							left: 0,
							bottom: 2,
						}}
					>
						<defs>
							<linearGradient
								id={GRADIENT_ID}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="0%"
									stopColor={GRADIENT_COLOR}
									stopOpacity={0.8}
								/>
								<stop
									offset="100%"
									stopColor={GRADIENT_COLOR}
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<Area
							isAnimationActive={false}
							type="linear"
							dataKey="value"
							strokeWidth={2}
							fillOpacity={1}
							stroke={selected ? LINE_COLOR : INACTIVE_LINE_COLOR}
							fill={selected ? `url(#${GRADIENT_ID})` : 'none'}
							activeDot={false}
						/>
					</ComposedChart>
				)}
			</AutoSizer>
		</div>
	)
})

export default ActivityGraph
