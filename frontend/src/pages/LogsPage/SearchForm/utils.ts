export type LogsSearchParam = {
	key: string
	operator: string
	value: string
	offsetStart: number
}

const SEPARATOR = ':'
const DEFAULT_OPERATOR = '='
const NAME_TEXT = 'text'
const PARSE_REGEX =
	/(\S+:'(?:[^'\\]|\\.)*')|(\S+:"(?:[^"\\]|\\.)*")|(-?"(?:[^"\\]|\\.)*")|(-?'(?:[^'\\]|\\.)*')|\S+|\S+:\S+/g

export const parseLogsQuery = (query: string): LogsSearchParam[] => {
	if (query.indexOf(SEPARATOR) === -1) {
		return [
			{
				key: NAME_TEXT,
				operator: DEFAULT_OPERATOR,
				value: query,
				offsetStart: 0,
			},
		]
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
				offsetStart: query.indexOf(key),
			})
		} else {
			freetextQueryWords.push(term)
		}
	}

	if (freetextQueryWords.length > 0) {
		const freetextQuery = freetextQueryWords.join(' ')

		terms.push({
			key: 'text',
			operator: DEFAULT_OPERATOR,
			value: freetextQuery,
			offsetStart: query.indexOf(freetextQuery),
		})
	}

	return terms
}

export const stringifyLogsQuery = (params: LogsSearchParam[]) => {
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

export const validateLogsQuery = (params: LogsSearchParam[]): boolean => {
	return !params.some((param) => !param.value)
}
