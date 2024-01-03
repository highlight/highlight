import SearchGrammarParser from '@/components/Search/Parser/SearchGrammarParser'
import { parseSearch, STRING_TYPE } from '@/components/Search/utils'

describe('parseSearch', () => {
	it('should parse a string correctly', () => {
		const queryString =
			'  span_name="Chris Schmitz" source=(backend OR frontend)  service_name!=private-graph'
		const { queryParts } = parseSearch(queryString)

		expect(queryParts).toEqual([
			{ text: 'span_name="Chris Schmitz"', start: 2, stop: 26 },
			{ text: 'source=(backend OR frontend)', start: 28, stop: 55 },
			{ text: 'service_name!=private-graph', start: 58, stop: 84 },
		])
	})

	it('should parse a string correctly', () => {
		const queryString =
			' service_name:private-graph span_name:KafkaBatchWorker'
		const { queryParts } = parseSearch(queryString)

		expect(queryParts).toEqual([
			{ text: 'service_name:private-graph', start: 1, stop: 26 },
			{ text: 'span_name:KafkaBatchWorker', start: 28, stop: 53 },
		])
	})
})

describe('groupTokens', () => {
	const queryString =
		'  span_name="Chris Schmitz" source=(backend OR frontend) OR  service_name!=private-graph span_name=gorm.Query "'

	it('should group tokens correctly', () => {
		const { tokenGroups } = parseSearch(queryString)

		expect(tokenGroups).toEqual([
			[{ type: STRING_TYPE, text: '  ', start: 0, stop: 2 }],
			[
				{
					type: SearchGrammarParser.ID,
					text: 'span_name',
					start: 2,
					stop: 10,
				},
				{
					type: SearchGrammarParser.EQ,
					text: '=',
					start: 11,
					stop: 11,
				},
				{
					type: SearchGrammarParser.STRING,
					text: '"Chris Schmitz"',
					start: 12,
					stop: 26,
				},
			],
			[{ type: STRING_TYPE, text: ' ', start: 27, stop: 28 }],
			[
				{
					type: SearchGrammarParser.ID,
					text: 'source',
					start: 28,
					stop: 33,
				},
				{
					type: SearchGrammarParser.EQ,
					text: '=',
					start: 34,
					stop: 34,
				},
				{
					type: SearchGrammarParser.LPAREN,
					text: '(',
					start: 35,
					stop: 35,
				},
				{
					type: SearchGrammarParser.ID,
					text: 'backend',
					start: 36,
					stop: 42,
				},
				{ type: STRING_TYPE, text: ' ', start: 43, stop: 44 },
				{
					type: SearchGrammarParser.OR,
					text: 'OR',
					start: 44,
					stop: 45,
				},
				{ type: STRING_TYPE, text: ' ', start: 46, stop: 47 },
				{
					type: SearchGrammarParser.ID,
					text: 'frontend',
					start: 47,
					stop: 54,
				},
				{
					type: SearchGrammarParser.RPAREN,
					text: ')',
					start: 55,
					stop: 55,
				},
			],
			[{ type: STRING_TYPE, text: ' ', start: 56, stop: 57 }],
			[{ type: SearchGrammarParser.OR, text: 'OR', start: 57, stop: 58 }],
			[{ type: STRING_TYPE, text: '  ', start: 59, stop: 61 }],
			[
				{
					type: SearchGrammarParser.ID,
					text: 'service_name',
					start: 61,
					stop: 72,
				},
				{
					type: SearchGrammarParser.NEQ,
					text: '!=',
					start: 73,
					stop: 74,
				},
				{
					type: SearchGrammarParser.ID,
					text: 'private-graph',
					start: 75,
					stop: 87,
				},
			],
			[{ type: STRING_TYPE, text: ' ', start: 88, stop: 89 }],
			[
				{
					type: SearchGrammarParser.ID,
					text: 'span_name',
					start: 89,
					stop: 97,
				},
				{
					type: SearchGrammarParser.EQ,
					text: '=',
					start: 98,
					stop: 98,
				},
				{
					type: SearchGrammarParser.ID,
					text: 'gorm.Query',
					start: 99,
					stop: 108,
				},
			],
			[
				{
					type: STRING_TYPE,
					start: 109,
					stop: 111,
					text: ' "',
				},
			],
		])
	})

	it('returns tokens in a format you can rebuild the input string', () => {
		const { tokenGroups } = parseSearch(queryString)
		const textFromTokens = tokenGroups
			.flat()
			.map((t) => t.text)
			.join('')

		expect(textFromTokens).toEqual(queryString)
	})
})
