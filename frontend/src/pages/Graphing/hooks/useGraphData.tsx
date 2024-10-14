import { useState } from 'react'
import { GraphContext, GraphData } from '@pages/Graphing/context/GraphContext'

export function useGraphData(): GraphContext {
	const [graphData, setGraphData] = useState<GraphData>({})

	return {
		graphData,
		setGraphData,
	}
}
