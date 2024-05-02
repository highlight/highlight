import { SearchExpression } from '@components/Search/Parser/listener'
import { useSearchContext } from '@components/Search/SearchContext'
import {
	useGetSessionsLazyQuery,
	useGetSessionUsersReportsLazyQuery,
} from '@graph/hooks'
import { Maybe, Session, SessionsReportRow } from '@graph/schemas'
import { useProjectId } from '@hooks/useProjectId'
import moment from 'moment/moment'

const processRows = <
	T extends { __typename?: Maybe<string>; user_properties?: Maybe<string> },
>(
	inputs: T[],
	ignoreKeys: Set<keyof T> = new Set<keyof T>([]),
) => {
	ignoreKeys.add('user_properties')
	ignoreKeys.add('__typename')

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

const getQueryRows = (
	start: Date,
	end: Date,
	queryParts: SearchExpression[],
	sessions: Session[],
) => {
	const startFormatted = moment(start).format()
	const endFormatted = moment(end).format()
	return [
		[
			'Number of Sessions',
			'Time From',
			'Time To',
			'',
			'',
			...queryParts.map((_, index) => `Filter ${index + 1}`),
		],
		[
			sessions.length,
			startFormatted,
			endFormatted,
			'',
			'Filter',
			...queryParts.map((part) => part.key),
		],
		[
			'',
			'',
			'',
			'',
			'Operator',
			...queryParts.map((part) => part.operator),
		],
		['', '', '', '', 'Value', ...queryParts.map((part) => part.value)],
	]
}

const getReportRows = (sessionsReportRows: SessionsReportRow[]) => {
	return processRows(sessionsReportRows)
}

const getSessionRows = (sessions: Session[]) => {
	return processRows(sessions, new Set<keyof Session>(['id', 'event_counts']))
}

const exportFile = async (name: string, content: string) => {
	const blob = new Blob([content], { type: 'text/csv' })
	const link = document.createElement('a')
	link.setAttribute('href', window.URL.createObjectURL(blob))
	link.setAttribute('download', name)
	document.body.appendChild(link) // Required for FF

	link.click() // This will download the data file named "my_data.csv".
}

type SessionWithUpdatedAt = Session & { payload_updated_at: string }

export const useGenerateSessionsReportCSV = () => {
	const PAGE_SIZE = 1_000
	const { query, queryParts, startDate, endDate } = useSearchContext()
	const { projectId } = useProjectId()
	const [getReport, { loading }] = useGetSessionUsersReportsLazyQuery()
	const [, { loading: sessionsLoading, fetchMore }] =
		useGetSessionsLazyQuery()

	return {
		loading: loading || sessionsLoading,
		generateSessionsReportCSV: async () => {
			const getSessionReport = async () => {
				const { data, error } = await getReport({
					variables: {
						params: {
							query,
							date_range: {
								start_date: startDate!.toISOString(),
								end_date: endDate!.toISOString(),
							},
						},
						project_id: projectId,
					},
				})
				if (!data?.session_users_report) {
					throw new Error(
						`No sessions report data: ${error?.message}`,
					)
				}
				return data.session_users_report
			}

			const getSessions = async (page: number) => {
				const { data, error } = await fetchMore({
					variables: {
						params: {
							query,
							date_range: {
								start_date: startDate,
								end_date: endDate,
							},
						},
						count: PAGE_SIZE,
						page,
						project_id: projectId,
						sort_desc: true,
					},
				})
				if (!data?.sessions) {
					console.error(`No sessions data: ${error?.message}`)
					return {
						totalCount: 0,
						sessions: [],
					}
				}
				return {
					totalCount: data.sessions.totalCount ?? 0,
					sessions: data.sessions.sessions.map((s) => ({
						...s,
						payload_updated_at: new Date().toISOString(),
					})),
				}
			}

			const sessionReportPromise = getSessionReport()
			const { sessions: s, totalCount } = await getSessions(1)

			const sessions = [...s]
			const promises: Promise<{
				totalCount: number
				sessions: SessionWithUpdatedAt[]
			}>[] = []
			for (
				let page = 2;
				page <= Math.ceil(totalCount / PAGE_SIZE);
				page++
			) {
				promises.push(getSessions(page))
			}
			const results = await Promise.allSettled(promises)
			sessions.push(
				...results
					.map((r) =>
						r.status === 'fulfilled' ? r.value.sessions : [],
					)
					.flat(),
			)

			const rows: any[][] = [
				...getQueryRows(startDate!, endDate!, queryParts, sessions),
				// leave a blank row between the sub reports
				[],
				...getReportRows(await sessionReportPromise),
				// leave a blank row between the sub reports
				[],
				...getSessionRows(sessions),
			]

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
				`collected sessions report with ${rows.length} rows, ${csvContent.length} long string.`,
			)
			await exportFile('sessions_results.csv', csvContent)
		},
	}
}
