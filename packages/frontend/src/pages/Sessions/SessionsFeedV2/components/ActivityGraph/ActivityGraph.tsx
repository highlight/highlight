import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Area, ComposedChart } from 'recharts'

interface Props {
	data: any[]
	height?: number
}

const ActivityGraph = ({ data, height = 20 }: Props) => {
	const gradientId = `session-activity-graph-colorUv`
	const lineColor = 'var(--color-purple)'

	return (
		<div style={{ height }}>
			<AutoSizer>
				{({ width }) => (
					<ComposedChart
						data={data}
						height={height}
						width={width}
						margin={{
							top: 4,
							right: 0,
							left: 0,
							bottom: 2,
						}}
						style={{
							opacity: 0.3,
						}}
					>
						<defs>
							<linearGradient
								id={gradientId}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor={lineColor}
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-primary-background)"
									stopOpacity={0.2}
								/>
							</linearGradient>
						</defs>
						<Area
							isAnimationActive={false}
							type="natural"
							dataKey="value"
							strokeWidth={2}
							fillOpacity={1}
							stroke={lineColor}
							fill={`url(#${gradientId})`}
							activeDot={false}
						/>
					</ComposedChart>
				)}
			</AutoSizer>
		</div>
	)
}

export default ActivityGraph
