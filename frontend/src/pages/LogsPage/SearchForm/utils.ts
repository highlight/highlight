import { LogLevel, LogSource, ReservedLogKey, Session } from '@graph/schemas'
import moment from 'moment'
import { stringify } from 'query-string'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'

export type LogsSearchParam = {
	key: string
	operator: string
	value: string
	offsetStart: number
}

const SEPARATOR = ':'
export const DEFAULT_LOGS_OPERATOR = '='
export const BODY_KEY = 'body'

// Inspired by search-query-parser:
// https://github.com/nepsilon/search-query-parser/blob/8158d09c70b66168440e93ffabd720f4c8314c9b/lib/search-query-parser.js#L40
const PARSE_REGEX =
	/(\S+:'(?:[^'\\]|\\.)*')|(\S+:"(?:[^"\\]|\\.)*")|(-?"(?:[^"\\]|\\.)*")|(-?'(?:[^'\\]|\\.)*')|\S+|\S+:\S+|\s$/g

export const parseLogsQuery = (query = ''): LogsSearchParam[] => {
	if (query.indexOf(SEPARATOR) === -1) {
		return [
			{
				key: BODY_KEY,
				operator: DEFAULT_LOGS_OPERATOR,
				value: query,
				offsetStart: 0,
			},
		]
	}

	const terms = []
	let match

	while ((match = PARSE_REGEX.exec(query)) !== null) {
		const term = match[0]
		const termIsQuotedString = term.startsWith('"') || term.startsWith("'")

		if (!termIsQuotedString && term.indexOf(SEPARATOR) > -1) {
			const [key, ...rest] = term.split(SEPARATOR)
			const value = rest.join(SEPARATOR)

			terms.push({
				key,
				value,
				operator: DEFAULT_LOGS_OPERATOR,
				offsetStart: match.index,
			})
		} else {
			const textTermIndex = terms.findIndex(
				(term) => term.key === BODY_KEY,
			)

			if (textTermIndex !== -1) {
				terms[textTermIndex].value +=
					terms[textTermIndex].value.length > 0 ? ` ${term}` : term
			} else {
				const isEmptyString = term.trim() === ''

				terms.push({
					key: BODY_KEY,
					operator: DEFAULT_LOGS_OPERATOR,
					value: isEmptyString ? '' : term,
					offsetStart: isEmptyString ? match.index + 1 : match.index,
				})
			}
		}
	}

	return terms
}

export const stringifyLogsQuery = (params: LogsSearchParam[]) => {
	const querySegments: string[] = []

	params.forEach(({ key, value }) => {
		if (key === BODY_KEY) {
			querySegments.push(value)
		} else {
			querySegments.push(`${key}:${value}`)
		}
	})

	return querySegments.join(' ')
}

// Same as the method above, but only used for building a query string to send
// to the server which requires that all strings are wrapped in double quotes.
export const buildLogsQueryForServer = (params: LogsSearchParam[]) => {
	const querySegments: string[] = []

	params.forEach(({ key, value }) => {
		value = value.trim()

		if (value.startsWith("'") && value.endsWith("'")) {
			value = `"${value.slice(1, -1)}"`
		}

		if (key === BODY_KEY) {
			querySegments.push(value)
		} else {
			querySegments.push(`${key}:${value}`)
		}
	})

	return querySegments.join(' ')
}

export const validateLogsQuery = (params: LogsSearchParam[]): boolean => {
	return !params.some((param) => !param.value)
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
	const queryParams: LogsSearchParam[] = []
	let offsetStart = 1

	if (session?.secure_id) {
		queryParams.push({
			key: ReservedLogKey.SecureSessionId,
			operator: DEFAULT_LOGS_OPERATOR,
			value: session.secure_id,
			offsetStart: offsetStart++,
		})
	}

	levels.forEach((level) => {
		queryParams.push({
			key: ReservedLogKey.Level,
			operator: DEFAULT_LOGS_OPERATOR,
			value: level,
			offsetStart: offsetStart++,
		})
	})

	sources.forEach((source) => {
		queryParams.push({
			key: ReservedLogKey.Source,
			operator: DEFAULT_LOGS_OPERATOR,
			value: source,
			offsetStart: offsetStart++,
		})
	})

	return {
		query: stringifyLogsQuery(queryParams),
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

export const quoteQueryValue = (value: string | number) => {
	if (typeof value !== 'string') {
		return String(value)
	}

	if (value.startsWith('"') || value.startsWith("'")) {
		return value
	}

	if (value.indexOf(' ') > -1) {
		return `"${value}"`
	}

	return value
}
