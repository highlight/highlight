type SearchParam = {
	key: string
	operator: string
	value: string
}

const SEPARATOR = ':'
const DEFAULT_OPERATOR = '='
const NAME_TEXT = 'text'
const PARSE_REGEX =
	/(\S+:'(?:[^'\\]|\\.)*')|(\S+:"(?:[^"\\]|\\.)*")|(-?"(?:[^"\\]|\\.)*")|(-?'(?:[^'\\]|\\.)*')|\S+|\S+:\S+/g

export const queryStringToSearchParams = (query: string) => {
	if (query.indexOf(SEPARATOR) === -1) {
		return [{ key: NAME_TEXT, operator: DEFAULT_OPERATOR, value: query }]
	}

	const terms = []
	const freetextQueryWords = []
	let match

	while ((match = PARSE_REGEX.exec(query)) !== null) {
		const term = match[0]
		if (term.indexOf(SEPARATOR) > -1) {
			const [key, value] = term.split(SEPARATOR)

			terms.push({
				key,
				operator: DEFAULT_OPERATOR,
				value: value?.replace(/^\"|\"$|^\'|\'$/g, ''), // strip quotes
			})
		} else {
			freetextQueryWords.push(term)
		}
	}

	if (freetextQueryWords.length > 0) {
		terms.push({
			key: 'text',
			operator: DEFAULT_OPERATOR,
			value: freetextQueryWords.join(' '),
		})
	}

	return terms
}

export const searchParamsToQueryString = (params: SearchParam[]) => {
	const querySegments: string[] = []

	params.forEach((param) => {
		if (param.key === 'text') {
			querySegments.push(param.value)
		} else {
			const value =
				param.value.indexOf(' ') > -1 ? `"${param.value}"` : param.value
			querySegments.push(`${param.key}:${value}`)
		}
	})

	return querySegments.join(' ')
}
