import { getSeriesName } from '@/pages/Graphing/components/Graph'
import { TIME_METRICS } from '@/pages/Graphing/constants'
import { exportFile } from '@util/session/report'
import moment from 'moment'

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

export const exportGraph = async (
	graphID: string,
	graphTitle: string,
	data: GraphData[],
) => {
	const ignoreKeys = new Set(['BucketMin', 'BucketMax', 'Percent', 'Query'])

	const rows: any[][] = []
	if (data.length) {
		const keys = {} as {
			[key in string]: GraphKey
		}

		for (const input of data) {
			Object.entries(input).forEach(([key, value], idx) => {
				if (ignoreKeys.has(key)) {
					return
				}

				if (!key.length) {
					key = 'Value'
				}
				if (!keys.hasOwnProperty(key)) {
					if (typeof value === 'number' || Array.isArray(value)) {
						keys[key] = { name: key, index: -1 } // -1 index so this grouping / bucketing column is first
					} else {
						const metric = value.series.column
						let suffix = ''
						if (metric && Object.hasOwn(TIME_METRICS, metric)) {
							suffix = ` (${TIME_METRICS[metric as keyof typeof TIME_METRICS]})`
						}
						keys[key] = {
							name:
								getSeriesName(
									value.series,
									true,
									value.series.groups.length > 0,
								) + suffix,
							index: idx,
						}
					}
				}
			})
		}

		const sortedKeys = Object.entries(keys).sort(
			([, key1], [_, key2]) => key1.index - key2.index,
		)

		rows.push(sortedKeys.map(([_, v]) => v.name))

		for (const input of data) {
			const row: any[] = []
			for (const [k] of sortedKeys) {
				const value = Object.hasOwn(input, k) ? input[k] : null
				if (value === null || typeof value === 'number') {
					row.push(value)
				} else if (Array.isArray(value)) {
					row.push(value.join(', '))
				} else {
					row.push(value.value)
				}
			}
			rows.push(row)
		}
	}

	const csvContent = rows
		.map((rowArray) =>
			rowArray
				.map((col) => {
					const m = moment(Number(col), 'X', true)
					return col
						? m.isAfter(moment().subtract(10, 'year'))
							? m.format('MM/DD/YYYY HH:mm:ss')
							: col.toString().replaceAll(/[,;\t]/gi, '|')
						: ''
				})
				.join(','),
		)
		.join('\r\n')
	console.info(
		`exporting graph with ${rows.length} rows, ${csvContent.length} long string.`,
		{ graphID, graphTitle, rows },
	)
	await exportFile(`graph_${graphID} ${graphTitle}.csv`, csvContent)
}
