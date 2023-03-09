import { UserPropertyInput } from '@graph/schemas'
import { QueryBuilderState } from '@pages/ErrorsV2/ErrorQueryBuilder/components/QueryBuilder/QueryBuilder'
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
	encode(properties?: UserPropertyInput[]) {
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

export type BuilderParams = {
	query?: boolean | string | null
	[key: string]: string | boolean | null | undefined
}
type IsAnd = boolean

// Input: { user_email: 'chris@highlight.io' }
// Output: '?query=and%7C%7Cuser_email%2Cis%2Cchris@highlight.io`
export const buildQueryURLString = (
	params: BuilderParams,
	options: { isAnd?: IsAnd; reload?: boolean } = {
		isAnd: true,
		reload: false,
	},
) => {
	const builderParams = buildQueryParams(params, !!options.isAnd)

	const encodedParams: any = QueryBuilderStateParam.encode(
		JSON.stringify(builderParams),
	)
	let url =
		params.query !== false
			? `?query=${encodeURIComponent(encodedParams)}`
			: encodeURIComponent(encodedParams.replace('and||', ''))

	if (options.reload) {
		url = `${url}&reload=1`
	}

	return url
}

// Input: { user_email: 'chris@highlight.io' }
// Output: '{"isAnd":true,"rules":[["user_email","is","highlight.io"]]}'
export const buildQueryStateString = (
	params: BuilderParams,
	isAnd: IsAnd = true,
) => {
	const builderParams = buildQueryParams(params, isAnd)

	return JSON.stringify({
		isAnd,
		rules: builderParams.rules,
	})
}

export const buildQueryParams = (
	{ query, ...params }: BuilderParams,
	isAnd: IsAnd,
) => {
	let builderParams: QueryBuilderState = {
		isAnd: isAnd,
		rules: [],
	}

	try {
		if (typeof query === 'string') {
			builderParams = JSON.parse(query)
		}
	} catch (e) {
		query = undefined
	}

	for (const key in params) {
		let value = String(params[key])
		let op = 'is'

		const index = value.indexOf(':')
		if (index > -1) {
			op = value.slice(0, index)
			value = value.slice(index + 1)
		}

		builderParams.rules.push([key, op, value])
	}

	return builderParams
}
