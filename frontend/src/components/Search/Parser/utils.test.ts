import SearchGrammarParser from '@/components/Search/Parser/SearchGrammarParser'
import { groupTokens, parseSearch } from '@/components/Search/Parser/utils'
import { Token } from 'antlr4'

describe('parseSearch', () => {
	it('should parse a string correctly', () => {
		const queryString =
			'  span_name="Chris Schmitz" source=(backend OR frontend)  service_name!=private-graph'
		const { queryParts } = parseSearch(queryString)
		expect(queryParts).toEqual([
			{ type: 'spaces', value: '  ', start: 0, stop: 2 },
			{
				type: 'filter',
				value: 'span_name="Chris Schmitz"',
				key: 'span_name',
				operator: '=',
				start: 2,
				stop: 27,
			},
			{ type: 'spaces', value: ' ', start: 27, stop: 28 },
			{
				type: 'filter',
				value: 'source=(backend OR frontend)',
				key: 'source',
				operator: '=',
				start: 28,
				stop: 56,
			},
			{ type: 'spaces', value: '  ', start: 56, stop: 58 },
			{
				type: 'filter',
				value: 'service_name!=private-graph',
				key: 'service_name',
				operator: '!=',
				start: 58,
				stop: 85,
			},
		])
	})

	it('should return a string to the original query string', () => {
		const queryString =
			'  span_name="Chris Schmitz" source=(backend OR frontend)  service_name!=private-graph'
		const { queryParts } = parseSearch(queryString)
		const stringFromParts = queryParts.map((part) => part.value).join('')
		expect(stringFromParts).toEqual(queryString)
	})

	it('should parse a string correctly', () => {
		const queryString =
			'service_name:private-graph span_name:KafkaBatchWorker'
		const { queryParts } = parseSearch(queryString)

		expect(queryParts).toEqual([
			{
				type: 'filter',
				value: 'service_name:private-graph',
				key: 'service_name',
				operator: ':',
				start: 0,
				stop: 26,
			},
			{ type: 'spaces', value: ' ', start: 26, stop: 27 },
			{
				type: 'filter',
				value: 'span_name:KafkaBatchWorker',
				key: 'span_name',
				operator: ':',
				start: 27,
				stop: 53,
			},
		])
	})
})

describe('groupTokens', () => {
	const tokens = [
		{ type: SearchGrammarParser.ID, text: 'span_name' }, // 0
		{ type: SearchGrammarParser.EQ, text: '=' }, // 1
		{ type: SearchGrammarParser.STRING, text: '"Chris Schmitz"' }, // 2
		{ type: SearchGrammarParser.ID, text: 'source' }, // 3
		{ type: SearchGrammarParser.EQ, text: '=' }, // 4
		{ type: SearchGrammarParser.LPAREN, text: '(' }, // 5
		{ type: SearchGrammarParser.ID, text: 'backend' }, // 6
		{ type: SearchGrammarParser.OR, text: 'OR' }, // 7
		{ type: SearchGrammarParser.ID, text: 'frontend' }, // 8
		{ type: SearchGrammarParser.RPAREN, text: ')' }, // 9
		{ type: SearchGrammarParser.ID, text: 'service_name' }, // 10
		{ type: SearchGrammarParser.NEQ, text: '!=' }, // 11
		{ type: SearchGrammarParser.ID, text: 'private-graph' }, // 12
		{ type: SearchGrammarParser.STRING, text: '"free text"' }, // 13
		{ type: -1, text: '<EOF>' }, // 14
	] as Token[]

	it('should group tokens correctly', () => {
		expect(groupTokens(tokens)).toEqual([
			[tokens[0], tokens[1], tokens[2]],
			[
				tokens[3],
				tokens[4],
				tokens[5],
				tokens[6],
				tokens[7],
				tokens[8],
				tokens[9],
			],
			[tokens[10], tokens[11], tokens[12]],
			[tokens[13], tokens[14]],
		])
	})
})
