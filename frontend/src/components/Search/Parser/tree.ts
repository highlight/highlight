import { CharStream, CommonTokenStream, ParseTreeWalker } from 'antlr4'

import { Filter, SearchListener } from '@/components/Search/Parser/listener'
import SearchGrammarParser from '@/components/Search/Parser/SearchGrammarParser'

import SearchGrammarLexer from './SearchGrammarLexer'

export const buildParser = (input: string) => {
	const chars = new CharStream(input)
	const lexer = new SearchGrammarLexer(chars)
	const tokens = new CommonTokenStream(lexer)
	const parser = new SearchGrammarParser(tokens)
	return parser
}

export const parseSearch = (input: string) => {
	const parser = buildParser(input)
	const tree = parser.search_query()
	const queryParts: Filter[] = []
	const listener = new SearchListener(input, queryParts)
	ParseTreeWalker.DEFAULT.walk(listener, tree)
	return queryParts
}
