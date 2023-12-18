import { parseSearch } from '@/components/Search/utils'

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
		'  span_name="Chris Schmitz" source=(backend OR frontend) OR  service_name!=private-graph span_name=gorm.Query'

	it('should group tokens correctly', () => {
		const { tokenGroups } = parseSearch(queryString)

		expect(tokenGroups).toEqual([
			[{ type: 100, text: '  ', start: 0, stop: 2 }],
			[
				{ type: 13, text: 'span_name', start: 2, stop: 10 },
				{ type: 4, text: '=', start: 11, stop: 11 },
				{ type: 14, text: '"Chris Schmitz"', start: 12, stop: 26 },
			],
			[{ type: 100, text: ' ', start: 27, stop: 28 }],
			[
				{ type: 13, text: 'source', start: 28, stop: 33 },
				{ type: 4, text: '=', start: 34, stop: 34 },
				{ type: 10, text: '(', start: 35, stop: 35 },
				{ type: 13, text: 'backend', start: 36, stop: 42 },
				{ type: 100, text: ' ', start: 43, stop: 44 },
				{ type: 2, text: 'OR', start: 44, stop: 45 },
				{ type: 100, text: ' ', start: 46, stop: 47 },
				{ type: 13, text: 'frontend', start: 47, stop: 54 },
				{ type: 11, text: ')', start: 55, stop: 55 },
			],
			[{ type: 100, text: ' ', start: 56, stop: 57 }],
			[{ type: 2, text: 'OR', start: 57, stop: 58 }],
			[{ type: 100, text: '  ', start: 59, stop: 61 }],
			[
				{ type: 13, text: 'service_name', start: 61, stop: 72 },
				{ type: 5, text: '!=', start: 73, stop: 74 },
				{ type: 13, text: 'private-graph', start: 75, stop: 87 },
			],
			[{ type: 100, text: ' ', start: 88, stop: 89 }],
			[
				{ type: 13, text: 'span_name', start: 89, stop: 97 },
				{ type: 4, text: '=', start: 98, stop: 98 },
				{ type: 13, text: 'gorm.Query', start: 99, stop: 108 },
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
