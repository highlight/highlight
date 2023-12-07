import { useGetSessionsReportLazyQuery } from '@graph/hooks'
import { ClickhouseQuery, Session, SessionsReportRow } from '@graph/schemas'
import { useProjectId } from '@hooks/useProjectId'

const getQueryRows = (query: ClickhouseQuery, sessions: Session[]) => [
	['filters', 'num_results'],
	[query.rules.map((rule) => rule.join(':')).join('|'), sessions.length],
]

const getReportRows = (sessionsReportRows: SessionsReportRow[]) => {
	let userProperties: string[] = []
	try {
		userProperties = Object.keys(
			JSON.parse(sessionsReportRows[0].user_properties ?? ''),
		)
	} catch (e) {}
	return [
		['key', 'num_sessions', ...userProperties],
		...sessionsReportRows.map((report: SessionsReportRow) => {
			let rowUserProperties: any[] = []
			try {
				rowUserProperties = Object.values(
					JSON.parse(report.user_properties ?? ''),
				)
			} catch (e) {}
			return [report.key, report.num_sessions, ...rowUserProperties]
		}),
	]
}

const getSessionRows = (sessions: Session[]) => {
	const rows = []
	for (const session of sessions) {
		let userPropertyKeys: string[] = []
		let userPropertyValues: any[] = []
		try {
			const parsed = JSON.parse(session.user_properties ?? '')
			userPropertyKeys = Object.keys(parsed)
			userPropertyValues = Object.values(parsed)
		} catch (e) {}
		rows.push([
			'secure_id',
			'identifier',
			'active_length',
			...userPropertyKeys,
		])
		rows.push([
			session.secure_id,
			session.identifier,
			session.active_length,
			...userPropertyValues,
		])
	}
	return rows
}

const exportFile = async (name: string, encodedUri: string) => {
	const link = document.createElement('a')
	link.setAttribute('href', encodedUri)
	link.setAttribute('download', name)
	document.body.appendChild(link) // Required for FF

	link.click() // This will download the data file named "my_data.csv".
}

export const useGenerateSessionsReportCSV = () => {
	const { projectId } = useProjectId()
	const [getReport, { loading }] = useGetSessionsReportLazyQuery()
	return {
		loading,
		generateSessionsReportCSV: async (
			query: ClickhouseQuery,
			sessions: Session[],
		) => {
			const { data, error } = await getReport({
				variables: {
					project_id: projectId,
					query,
				},
			})
			if (!data?.sessions_report) {
				throw new Error(`No sessions report data: ${error?.message}`)
			}

			const rows = [
				...getQueryRows(query, sessions),
				...getReportRows(data.sessions_report),
				...getSessionRows(sessions),
			]

			let csvContent = 'data:text/csv;charset=utf-8,'
			rows.forEach(function (rowArray) {
				const row = rowArray.join(',')
				csvContent += row + '\r\n'
			})
			await exportFile('sessions_results.csv', encodeURI(csvContent))
		},
	}
}
