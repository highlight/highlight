export type SearchParam = {
	key: string
	operator: string
	value: string
	offsetStart: number
}

const SEPARATOR = ':'
export const DEFAULT_OPERATOR = '='
export const BODY_KEY = 'body'

// Inspired by search-query-parser:
// https://github.com/nepsilon/search-query-parser/blob/8158d09c70b66168440e93ffabd720f4c8314c9b/lib/search-query-parser.js#L40
const PARSE_REGEX =
	/(\S+:'(?:[^'\\]|\\.)*')|(\S+:"(?:[^"\\]|\\.)*")|(-?"(?:[^"\\]|\\.)*")|(-?'(?:[^'\\]|\\.)*')|\S+|\S+:\S+|\s$/g

export const parseSearchQuery = (query = ''): SearchParam[] => {
	if (query.indexOf(SEPARATOR) === -1) {
		return [
			{
				key: BODY_KEY,
				operator: DEFAULT_OPERATOR,
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
				operator: DEFAULT_OPERATOR,
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
					operator: DEFAULT_OPERATOR,
					value: isEmptyString ? '' : term,
					offsetStart: isEmptyString ? match.index + 1 : match.index,
				})
			}
		}
	}

	return terms
}

export const queryAsStringParams = (query: string): string[] => {
	const terms = []
	let match

	while ((match = PARSE_REGEX.exec(query)) !== null) {
		const term = match[0]

		if (term.trim() !== '') {
			terms.push(term)
		}
	}

	return terms
}

export const stringifySearchQuery = (params: SearchParam[]) => {
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
export const buildSearchQueryForServer = (params: SearchParam[]) => {
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

export const validateSearchQuery = (params: SearchParam[]): boolean => {
	return !params.some((param) => !param.value)
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
