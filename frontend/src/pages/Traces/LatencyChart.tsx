import { Box, Stack, Text } from '@highlight-run/ui/components'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts'

import Button from '@/components/Button/Button/Button'
import { CustomTooltip } from '@/components/LineChart/LineChart'
import { RechartTooltip } from '@/components/recharts/RechartTooltip/RechartTooltip'

import * as styles from './LatencyChart.css'

const LINE_COLORS: Map<string, string> = new Map([
	['p50', '#AD5700'],
	['p90', '#6346AF'],
])

const LOADING_LINE_COLORS: Map<string, string> = new Map([
	['avg', '#eee'],
	['p50', '#eaeaea'],
	['p90', '#efefef'],
])

interface Props {
	metricsBuckets: {
		p50: number | undefined
		p90: number | undefined
	}[]
	loading?: boolean
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
					style={{
						padding: 4,
					}}
				>
					<Stack gap="2" direction="row">
						<Box
							cssClass={clsx(styles.legendIcon, {
								[styles.notShowingIcon]:
									!dataTypesToShow.includes(entry.value),
							})}
							style={{
								background: entry.color,
							}}
						/>

						<Text
							size="xSmall"
							color="secondaryContentText"
							decoration={
								!dataTypesToShow.includes(entry.value)
									? 'line-through'
									: undefined
							}
						>
							{entry.value}
						</Text>
					</Stack>
				</Button>
			))}
		</Box>
	)
}

const DEFAULT_DATA_TYPES_TO_SHOW = ['avg', 'p50', 'p90']

export const LatencyChart = ({ loading, metricsBuckets }: Props) => {
	const [dataTypesToShow, setDataTypesToShow] = useState(
		DEFAULT_DATA_TYPES_TO_SHOW,
	)

	if (loading) {
		return <LoadingLatencyGraph />
	}

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
						animationDuration={0}
						dot={false}
						connectNulls
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	)
}

const LoadingLatencyGraph = () => {
	const metricsBuckets = useMemo(
		() =>
			Array.from({ length: 48 }, () => {
				const point = Math.random()
				return {
					avg: point * 100 * 20,
					p50: point * 100 * 2,
					p90: point * 100 * 10,
				}
			}),
		[],
	)

	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart data={metricsBuckets}>
				{(metricsBuckets.length > 0
					? Object.keys(metricsBuckets[0])
					: []
				).map((key) => (
					<Line
						key={key}
						type="linear"
						dataKey={key}
						stroke={LOADING_LINE_COLORS.get(key)}
						strokeWidth={2}
						animationDuration={0}
						dot={false}
						connectNulls
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	)
}
