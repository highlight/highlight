import { buildQueryStateString, buildQueryURLString } from '@util/url/params'

describe('buildQueryURLString', () => {
	it('returns a query string correctly', () => {
		const queryString = buildQueryURLString({
			user_email: 'chris@highlight.io',
		})

		expect(queryString).toEqual(
			'?query=and%7C%7Cuser_email%2Cis%2Cchris%40highlight.io',
		)
	})

	it('handles the contains operator', () => {
		const queryString = buildQueryURLString({
			user_email: 'contains:highlight.io',
		})

		expect(queryString).toEqual(
			'?query=and%7C%7Cuser_email%2Ccontains%2Chighlight.io',
		)
	})

	it('allows you to return only the param string', () => {
		const queryString = buildQueryURLString({
			user_email: 'contains:highlight.io',
			query: false,
		})

		expect(queryString).toEqual('user_email%2Ccontains%2Chighlight.io')
	})

	it('handles merging query params', () => {
		const queryString = buildQueryURLString({
			user_email: 'contains:highlight.io',
			query: '{"isAnd":false,"rules":[["custom_created_at","between_date","30 days"]]}',
		})

		expect(queryString).toEqual(
			'?query=or%7C%7Ccustom_created_at%2Cbetween_date%2C30%20days%7C%7Cuser_email%2Ccontains%2Chighlight.io',
		)
	})
})

describe('buildQueryStateString', () => {
	it('returns a properly formatted string', () => {
		const queryString = buildQueryStateString({
			user_email: 'contains:highlight.io',
			query: '{"isAnd":false,"rules":[["custom_created_at","between_date","30 days"]]}',
		})

		expect(queryString).toEqual(
			'{"isAnd":true,"rules":[["custom_created_at","between_date","30 days"],["user_email","contains","highlight.io"]]}',
		)
	})
})
