import moment from 'moment'
import { stringify } from 'query-string'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'

import {
	AndOrExpression,
	SearchExpression,
} from '@/components/Search/Parser/listener'
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

const bodyKey = ReservedLogKey['Message']

export const findMatchingLogAttributes = (
	queryParts: Array<SearchExpression | AndOrExpression>,
	logAttributes: object | string,
	matchingAttributes: any = {},
	attributeKeyBase: string[] = [],
): { [key: string]: { match: string; value: string } } => {
	if (!queryParts?.length || !logAttributes) {
		return {}
	}

	const bodyQueryValue = queryParts.find(
		(term): term is SearchExpression =>
			'key' in term && term.key === 'body',
	)?.value

	Object.entries(logAttributes).forEach(([key, value]) => {
		const isString = typeof value === 'string'

		if (!isString) {
			findMatchingLogAttributes(queryParts, value, matchingAttributes, [
				...attributeKeyBase,
				key,
			])
			return
		}

		let matchingAttribute: string | undefined = undefined
		if (
			bodyQueryValue &&
			key === bodyKey &&
			value.toLowerCase().indexOf(bodyQueryValue.toLowerCase()) !== -1
		) {
			matchingAttribute = bodyQueryValue
		} else {
			const fullKey = [...attributeKeyBase, key].join('.')

			queryParts.some((term) => {
				if (!('key' in term)) {
					return false
				}

				const queryKey = term.key.toLowerCase()
				const queryValue = term.value?.toLowerCase()

				// TODO: skips when using the exists operator, but we may want to support showing all values
				if (queryValue && queryKey === fullKey) {
					matchingAttribute = queryValue
				}
			})
		}

		if (!!matchingAttribute) {
			matchingAttributes[[...attributeKeyBase, key].join('.')] = {
				match: matchingAttribute,
				value,
			}
		}
	})

	return matchingAttributes
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

	levels.forEach((level) => {
		query += ` ${ReservedLogKey.Level}${DEFAULT_OPERATOR}${level}`
	})

	sources.forEach((source) => {
		query += ` ${ReservedLogKey.Source}${DEFAULT_OPERATOR}${source}`
	})

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
