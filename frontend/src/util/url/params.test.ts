import { getQueryBuilderString } from '@util/url/params'

describe('getQueryBuilderString', () => {
	it('returns a query string correctly', () => {
		const queryString = getQueryBuilderString({
			user_email: 'chris@highlight.io',
		})

		expect(queryString).toEqual(
			'?query=and%7C%7Cuser_email%2Cis%2Cchris%40highlight.io',
		)
	})

	it('handles the contains operator', () => {
		const queryString = getQueryBuilderString({
			user_email: 'contains:highlight.io',
		})

		expect(queryString).toEqual(
			'?query=and%7C%7Cuser_email%2Ccontains%2Chighlight.io',
		)
	})

	it('allows you to return only the param string', () => {
		const queryString = getQueryBuilderString(
			{
				user_email: 'contains:highlight.io',
			},
			true,
			false,
		)

		expect(queryString).toEqual('user_email%2Ccontains%2Chighlight.io')
	})
})
