import { parseSearch } from '@/components/Search/Parser/utils'

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
