import {
	BODY_KEY,
	buildSearchQueryForServer,
	parseSearchQuery,
	queryAsStringParams,
	quoteQueryValue,
	stringifySearchQuery,
	tokenAsParts,
	validateSearchQuery,
} from './utils'

const complexQueryString = `name:"Eric Thomas" workspace:'Chilly McWilly' project_id:9 freetext query`
const complexQueryParams = [
	{
		key: 'name',
		operator: '=',
		value: '"Eric Thomas"',
		offsetStart: 0,
	},
	{
		key: 'workspace',
		operator: '=',
		value: "'Chilly McWilly'",
		offsetStart: 19,
	},
	{
		key: 'project_id',
		operator: '=',
		value: '9',
		offsetStart: 46,
	},
	{
		key: BODY_KEY,
		operator: '=',
		value: 'freetext query',
		offsetStart: 59,
	},
]

describe('parseLogsQuery', () => {
	it('parses a simple query correctly', () => {
		const query = 'a test query'

		expect(parseSearchQuery(query)).toEqual([
			{
				key: BODY_KEY,
				operator: '=',
				value: query,
				offsetStart: 0,
			},
		])
	})

	it('parses a complex query correctly', () => {
		expect(parseSearchQuery(complexQueryString)).toEqual(complexQueryParams)
	})

	it('calculates offsets correctly when text query when not at end of query', () => {
		const query = 'project_id:18 search query name:"Eric Thomas"'

		expect(parseSearchQuery(query)).toEqual([
			{
				key: 'project_id',
				operator: '=',
				value: '18',
				offsetStart: 0,
			},
			{
				key: BODY_KEY,
				operator: '=',
				value: 'search query',
				offsetStart: 14,
			},
			{
				key: 'name',
				operator: '=',
				value: '"Eric Thomas"',
				offsetStart: 27,
			},
		])
	})

	it('adds a text query when there is a trailing space', () => {
		const query = 'name:"Eric Thomas" '
		expect(parseSearchQuery(query)).toEqual([
			{
				key: 'name',
				operator: '=',
				value: '"Eric Thomas"',
				offsetStart: 0,
			},
			{
				key: BODY_KEY,
				operator: '=',
				value: '',
				offsetStart: 19,
			},
		])
	})

	it('handles separators in quotes', () => {
		const query =
			'"Error updating filter group: Filtering out noisy error" user:"Chilly: McWilly"'
		expect(parseSearchQuery(query)).toEqual([
			{
				key: BODY_KEY,
				operator: '=',
				value: '"Error updating filter group: Filtering out noisy error"',
				offsetStart: 0,
			},
			{
				key: 'user',
				offsetStart: 57,
				operator: '=',
				value: '"Chilly: McWilly"',
			},
		])
	})

	it('handles nested quotes', () => {
		const query = `'test: "ing' user:'Chilly "McWilly"'`
		expect(parseSearchQuery(query)).toEqual([
			{
				key: BODY_KEY,
				operator: '=',
				value: `'test: "ing'`,
				offsetStart: 0,
			},
			{
				key: 'user',
				operator: '=',
				value: `'Chilly "McWilly"'`,
				offsetStart: 13,
			},
		])
	})
})

describe('stringifyLogsQuery', () => {
	it('parses simple params to a query string', () => {
		expect(
			stringifySearchQuery([
				{
					key: BODY_KEY,
					operator: '=',
					value: 'a test query',
					offsetStart: 0,
				},
			]),
		).toEqual('a test query')
	})

	it('parses complex params to a query string', () => {
		expect(stringifySearchQuery(complexQueryParams)).toEqual(
			complexQueryString,
		)
	})

	it('includes quotes for the body query', () => {
		expect(
			stringifySearchQuery([
				{
					key: BODY_KEY,
					operator: '=',
					value: '"Error updating filter group: Filtering out noisy error"',
					offsetStart: 0,
				},
			]),
		).toEqual('"Error updating filter group: Filtering out noisy error"')
	})
})

describe('buildLogsQueryForServer', () => {
	it('handles quoted strings correctly', () => {
		expect(
			buildSearchQueryForServer([
				{
					key: BODY_KEY,
					operator: '=',
					value: `"test: \"ing"`,
					offsetStart: 0,
				},
				{
					key: 'user',
					operator: '=',
					value: `'Chilly "McWilly"'`,
					offsetStart: 10,
				},
			]),
		).toEqual(`"test: \"ing" user:"Chilly \"McWilly\""`)
	})
})

describe('validateLogsQuery', () => {
	it('returns true for an invalid query', () => {
		expect(validateSearchQuery(complexQueryParams)).toBeTruthy()
	})

	it('returns false for an invalid query', () => {
		const params = [...complexQueryParams]
		params[0].value = ''
		expect(validateSearchQuery(params)).toBeFalsy()
	})
})

describe('quoteQueryValue', () => {
	it('quotes strings with spaces', () => {
		expect(quoteQueryValue('a test query')).toEqual('"a test query"')
	})

	it('handles double quoted strings', () => {
		expect(quoteQueryValue('"a test query"')).toEqual('"a test query"')
	})

	it('handles single quoted strings', () => {
		expect(quoteQueryValue("'a test query'")).toEqual("'a test query'")
	})

	it('handles numbers', () => {
		expect(quoteQueryValue(1234)).toEqual('1234')
	})
})

describe('queryAsStringParams', () => {
	it('parses a simple query correctly', () => {
		const query = 'body-a   source:backend body-b  source:frontend body-c '

		expect(queryAsStringParams(query)).toEqual([
			'body-a',
			'   ',
			'source:backend',
			' ',
			'body-b',
			'  ',
			'source:frontend',
			' ',
			'body-c',
			' ',
		])
	})

	it('parses a complex query correctly', () => {
		const query =
			' body-a   source:(backend OR frontend) body-b  name:"Chris Schmitz" body-c '

		expect(queryAsStringParams(query)).toEqual([
			' ',
			'body-a',
			'   ',
			'source:(backend OR frontend)',
			' ',
			'body-b',
			'  ',
			'name:"Chris Schmitz"',
			' ',
			'body-c',
			' ',
		])

		const query2 =
			'service_name=(private-graph OR public-graph) OR (status>=400 AND span_kind!=internal) name!="Zane Mayberry"'

		expect(queryAsStringParams(query2)).toEqual([
			'service_name=(private-graph OR public-graph)',
			' ',
			'OR',
			' ',
			'(status>=400 AND span_kind!=internal)',
			' ',
			'name!="Zane Mayberry"',
		])
	})

	// TODO: Figure out how to fix handling when there is an opening quote and no
	// closing quote.
	it.skip('handles leading and trailing spaces with quotes', () => {
		const query = '  service_name:foo " '

		expect(queryAsStringParams(query)).toEqual([
			'  ',
			'service_name:foo',
			'" ',
		])
	})

	it.skip('handles leading and trailing spaces with quotes', () => {
		const query = 'service_name:"Chris Schmitz" "another filter" "'

		expect(queryAsStringParams(query)).toEqual([
			'service_name:"Chris Schmitz"',
			' ',
			'"another filter"',
			' ',
			'"',
		])
	})
})

describe('tokenAsParts', () => {
	it('parses a token and breaks it into the correct parts', () => {
		expect(tokenAsParts('service_name:(foo OR bar)')).toEqual([
			'service_name',
			':',
			'(',
			'foo ',
			'OR',
			' bar',
			')',
		])

		expect(tokenAsParts('name!=chris')).toEqual(['name', '!=', 'chris'])
	})
})
