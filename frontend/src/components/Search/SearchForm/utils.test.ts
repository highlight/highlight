import { SearchExpression } from '@/components/Search/Parser/listener'

import {
	BODY_KEY,
	buildTokenGroups,
	quoteQueryValue,
	stringifySearchQuery,
	validateSearchQuery,
} from './utils'

const complexQueryString = `  name:"Eric Thomas" workspace:'Chilly McWilly'  project_id:9 freetext query`
const complexQueryParams: SearchExpression[] = [
	{
		key: 'name',
		operator: '=',
		value: '"Eric Thomas"',
		text: 'name:"Eric Thomas"',
		start: 2,
		stop: 17,
	},
	{
		key: 'workspace',
		operator: '=',
		value: "'Chilly McWilly'",
		text: "workspace:'Chilly McWilly'",
		start: 21,
		stop: 40,
	},
	{
		key: 'project_id',
		operator: '=',
		value: '9',
		text: 'project_id:9',
		start: 49,
		stop: 59,
	},
	{
		key: BODY_KEY,
		operator: '=',
		value: 'freetext query',
		text: 'freetext query',
		start: 62,
		stop: 75,
	},
]

describe('stringifyLogsQuery', () => {
	it('parses simple params to a query string', () => {
		expect(
			stringifySearchQuery([
				{
					key: BODY_KEY,
					operator: '=',
					value: 'a test query',
					text: 'a test query',
					start: 0,
					stop: 12,
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
					text: '"Error updating filter group: Filtering out noisy error"',
					start: 0,
					stop: 62,
				},
			]),
		).toEqual('"Error updating filter group: Filtering out noisy error"')
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

describe('buildTokenGroups', () => {
	const tokens = [
		{ start: 1, stop: 12, type: 13, text: 'service_name' },
		{ start: 13, stop: 13, type: 4, text: '=' },
		{ start: 14, stop: 14, type: 10, text: '(' },
		{ start: 15, stop: 27, type: 13, text: 'private-graph' },
		{ start: 30, stop: 31, type: 2, text: 'OR' },
		{ start: 33, stop: 44, type: 13, text: 'public-graph' },
		{ start: 45, stop: 45, type: 11, text: ')' },
		{ start: 47, stop: 55, type: 13, text: 'span_name' },
		{ start: 56, stop: 57, type: 5, text: '!=' },
		{ start: 58, stop: 67, type: 13, text: 'gorm.Query' },
		{ start: 69, stop: 72, type: 13, text: 'asdf' },
		{ start: 74, stop: 77, type: 13, text: 'fdsa' },
		{ start: 79, stop: 78, type: -1, text: '<EOF>' },
	]

	const queryParts = [
		{
			start: 1,
			stop: 45,
			text: 'service_name=(private-graph  OR public-graph)',
			key: 'service_name',
			operator: '=',
			value: '(private-graph  OR public-graph)',
		},
		{
			start: 47,
			stop: 67,
			text: 'span_name!=gorm.Query',
			key: 'span_name',
			operator: '!=',
			value: 'gorm.Query',
		},
		{
			start: 69,
			stop: 72,
			text: 'asdf',
			key: 'asdf',
			operator: '=',
			value: '',
		},
		{
			start: 74,
			stop: 77,
			text: 'fdsa',
			key: 'fdsa',
			operator: '=',
			value: '',
		},
	]

	const queryString =
		' service_name=(private-graph  OR public-graph) span_name!=gorm.Query asdf fdsa '

	it('builds token groups correctly', () => {
		const tokenGroups = buildTokenGroups(tokens, queryParts, queryString)
		const tokenGroupStrings = tokenGroups.map((group) =>
			group.tokens.map((token) => token.text).join(''),
		)

		expect(tokenGroupStrings).toEqual([
			' ',
			'service_name=(private-graph  OR public-graph)',
			' ',
			'span_name!=gorm.Query',
			' ',
			'asdf',
			' ',
			'fdsa',
			' ',
		])
	})
})
