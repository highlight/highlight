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

const EXISTS_PLACEHOLDER_VALUE = 'EXISTS'

export const findMatchingLogAttributes = (
	queryParts: Array<SearchExpression | AndOrExpression>,
	logAttributes: object | string,
	matchingAttributes: any = {},
	attributeKeyBase: string[] = [],
): { [key: string]: { match: string; value: string } } => {
	if (!queryParts?.length || !logAttributes) {
		return {}
	}

	const bodyQueryValues = queryParts
		.filter(
			(term): term is SearchExpression =>
				'key' in term && term.key === bodyKey,
		)
		.map((term) => term.value.replace(/^"|"$/g, ''))

	Object.entries(logAttributes).forEach(([key, value]) => {
		const isString = typeof value === 'string'

		if (!isString) {
			findMatchingLogAttributes(queryParts, value, matchingAttributes, [
				...attributeKeyBase,
				key,
			])
			return
		}

		const bodyQueryValue = bodyQueryValues.find(
			(bodyQueryValue) =>
				value.toLowerCase().indexOf(bodyQueryValue.toLowerCase()) > -1,
		)

		let matchingAttribute: string | undefined = undefined
		if (bodyQueryValue && key === bodyKey) {
			matchingAttribute = bodyQueryValue
		} else {
			const fullKey = [...attributeKeyBase, key].join('.')

			queryParts.some((term) => {
				if (!('key' in term)) {
					return false
				}

				const queryKey = term.key.toLowerCase()
				const queryOpertor = term.operator
				const queryValue = term.value?.toLowerCase()

				if (queryKey === fullKey) {
					// TODO: figure out why operator is 'NOTEXISTS' without spaces
					// so we can use the constants
					matchingAttribute = ['EXISTS', 'NOTEXISTS'].includes(
						queryOpertor.toUpperCase(),
					)
						? EXISTS_PLACEHOLDER_VALUE
						: queryValue
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
