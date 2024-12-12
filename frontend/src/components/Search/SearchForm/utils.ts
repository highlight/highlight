import SearchGrammarLexer from '@/components/Search/Parser/antlr/SearchGrammarLexer'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { SearchToken } from '@/components/Search/utils'

export const DEFAULT_OPERATOR = '=' as const
export const BODY_KEY = 'message' as const

const NEED_QUOTE_REGEX = /["'` :=><]/

export const quoteQueryValue = (value: string | number) => {
	if (typeof value !== 'string') {
		return String(value)
	}

	const isQuotedString =
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'")) ||
		(value.startsWith('`') && value.endsWith('`'))
	if (isQuotedString) {
		return value
	}

	if (NEED_QUOTE_REGEX.test(value)) {
		return `"${value.replace(/"/g, '\\"')}"`
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

const QUOTE_CHARS = ['"', "'", '`']

export const OPERATOR_TOKENS = [
	SearchGrammarLexer.EQ,
	SearchGrammarLexer.NEQ,
	SearchGrammarLexer.GT,
	SearchGrammarLexer.GTE,
	SearchGrammarLexer.LT,
	SearchGrammarLexer.LTE,
]

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

	const isNearOperator = (index: number): boolean => {
		const prevToken = tokens[index - 1]
		const nextToken = tokens[index + 1]

		return (
			(!!prevToken && OPERATOR_TOKENS.includes(prevToken.type)) ||
			(!!nextToken && OPERATOR_TOKENS.includes(nextToken.type))
		)
	}

	tokens.forEach((token, index) => {
		if (token.type === SearchGrammarLexer.EOF) {
			return
		}

		// Check if we're inside quotes or parentheses
		if (QUOTE_CHARS.includes(token.text)) {
			insideQuotes = !insideQuotes
		} else if (token.text === '(') {
			insideParens = true
		} else if (token.text === ')') {
			insideParens = false
		}

		const tokenIsSeparator =
			(SEPARATOR_TOKENS.includes(token.type) ||
				token.text.trim() === '') &&
			// Don't treat spaces as separators if they're around operators
			!(token.text.trim() === '' && isNearOperator(index))

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

export const getActivePart = (
	cursorIndex: number,
	queryParts: SearchExpression[],
): SearchExpression => {
	if (!queryParts.length) {
		return {
			key: BODY_KEY,
			operator: DEFAULT_OPERATOR,
			value: '',
			text: '',
			start: 0,
			stop: 0,
		}
	}

	// Find the part that contains the cursor
	for (let i = 0; i < queryParts.length; i++) {
		const currentPart = queryParts[i]
		const nextPart = queryParts[i + 1]

		// If cursor is within current part's range
		if (
			cursorIndex >= currentPart.start &&
			cursorIndex <= currentPart.stop + 1
		) {
			return currentPart
		}

		// Handle spaces between parts
		if (
			nextPart &&
			cursorIndex > currentPart.stop &&
			cursorIndex < nextPart.start
		) {
			// If cursor is closer to current part, return current part
			if (!!currentPart.value.trim()) {
				return {
					key: BODY_KEY,
					operator: DEFAULT_OPERATOR,
					value: '',
					text: '',
					start: currentPart.stop + 1,
					stop: currentPart.stop + 1,
				}
			} else if (cursorIndex < nextPart.start) {
				return currentPart
			} else {
				return nextPart
			}
		}
	}

	// If cursor is after all parts, create new part
	const lastPart = queryParts[queryParts.length - 1]
	const lastPartStop = Math.max(lastPart.stop + 1, cursorIndex)

	return {
		key: BODY_KEY,
		operator: DEFAULT_OPERATOR,
		value: '',
		text: '',
		start: lastPartStop,
		stop: lastPartStop,
	}
}
