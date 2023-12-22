import { SearchExpression } from '@/components/Search/Parser/listener'

export const DEFAULT_OPERATOR = '='
export const BODY_KEY = 'message'

export const stringifySearchQuery = (params: SearchExpression[]) => {
	const querySegments: string[] = []
	let currentOffset = 0

	params.forEach(({ text, start }) => {
		const spaces = start - currentOffset
		currentOffset = start + text.length

		if (spaces > 0) {
			querySegments.push(' '.repeat(spaces))
		}

		querySegments.push(text)
	})

	return querySegments.join('')
}

export const validateSearchQuery = (params: SearchExpression[]): boolean => {
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
