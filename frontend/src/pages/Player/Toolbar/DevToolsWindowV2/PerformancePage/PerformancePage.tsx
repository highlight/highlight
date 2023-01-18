import LoadingBox from '@components/LoadingBox'
import StackedAreaChart from '@components/StackedAreaChart/StackedAreaChart'
import SvgActivityIcon from '@icons/ActivityIcon'
import SvgCarDashboardIcon from '@icons/CarDashboardIcon'
import SvgTimerIcon from '@icons/TimerIcon'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { MillisToMinutesAndSeconds } from '@util/time'
import React from 'react'

import styles from './PerformancePage.module.scss'

type Props = {
	currentTime: number
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

const PerformancePage = React.memo(({ currentTime }: Props) => {
	const {
		performancePayloads,
		jankPayloads,
		pause,
		eventsForTimelineIndicator,
		session,
		sessionMetadata,
	} = useReplayerContext()

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
						<p>This session has no performance data.</p>
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
				].map(
					({
						key,
						strokeColor,
						fillColor,
						yAxisTickFormatter,
						yAxisLabel,
						noTooltipLabel,
						tooltipIcon,
						chartLabel,
						helpLink,
					}) => {
						const timestamps = performanceData.map(
							(d) => d.timestamp,
						)
						const closestTimestamp = findClosestTimestamp(
							timestamps,
							currentTime - sessionMetadata.startTime,
						)
						const data = performanceData.map((d) => ({
							timestamp: d.timestamp,
							...(key === 'jank'
								? {
										jank: d.jank.amount,
										selector: d.jank.selector,
										...(d.jank.newLocation
											? {
													locationChanged:
														d.jank.newLocation,
											  }
											: {}),
								  }
								: { [key]: d[key] }),
						}))

						const hasData = data.some(
							(data: any) => !isNaN(data[key]),
						)
						if (data.length === 0 || !hasData) {
							return (
								<div
									className={styles.noDataContainer}
									key={key}
								>
									{key === 'jank' ? (
										<p>No UI Jank recording available.</p>
									) : (
										<p>
											{session?.browser_name}{' '}
											{session?.browser_version} does not
											support recording {chartLabel}.
										</p>
									)}
								</div>
							)
						}

						return (
							<StackedAreaChart
								key={key}
								data={data}
								xAxisKey="timestamp"
								showXAxis={key === 'jank'}
								heightPercent="30%"
								fillColor={fillColor}
								strokeColor={strokeColor}
								xAxisTickFormatter={(tickItem) => {
									return MillisToMinutesAndSeconds(tickItem)
								}}
								onClickHandler={(event) => {
									if (event?.activePayload?.length > 0) {
										const timestamp =
											event.activePayload[0].payload
												.timestamp

										pause(timestamp)
									}
								}}
								yAxisTickFormatter={yAxisTickFormatter}
								referenceLineProps={{
									stroke: 'var(--color-purple)',
									x: closestTimestamp,
								}}
								yAxisLabel={yAxisLabel}
								noTooltipLabel={noTooltipLabel || false}
								tooltipIcon={tooltipIcon}
								chartLabel={chartLabel}
								helpLink={helpLink}
							/>
						)
					},
				)}
		</div>
	)
})

export default PerformancePage

function findClosestTimestamp(nums: Array<number>, key: number): number {
	let low = 0
	let high = nums.length - 1
	let mid = 0
	while (low <= high) {
		mid = Math.floor((low + high) / 2)
		if (nums[mid] === key) {
			return nums[mid + 1]
		}
		if (key > nums[mid]) {
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	return nums[mid - 1]
}
