import { GetErrorGroupQuery } from '@graph/operations'
import { MetricAggregator, ProductType } from '@graph/schemas'
import {
	Box,
	DateRangePicker,
	EXTENDED_TIME_PRESETS,
	Heading,
	IconSolidTrendingUp,
	presetStartDate,
	Text,
} from '@highlight-run/ui/components'
import { ErrorDistributions } from '@pages/ErrorsV2/ErrorMetrics/ErrorDistributions'
import React, { useMemo } from 'react'
import Graph from '@/pages/Graphing/components/Graph'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { GraphContextProvider } from '@/pages/Graphing/context/GraphContext'
import { useGraphTime } from '@/pages/Graphing/hooks/useGraphTime'

import styles from './ErrorMetrics.module.css'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

const NUM_BUCKETS_TIMELINE = 30

const GRAPH_ID = 'errorFrequencyChart'

const ErrorMetrics: React.FC<Props> = ({ errorGroup }) => {
	const graphContext = useGraphData()
	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useGraphTime(EXTENDED_TIME_PRESETS)

	const totalCount = useMemo(() => {
		const data = graphContext.graphData.current?.[GRAPH_ID] || []

		return data.reduce((acc, curr) => {
			const seriesValue = Object.values(curr).find(
				(value) => typeof value === 'object',
			) as any

			if (!seriesValue || !seriesValue.value) {
				return acc
			}

			return acc + seriesValue.value
		}, 0)
	}, [graphContext])

	return (
		<Box>
			<Box mt="20" mb="32" display="flex" justifyContent="space-between">
				<Heading level="h3">Metrics</Heading>
				<div className={styles.timePickerContainer}>
					<DateRangePicker
						selectedValue={{
							startDate: startDate,
							endDate: endDate,
							selectedPreset: selectedPreset,
						}}
						onDatesChange={updateSearchTime}
						presets={EXTENDED_TIME_PRESETS}
						minDate={presetStartDate(EXTENDED_TIME_PRESETS[6])}
						kind="secondary"
						size="medium"
						emphasis="low"
					/>
				</div>
			</Box>

			<Box mb="24" display="flex" gap="28" alignItems="flex-start">
				<Box
					cssClass={styles.metricsDistributionContainer}
					style={{ width: '50%' }}
				>
					<GraphContextProvider value={graphContext}>
						<ErrorMetricsGraph
							projectId={String(errorGroup!.project_id)}
							secureId={errorGroup!.secure_id}
							startDate={startDate}
							endDate={endDate}
							updateSearchTime={updateSearchTime}
						/>
					</GraphContextProvider>
				</Box>

				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					style={{ width: '50%' }}
				>
					<span className={styles.titleContainer}>
						<span className={styles.iconContainer}>
							<IconSolidTrendingUp color="#6b48c7" />
						</span>
						<Text weight="bold">Total occurrences</Text>
					</span>
					<Text>{totalCount}</Text>
				</Box>
			</Box>

			<Box borderBottom="secondary" pb="16">
				<Heading level="h4">Distributions</Heading>
			</Box>
			<ErrorDistributions errorGroup={errorGroup} />
		</Box>
	)
}

type ErrorMetricsGraphProps = {
	projectId: string
	secureId: string
	startDate: Date
	endDate: Date
	updateSearchTime: (startDate: Date, endDate: Date) => void
}

const ErrorMetricsGraph = React.memo(
	({
		projectId,
		secureId,
		startDate,
		endDate,
		updateSearchTime,
	}: ErrorMetricsGraphProps) => (
		<Graph
			id={GRAPH_ID}
			viewConfig={{
				type: 'Bar chart',
				showLegend: false,
			}}
			productType={ProductType.Errors}
			projectId={projectId}
			startDate={startDate}
			endDate={endDate}
			query={`secure_id=${secureId}`}
			setTimeRange={updateSearchTime}
			bucketByKey="Timestamp"
			bucketCount={NUM_BUCKETS_TIMELINE}
			expressions={[{ aggregator: MetricAggregator.Count, column: '' }]}
			height={200}
			hideTitle
		/>
	),
)

export default ErrorMetrics
