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
	/(\S+:'(?:[^'\\]|\\.)*')|(\S+:"(?:[^"\\]|\\.)*")|(-?"(?:[^"\\]|\\.)*")|(-?'(?:[^'\\]|\\.)*')|\S+|\S+:\S+|\s$/g

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
	let match

	while ((match = PARSE_REGEX.exec(query)) !== null) {
		const term = match[0]

		if (term.indexOf(SEPARATOR) > -1) {
			const [key, value] = term.split(SEPARATOR)

			terms.push({
				key,
				operator: DEFAULT_OPERATOR,
				value: value?.replace(/^\"|\"$|^\'|\'$/g, ''), // strip quotes
				offsetStart: match.index,
			})
		} else {
			const textTermIndex = terms.findIndex((term) => term.key === 'text')

			if (textTermIndex !== -1) {
				terms[textTermIndex].value +=
					terms[textTermIndex].value.length > 0 ? ` ${term}` : term
			} else {
				const isEmptyString = term === ' '

				terms.push({
					key: 'text',
					operator: DEFAULT_OPERATOR,
					value: isEmptyString ? '' : term,
					offsetStart: isEmptyString ? match.index + 1 : match.index,
				})
			}
		}
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
