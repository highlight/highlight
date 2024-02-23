import { Box, Button, Text } from '@highlight-run/ui/components'
import _ from 'lodash'
import React, { useState } from 'react'
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'

interface Props {
	data: any[]
	xAxisKey: string
	heightPercent?: string
	strokeColor: string
	fillColor: string
	showXAxis?: boolean
	xAxisTickFormatter?: (value: any, index: number) => string
	yAxisTickFormatter?: (value: any, index: number) => string
	onClickHandler?: (event: any) => void
	noTooltipLabel?: boolean
	tooltipIcon?: React.ReactNode
	chartLabel?: string
	helpLink?: string
	/** This is used to align multiple charts. */
	syncId?: string
}

const strokeColors = ['#0090FF', '#D6409F']

const CustomYAxisTick = ({ y, payload }: any) => (
	<g transform={`translate(${0},${y})`}>
		<text
			x={0}
			y={0}
			fontSize={10}
			fill="#C8C7CB"
			textAnchor="start"
			orientation="left"
		>
			{payload.value.toFixed(1)}
		</text>
	</g>
)

const CustomXAxisTick = ({ x, y, payload }: any) => (
	<g transform={`translate(${x},${y})`}>
		<text
			x={0}
			y={0}
			dy={4}
			fontSize={10}
			fill="#C8C7CB"
			textAnchor="middle"
			orientation="bottom"
		>
			{payload.value}
		</text>
	</g>
)

const Graph = ({
	data,
	xAxisKey,
	onClickHandler,
	chartLabel,
	syncId,
}: Props) => {
	const series = _.uniq(data.flatMap((d) => Object.keys(d))).filter(
		(key) => key !== xAxisKey,
	)
	const [visibility, setVisibility] = useState<boolean[]>(
		series.map(() => true),
	)

	return (
		<Box
			px="16"
			py="12"
			width="full"
			height="full"
			border="divider"
			borderRadius="8"
			display="flex"
			flexDirection="column"
			justifyContent="space-between"
			position="static"
		>
			<Box>
				<Box>
					<Text>{chartLabel}</Text>
				</Box>
				<Box>
					{series.map((key, idx) => {
						return (
							<Button
								kind="secondary"
								emphasis="low"
								key={key}
								onClick={() => {
									const newVisibility = [...visibility]
									newVisibility[idx] = !newVisibility[idx]
									setVisibility(newVisibility)
								}}
							>
								<div
									style={{
										width: 8,
										height: 8,
										backgroundColor: visibility[idx]
											? strokeColors[idx]
											: undefined,
										borderRadius: '50%',
										margin: 'auto',
										marginRight: '4px',
									}}
								></div>
								<Text
									color={visibility[idx] ? undefined : 'n8'}
								>
									{key}
								</Text>
							</Button>
						)
					})}
				</Box>
			</Box>
			<Box width="full" style={{ height: '281px' }}>
				<ResponsiveContainer>
					<AreaChart
						data={data}
						onClick={onClickHandler}
						syncId={syncId}
					>
						<XAxis
							dataKey={xAxisKey}
							fontSize={10}
							tick={<CustomXAxisTick />}
							tickLine={{ visibility: 'hidden' }}
							axisLine={{ visibility: 'hidden' }}
							height={12}
						/>

						<YAxis
							fontSize={10}
							tickLine={{ visibility: 'hidden' }}
							axisLine={{ visibility: 'hidden' }}
							tick={<CustomYAxisTick />}
							tickCount={7}
							width={32}
						/>

						<CartesianGrid
							strokeDasharray=""
							vertical={false}
							stroke="var(--color-gray-200)"
						/>

						{series.length > 0 &&
							series.map((key, idx) => {
								if (!visibility[idx]) {
									return null
								}

								return (
									<Area
										isAnimationActive={false}
										key={key}
										dataKey={key}
										stackId="1"
										strokeWidth="2px"
										stroke={strokeColors[idx]}
										fill={strokeColors[idx]}
										fillOpacity={0.1}
									/>
								)
							})}
					</AreaChart>
				</ResponsiveContainer>
			</Box>
		</Box>
	)
}

export default Graph
