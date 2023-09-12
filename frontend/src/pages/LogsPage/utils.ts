import moment from 'moment'
import { stringify } from 'query-string'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import {
	DEFAULT_OPERATOR,
	SearchParam,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'
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
	queryTerms: SearchParam[],
	logAttributes: object | string,
	matchingAttributes: any = {},
	attributeKeyBase: string[] = [],
): { [key: string]: { match: string; value: string } } => {
	if (!queryTerms?.length || !logAttributes) {
		return {}
	}

	const bodyQueryValue = queryTerms.find((term) => term.key === 'body')?.value

	Object.entries(logAttributes).forEach(([key, value]) => {
		const isString = typeof value === 'string'

		if (!isString) {
			findMatchingLogAttributes(queryTerms, value, matchingAttributes, [
				...attributeKeyBase,
				key,
			])
			return
		}

		let matchingAttribute: string | undefined = undefined
		if (
			bodyQueryValue &&
			key === bodyKey &&
			value.indexOf(bodyQueryValue) !== -1
		) {
			matchingAttribute = bodyQueryValue
		} else {
			const fullKey = [...attributeKeyBase, key].join('.')

			queryTerms.some((term) => {
				const queryKey = term.key
				const queryValue = term.value

				if (queryKey === fullKey) {
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
	const queryParams: SearchParam[] = []
	let offsetStart = 1

	if (session?.secure_id) {
		queryParams.push({
			key: ReservedLogKey.SecureSessionId,
			operator: DEFAULT_OPERATOR,
			value: session.secure_id,
			offsetStart: offsetStart++,
		})
	}

	levels.forEach((level) => {
		queryParams.push({
			key: ReservedLogKey.Level,
			operator: DEFAULT_OPERATOR,
			value: level,
			offsetStart: offsetStart++,
		})
	})

	sources.forEach((source) => {
		queryParams.push({
			key: ReservedLogKey.Source,
			operator: DEFAULT_OPERATOR,
			value: source,
			offsetStart: offsetStart++,
		})
	})

	return {
		query: stringifySearchQuery(queryParams),
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
