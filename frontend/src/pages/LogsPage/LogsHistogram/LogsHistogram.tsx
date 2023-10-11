import { LogLevel as Level } from '@graph/schemas'
import { Box, BoxProps, Popover, Text } from '@highlight-run/ui'
import { COLOR_MAPPING } from '@pages/LogsPage/constants'
import { formatDate, isSignificantDateRange } from '@pages/LogsPage/utils'
import { clamp, formatNumber } from '@util/numbers'
import clsx from 'clsx'
import { memo, useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import LoadingBox from '@/components/LoadingBox'

import * as styles from './LogsHistogram.css'

type LogCount = {
	level: string
	count: number
}
interface HistogramBucket {
	startDate: Date
	endDate: Date
	counts?: LogCount[]
}

type LogsHistogramProps = Omit<
	LogsHistogramChartProps,
	| 'buckets'
	| 'showLoadingState'
	| 'totalCount'
	| 'maxBucketCount'
	| 'loadingState'
> & {
	histogramBuckets: { bucketId: number; counts: LogCount[] }[] | undefined
	bucketCount: number
	loading: boolean
	outline?: boolean
	threshold?: number
	belowThreshold?: boolean
	frequencySeconds?: number
} & BoxProps

type LoadingState = 'skeleton' | 'spinner'

interface LogsHistogramChartProps {
	startDate: Date
	endDate: Date
	buckets: HistogramBucket[]
	loadingState: LoadingState | undefined
	totalCount: number
	maxBucketCount: number
	onDatesChange?: (startDate: Date, endDate: Date) => void
	onLevelChange?: (level: Level) => void
}

const LogsHistogram = ({
	outline,
	startDate,
	endDate,
	onDatesChange,
	onLevelChange,
	threshold,
	belowThreshold,
	frequencySeconds,
	histogramBuckets,
	bucketCount,
	loading,
	...props
}: LogsHistogramProps) => {
	const maxBucketCount = useMemo(() => {
		if (histogramBuckets === undefined) {
			return 0
		}

		let maxBucketCount = 0
		histogramBuckets.forEach((bucket) => {
			const { counts } = bucket
			const bucketTotal = counts.reduce(
				(acc, count) => acc + count.count,
				0,
			)
			maxBucketCount = Math.max(maxBucketCount, bucketTotal)
		})

		return maxBucketCount
	}, [histogramBuckets])

	const buckets = useMemo(() => {
		if (histogramBuckets === undefined) {
			return []
		}

		const bucketData = new Map<number, LogCount[]>()

		histogramBuckets.forEach((bucket) => {
			const { bucketId, counts } = bucket
			const bucketTotal = counts.reduce(
				(acc, count) => acc + count.count,
				0,
			)
			bucketData.set(
				Number(bucketId),
				counts.map((count) => ({
					...count,
					height: Math.max((bucketTotal / maxBucketCount) * 100, 2),
				})),
			)
		})

		const bucketStep =
			(endDate.getTime() - startDate.getTime()) / bucketCount

		return [...Array(bucketCount)].map((_, bucketId) => {
			const counts = bucketData.get(bucketId)
			const bucket = {
				startDate: new Date(
					startDate.getTime() + bucketId * bucketStep,
				),
				endDate: new Date(
					startDate.getTime() + (bucketId + 1) * bucketStep,
				),
				width: 100 / bucketCount,
				counts,
			} as HistogramBucket
			return bucket
		})
	}, [histogramBuckets, endDate, startDate, bucketCount, maxBucketCount])

	const tickValues = useMemo(() => {
		// return the axis with up to 5 ticks based on maxBucketCount
		const count = Math.min(5, maxBucketCount)
		return [
			...new Set(
				[...Array(count + 1)].map((_, idx) => {
					const tick = Math.ceil(maxBucketCount / count) * idx
					return tick
				}),
			),
		]
	}, [maxBucketCount])

	const axis = useMemo(() => {
		if (!outline) {
			return null
		}

		const ticks = (tickValues.length > 1 ? tickValues : []).map((tick) => {
			return (
				<Text
					key={tick}
					color="weak"
					size="xxSmall"
					weight="regular"
					userSelect="none"
				>
					{formatNumber(tick)}
				</Text>
			)
		})
		return (
			<Box
				position="relative"
				height="full"
				display="flex"
				flexDirection="column-reverse"
				justifyContent="space-between"
				alignItems="flex-start"
				p="2"
				style={{
					width: formatNumber(maxBucketCount).length * 8,
				}}
			>
				{loading ? null : ticks}
			</Box>
		)
	}, [loading, maxBucketCount, outline, tickValues])

	const maxValue = tickValues[tickValues.length - 1] ?? 0
	const referenceValue = belowThreshold ? 0 : maxValue
	const timeSeconds = (endDate.getTime() - startDate.getTime()) / 1000
	const adjThreshold =
		((threshold ?? 0) * timeSeconds) /
		(frequencySeconds ?? timeSeconds) /
		buckets.length
	const clampedThreshold = clamp(
		Math.abs(adjThreshold ?? referenceValue),
		0,
		maxValue,
	)
	const thresholdAreaHeight =
		clamp(
			Math.abs(referenceValue - clampedThreshold) / maxValue,
			0,
			1 - (2 * styles.OUTLINE_PADDING) / styles.OUTLINE_HISTOGRAM_HEIGHT,
		) * 100

	const showLoadingState =
		loading ||
		(!outline && (histogramBuckets === undefined || !maxBucketCount))

	if (!loading && !maxBucketCount && !outline) {
		return (
			<Box
				cssClass={clsx({
					[styles.regularHeight]: !outline,
					[styles.outlineHeight]: outline,
				})}
			/>
		)
	}

	let loadingState: LoadingState | undefined
	if (showLoadingState) {
		if (outline) {
			loadingState = 'spinner'
		} else {
			loadingState = 'skeleton'
		}
	}

	return (
		<Box
			display="flex"
			alignItems="center"
			gap="4"
			cssClass={clsx({
				[styles.regularHeight]: !outline,
				[styles.outlineHeight]: outline,
			})}
			{...props}
		>
			<Box
				p={outline ? `${styles.OUTLINE_PADDING}` : undefined}
				border={outline ? 'dividerWeak' : undefined}
				position="relative"
				borderRadius="4"
				width="full"
				height="full"
			>
				{showLoadingState || !!maxBucketCount ? (
					<>
						{outline && threshold && thresholdAreaHeight ? (
							<Box
								position="absolute"
								display="inline-flex"
								backgroundColor="contentBad"
								borderRadius="3"
								cssClass={styles.thresholdArea}
								style={{
									height: `${thresholdAreaHeight}%`,
									left: 2,
									right: 2,
									top: belowThreshold ? undefined : 2,
									bottom: belowThreshold ? 2 : undefined,
								}}
							/>
						) : null}
						<LogsHistogramChart
							buckets={buckets}
							startDate={startDate}
							endDate={endDate}
							loadingState={loadingState}
							onDatesChange={onDatesChange}
							onLevelChange={onLevelChange}
							totalCount={buckets.length}
							maxBucketCount={maxBucketCount}
						/>
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
			{axis}
		</Box>
	)
}

const LogsHistogramChart = ({
	buckets,
	startDate,
	endDate,
	onDatesChange,
	onLevelChange,
	loadingState,
	totalCount,
	maxBucketCount,
}: LogsHistogramChartProps) => {
	const [dragStart, setDragStart] = useState<number | undefined>()
	const [dragEnd, setDragEnd] = useState<number | undefined>()
	let dragLeft: number | undefined
	let dragRight: number | undefined
	if (dragStart !== undefined && dragEnd !== undefined) {
		dragLeft = Math.min(dragStart, dragEnd)
		dragRight = Math.max(dragStart, dragEnd)
	}

	const content = useMemo(() => {
		return buckets.map((bucket, idx) => {
			return (
				<LogBucketBar
					key={idx}
					bucket={bucket}
					width={`${100 / totalCount}%`}
					maxBucketCount={maxBucketCount}
					onDatesChange={onDatesChange}
					onLevelChange={onLevelChange}
					isDragging={
						dragLeft !== undefined && dragRight !== undefined
					}
				/>
			)
		})
	}, [
		buckets,
		dragLeft,
		dragRight,
		maxBucketCount,
		onDatesChange,
		onLevelChange,
		totalCount,
	])

	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<Box
			display="flex"
			alignItems="flex-end"
			height="full"
			width="full"
			position="relative"
			px="12"
			py="4"
			ref={containerRef}
			onMouseDown={(e: any) => {
				if (!e || !containerRef.current || loadingState) {
					return
				}
				const rect = containerRef.current.getBoundingClientRect()
				const pos = ((e.clientX - rect.left) / rect.width) * 100
				setDragStart(pos)
			}}
			onMouseMove={(e: any) => {
				if (!e || !containerRef.current || loadingState) {
					return
				}
				if (dragStart !== undefined) {
					const rect = containerRef.current.getBoundingClientRect()
					const pos = ((e.clientX - rect.left) / rect.width) * 100
					setDragEnd(pos)
				}
			}}
			onMouseUp={() => {
				if (dragLeft !== undefined && dragRight !== undefined) {
					const range = endDate.getTime() - startDate.getTime()
					const start = new Date(
						startDate.getTime() + (dragLeft / 100) * range,
					)
					const end = new Date(
						startDate.getTime() + (dragRight / 100) * range,
					)
					if (isSignificantDateRange(start, end)) {
						onDatesChange?.(start, end)
					}
				}

				setDragStart(undefined)
				setDragEnd(undefined)
			}}
			onMouseLeave={() => {
				setDragStart(undefined)
				setDragEnd(undefined)
			}}
		>
			{loadingState === 'skeleton' && <LoadingState />}
			{loadingState === 'spinner' && <LoadingBox />}
			{!loadingState && content}
			{dragLeft !== undefined && dragRight !== undefined && (
				<Box
					position="absolute"
					height="full"
					style={{
						left: `${dragLeft}%`,
						width: `${dragRight - dragLeft}%`,
					}}
					cssClass={styles.dragSelection}
				/>
			)}
		</Box>
	)
}

const LogBucketBar = ({
	bucket,
	maxBucketCount,
	width,
	onDatesChange,
	onLevelChange,
	isDragging,
	loading,
}: {
	bucket?: HistogramBucket
	maxBucketCount: number
	width: string | number
	onDatesChange?: (startDate: Date, endDate: Date) => void
	onLevelChange?: (level: Level) => void
	isDragging?: boolean
	loading?: boolean
}) => {
	const [open, setOpen] = useState(false)
	useHotkeys('esc', () => {
		setOpen(false)
	})

	const trigger = useMemo(() => {
		return (
			<Popover.BoxTrigger
				display="flex"
				flexDirection="column"
				justifyContent="flex-end"
				height="full"
				width="full"
				p="2"
				gap="2"
				cssClass={{ [styles.hover]: !loading && !isDragging }}
				style={{
					width: width,
					height: '100%',
				}}
			>
				{bucket?.counts?.map((bar) => {
					if (!bar.count) return null
					return (
						<Box
							key={bar.level}
							style={{
								backgroundColor: loading
									? '#F3F3F4'
									: COLOR_MAPPING[bar.level as Level],
								height: `${Math.max(
									(bar.count / maxBucketCount) * 100,
									2,
								)}%`,
							}}
							width="full"
							borderRadius="2"
						/>
					)
				})}
			</Popover.BoxTrigger>
		)
	}, [bucket?.counts, width, isDragging, loading, maxBucketCount])

	const content = useMemo(() => {
		if (loading) {
			return null
		}

		const bucketCount = bucket?.counts?.reduce(
			(acc, curr) => acc + curr.count,
			0,
		)

		if (!bucketCount) return null

		return (
			<Popover.Content
				wrapperProps={{
					// otherwise the popover content will leave shadows on
					className: open ? styles.popoverContent : undefined,
				}}
			>
				<Box display="flex" flexDirection="column" py="4">
					{bucket?.counts?.map((bar, index) => {
						if (!bar.count) return null
						return (
							<Box
								key={index}
								display="flex"
								alignItems="center"
								gap="8"
								px="8"
								py="4"
								cssClass={[
									styles.popoverContentRow,
									styles.hover,
								]}
								onClick={() => {
									onLevelChange?.(bar.level as Level)
									if (
										isSignificantDateRange(
											bucket.startDate,
											bucket.endDate,
										)
									) {
										onDatesChange?.(
											bucket.startDate,
											bucket.endDate,
										)
									}
								}}
							>
								<Box
									borderRadius="round"
									style={{
										backgroundColor:
											COLOR_MAPPING[bar.level as Level],
										height: 8,
										width: 8,
									}}
								/>
								<Text
									color="secondaryContentText"
									transform="capitalize"
								>
									{bar.level}
								</Text>
								<Box ml="auto">
									<Text
										color="secondaryContentText"
										size="small"
										weight="medium"
									>
										{bar.count}
									</Text>
								</Box>
							</Box>
						)
					})}
				</Box>
			</Popover.Content>
		)
	}, [
		bucket?.counts,
		bucket?.endDate,
		bucket?.startDate,
		loading,
		onDatesChange,
		onLevelChange,
		open,
	])

	return (
		<Popover placement="bottom-start" open={open} setOpen={setOpen}>
			{trigger}
			{content}
		</Popover>
	)
}

const LoadingState = memo(() => {
	const loadingData: HistogramBucket[] = []
	const now = new Date()
	const maxBucketCount = 150

	for (let i = 50; i > 0; i--) {
		const isEmpty = Math.round(Math.random() * 100) % 10 === 0
		const multiplier = Math.random() * maxBucketCount
		const startDate = new Date(now)
		startDate.setMinutes(now.getMinutes() - i)
		const endDate = new Date(now)
		endDate.setMinutes(now.getMinutes() - (i + 1))

		loadingData.push({
			startDate,
			endDate,
			counts: [
				{
					level: 'info',
					count: isEmpty ? 0 : Math.random() * multiplier,
				},
				{
					level: 'warn',
					count: isEmpty ? 0 : Math.random() * multiplier,
				},
				{
					level: 'error',
					count: isEmpty ? 0 : Math.random() * multiplier,
				},
				{
					level: 'fatal',
					count: isEmpty ? 0 : Math.random() * multiplier,
				},
			],
		})
	}

	return (
		<>
			{loadingData.map((bucket, index) => {
				return (
					<LogBucketBar
						key={index}
						bucket={bucket}
						loading
						maxBucketCount={maxBucketCount}
						width={`${100 / 50}%`}
					/>
				)
			})}
		</>
	)
})

export default LogsHistogram
