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

	return querySegments.join('').trim()
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
	type: 'expression' | 'separator' | 'andOr'
	expression?: SearchExpression
	error?: string
}

export const buildTokenGroups = (tokens: SearchToken[]) => {
	const tokenGroups: TokenGroup[] = []
	let currentGroup: TokenGroup | null = null
	let insideQuotes = false
	let insideParens = false

	const startNewGroup = (type: TokenGroup['type'], index: number) => {
		if (currentGroup) {
			tokenGroups.push(currentGroup)
		}

		insideParens = false
		insideQuotes = false

		currentGroup = {
			tokens: [],
			start: index,
			stop: index,
			type,
		}
	}

	tokens.forEach((token, index) => {
		if (token.type === SearchGrammarLexer.EOF) {
			return
		}

		// Check if we're inside quotes or parentheses
		if (token.text === '"') {
			insideQuotes = !insideQuotes
		} else if (token.text === '(') {
			insideParens = true
		} else if (token.text === ')') {
			insideParens = false
		}

		const tokenIsSeparator =
			SEPARATOR_TOKENS.includes(token.type) || token.text.trim() === ''

		// Start a new group if we encounter a space outside of quotes and parentheses
		if (tokenIsSeparator && !insideQuotes && !insideParens) {
			if (!currentGroup) {
				currentGroup = {
					tokens: [],
					start: token.start,
					stop: token.stop,
					type: 'separator',
				}
			} else {
				// Special handling of (NOT) EXISTS operators since we don't want to
				// break on a space character in that case.
				const nextThreeTokens = tokens.slice(index + 1, index + 4)
				const nextTokenIsExists =
					nextThreeTokens[0]?.type === SearchGrammarLexer.EXISTS
				const nextTokensIsNotExists =
					nextThreeTokens[0]?.type === SearchGrammarLexer.NOT &&
					nextThreeTokens[2]?.type === SearchGrammarLexer.EXISTS

				if (nextTokenIsExists || nextTokensIsNotExists) {
					currentGroup.tokens.push(token)
					currentGroup.stop = token.stop
					return
				}
			}

			// If we are not in a separator group, start a new one
			if (currentGroup.type !== 'separator') {
				startNewGroup('separator', token.start)
			}

			// Make AND and OR their own groups
			if (SEPARATOR_TOKENS.includes(token.type)) {
				startNewGroup('andOr', token.start)
			}

			currentGroup.tokens.push(token)
			currentGroup.stop = token.stop
		} else {
			if (!currentGroup) {
				currentGroup = {
					tokens: [],
					start: token.start,
					stop: token.stop,
					type: 'expression',
				}
			}

			if (currentGroup.type === 'separator') {
				startNewGroup('expression', token.start)
			}

			// Add the token to the current group
			currentGroup.tokens.push(token)
			currentGroup.stop = token.stop

			// If the token has an error message, assign an error property to the group
			if (token.errorMessage) {
				currentGroup.error = token.errorMessage
			}
		}
	})

	// Add the last group if it exists
	if (currentGroup) {
		tokenGroups.push(currentGroup)
	}

	return tokenGroups
}
