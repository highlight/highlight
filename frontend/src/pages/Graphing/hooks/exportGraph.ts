import { exportFile, processRows } from '@util/session/report'
import moment from 'moment'

export const exportGraph = async (
	graphID: string,
	graphTitle: string,
	functionType: string,
	metric: string,
	data: any[],
) => {
	const rows = processRows(data, new Set(['BucketMin', 'BucketMax']), metric)
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
		{ graphID, graphTitle, functionType, metric, rows },
	)
	await exportFile(`graph_${graphID} ${graphTitle}.csv`, csvContent)
}
