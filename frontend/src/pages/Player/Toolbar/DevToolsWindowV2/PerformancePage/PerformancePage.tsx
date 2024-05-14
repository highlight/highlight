import LoadingBox from '@components/LoadingBox'
import { MetricAggregator } from '@graph/schemas'
import { Box, Text } from '@highlight-run/ui/components'
import SvgActivityIcon from '@icons/ActivityIcon'
import SvgCarDashboardIcon from '@icons/CarDashboardIcon'
import SvgTimerIcon from '@icons/TimerIcon'
import { TIMESTAMP_KEY } from '@pages/Graphing/components/Graph'
import { LineChart } from '@pages/Graphing/components/LineChart'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import React from 'react'

import * as styles from './style.css'

type Props = {
	time: number
}

interface PerformanceData {
	timestamp: number
	jank: {
		amount?: number
		selector?: string
		newLocation?: string
	}
	fps?: number
	memoryUsagePercent?: number
}

const PerformancePage = React.memo(({}: Props) => {
	const { performancePayloads, jankPayloads, eventsForTimelineIndicator } =
		useReplayerContext()

	const performanceData: PerformanceData[] = performancePayloads.map(
		(payload) => {
			return {
				timestamp: payload.relativeTimestamp * 1000,
				fps: payload.fps,
				jank: {},
				memoryUsagePercent:
					payload.usedJSHeapSize / payload.jsHeapSizeLimit,
			}
		},
	)
	performanceData.push(
		...jankPayloads.map((j) => {
			const perf = performanceData.find(
				(p) => p.timestamp >= j.relativeTimestamp * 1000,
			)
			return {
				timestamp: j.relativeTimestamp * 1000,
				jank: {
					amount: j.jankAmount,
					selector: j.querySelector,
					newLocation: j.newLocation,
				},
				fps: perf?.fps,
				memoryUsagePercent: perf?.memoryUsagePercent,
			}
		}),
	)
	performanceData.sort((a, b) => a.timestamp - b.timestamp)

	const isLoading =
		eventsForTimelineIndicator.length === 0 &&
		performancePayloads.length === 0
	const hasNoPerformancePayloads =
		eventsForTimelineIndicator.length > 0 &&
		performancePayloads.length === 0

	return (
		<div className={styles.container}>
			{isLoading && <LoadingBox />}
			{hasNoPerformancePayloads && (
				<div className={styles.emptyContainer}>
					<div className={styles.messageContainer}>
						<Text>This session has no performance data.</Text>
					</div>
				</div>
			)}
			{!isLoading &&
				[
					{
						key: 'fps' as keyof PerformanceData,
						strokeColor: 'var(--color-green-700)',
						fillColor: 'var(--color-green-400)',
						yAxisLabel: 'Frames per Second',
						tooltipIcon: <SvgTimerIcon />,
						chartLabel: 'Frames Per Second',
						helpLink:
							'https://developer.mozilla.org/en-US/docs/Web/Performance/Animation_performance_and_frame_rate',
					},
					{
						key: 'memoryUsagePercent' as keyof PerformanceData,
						strokeColor: 'var(--color-blue-700)',
						fillColor: 'var(--color-blue-400)',
						yAxisTickFormatter: (tickItem: number) =>
							`${(tickItem * 100).toFixed(0)}%`,
						yAxisLabel: 'Memory Used',
						tooltipIcon: <SvgCarDashboardIcon />,
						chartLabel: 'Device Memory',
						helpLink:
							'https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory',
					},
					{
						key: 'jank' as keyof PerformanceData,
						yAxisTickFormatter: (tickItem: number | string) =>
							typeof tickItem === 'number'
								? `${tickItem.toFixed(0)} ms`
								: `${tickItem}`,
						strokeColor: 'var(--color-purple-700)',
						fillColor: 'var(--color-purple-400)',
						yAxisLabel: 'ms',
						noTooltipLabel: true,
						tooltipIcon: <SvgActivityIcon />,
						chartLabel: 'Jank',
						helpLink:
							'https://developer.mozilla.org/en-US/docs/Glossary/Jank',
					},
				].map(({ key, strokeColor, yAxisLabel }, idx) => {
					const data = performanceData.map((b) => ({
						[TIMESTAMP_KEY]: b.timestamp,
						[key]: b[key],
					}))

					const hasData = data.some((data: any) => !isNaN(data[key]))
					if (data.length === 0 || !hasData) {
						return null
					}

					return (
						<Box
							key={key}
							width="full"
							my={idx === 0 ? undefined : '32'}
							px="16"
							style={{ height: 60 }}
						>
							<Box position="relative" my="8" px="28">
								<Text lines="1" color="n8" align="left">
									{yAxisLabel || '<empty>'}
								</Text>
							</Box>
							<LineChart
								data={data}
								yAxisFunction={MetricAggregator.Count}
								xAxisMetric={TIMESTAMP_KEY}
								yAxisMetric={key}
								series={[key]}
								strokeColors={[strokeColor]}
								viewConfig={{
									type: 'Line chart',
									display: 'Stacked area',
									showLegend: true,
								}}
							/>
						</Box>
					)
				})}
		</div>
	)
})

export default PerformancePage
