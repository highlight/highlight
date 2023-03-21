import { ReservedLogKey, Session } from '@graph/schemas'
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

		if (term.indexOf(SEPARATOR) > -1) {
			const [key, value] = term.split(SEPARATOR)

			terms.push({
				key,
				operator: DEFAULT_LOGS_OPERATOR,
				value: value?.replace(/^\"|\"$|^\'|\'$/g, ''), // strip quotes
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
				const isEmptyString = term === ' '

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

	params.forEach((param) => {
		if (param.key === BODY_KEY) {
			querySegments.push(param.value)
		} else {
			const value =
				param.value.indexOf(' ') > -1 ? `"${param.value}"` : param.value
			querySegments.push(`${param.key}:${value}`)
		}
	})

	return querySegments.join(' ')
}

export const validateLogsQuery = (params: LogsSearchParam[]): boolean => {
	return !params.some((param) => !param.value)
}

export const getLogsURLForSession = (projectId: string, session: Session) => {
	const queryParams: LogsSearchParam[] = []
	queryParams.push({
		key: ReservedLogKey.SecureSessionId,
		operator: DEFAULT_LOGS_OPERATOR,
		value: session.secure_id,
		offsetStart: 0,
	})

	const sessionStartDate = new Date(session.created_at)
	const sessionEndDate = new Date()

	const encodedQuery = encodeQueryParams(
		{
			query: StringParam,
			start_date: DateTimeParam,
			end_date: DateTimeParam,
		},
		{
			query: stringifyLogsQuery(queryParams),
			start_date: sessionStartDate,
			end_date: sessionEndDate,
		},
	)
	return `/${projectId}/logs?${stringify(encodedQuery)}`
}
