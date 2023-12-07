import {
	useGetSessionsClickhouseLazyQuery,
	useGetSessionsReportLazyQuery,
} from '@graph/hooks'
import { ClickhouseQuery, Session, SessionsReportRow } from '@graph/schemas'
import { useProjectId } from '@hooks/useProjectId'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'

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
	const { searchQuery } = useSearchContext()
	const { projectId } = useProjectId()
	const [getReport, { loading }] = useGetSessionsReportLazyQuery()
	const [getSessionsClickhouse, { loading: sessionsLoading }] =
		useGetSessionsClickhouseLazyQuery()
	return {
		loading: loading || sessionsLoading,
		generateSessionsReportCSV: async () => {
			const query = JSON.parse(searchQuery) as ClickhouseQuery
			const [sessions, sessionsReport] = await Promise.all([
				(async () => {
					const { data, error } = await getSessionsClickhouse({
						variables: {
							query,
							count: 1_000_000_000,
							page: 1,
							project_id: projectId,
							sort_desc: true,
						},
					})
					if (!data?.sessions_clickhouse) {
						throw new Error(`No sessions data: ${error?.message}`)
					}
					return data.sessions_clickhouse.sessions.map((s) => ({
						...s,
						payload_updated_at: new Date().toISOString(),
					}))
				})(),
				(async () => {
					const { data, error } = await getReport({
						variables: {
							query,
							project_id: projectId,
						},
					})
					if (!data?.sessions_report) {
						throw new Error(
							`No sessions report data: ${error?.message}`,
						)
					}
					return data.sessions_report
				})(),
			])

			const rows = [
				...getQueryRows(query, sessions),
				...getReportRows(sessionsReport),
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
