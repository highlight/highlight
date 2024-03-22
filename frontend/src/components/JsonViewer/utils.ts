import {
	AndOrExpression,
	SearchExpression,
} from '@/components/Search/Parser/listener'
import { ReservedLogKey } from '@/graph/generated/schemas'

const bodyKey = ReservedLogKey['Message']

export const findMatchingAttributes = (
	queryParts: Array<SearchExpression | AndOrExpression>,
	attributes: object | string,
	matchingAttributes: any = {},
	attributeKeyBase: string[] = [],
): { [key: string]: { match: string; value: string } } => {
	if (!queryParts?.length || !attributes) {
		return {}
	}

	const bodyQueryValues = queryParts
		.filter(
			(term): term is SearchExpression =>
				'key' in term && term.key === bodyKey,
		)
		.map((term) => term.value.replace(/^"|"$/g, ''))

	Object.entries(attributes).forEach(([key, value]) => {
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
				const queryValue = term.value?.toLowerCase()

				if (queryKey === fullKey) {
					matchingAttribute = queryValue?.replace(/^\"|\"$/g, '')
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
