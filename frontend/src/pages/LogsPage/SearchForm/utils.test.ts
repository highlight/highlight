import { parseLogsQuery, stringifyLogsQuery, validateLogsQuery } from './utils'

const complexQueryString = `name:"Eric Thomas" workspace:'Chilly McWilly' project_id:9 freetext query`
const complexQueryParams = [
	{
		key: 'name',
		operator: '=',
		value: 'Eric Thomas',
		offsetStart: 0,
	},
	{
		key: 'workspace',
		operator: '=',
		value: 'Chilly McWilly',
		offsetStart: 19,
	},
	{
		key: 'project_id',
		operator: '=',
		value: '9',
		offsetStart: 46,
	},
	{
		key: 'text',
		operator: '=',
		value: 'freetext query',
		offsetStart: 59,
	},
]

describe('parseLogsQuery', () => {
	it('parses a simple query correctly', () => {
		const query = 'a test query'

		expect(parseLogsQuery(query)).toEqual([
			{
				key: 'text',
				operator: '=',
				value: query,
				offsetStart: 0,
			},
		])
	})

	it('parses a complex query correctly', () => {
		expect(parseLogsQuery(complexQueryString)).toEqual(complexQueryParams)
	})
})

describe('stringifyLogsQuery', () => {
	it('parses simple params to a query string', () => {
		expect(
			stringifyLogsQuery([
				{
					key: 'text',
					operator: '=',
					value: 'a test query',
					offsetStart: 0,
				},
			]),
		).toEqual('a test query')
	})

	it('parses complex params to a query string', () => {
		expect(stringifyLogsQuery(complexQueryParams)).toEqual(
			`${complexQueryString}`.replaceAll(`'`, `"`),
		)
	})
})

describe('validateLogsQuery', () => {
	it('returns true for an invalid query', () => {
		expect(validateLogsQuery(complexQueryParams)).toBeTruthy()
	})

	it('returns false for an invalid query', () => {
		const params = [...complexQueryParams]
		params[0].value = ''
		expect(validateLogsQuery(params)).toBeFalsy()
	})
})
