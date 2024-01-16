import { parseSearch } from '@/components/Search/utils'

describe('parseSearch', () => {
	it('should parse a string correctly', () => {
		const queryString =
			'  span_name="Chris Schmitz" source=(backend OR frontend)  service_name!=private-graph AND status>=400 '
		const { queryParts } = parseSearch(queryString)

		expect(queryParts).toEqual([
			{
				key: 'span_name',
				operator: '=',
				value: '"Chris Schmitz"',
				text: 'span_name="Chris Schmitz"',
				start: 2,
				stop: 26,
			},
			{
				key: 'source',
				operator: '=',
				value: '(backend OR frontend)',
				text: 'source=(backend OR frontend)',
				start: 28,
				stop: 55,
			},
			{
				key: 'service_name',
				operator: '!=',
				value: 'private-graph',
				text: 'service_name!=private-graph',
				start: 58,
				stop: 84,
			},
			{
				text: 'AND',
				start: 86,
				stop: 88,
			},
			{
				key: 'status',
				operator: '>=',
				start: 90,
				stop: 100,
				text: 'status>=400',
				value: '400',
			},
		])
	})

	it('should parse a string correctly', () => {
		const queryString =
			' service_name:private-graph span_name:KafkaBatchWorker'
		const { queryParts } = parseSearch(queryString)

		expect(queryParts).toEqual([
			{
				key: 'service_name',
				operator: ':',
				value: 'private-graph',
				text: 'service_name:private-graph',
				start: 1,
				stop: 26,
			},
			{
				key: 'span_name',
				operator: ':',
				value: 'KafkaBatchWorker',
				text: 'span_name:KafkaBatchWorker',
				start: 28,
				stop: 53,
			},
		])
	})
})
