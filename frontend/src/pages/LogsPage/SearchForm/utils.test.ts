import { queryStringToSearchParams, searchParamsToQueryString } from './utils'

const complexQueryString = `name:"Eric Thomas" workspace:'Chilly McWilly' project_id:9 freetext query`
const complexQueryParams = [
	{
		key: 'name',
		operator: '=',
		value: 'Eric Thomas',
	},
	{
		key: 'workspace',
		operator: '=',
		value: 'Chilly McWilly',
	},
	{
		key: 'project_id',
		operator: '=',
		value: '9',
	},
	{
		key: 'text',
		operator: '=',
		value: 'freetext query',
	},
]

describe('queryStringToSearchParams', () => {
	it('does not transform a query with no operators', () => {
		const query = 'a test query'

		expect(queryStringToSearchParams(query)).toEqual([
			{
				key: 'text',
				operator: '=',
				value: query,
			},
		])
	})

	it('splits apart strings with operators', () => {
		expect(queryStringToSearchParams(complexQueryString)).toEqual(
			complexQueryParams,
		)
	})
})

describe('searchParamsToQueryString', () => {
	it('parses basic params to a query string', () => {
		expect(
			searchParamsToQueryString([
				{
					key: 'text',
					operator: '=',
					value: 'a test query',
				},
			]),
		).toEqual('a test query')
	})

	it('parses complex params to a query string', () => {
		expect(searchParamsToQueryString(complexQueryParams)).toEqual(
			complexQueryString.replaceAll(`'`, `"`),
		)
	})
})
