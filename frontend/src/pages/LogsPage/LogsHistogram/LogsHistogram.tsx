import { Box, BoxProps } from '@highlight-run/ui/components'
import { clamp } from '@util/numbers'
import clsx from 'clsx'
import { ReferenceArea } from 'recharts'

import { GetMetricsQuery } from '@/graph/generated/operations'
import { BarChart } from '@/pages/Graphing/components/BarChart'
import {
	TIMESTAMP_KEY,
	useGraphData,
	useGraphSeries,
} from '@/pages/Graphing/components/Graph'
import { LineChart } from '@/pages/Graphing/components/LineChart'
import { LEVEL_COLOR_MAPPING } from '@/pages/LogsPage/constants'

import * as styles from './LogsHistogram.css'

type LogsHistogramProps = Omit<
	LogsHistogramChartProps,
	'totalCount' | 'maxBucketCount' | 'loadingState'
> & {
	loading: boolean
	loadingState?: LoadingState
	outline?: boolean
	legend?: boolean
	threshold?: number
	belowThreshold?: boolean
	frequencySeconds?: number
	barColor?: string
	noPadding?: boolean
	lineChart?: boolean
} & BoxProps

type LoadingState = 'skeleton' | 'spinner'

interface LogsHistogramChartProps {
	startDate: Date
	endDate: Date
	loadingState: LoadingState | undefined
	metrics: GetMetricsQuery | undefined
	series?: string[]
	onDatesChange?: (startDate: Date, endDate: Date) => void
	noPadding?: boolean
}

const LogsHistogram = ({
	outline,
	startDate,
	endDate,
	metrics,
	onDatesChange,
	threshold,
	belowThreshold,
	frequencySeconds,
	loading,
	loadingState,
	series,
	lineChart,
	...props
}: LogsHistogramProps) => {
	const data = useGraphData(metrics, TIMESTAMP_KEY)
	const fallbackSeries = useGraphSeries(data, TIMESTAMP_KEY)
	if (series === undefined) {
		series = fallbackSeries
	}
	let maxValue = 0
	for (const d of data ?? []) {
		let curValue = 0
		for (const [key, value] of Object.entries(d)) {
			if (key !== TIMESTAMP_KEY) {
				curValue += (value as number | undefined | null) ?? 0
			}
		}
		if (curValue > maxValue) {
			maxValue = curValue
		}
	}
	const bucketCount = data?.length ?? 0

	const referenceValue = belowThreshold ? 0 : maxValue
	const timeSeconds = (endDate.getTime() - startDate.getTime()) / 1000
	const adjThreshold =
		((threshold ?? 0) * timeSeconds) /
		(frequencySeconds ?? timeSeconds) /
		bucketCount
	const clampedThreshold = clamp(
		Math.abs(adjThreshold ?? referenceValue),
		0,
		maxValue,
	)
	const areaMin = belowThreshold ? 0 : clampedThreshold
	const areaMax = belowThreshold ? clampedThreshold : maxValue

	const showLoadingState = loading || (!outline && maxValue === 0)

	if (!loading && !outline && maxValue === 0) {
		return (
			<Box
				cssClass={clsx({
					[styles.regularHeight]: !outline,
					[styles.outlineHeight]: outline,
				})}
			/>
		)
	}

	if (showLoadingState) {
		if (!loadingState) {
			if (outline) {
				loadingState = 'spinner'
			} else {
				loadingState = 'skeleton'
			}
		}
	} else {
		loadingState = undefined
	}

	const heightClass = clsx({
		[styles.regularHeight]: !outline,
		[styles.outlineHeight]: outline,
	})

	return (
		<Box
			display="flex"
			alignItems="center"
			gap="4"
			cssClass={heightClass}
			{...props}
		>
			<Box
				p={outline ? `${styles.OUTLINE_PADDING}` : undefined}
				border={outline ? 'dividerWeak' : undefined}
				position="relative"
				borderRadius="4"
				width="full"
				cssClass={heightClass}
			>
				{!!maxValue && !lineChart && (
					<>
						<BarChart
							data={data}
							xAxisMetric="Timestamp"
							yAxisMetric=""
							yAxisFunction=""
							viewConfig={{
								type: 'Bar chart',
								showLegend: false,
								display: 'Stacked',
							}}
							series={series}
							showYAxis={false}
							strokeColors={LEVEL_COLOR_MAPPING}
							setTimeRange={onDatesChange}
						>
							{threshold !== undefined && !belowThreshold && (
								<ReferenceArea
									y1={areaMin}
									isFront
									fill="#cd2b31"
									opacity={0.5}
								/>
							)}
							{threshold !== undefined && belowThreshold && (
								<ReferenceArea
									y2={areaMax}
									isFront
									fill="#cd2b31"
									opacity={0.5}
								/>
							)}
						</BarChart>
					</>
				)}
				{!!maxValue && lineChart && (
					<>
						<LineChart
							data={data}
							xAxisMetric="Timestamp"
							yAxisMetric="duration"
							yAxisFunction=""
							viewConfig={{
								type: 'Line chart',
								showLegend: false,
							}}
							series={series}
							showYAxis={false}
							strokeColors={LEVEL_COLOR_MAPPING}
							setTimeRange={onDatesChange}
						>
							{threshold !== undefined && (
								<ReferenceArea
									y1={areaMin}
									y2={areaMax}
									color="#FFFFFF"
									isFront
								/>
							)}
						</LineChart>
					</>
				)}
			</Box>
		</Box>
	)
}

export default LogsHistogram
