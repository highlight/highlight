import moment from 'moment'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { DEFAULT_OPERATOR } from '@/components/Search/SearchForm/utils'
import { ReservedLogKey, Session } from '@/graph/generated/schemas'
import { exportFile, processRows } from '@util/session/report'
import { LogEdgeWithResources } from '@pages/LogsPage/useGetLogs'

export const formatDate = (date: Date) => {
	return moment(date).format('M/D/YY h:mm:ss A')
}

export const isSignificantDateRange = (startDate: Date, endDate: Date) => {
	return (
		moment(startDate).format(TIME_FORMAT) !==
		moment(endDate).format(TIME_FORMAT)
	)
}

export const buildSessionParams = ({
	session,
	query,
}: {
	session: Session | undefined
	query: string
}) => {
	let searchQuery = query

	if (session?.secure_id) {
		searchQuery += ` ${ReservedLogKey.SecureSessionId}${DEFAULT_OPERATOR}${session.secure_id}`
	}

	return {
		query: searchQuery.trim(),
		date_range: {
			start_date: moment(session?.created_at).subtract(5, 'minutes'),
			end_date: moment(session?.created_at)
				.add(session?.length, 'milliseconds')
				.add(5, 'minutes'),
		},
	}
}

export const exportLogs = async (edges: LogEdgeWithResources[]) => {
	const csvContent = processRows(
		edges.map((e) => {
			const { logAttributes, ...rest } = e.node
			return { ...rest, ...logAttributes }
		}),
	)
		.map((rowArray) =>
			rowArray
				.map((col) => {
					const m = moment(Number(col), 'X', true)
					return col
						? m.isAfter(moment().subtract(10, 'year'))
							? m.format('MM/DD/YYYY HH:mm:ss')
							: col
									.toString()
									.replaceAll(/[,;\t]/gi, '|')
									.replaceAll(/\s+/gi, ' ')
						: ''
				})
				.join(','),
		)
		.join('\r\n')

	await exportFile(`logs.csv`, csvContent)
}
