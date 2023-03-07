import LoadingBox from '@components/LoadingBox'
import { useGetLogsHistogramQuery } from '@graph/hooks'
import { LogLevel as Level } from '@graph/schemas'
import { Box, Popover, Text } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { FORMAT } from '@pages/LogsPage/constants'
import { LogLevel } from '@pages/LogsPage/LogsTable/LogLevel'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import { useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

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

const LogsHistogram = ({
	query,
	startDate,
	endDate,
	onDatesChange,
	onLevelChange,
}: {
	query: string
	startDate: Date
	endDate: Date
	onDatesChange?: (startDate: Date, endDate: Date) => void
	onLevelChange?: (level: Level) => void
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const { data, loading } = useGetLogsHistogramQuery({
		variables: {
			project_id: project_id!,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(FORMAT),
					end_date: moment(endDate).format(FORMAT),
				},
			},
		},
		skip: !project_id,
	})

	const [dragStart, setDragStart] = useState<number | undefined>()
	const [dragEnd, setDragEnd] = useState<number | undefined>()
	let dragLeft: number | undefined
	let dragRight: number | undefined
	if (dragStart !== undefined && dragEnd !== undefined) {
		dragLeft = Math.min(dragStart, dragEnd)
		dragRight = Math.max(dragStart, dragEnd)
	}

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

	const content = useMemo(() => {
		if (loading) {
			return <LoadingBox />
		}

		if (!data?.logs_histogram || !maxBucketCount) {
			return null
		}

		const { totalCount, buckets } = data.logs_histogram

		const bucketData = new Map<number, LogCount[]>()

		buckets.forEach((bucket) => {
			const { bucketId, counts } = bucket
			bucketData.set(Number(bucketId), counts)
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
				counts,
			} as HistogramBucket

			return (
				<LogBucketBar
					key={bucketId}
					bucket={bucket}
					width={`${100 / totalCount}%`}
					maxBucketCount={maxBucketCount}
					onDatesChange={onDatesChange}
					onLevelChange={onLevelChange}
				/>
			)
		})
	}, [
		data?.logs_histogram,
		endDate,
		loading,
		maxBucketCount,
		onDatesChange,
		onLevelChange,
		startDate,
	])

	const containerRef = useRef<HTMLDivElement>(null)
	if (!loading && !maxBucketCount) {
		return null
	}

	return (
		<Box
			display="flex"
			alignItems="flex-end"
			cssClass={styles.histogramContainer}
			width="full"
			px="12"
			mt="8"
			position="relative"
			ref={containerRef}
			onMouseDown={(e: any) => {
				if (!e || !containerRef.current) {
					return
				}
				const rect = containerRef.current.getBoundingClientRect()
				const pos = ((e.clientX - rect.left) / rect.width) * 100
				setDragStart(pos)
				setDragEnd(pos)
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
					onDatesChange?.(start, end)
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
	maxBucketCount,
	width,
	onDatesChange,
	onLevelChange,
	isDragging,
}: {
	bucket?: HistogramBucket
	maxBucketCount: number
	width: string | number
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
				cssClass={{ [styles.hover]: isDragging }}
				style={{
					width,
					height: '100%',
				}}
			>
				{bucket?.counts?.map((bar) => {
					if (!bar.count) return null
					return (
						<Box
							key={bar.level}
							style={{
								height: `${
									(bar.count / maxBucketCount) * 100
								}%`,
								backgroundColor:
									severityToColor[bar.level as Level],
							}}
							width="full"
							borderRadius="2"
						/>
					)
				})}
			</Popover.BoxTrigger>
		)
	}, [bucket?.counts, isDragging, maxBucketCount, width])

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
									onDatesChange?.(
										bucket.startDate,
										bucket.endDate,
									)
								}}
							>
								<Box
									borderRadius="round"
									style={{
										backgroundColor:
											severityToColor[bar.level as Level],
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

const severityToColor = {
	[Level.Trace]: colors.n6,
	[Level.Debug]: colors.n8,
	[Level.Info]: colors.n9,
	[Level.Warn]: colors.n10,
	[Level.Error]: colors.n11,
	[Level.Fatal]: colors.n12,
} as const

export default LogsHistogram
