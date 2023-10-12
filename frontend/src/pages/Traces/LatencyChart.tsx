import { Box } from '@highlight-run/ui'
import clsx from 'clsx'
import { useState } from 'react'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts'

import Button from '@/components/Button/Button/Button'
import { CustomTooltip } from '@/components/LineChart/LineChart'
import { RechartTooltip } from '@/components/recharts/RechartTooltip/RechartTooltip'

import * as styles from './LatencyChart.css'

const LINE_COLORS: Map<string, string> = new Map([
	['p50', '#AD5700'],
	['p90', '#6346AF'],
])

interface Props {
	metricsBuckets: {
		p50: number | undefined
		p90: number | undefined
	}[]
}

const CustomLegend = ({
	dataTypesToShow,
	setDataTypesToShow,
	props,
}: {
	dataTypesToShow: string[]
	setDataTypesToShow: React.Dispatch<React.SetStateAction<string[]>>
	props: any
}) => {
	const { payload }: { payload: any[] } = props
	return (
		<Box
			display="flex"
			flexDirection="row"
			justifyContent="flex-end"
			gap="4"
			position="relative"
			style={{
				top: '-5px',
			}}
		>
			{payload?.map((entry, index) => (
				<Button
					trackingId="LineChartLegendFilter"
					key={`item-${index}`}
					type="text"
					size="small"
					onClick={() => {
						setDataTypesToShow((previous) => {
							// Toggle off
							if (previous.includes(entry.value)) {
								return previous.filter((e) => e !== entry.value)
							} else {
								// Toggle on
								return [...previous, entry.value]
							}
						})
					}}
					className="flex items-center gap-x-1 overflow-hidden p-0 text-xs text-gray-500"
				>
					<div
						className={clsx(styles.legendIcon, {
							[styles.notShowingIcon]: !dataTypesToShow.includes(
								entry.value,
							),
						})}
						style={{
							background: entry.color,
						}}
					></div>
					<span
						className={clsx(styles.legendValue, {
							[styles.notShowingValue]: !dataTypesToShow.includes(
								entry.value,
							),
						})}
					>
						{entry.value}
					</span>
				</Button>
			))}
		</Box>
	)
}

export const LatencyChart = ({ metricsBuckets }: Props) => {
	const [dataTypesToShow, setDataTypesToShow] = useState(['p50', 'p90'])
	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart data={metricsBuckets}>
				<Tooltip
					position={{ y: 0 }}
					content={
						<RechartTooltip
							render={(payload: any[]) => (
								<CustomTooltip
									payload={payload}
									yAxisLabel="ms"
									precision={1}
									units="ms"
								/>
							)}
						/>
					}
				/>

				<Legend
					verticalAlign="top"
					content={(props) => {
						return (
							<CustomLegend
								props={props}
								dataTypesToShow={dataTypesToShow}
								setDataTypesToShow={setDataTypesToShow}
							/>
						)
					}}
				/>
				{(metricsBuckets.length > 0
					? Object.keys(metricsBuckets[0])
					: []
				).map((key) => (
					<Line
						hide={!dataTypesToShow.includes(key)}
						key={key}
						type="linear"
						dataKey={key}
						stroke={LINE_COLORS.get(key)}
						strokeWidth={2}
						animationDuration={100}
						dot={false}
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	)
}
