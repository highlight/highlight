import moment from 'moment'
import { stringify } from 'query-string'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { DEFAULT_OPERATOR } from '@/components/Search/SearchForm/utils'
import {
	LogLevel,
	LogSource,
	ReservedLogKey,
	Session,
} from '@/graph/generated/schemas'

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
	levels,
	sources,
}: {
	session: Session | undefined
	levels: LogLevel[]
	sources: LogSource[]
}) => {
	let query = ''

	if (session?.secure_id) {
		query += `${ReservedLogKey.SecureSessionId}${DEFAULT_OPERATOR}${session.secure_id}`
	}

	if (levels.length) {
		query += ` ${ReservedLogKey.Level}${DEFAULT_OPERATOR}(${levels.join(
			' OR ',
		)})`
	}
	if (sources.length) {
		query += ` ${ReservedLogKey.Source}${DEFAULT_OPERATOR}(${sources.join(
			' OR ',
		)})`
	}

	return {
		query: query.trim(),
		date_range: {
			start_date: moment(session?.created_at),
			end_date: moment(session?.created_at).add(4, 'hours'),
		},
	}
}

export const getLogsURLForSession = ({
	projectId,
	session,
	levels,
	sources,
}: {
	projectId: string
	session: Session
	levels: LogLevel[]
	sources: LogSource[]
}) => {
	const params = buildSessionParams({ session, levels, sources })

	const encodedQuery = encodeQueryParams(
		{
			query: StringParam,
			start_date: DateTimeParam,
			end_date: DateTimeParam,
		},
		{
			query: params.query,
			start_date: params.date_range.start_date.toDate(),
			end_date: params.date_range.end_date.toDate(),
		},
	)
	return `/${projectId}/logs?${stringify(encodedQuery)}`
}
