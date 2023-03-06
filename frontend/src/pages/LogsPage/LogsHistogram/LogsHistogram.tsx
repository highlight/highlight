import LoadingBox from '@components/LoadingBox'
import { useGetLogsHistogramQuery } from '@graph/hooks'
import { SeverityText } from '@graph/schemas'
import { Box, Popover, Text } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { FORMAT } from '@pages/LogsPage/constants'
import { LogSeverityText } from '@pages/LogsPage/LogsTable/LogSeverityText'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import { useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import * as styles from './LogsHistogram.css'

type LogCount = {
	severityText: string
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
	onLevelChange?: (level: SeverityText) => void
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
			pt="8"
		>
			{content}
		</Box>
	)
}

const LogBucketBar = ({
	bucket,
	maxBucketCount,
	width,
	onDatesChange,
	onLevelChange,
}: {
	bucket?: HistogramBucket
	maxBucketCount: number
	width: string | number
	onDatesChange?: (startDate: Date, endDate: Date) => void
	onLevelChange?: (level: SeverityText) => void
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
				cssClass={styles.hover}
				style={{
					width,
					height: '100%',
				}}
			>
				{bucket?.counts?.map((bar) => (
					<Box
						key={bar.severityText}
						style={{
							height: `${(bar.count / maxBucketCount) * 100}%`,
							backgroundColor:
								severityToColor[
									bar.severityText as SeverityText
								],
						}}
						width="full"
						borderRadius="2"
					/>
				))}
			</Popover.BoxTrigger>
		)
	}, [bucket, maxBucketCount, width])

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
					{bucket?.counts?.map((bar, index) => (
						<Box
							key={index}
							display="flex"
							alignItems="center"
							gap="8"
							px="8"
							py="4"
							cssClass={[styles.popoverContentRow, styles.hover]}
							onClick={() => {
								if (onLevelChange) {
									onLevelChange(
										bar.severityText as SeverityText,
									)
								}
								if (onDatesChange) {
									onDatesChange(
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
										severityToColor[
											bar.severityText as SeverityText
										],
									height: 8,
									width: 8,
								}}
							/>
							<LogSeverityText
								severityText={bar.severityText as SeverityText}
							/>
							<Box ml="auto" color="weak">
								<Text size="small" weight="medium">
									{bar.count}
								</Text>
							</Box>
						</Box>
					))}
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
	[SeverityText.Trace]: colors.n6,
	[SeverityText.Debug]: colors.n8,
	[SeverityText.Info]: colors.n9,
	[SeverityText.Warn]: colors.n10,
	[SeverityText.Error]: colors.n11,
	[SeverityText.Fatal]: colors.n12,
} as const

export default LogsHistogram
