import { UserProperty } from '@pages/Sessions/SearchContext/SearchContext'
import { QueryBuilderState } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder'
import { decodeDelimitedArray, encodeDelimitedArray } from 'use-query-params'

/**
 * Delimiter used to delimit a properties value and id.
 */
const FIELD_DELIMITER = '||'

/**
 * Delimiter used to delimit individual properties.
 */
const PROPERTY_DELIMITER = ','

export const FieldArrayParam = {
	encode(properties?: UserProperty[]) {
		if (!properties) {
			return undefined
		}

		const mappedPropertiesAsString = properties!.map(
			({ id, name, value }) => {
				const [valueKey] = value.split(':')

				if (value.includes(`contains:`)) {
					return name
				}

				// @ts-expect-error
				if ((id === -1 || id === '-1') && name === 'contains') {
					return `${value}`
				}

				return `${id}${FIELD_DELIMITER}${name}${FIELD_DELIMITER}${valueKey}`
			},
		)
		const encodedProperties = encodeDelimitedArray(
			mappedPropertiesAsString,
			PROPERTY_DELIMITER,
		)
		return `${encodedProperties}`
	},

	decode(strValue: any) {
		const decodedProperties = decodeDelimitedArray(
			strValue,
			PROPERTY_DELIMITER,
		)
		const mappedProperties = decodedProperties?.map((property) => {
			if (property?.includes(FIELD_DELIMITER)) {
				const [id, name, valueKey] = property.split(FIELD_DELIMITER)

				return {
					id,
					name,
					value: `${valueKey}:${name}`,
				}
			} else {
				return {
					id: -1,
					name: 'contains',
					value: property,
				}
			}
		})
		return mappedProperties
	},
}

const OR = 'or'
const AND = 'and'

// Encoded example:
// and||track_event,is,Authenticated||user_email,contains,zane,highlight
export const QueryBuilderStateParam = {
	encode(stateStr?: string) {
		if (!stateStr) {
			return undefined
		}

		const state = JSON.parse(stateStr) as QueryBuilderState

		const encodedRules = state.rules.map((terms) => {
			return encodeDelimitedArray(terms, PROPERTY_DELIMITER) ?? null
		})

		return encodeDelimitedArray(
			[...(state.isAnd ? [AND] : [OR]), ...encodedRules],
			FIELD_DELIMITER,
		)
	},

	decode(strValue: any) {
		const decodedTerms = decodeDelimitedArray(strValue, FIELD_DELIMITER)

		if (!decodedTerms || decodedTerms.length === 0) {
			return undefined
		}

		if (!!decodedTerms && decodedTerms.length > 0) {
			const [separator, ...rules] = decodedTerms
			return JSON.stringify({
				isAnd: separator !== OR,
				rules: rules.map((rule) =>
					decodeDelimitedArray(rule, PROPERTY_DELIMITER),
				),
			})
		} else {
			return undefined
		}
	},
}
