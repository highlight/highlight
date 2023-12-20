import { CharStream, CommonTokenStream, ParseTreeWalker, Token } from 'antlr4'

import {
	Expression,
	SearchErrorListener,
	SearchListener,
} from '@/components/Search/Parser/listener'
import SearchGrammarParser from '@/components/Search/Parser/SearchGrammarParser'

import SearchGrammarLexer from './Parser/SearchGrammarLexer'

// We don't have a type from the generated lexer for this token type, so create
//
export const STRING_TYPE = 100

export const buildParser = (input: string) => {
	const chars = new CharStream(input)
	const lexer = new SearchGrammarLexer(chars)
	const tokens = new CommonTokenStream(lexer)
	const parser = new SearchGrammarParser(tokens)
	return { parser, tokens }
}

export const parseSearch = (input: string) => {
	const { parser, tokens } = buildParser(input)
	const queryParts: Expression[] = []

	// Setup a custom error listener. The default listener prints a lot of noise.
	parser.removeErrorListeners()
	parser.addErrorListener(new SearchErrorListener())

	const tree = parser.search_query()
	const listener = new SearchListener(input, queryParts)

	// Walk the tree created during the parse, trigger callbacks
	ParseTreeWalker.DEFAULT.walk(listener, tree)

	return {
		queryParts,
		tokenGroups: groupTokens(tokens.tokens, queryParts, input),
	}
}

export type SearchToken = {
	type: number
	text: string
	start: number
	stop: number
}

export const groupTokens = (
	tokens: Token[],
	expressions: Expression[],
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
