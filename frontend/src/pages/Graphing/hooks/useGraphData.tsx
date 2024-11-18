import { useRef, useCallback } from 'react'
import { GraphContext, GraphData } from '@pages/Graphing/context/GraphContext'
import {
	GetMetricsQueryResult,
	useGetMetricsBatchedLazyQuery,
} from '@/graph/generated/hooks'
import { Exact, MetricsInput } from '@/graph/generated/schemas'
import { QueryResult } from '@apollo/client'
import { GetMetricsBatchedQuery } from '@/graph/generated/operations'

const WAIT_TIME_MS = 20

export function useGraphData(): GraphContext {
	const graphData = useRef<GraphData>({})

	const requestQueue = useRef<MetricsInput[]>([])
	const requestPromise = useRef<
		Promise<
			QueryResult<
				GetMetricsBatchedQuery,
				Exact<{
					input: Array<MetricsInput> | MetricsInput
				}>
			>
		>
	>()

	const [getMetricsBatched] = useGetMetricsBatchedLazyQuery()

	const getMetrics: (
		input: MetricsInput,
	) => Promise<GetMetricsQueryResult['data']> = useCallback(
		(input: MetricsInput) => {
			const idx = requestQueue.current.length
			const isFirst = idx === 0
			requestQueue.current.push(input)

			if (isFirst) {
				requestPromise.current = new Promise((resolve) =>
					setTimeout(() => {
						const input = {
							variables: { input: [...requestQueue.current] },
						}

						requestQueue.current = []

						getMetricsBatched(input).then((r) => {
							resolve(r)
						})
					}, WAIT_TIME_MS),
				)
			}

			return new Promise((resolve) => {
				requestPromise.current?.then((r) => {
					resolve({
						metrics: r.data!.metrics_batched[idx],
					})
				})
			})
		},
		[getMetricsBatched],
	)

	return {
		graphData,
		setGraphData: (
			graph?: GraphData | ((graph: GraphData) => GraphData),
		) => {
			if (typeof graph === 'function') {
				graphData.current = graph(graphData.current)
			} else if (graph) {
				graphData.current = graph
			}
		},
		getMetrics,
	}
}
