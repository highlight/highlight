import {
	useGetSessionsClickhouseLazyQuery,
	useGetSessionsReportLazyQuery,
} from '@graph/hooks'
import { ClickhouseQuery, Session, SessionsReportRow } from '@graph/schemas'
import { useProjectId } from '@hooks/useProjectId'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'

const getQueryRows = (query: ClickhouseQuery, sessions: Session[]) => [
	[
		'Number of Sessions',
		'',
		...query.rules.map((_, index) => `Filter #${index + 1}`),
	],
	[
		sessions.length,
		'Filter',
		...query.rules.map((rule) => rule[0].split('_', 1)[1]),
	],
	['', 'Operator', ...query.rules.map((rule) => rule[1])],
	['', 'Value', ...query.rules.map((rule) => rule[2])],
]

const getReportRows = (sessionsReportRows: SessionsReportRow[]) => {
	// assume that all report rows have the same keys
	const keys = Object.keys(sessionsReportRows[0])
		.filter((key) => key !== '__typename')
		.map((key) => `${key[0].toUpperCase()}${key.slice(1)}`)
	return [
		keys,
		...sessionsReportRows.map((report: SessionsReportRow) => {
			return keys.map((key) => report[key as keyof SessionsReportRow])
		}),
	]
}

const getSessionRows = (sessions: Session[]) => {
	const rows: any[] = []
	if (!sessions.length) {
		return rows
	}
	const sessionKeys = {} as {
		[key in keyof Session]: number
	}
	for (const session of sessions) {
		let data = session
		try {
			data = { ...data, ...JSON.parse(session.user_properties ?? '') }
		} catch (e) {}
		delete data.user_properties
		delete data.__typename
		Object.keys(data).forEach((key, idx) => {
			if (!sessionKeys.hasOwnProperty(key)) {
				sessionKeys[key as keyof Session] = idx
			}
		})
	}
	rows.push([
		...Object.keys(sessionKeys).map(
			(key) => `${key[0].toUpperCase()}${key.slice(1)}`,
		),
	])

	for (const session of sessions) {
		let data = session
		try {
			data = { ...data, ...JSON.parse(session.user_properties ?? '') }
		} catch (e) {}
		rows.push(
			Object.entries(sessionKeys)
				.sort(([, idx1], [_, idx2]) => idx1 - idx2)
				.map(([k]) => data[k as keyof Session]),
		)
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
							count: 1_000_000,
							page: 1,
							project_id: projectId,
							sort_desc: true,
						},
					})
					if (!data?.sessions_clickhouse) {
						throw new Error(`No sessions data: ${error?.message}`)
					}
					if (data?.sessions_clickhouse.totalCount >= 1_000_000) {
						throw new Error(
							'Too many sessions to export. Please narrow your search.',
						)
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

			const rows: any[][] = [
				...getQueryRows(query, sessions),
				// leave a blank row between the sub reports
				[],
				...getReportRows(sessionsReport),
				// leave a blank row between the sub reports
				[],
				...getSessionRows(sessions),
			]

			let csvContent = 'data:text/csv;charset=utf-8,'
			rows.forEach((rowArray) => {
				const row = rowArray
					.map((col) =>
						col ? col.toString().replaceAll(',', '|') : '',
					)
					.join(',')
				csvContent += row + '\r\n'
			})
			await exportFile('sessions_results.csv', encodeURI(csvContent))
		},
	}
}
