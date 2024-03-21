import { SearchExpression } from '@/components/Search/Parser/listener'
import { parseSearch } from '@/components/Search/utils'

import {
	BODY_KEY,
	buildTokenGroups,
	quoteQueryValue,
	stringifySearchQuery,
} from './utils'

const complexQueryString = `name:"Eric Thomas" workspace:'Chilly McWilly'  project_id:9 freetext query`
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

describe('quoteQueryValue', () => {
	it('quotes strings with spaces', () => {
		expect(quoteQueryValue('a test query')).toEqual('"a test query"')
	})

	it('handles double quoted strings', () => {
		expect(quoteQueryValue('"a test query"')).toEqual('"a test query"')
	})

	it('handles numbers', () => {
		expect(quoteQueryValue(1234)).toEqual('1234')
	})

	it('handles nested quoted strings', () => {
		expect(quoteQueryValue('{body:"quoted value"}')).toEqual(
			`"{body:\\"quoted value\\"}"`,
		)

		expect(quoteQueryValue(`{'body':'quoted value'}`)).toEqual(
			`"{'body':'quoted value'}"`,
		)

		expect(quoteQueryValue(`body={"joinCode":"abcd"}`)).toEqual(
			`"body={\\"joinCode\\":\\"abcd\\"}"`,
		)
	})
})

describe('buildTokenGroups', () => {
	it('builds token groups correctly', () => {
		const queryString =
			' service_name=(private-graph  OR public-graph) AND span_name!=gorm.Query asdf fdsa '
		const { tokens } = parseSearch(queryString)
		const tokenGroups = buildTokenGroups(tokens)
		const tokenGroupStrings = tokenGroups.map((group) =>
			group.tokens.map((token) => token.text).join(''),
		)

		expect(tokenGroupStrings).toEqual([
			' ',
			'service_name=(private-graph  OR public-graph)',
			' ',
			'AND',
			' ',
			'span_name!=gorm.Query',
			' ',
			'asdf',
			' ',
			'fdsa',
			' ',
		])
	})

	it('handles AND and OR correctly', () => {
		const queryString =
			'service_name=private-graph AND span_name!=gorm.Query'
		const { tokens } = parseSearch(queryString)
		const tokenGroups = buildTokenGroups(tokens)
		const tokenGroupStrings = tokenGroups.map((group) =>
			group.tokens.map((token) => token.text).join(''),
		)

		expect(tokenGroups.map((group) => group.type)).toEqual([
			'expression',
			'separator',
			'andOr',
			'separator',
			'expression',
		])

		expect(tokenGroupStrings).toEqual([
			'service_name=private-graph',
			' ',
			'AND',
			' ',
			'span_name!=gorm.Query',
		])
	})
})
