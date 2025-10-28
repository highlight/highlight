import { exportGraphDataAsCSV } from '@/util/session/csvExport'
import { getSeriesName } from '../components/Graph'
import { TIME_METRICS } from '../constants'

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
