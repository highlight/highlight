import LoadingBox from '@components/LoadingBox'
import { useGetLogsHistogramQuery } from '@graph/hooks'
import { SeverityText } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { FORMAT } from '@pages/LogsPage/constants'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import { useMemo } from 'react'

import * as styles from './LogsHistogram.css'

const LogsHistogram = ({
	query,
	startDate,
	endDate,
}: {
	query: string
	startDate: Date
	endDate: Date
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

		if (!data?.logs_histogram) {
			return null
		}

		const { totalCount, buckets } = data.logs_histogram

		const bucketData = new Map<
			number,
			{
				severityText: string
				count: number
			}[]
		>()

		buckets.forEach((bucket) => {
			const { bucketId, counts } = bucket
			bucketData.set(Number(bucketId), counts)
		})

		return [...Array(totalCount)].map((_, bucketId) => {
			const data = bucketData.get(bucketId)

			return (
				<Box
					key={bucketId}
					display="flex"
					flexDirection="column"
					justifyContent="flex-end"
					height="full"
					p="1"
					gap="1"
					style={{
						width: `${100 / totalCount}%`,
					}}
				>
					{data?.map((bar) => (
						<Box
							key={`${bucketId}-${bar.severityText}`}
							style={{
								height: `${
									(bar.count / maxBucketCount) * 100
								}%`,
								backgroundColor:
									severityToColor[
										bar.severityText as SeverityText
									],
							}}
							width="full"
							borderRadius="2"
						/>
					))}
				</Box>
			)
		})
	}, [data?.logs_histogram, loading, maxBucketCount])

	if (!maxBucketCount) {
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

const severityToColor = {
	[SeverityText.Trace]: colors.n4,
	[SeverityText.Debug]: colors.n6,
	[SeverityText.Info]: colors.n7,
	[SeverityText.Warn]: colors.n8,
	[SeverityText.Error]: colors.n10,
	[SeverityText.Fatal]: colors.n12,
}

export default LogsHistogram
