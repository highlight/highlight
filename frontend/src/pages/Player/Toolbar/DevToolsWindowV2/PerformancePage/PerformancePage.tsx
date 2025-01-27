import LoadingBox from '@components/LoadingBox'
import { Box, Text } from '@highlight-run/ui/components'
import { TIMESTAMP_KEY, useGraphData } from '@pages/Graphing/components/Graph'
import { LineChart } from '@pages/Graphing/components/LineChart'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import React from 'react'

import * as styles from './style.css'
import { TIME_FORMAT } from '@components/Search/SearchForm/constants'
import { useParams } from '@util/react-router/useParams'
import { useGetMetricsQuery } from '@/graph/generated/hooks'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import moment from 'moment'

type Props = {}

const PerformancePage = React.memo(({}: Props) => {
	const { session, sessionMetadata } = useReplayerContext()
	const { project_id } = useParams<{ project_id: string }>()

	const start = moment(sessionMetadata.startTime)
	const end = moment(sessionMetadata.endTime)
	const { data: metricsData, loading: isLoading } = useGetMetricsQuery({
		variables: {
			product_type: ProductType.Metrics,
			project_id: project_id!,
			params: {
				date_range: {
					start_date: start.format(TIME_FORMAT),
					end_date: end.format(TIME_FORMAT),
				},
				query: `secure_session_id=${session?.secure_id} AND (metric_name=Jank OR metric_name=usedJSHeapSize OR metric_name=fps)`,
			},
			group_by: ['metric_name'],
			bucket_by: TIMESTAMP_KEY,
			bucket_count: 60,
			limit: 1_000,
			expressions: [
				{ aggregator: MetricAggregator.Avg, column: 'value' },
			],
		},
	})

	const data = useGraphData(metricsData, TIMESTAMP_KEY) ?? []

	const hasNoPerformancePayloads = metricsData?.metrics?.buckets?.length === 0

	console.log('vadim', { metricsData, data })
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
			{!isLoading && !hasNoPerformancePayloads ? (
				<Box width="full" height="full" p="16">
					<LineChart
						data={data}
						xAxisMetric={TIMESTAMP_KEY}
						viewConfig={{
							type: 'Line chart',
							display: 'Line',
							showLegend: true,
							nullHandling: 'Connected',
						}}
					/>
				</Box>
			) : null}
		</div>
	)
})

export default PerformancePage
