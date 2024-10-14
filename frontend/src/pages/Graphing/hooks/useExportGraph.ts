import { exportFile, processRows } from '@util/session/report'
import moment from 'moment'

export const useExportGraph = () => {
	return {
		exportGraph: async (
			dashboardID: string,
			graphID: string,
			data: any[],
		) => {
			const rows = processRows(data, new Set(['BucketMin', 'BucketMax']))
			const csvContent = rows
				.map((rowArray) =>
					rowArray
						.map((col) => {
							const m = moment(Number(col), 'X', true)
							return col
								? m.isAfter(moment().subtract(10, 'year'))
									? m.format('yyyy-MM-dd HH:mm:ss')
									: col.toString().replaceAll(/[,;\t]/gi, '|')
								: ''
						})
						.join(','),
				)
				.join('\r\n')
			console.info(
				`exporting graph with ${rows.length} rows, ${csvContent.length} long string.`,
				{ dashboardID, graphID, rows },
			)
			await exportFile(`graph_${dashboardID}_${graphID}.csv`, csvContent)
		},
	}
}
