import { exportFile, processRows } from '@util/session/report'

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
						.map((col) =>
							col
								? col.toString().replaceAll(/[,;\t]/gi, '|')
								: '',
						)
						.join(','),
				)
				.join('\r\n')
			console.info(
				`exporting graph ${graphID} from dashboard ${dashboardID} with ${rows.length} rows, ${csvContent.length} long string.`,
				{ dashboardID, graphID, rows },
			)
			await exportFile(`graph_${dashboardID}_${graphID}.csv`, csvContent)
		},
	}
}
