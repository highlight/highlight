import { useRef, useState } from 'react'
import { GraphContext, GraphData } from '@pages/Graphing/context/GraphContext'

export function useGraphData(): GraphContext {
	const graphData = useRef<GraphData>({})
	const [errors, setErrors] = useState<string[]>([])
	const [queryStartTime, setQueryStartTime] = useState<Date | undefined>()

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
		errors,
		setErrors,
		queryStartTime,
		setQueryStartTime,
	}
}
