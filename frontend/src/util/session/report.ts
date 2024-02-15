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
	query: ClickhouseQuery,
	sessions: Session[],
) => {
	const rules = query.rules.filter(
		(rule: any) => (rule[1] as Operator) !== 'between_date',
	)
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

type SessionWithUpdatedAt = Session & { payload_updated_at: string }

export const useGenerateSessionsReportCSV = () => {
	const PAGE_SIZE = 1_000
	const { searchQuery, startDate, endDate } = useSearchContext()
	const { projectId } = useProjectId()
	const [getReport, { loading }] = useGetSessionsReportLazyQuery()
	const [, { loading: sessionsLoading, fetchMore }] =
		useGetSessionsClickhouseLazyQuery()

	return {
		loading: loading || sessionsLoading,
		generateSessionsReportCSV: async () => {
			const query = JSON.parse(searchQuery) as ClickhouseQuery

			const getSessionReport = async () => {
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
			}

			const getSessions = async (page: number) => {
				const { data, error } = await fetchMore({
					variables: {
						query,
						count: PAGE_SIZE,
						page,
						project_id: projectId,
						sort_desc: true,
					},
				})
				if (!data?.sessions_clickhouse) {
					console.error(`No sessions data: ${error?.message}`)
					return {
						totalCount: 0,
						sessions: [],
					}
				}
				return {
					totalCount: data.sessions_clickhouse.totalCount ?? 0,
					sessions: data.sessions_clickhouse.sessions.map((s) => ({
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
			const results = await Promise.all(promises)
			sessions.push(...results.map((r) => r.sessions).flat())

			const rows: any[][] = [
				...getQueryRows(startDate, endDate, query, sessions),
				// leave a blank row between the sub reports
				[],
				...getReportRows(await sessionReportPromise),
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
