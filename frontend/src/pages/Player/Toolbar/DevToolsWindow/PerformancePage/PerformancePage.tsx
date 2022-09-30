import { Skeleton } from '@components/Skeleton/Skeleton'
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
	startTime: number
}

interface PerformanceData {
	timestamp: number
	fps: number
	jank: {
		amount?: number
		selector?: string
		newLocation?: string
	}
	memoryUsagePercent: number
}

const PerformancePage = React.memo(({ currentTime, startTime }: Props) => {
	const { performancePayloads, jankPayloads, pause, events, session } =
		useReplayerContext()

	const performanceData: PerformanceData[] = performancePayloads.map(
		(payload) => {
			const jank = jankPayloads.find(
				(j) =>
					j.relativeTimestamp >= payload.relativeTimestamp &&
					j.relativeTimestamp <=
						payload.relativeTimestamp + j.jankAmount,
			)
			return {
				timestamp: payload.relativeTimestamp * 1000,
				fps: payload.fps,
				jank: {
					amount: jank?.jankAmount,
					selector: jank?.querySelector,
					newLocation: jank?.newLocation,
				},
				memoryUsagePercent:
					payload.usedJSHeapSize / payload.jsHeapSizeLimit,
			}
		},
	)

	const isLoading = events.length === 0 && performancePayloads.length === 0
	const hasNoPerformancePayloads =
		events.length > 0 && performancePayloads.length === 0

	return (
		<div className={styles.container}>
			{isLoading && (
				<div className={styles.emptyContainer}>
					<Skeleton height="100%" />
				</div>
			)}
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
					},
					{
						key: 'jank' as keyof PerformanceData,
						yAxisTickFormatter: (tickItem: number | string) =>
							typeof tickItem === 'number'
								? `${tickItem.toFixed(1)} ms`
								: `${tickItem}`,
						strokeColor: 'var(--color-red-700)',
						fillColor: 'var(--color-red-400)',
						yAxisLabel: 'ms',
						noTooltipLabel: true,
						tooltipIcon: <SvgActivityIcon />,
						chartLabel: 'Jank',
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
					}) => {
						const timestamps = performanceData.map(
							(d) => d.timestamp,
						)
						const closestTimestamp = findClosestTimestamp(
							timestamps,
							currentTime - startTime,
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
								<div className={styles.noDataContainer}>
									<p>
										{session?.browser_name}{' '}
										{session?.browser_version} does not
										support recording {chartLabel}.
									</p>
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
