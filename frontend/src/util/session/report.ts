import { Operator } from '@components/QueryBuilder/QueryBuilder'
import {
	useGetSessionsClickhouseLazyQuery,
	useGetSessionsReportLazyQuery,
} from '@graph/hooks'
import {
	ClickhouseQuery,
	Maybe,
	Session,
	SessionsReportRow,
} from '@graph/schemas'
import { useProjectId } from '@hooks/useProjectId'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import moment from 'moment/moment'

const processRows = <
	T extends { __typename?: string; user_properties?: Maybe<string> },
>(
	inputs: T[],
	ignoreKeys: Set<keyof T> = new Set<keyof T>([]),
) => {
	const rows: any[][] = []
	if (!inputs.length) {
		return rows
	}
	const keys = {} as {
		[key in keyof T]: number
	}
	for (let input of inputs) {
		try {
			input = { ...input, ...JSON.parse(input.user_properties ?? '') }
		} catch (e) {}
		delete input.user_properties
		delete input.__typename
		Object.keys(input).forEach((key, idx) => {
			if (!keys.hasOwnProperty(key)) {
				keys[key as keyof T] = idx
			}
		})
	}
	rows.push([
		...Object.keys(keys).filter((k) => !ignoreKeys.has(k as keyof T)),
	])

	for (const session of inputs) {
		let data = session
		try {
			data = { ...data, ...JSON.parse(session.user_properties ?? '') }
		} catch (e) {}
		rows.push(
			Object.entries(keys)
				.filter(([k]) => !ignoreKeys.has(k as keyof T))
				.sort(([, idx1], [_, idx2]) => idx1 - idx2)
				.map(([k]) => data[k as keyof T]),
		)
	}
	return rows
}

const getQueryRows = (query: ClickhouseQuery, sessions: Session[]) => {
	const timeRule = query.rules.find(
		(rule) => (rule[1] as Operator) === 'between_date',
	)!
	const rules = query.rules.filter(
		(rule: any) => (rule[1] as Operator) !== 'between_date',
	)
	const [start, end] = timeRule[2].split('_')
	const startFormatted = moment(start).format()
	const endFormatted = moment(end).format()
	return [
		[
			'Number of Sessions',
			'Time From',
			'Time To',
			'',
			'',
			...rules.map((_, index) => `Filter ${index + 1}`),
		],
		[
			sessions.length,
			startFormatted,
			endFormatted,
			'',
			'Filter',
			...rules.map((rule) => rule[0].split('_', 2)[1]),
		],
		['', '', '', '', 'Operator', ...rules.map((rule) => rule[1])],
		['', '', '', '', 'Value', ...rules.map((rule) => rule[2])],
	]
}

const getReportRows = (sessionsReportRows: SessionsReportRow[]) => {
	return processRows(sessionsReportRows)
}

const getSessionRows = (sessions: Session[]) => {
	return processRows(sessions, new Set<keyof Session>(['id', 'event_counts']))
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
						col ? col.toString().replaceAll(/[,;\t]/gi, '|') : '',
					)
					.join(',')
				csvContent += row + '\r\n'
			})
			await exportFile('sessions_results.csv', encodeURI(csvContent))
		},
	}
}
