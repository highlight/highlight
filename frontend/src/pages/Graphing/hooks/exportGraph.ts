import { useCallback, useState } from 'react'
import moment from 'moment'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useGetMetricsLazyQuery } from '@/graph/generated/hooks'
import {
	MetricAggregator,
	MetricExpression,
	ProductType,
} from '@/graph/generated/schemas'
import { exportGraphDataAsCSV } from '@/util/session/csvExport'
import {
	getSeriesName,
	GROUPS_KEY,
	matchParamVariables,
	replaceQueryVariables,
	TIMESTAMP_KEY,
	transformMetricsToGraphData,
} from '../components/Graph'
import { NO_LIMIT, TIME_METRICS } from '../constants'

interface GraphSeries {
	aggregator: string
	column: string
	groups: string[]
}

interface GraphValue {
	series: GraphSeries
	value: number | null
}

interface GraphData {
	[k: string]: number | string[] | GraphValue
}

export const exportGraph = async (
	graphID: string,
	graphTitle: string,
	data: GraphData[],
) => {
	await exportGraphDataAsCSV(
		graphID,
		graphTitle,
		data,
		getSeriesName,
		TIME_METRICS,
	)
}

export interface UseExportGraphCSVParams {
	graphId: string
	graphTitle: string
	productType: ProductType
	projectId: string
	startDate: Date
	endDate: Date
	query: string
	sql?: string
	groupByKeys?: string[]
	bucketByKey?: string
	bucketByWindow?: number
	bucketCount?: number
	limit?: number
	limitFunctionType?: MetricAggregator
	limitMetric?: string
	expressions: MetricExpression[]
	variables?: Map<string, string[]>
}

/**
 * Hook for exporting graph data to CSV with full (unlimited) results.
 * This refetches the data with NO_LIMIT to get all groups, not just the UI-limited 100.
 */
export const useExportGraphCSV = ({
	graphId,
	graphTitle,
	productType,
	projectId,
	startDate,
	endDate,
	query,
	sql,
	groupByKeys,
	bucketByKey,
	bucketByWindow,
	bucketCount,
	limitFunctionType,
	limitMetric,
	expressions,
	variables,
}: UseExportGraphCSVParams) => {
	const [loading, setLoading] = useState(false)
	const [getMetrics] = useGetMetricsLazyQuery()

	const exportCSV = useCallback(async () => {
		setLoading(true)

		try {
			const useLongerRounding =
				moment(endDate).diff(startDate, 'hours') >= 4
			const overage = useLongerRounding
				? moment(startDate).minute() % 5
				: 0
			const start = moment(startDate)
				.startOf('minute')
				.subtract(overage, 'minute')
			const end = moment(endDate)
				.startOf('minute')
				.subtract(overage, 'minute')

			const getMetricsVariables = {
				product_type: productType,
				project_id: projectId,
				params: {
					date_range: {
						start_date: start.format(TIME_FORMAT),
						end_date: end.format(TIME_FORMAT),
					},
					query: replaceQueryVariables(query, variables),
				},
				sql,
				group_by:
					groupByKeys !== undefined
						? matchParamVariables(groupByKeys, variables)
						: [],
				bucket_by:
					bucketByKey !== undefined
						? (matchParamVariables(bucketByKey, variables).at(0) ??
							'')
						: TIMESTAMP_KEY,
				bucket_window:
					bucketByKey !== undefined ? bucketByWindow : undefined,
				bucket_count: bucketByKey !== undefined ? bucketCount : 1,
				// Use NO_LIMIT to get all groups for CSV export
				limit: NO_LIMIT,
				limit_aggregator: limitFunctionType,
				limit_column: limitMetric
					? matchParamVariables(limitMetric, variables).at(0)
					: undefined,
				expressions: expressions.map((e) => ({ ...e })),
			}

			const result = await getMetrics({
				fetchPolicy: 'network-only',
				variables: getMetricsVariables,
			})

			if (result.data) {
				// Determine xAxisMetric based on query configuration
				let xAxisMetric = GROUPS_KEY
				if (sql) {
					const isBucketed =
						result.data.metrics?.buckets.find(
							(b) => b.bucket_value !== null,
						) !== undefined
					if (isBucketed) {
						xAxisMetric = TIMESTAMP_KEY
					}
				} else if (bucketByKey !== undefined) {
					xAxisMetric = bucketByKey
				}

				const graphData = transformMetricsToGraphData(
					result.data,
					xAxisMetric,
				)

				if (graphData) {
					await exportGraphDataAsCSV(
						graphId,
						graphTitle,
						graphData,
						getSeriesName,
						TIME_METRICS,
					)
				}
			}
		} finally {
			setLoading(false)
		}
	}, [
		endDate,
		startDate,
		productType,
		projectId,
		query,
		variables,
		sql,
		groupByKeys,
		bucketByKey,
		bucketByWindow,
		bucketCount,
		limitFunctionType,
		limitMetric,
		expressions,
		getMetrics,
		graphId,
		graphTitle,
	])

	return { exportCSV, loading }
}
