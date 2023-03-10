import LoadingBox from '@components/LoadingBox'
import { useGetLogsHistogramQuery } from '@graph/hooks'
import { LogLevel as Level } from '@graph/schemas'
import { Box, BoxProps, Popover, Text } from '@highlight-run/ui'
import {
	LOG_PAGE_COLOR_MAPPING,
	LOG_TIME_FORMAT,
} from '@pages/LogsPage/constants'
import { LogLevel } from '@pages/LogsPage/LogsTable/LogLevel'
import { isSignificantDateRange } from '@pages/LogsPage/utils'
import { formatNumber } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import { useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import * as styles from './LogsHistogram.css'

type LogCount = {
	level: string
	count: number
	height: number
}
interface HistogramBucket {
	startDate: Date
	endDate: Date
	width: number
	counts?: LogCount[]
}

type LogsHistogramProps = Omit<LogsHistogramChartProps, 'buckets'> & {
	query: string
	outline?: boolean
} & BoxProps

interface LogsHistogramChartProps {
	startDate: Date
	endDate: Date
	buckets: HistogramBucket[]
	onDatesChange?: (startDate: Date, endDate: Date) => void
	onLevelChange?: (level: Level) => void
}

const LogsHistogram = ({
	outline,
	query,
	startDate,
	endDate,
	onDatesChange,
	onLevelChange,
	...props
}: LogsHistogramProps) => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const { data, loading } = useGetLogsHistogramQuery({
		variables: {
			project_id: project_id!,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(LOG_TIME_FORMAT),
					end_date: moment(endDate).format(LOG_TIME_FORMAT),
				},
			},
		},
		skip: !project_id,
	})

	const maxBucketCount = useMemo(() => {
		if (!data?.logs_histogram) {
			return 0
		}

		const { buckets } = data.logs_histogram

		let maxBucketCount = 0
		buckets.forEach((bucket) => {
			const { counts } = bucket
			const bucketTotal = counts.reduce(
				(acc, count) => acc + count.count,
				0,
			)
			maxBucketCount = Math.max(maxBucketCount, bucketTotal)
		})

		return maxBucketCount
	}, [data?.logs_histogram])

	const buckets = useMemo(() => {
		if (!data?.logs_histogram) {
			return []
		}

		const { totalCount, buckets } = data.logs_histogram

		const bucketData = new Map<number, LogCount[]>()

		buckets.forEach((bucket) => {
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
			(endDate.getTime() - startDate.getTime()) / totalCount

		return [...Array(totalCount)].map((_, bucketId) => {
			const counts = bucketData.get(bucketId)
			const bucket = {
				startDate: new Date(
					startDate.getTime() + bucketId * bucketStep,
				),
				endDate: new Date(
					startDate.getTime() + (bucketId + 1) * bucketStep,
				),
				width: 100 / totalCount,
				counts,
			} as HistogramBucket
			return bucket
		})
	}, [data?.logs_histogram, endDate, maxBucketCount, startDate])

	const axis = useMemo(() => {
		if (!outline) {
			return null
		}
		// return the axis with 5 ticks based on maxBucketCount
		const count = 5
		const ticks = [...Array(count + 1)].map((_, idx) => {
			const tick = Math.ceil(maxBucketCount / count) * idx
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
	}, [loading, maxBucketCount, outline])

	if (!loading && !maxBucketCount) {
		return null
	}

	return (
		<Box
			display="flex"
			alignItems="center"
			gap="4"
			{...props}
			style={{
				height: outline
					? styles.OUTLINE_HISTOGRAM_HEIGHT
					: styles.REGULAR_HISTOGRAM_HEIGHT,
			}}
		>
			<Box
				p={outline ? '2' : undefined}
				border={outline ? 'dividerWeak' : undefined}
				borderRadius="4"
				width="full"
				height="full"
			>
				{loading ? (
					<LoadingBox />
				) : (
					<LogsHistogramChart
						buckets={buckets}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={onDatesChange}
						onLevelChange={onLevelChange}
					/>
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
					onDatesChange={onDatesChange}
					onLevelChange={onLevelChange}
					isDragging={
						dragLeft !== undefined && dragRight !== undefined
					}
				/>
			)
		})
	}, [buckets, dragLeft, dragRight, onDatesChange, onLevelChange])

	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<Box
			display="flex"
			alignItems="flex-end"
			height="full"
			width="full"
			position="relative"
			ref={containerRef}
			onMouseDown={(e: any) => {
				if (!e || !containerRef.current) {
					return
				}
				const rect = containerRef.current.getBoundingClientRect()
				const pos = ((e.clientX - rect.left) / rect.width) * 100
				setDragStart(pos)
			}}
			onMouseMove={(e: any) => {
				if (!e || !containerRef.current) {
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
			{content}
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
	onDatesChange,
	onLevelChange,
	isDragging,
}: {
	bucket?: HistogramBucket
	onDatesChange?: (startDate: Date, endDate: Date) => void
	onLevelChange?: (level: Level) => void
	isDragging?: boolean
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
				p="1"
				gap="1"
				cssClass={{ [styles.hover]: !isDragging }}
				style={{
					width: `${bucket?.width}%`,
					height: '100%',
				}}
			>
				{bucket?.counts?.map((bar) => {
					if (!bar.count) return null
					return (
						<Box
							key={bar.level}
							style={{
								height: `${bar.height}%`,
							}}
							width="full"
							borderRadius="2"
							backgroundColor={
								LOG_PAGE_COLOR_MAPPING[bar.level as Level]
							}
						/>
					)
				})}
			</Popover.BoxTrigger>
		)
	}, [bucket?.counts, bucket?.width, isDragging])

	const content = useMemo(() => {
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
											LOG_PAGE_COLOR_MAPPING[
												bar.level as Level
											],
										height: 8,
										width: 8,
									}}
								/>
								<LogLevel level={bar.level as Level} />
								<Box ml="auto" color="weak">
									<Text size="small" weight="medium">
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

export default LogsHistogram
