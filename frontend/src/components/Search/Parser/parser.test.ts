import { parseSearch } from '@/components/Search/Parser/utils'

describe('Parser', () => {
	const queryString =
		'  span_name="Chris Schmitz" source=(backend OR frontend)  service_name!=private-graph'

	it('should parse a string correctly', () => {
		const queryParts = parseSearch(queryString)
		expect(queryParts).toEqual([
			{ type: 'spaces', value: '  ' },
			{
				type: 'filter',
				value: 'span_name="Chris Schmitz"',
				key: 'span_name',
				operator: '=',
				start: 2,
				stop: 27,
			},
			{ type: 'spaces', value: ' ' },
			{
				type: 'filter',
				value: 'source=(backend OR frontend)',
				key: 'source',
				operator: '=',
				start: 28,
				stop: 56,
			},
			{ type: 'spaces', value: '  ' },
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
		const queryParts = parseSearch(queryString)
		const stringFromParts = queryParts.map((part) => part.value).join('')
		expect(stringFromParts).toEqual(queryString)
	})
})
