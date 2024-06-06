import { LogLevel as Level } from '@graph/schemas'
import { Box, BoxProps } from '@highlight-run/ui/components'
import { formatDate } from '@pages/LogsPage/utils'
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
} & BoxProps

type LoadingState = 'skeleton' | 'spinner'

interface LogsHistogramChartProps {
	startDate: Date
	endDate: Date
	loadingState: LoadingState | undefined
	metrics: GetMetricsQuery | undefined
	onDatesChange?: (startDate: Date, endDate: Date) => void
	onLevelChange?: (level: Level) => void
	barColor?: string
	noPadding?: boolean
	legend?: boolean
}

const LogsHistogram = ({
	outline,
	legend,
	startDate,
	endDate,
	metrics,
	// onDatesChange,
	// onLevelChange,
	threshold,
	belowThreshold,
	frequencySeconds,
	loading,
	loadingState,
	// barColor,
	// noPadding,
	...props
}: LogsHistogramProps) => {
	const data = useGraphData(metrics, TIMESTAMP_KEY)
	const series = useGraphSeries(data, TIMESTAMP_KEY)
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
		[styles.regularHeight]: !legend && !outline,
		[styles.outlineHeight]: !legend && outline,
		[styles.legendHeight]: legend,
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
				{showLoadingState || !!maxValue ? (
					<>
						<BarChart
							data={data}
							xAxisMetric="Timestamp"
							yAxisMetric=""
							yAxisFunction="Count"
							viewConfig={{
								type: 'Bar chart',
								showLegend: false,
								display: 'Stacked',
							}}
							series={series}
							showYAxis={false}
							verboseTooltip
						>
							{threshold !== undefined && (
								<ReferenceArea
									y1={areaMin}
									y2={areaMax}
									color="#FFFFFF"
									isFront
								/>
							)}
						</BarChart>
					</>
				) : (
					<Box
						width="full"
						height="full"
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						No logs from {formatDate(startDate)} to{' '}
						{formatDate(endDate)}.
					</Box>
				)}
			</Box>
		</Box>
	)
}

export default LogsHistogram
