import { exportFile } from '@util/session/report'
import moment from 'moment'

/**
 * Shared utility for exporting graph data to CSV format.
 * This consolidates the CSV generation logic used across different components.
 */

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

interface GraphKey {
	name: string
	index: number
}

/**
 * Export graph data as CSV file
 * @param graphId - Unique identifier for the graph
 * @param graphTitle - Display title for the graph
 * @param data - Array of graph data objects
 * @param getSeriesName - Optional function to format series names (used by exportGraph)
 * @param timeMetrics - Optional time metrics mapping (used by exportGraph)
 */
export const exportGraph = async (
	graphId: string,
	graphTitle: string,
	data: GraphData[],
	getSeriesName?: (
		series: GraphSeries,
		includeAggregator: boolean,
		hasGroups: boolean,
	) => string,
	timeMetrics?: { [key: string]: string },
) => {
	const ignoreKeys = new Set(['BucketMin', 'BucketMax', 'Percent', 'Query'])
	const rows: unknown[][] = []
	const timestampColumns = new Set<number>() // Track which column indices contain timestamps

	if (data.length) {
		const keys = {} as { [key in string]: GraphKey }

		for (const input of data) {
			Object.entries(input).forEach(([keyName, value], idx) => {
				if (ignoreKeys.has(keyName)) {
					return
				}

				let key = keyName
				if (!key.length) {
					key = 'Value'
				}
				if (!keys.hasOwnProperty(key)) {
					if (typeof value === 'number' || Array.isArray(value)) {
						keys[key] = { name: key, index: -1 } // -1 index so this grouping / bucketing column is first
					} else if (typeof value === 'object' && 'series' in value) {
						// Handle GraphValue objects (used by exportGraph)
						const metric = value.series.column
						let suffix = ''
						if (
							metric &&
							timeMetrics &&
							Object.hasOwn(timeMetrics, metric)
						) {
							suffix = ` (${timeMetrics[metric]})`
						}
						const seriesName = getSeriesName
							? getSeriesName(
									value.series,
									true,
									value.series.groups.length > 0,
								)
							: key
						keys[key] = {
							name: seriesName + suffix,
							index: idx,
						}
					} else {
						keys[key] = {
							name: key,
							index: idx,
						}
					}
				}
			})
		}

		const sortedKeys = Object.entries(keys).sort(
			([, key1], [_, key2]) => key1.index - key2.index,
		)

		// Identify timestamp columns by their key name
		sortedKeys.forEach(([keyName], columnIndex) => {
			const normalizedKey = keyName.toLowerCase()
			if (normalizedKey === 'timestamp' || normalizedKey === 'time') {
				timestampColumns.add(columnIndex)
			}
		})

		rows.push(sortedKeys.map(([_, v]) => v.name))

		for (const input of data) {
			const row: unknown[] = []
			for (const [k] of sortedKeys) {
				const value = Object.hasOwn(input, k) ? input[k] : null
				if (value === null || typeof value === 'number') {
					row.push(value)
				} else if (Array.isArray(value)) {
					row.push(value.join(', '))
				} else if (typeof value === 'object' && 'value' in value) {
					row.push(value.value)
				} else {
					row.push(value)
				}
			}
			rows.push(row)
		}
	}

	const csvContent = rows
		.map((rowArray, rowIndex) =>
			rowArray
				.map((col, colIndex) => {
					if (!col) {
						return ''
					}

					// Format timestamps only for identified timestamp columns (skip header row)
					if (rowIndex > 0 && timestampColumns.has(colIndex)) {
						const numValue = Number(col)
						if (!isNaN(numValue)) {
							// Assume Unix timestamp in seconds
							return moment(numValue, 'X').format(
								'MM/DD/YYYY HH:mm:ss',
							)
						}
					}

					return col
						.toString()
						.replaceAll(/[,;\t]/gi, '|')
						.replaceAll(/\s+/gi, ' ')
				})
				.join(','),
		)
		.join('\r\n')

	await exportFile(`graph_${graphId}_${graphTitle}.csv`, csvContent)
	return csvContent
}
