import {
	AndOrExpression,
	SearchExpression,
} from '@/components/Search/Parser/listener'
import { ReservedLogKey } from '@/graph/generated/schemas'

const bodyKey = ReservedLogKey['Message']

const EXISTS_PLACEHOLDER_VALUE = 'EXISTS'

export const findMatchingAttributes = (
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
			findMatchingAttributes(queryParts, value, matchingAttributes, [
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
