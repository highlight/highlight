import { CharStream, CommonTokenStream, ParseTreeWalker, Token } from 'antlr4'

import SearchGrammarParser from '@/components/Search/Parser/antlr/SearchGrammarParser'
import {
	SearchErrorListener,
	SearchExpression,
	SearchListener,
} from '@/components/Search/Parser/listener'
import {
	BODY_KEY,
	DEFAULT_OPERATOR,
} from '@/components/Search/SearchForm/utils'

import SearchGrammarLexer from './Parser/antlr/SearchGrammarLexer'

export const buildParser = (input: string) => {
	const chars = new CharStream(input)
	const lexer = new SearchGrammarLexer(chars)
	const tokens = new CommonTokenStream(lexer)
	const parser = new SearchGrammarParser(tokens)
	return { parser, tokens }
}

export const parseSearch = (input: string) => {
	const { parser, tokens } = buildParser(input)
	const queryParts: SearchExpression[] = []

	// The default listener prints a lot of noise, so remove it and set up a
	// custom listener.
	parser.removeErrorListeners()
	parser.addErrorListener(new SearchErrorListener())

	const listener = new SearchListener(input, queryParts)

	// Walk the tree created during the parse + trigger callbacks.
	const tree = parser.search_query()
	ParseTreeWalker.DEFAULT.walk(listener, tree)

	if (input.trim() === '') {
		const bodyPosition = Math.max(0, input.length - 1)

		queryParts.push({
			key: BODY_KEY,
			operator: DEFAULT_OPERATOR,
			value: '',
			text: '',
			start: bodyPosition,
			stop: bodyPosition,
		})
	}

	return {
		queryParts,
		tokens: tokens.tokens,
	}
}

export type SearchToken = {
	type: number
	text: string
	start: number
	stop: number
	errorMessage?: string
}

export const groupTokens = (
	tokens: Token[],
	expressions: SearchExpression[],
	query: string,
) => {
	const groupedTokens: {
		[start: number]: {
			tokens: SearchToken[]
		}
	} = {}

	tokens.forEach((token, index) => {
		const { start } = token
		const prevStop = tokens[index - 1]?.stop ?? -1
		const expression = expressions.find(
			(e) => e.start <= start && e.stop >= token.stop,
		)
		const expressionStart = expression?.start
		const whitespaceLength = start - prevStop - 1

		if (whitespaceLength) {
			const whitespaceStart = start - (whitespaceLength ?? 0)
			const whitespaceStop = whitespaceStart + whitespaceLength
			const whitespaceToken = {
				type: 100,
				text: query.substring(whitespaceStart, whitespaceStop),
				start: whitespaceStart,
				stop: whitespaceStop,
			}

			if (
				expressionStart !== undefined &&
				expressionStart <= whitespaceStart
			) {
				groupedTokens[expressionStart].tokens.push(whitespaceToken)
			} else {
				groupedTokens[whitespaceStart] = {
					tokens: [whitespaceToken],
				}
			}
		}

		if (expressionStart !== undefined && token.type !== -1) {
			if (!groupedTokens[expressionStart]) {
				groupedTokens[expressionStart] = {
					tokens: [],
				}
			}

			groupedTokens[expressionStart].tokens.push({
				type: token.type,
				text: token.text,
				start: token.start,
				stop: token.stop,
			})
		} else if (token.type !== -1) {
			groupedTokens[start] = {
				tokens: [
					{
						type: token.type,
						text: token.text,
						start: token.start,
						stop: token.stop,
					},
				],
			}
		}
	})

	return Object.values(groupedTokens).map((group) => group.tokens)
}
