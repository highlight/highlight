import SearchGrammarLexer from '@/components/Search/Parser/antlr/SearchGrammarLexer'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { SearchToken } from '@/components/Search/utils'

export const DEFAULT_OPERATOR = '=' as const
export const BODY_KEY = 'message' as const

export const stringifySearchQuery = (params: SearchExpression[]) => {
	const querySegments: string[] = []
	let currentOffset = 0

	params.forEach(({ text, start }, index) => {
		const spaces = Math.max(start - currentOffset, index === 0 ? 0 : 1)
		currentOffset = start + text.length

		if (spaces > 0) {
			querySegments.push(' '.repeat(spaces))
		}

		querySegments.push(text)
	})

	return querySegments.join('')
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

const SEPARATOR_TOKENS = [SearchGrammarLexer.AND, SearchGrammarLexer.OR]

export type TokenGroup = {
	tokens: SearchToken[]
	start: number
	stop: number
	type: 'expression' | 'separator'
	expression?: SearchExpression
}

export const buildTokenGroups = (
	tokens: SearchToken[],
	queryParts: SearchExpression[],
	queryString: string,
) => {
	const tokenGroups: TokenGroup[] = []
	let currentTokenIndex = 0
	let currentToken = tokens[currentTokenIndex]
	let currentGroupIndex = 0
	let lastTokenStopIndex = -1
	let stopIndex = -1

	while (currentToken) {
		const currentPartIndex = queryParts.findIndex(
			(part) =>
				currentToken.start >= part.start &&
				currentToken.stop <= part.stop,
		)
		const currentPart = queryParts[currentPartIndex]
		const whitespace = queryString.substring(
			lastTokenStopIndex + 1,
			currentToken.start,
		)
		const whitespaceToken =
			whitespace.length > 0
				? {
						type: SearchGrammarLexer.WS,
						text: whitespace,
						start: lastTokenStopIndex + 1,
						stop: currentToken.start,
				  }
				: undefined

		if (stopIndex === -1) {
			stopIndex = currentPart?.stop ?? 0
		}

		if (tokenGroups.length === 0 || currentToken.stop > stopIndex) {
			if (whitespaceToken) {
				if (currentTokenIndex > 0) {
					currentGroupIndex++
				}

				tokenGroups[currentGroupIndex] = {
					tokens: [whitespaceToken],
					start: whitespaceToken.start,
					stop: whitespaceToken.stop,
					type: 'separator',
				}
			}

			currentGroupIndex++
			tokenGroups[currentGroupIndex] = {
				tokens: [],
				start: currentToken.start,
				stop: currentToken.stop,
				type: 'separator',
			}
		} else {
			if (whitespaceToken) {
				tokenGroups[currentGroupIndex].tokens.push(whitespaceToken)
			}
		}

		tokenGroups[currentGroupIndex].tokens.push(currentToken)
		tokenGroups[currentGroupIndex].stop = currentToken.stop

		const isExpression = !SEPARATOR_TOKENS.includes(currentToken.type)
		if (isExpression) {
			tokenGroups[currentGroupIndex].type = 'expression'
			tokenGroups[currentGroupIndex].expression = currentPart
		}

		lastTokenStopIndex = currentToken.stop
		stopIndex = currentPart
			? currentPart.stop
			: queryParts[currentPartIndex + 1]?.stop ?? lastTokenStopIndex
		currentTokenIndex++
		currentToken = tokens[currentTokenIndex]
	}

	// Remove any empty token groups
	return tokenGroups.filter((group) => group.tokens.length > 0)
}
