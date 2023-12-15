import { CharStream, CommonTokenStream, ParseTreeWalker, Token } from 'antlr4'

import {
	Filter,
	SearchErrorListener,
	SearchListener,
} from '@/components/Search/Parser/listener'
import SearchGrammarParser from '@/components/Search/Parser/SearchGrammarParser'

import SearchGrammarLexer from './SearchGrammarLexer'
import Search from 'antd/lib/transfer/search'

export const buildParser = (input: string) => {
	const chars = new CharStream(input)
	const lexer = new SearchGrammarLexer(chars)
	const tokens = new CommonTokenStream(lexer)
	const parser = new SearchGrammarParser(tokens)
	return { parser, tokens }
}

export const parseSearch = (input: string) => {
	const { parser, tokens } = buildParser(input)
	const queryParts: Filter[] = []

	// Setup a custom error listener. The default listener prints a lot of noise.
	parser.removeErrorListeners()
	parser.addErrorListener(new SearchErrorListener())

	const tree = parser.search_query()
	const listener = new SearchListener(input, queryParts)

	// Walk the tree created during the parse, trigger callbacks
	ParseTreeWalker.DEFAULT.walk(listener, tree)

	return { queryParts, tokens: groupTokens(tokens.tokens) }
}

const stringTokens = [SearchGrammarParser.STRING, SearchGrammarParser.ID]
const operatorTokens = [
	SearchGrammarParser.EQ,
	SearchGrammarParser.NEQ,
	SearchGrammarParser.GT,
	SearchGrammarParser.GTE,
	SearchGrammarParser.LT,
	SearchGrammarParser.LTE,
]

export const groupTokens = (tokens: Token[]) => {
	const originalString = (tokens[0] as any).getInputStream().strdata
	const groupedTokens: Token[][] = []
	let currentGroup: Token[] = []
	let hasOperator = false
	let hasMatchingParens = true
	let hasKey = false
	let hasValue = false
	let startIndex: number | undefined = undefined
	let stopIndex: number

	for (const token of tokens) {
		if (startIndex === undefined) {
			startIndex = token.start
		}

		if (token.type === SearchGrammarParser.LPAREN) {
			hasMatchingParens = false
		}

		if (token.type === SearchGrammarParser.RPAREN) {
			hasMatchingParens = true
		}

		if (operatorTokens.includes(token.type)) {
			hasOperator = true
		}

		if (stringTokens.includes(token.type)) {
			if (hasKey) {
				if (hasOperator) {
					hasValue = true
				} else {
					groupedTokens.push(currentGroup)
					currentGroup = []
					hasOperator = false
					hasKey = false
				}
			} else {
				hasKey = true
			}
		}

		currentGroup.push(token)

		if (hasMatchingParens && hasOperator && hasKey && hasValue) {
			stopIndex = token.stop
			// This works to get the full tag text, but need to figure out how to
			// handle rendering of the tag group :thinking:
			const text = originalString.substring(startIndex, stopIndex + 1)
			console.log('::: text', text)
			groupedTokens.push(currentGroup)
			currentGroup = []
			hasOperator = false
			hasKey = false
			hasValue = false
			startIndex = undefined
		}
	}

	if (currentGroup.length) {
		groupedTokens.push(currentGroup)
	}

	return groupedTokens
}
