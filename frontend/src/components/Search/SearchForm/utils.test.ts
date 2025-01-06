import { SearchExpression } from '@/components/Search/Parser/listener'
import {
	BODY_KEY,
	buildTokenGroups,
	getActivePart,
	quoteQueryValue,
} from './utils'
import { parseSearch } from '@/components/Search/utils'

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
			' service_name=(private-graph  OR public-graph) AND span_name !=  gorm.Query asdf fdsa '
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
			'span_name !=  gorm.Query',
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

describe('getActivePart', () => {
	it('returns the active part', () => {
		expect(getActivePart(10, complexQueryParams)).toEqual(
			complexQueryParams[0],
		)
	})

	it('handles spaces around operators', () => {
		const queryString = 'name = '
		const { queryParts } = parseSearch(queryString)
		expect(getActivePart(7, queryParts).text).toEqual('name = ')
	})

	it('handles end of operator correctly', () => {
		const queryString = 'span_name=gorm.Query service_name ='
		const { queryParts } = parseSearch(queryString)
		expect(getActivePart(35, queryParts).text).toEqual('service_name =')
	})

	it('handles earlier expression correctly', () => {
		const queryString = 'span_name=gorm.Query service_name=frontend'
		const { queryParts } = parseSearch(queryString)
		expect(getActivePart(20, queryParts).text).toEqual(
			'span_name=gorm.Query',
		)
	})

	it('handles trailing spaces in earlier expressions correctly', () => {
		const queryString = 'span_name =  service_name=frontend'
		const { queryParts } = parseSearch(queryString)
		expect(getActivePart(12, queryParts).text).toEqual('span_name =')
	})

	it('handles trailing spaces in earlier expressions correctly', () => {
		const queryString = 'span_name =  service_name=frontend'
		const { queryParts } = parseSearch(queryString)
		expect(getActivePart(13, queryParts).text).toEqual(
			'service_name=frontend',
		)
	})

	it('handles trailing spaces in earlier expressions correctly', () => {
		const queryString = 'has_errors= span_name =  service_name=frontend'
		const { queryParts } = parseSearch(queryString)
		expect(getActivePart(11, queryParts).text).toEqual('has_errors=')
	})

	it('handles trailing spaces in earlier expressions correctly', () => {
		const queryString = 'span_name = gorm.Query  service_name=frontend'
		const { queryParts } = parseSearch(queryString)
		const activePart = getActivePart(23, queryParts)
		expect(activePart.key).toEqual(BODY_KEY)
		expect(activePart.operator).toEqual('=')
		expect(activePart.text).toEqual('')
		expect(activePart.value).toEqual('')
	})

	it('handles trailing spaces on full queries', () => {
		const queryString = 'service_name=frontend '
		const { queryParts } = parseSearch(queryString)
		const activePart = getActivePart(22, queryParts)

		expect(activePart.key).toEqual(BODY_KEY)
		expect(activePart.operator).toEqual('=')
		expect(activePart.text).toEqual('')
		expect(activePart.value).toEqual('')
	})
})
