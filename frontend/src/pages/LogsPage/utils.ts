import { LOG_TIME_FORMAT } from '@pages/LogsPage/constants'
import moment from 'moment'

import { ReservedLogKey } from '@/graph/generated/schemas'
import { LogsSearchParam } from '@/pages/LogsPage/SearchForm/utils'

export const formatDate = (date: Date) => {
	return moment(date).format('M/D/YY h:mm:ss A')
}

export const isSignificantDateRange = (startDate: Date, endDate: Date) => {
	return (
		moment(startDate).format(LOG_TIME_FORMAT) !==
		moment(endDate).format(LOG_TIME_FORMAT)
	)
}

const bodyKey = ReservedLogKey['Message']

export const findMatchingLogAttributes = (
	queryTerms: LogsSearchParam[],
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
