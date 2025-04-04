import { getCorsUrlsPattern } from './index'

describe('getCorsUrlsPattern', () => {
	it('handles `tracingOrigins: false` correctly', () => {
		expect(getCorsUrlsPattern(false)).toEqual(/^$/)
	})

	it('handles `tracingOrigins: true` correctly', () => {
		expect(getCorsUrlsPattern(true)).toEqual([
			/localhost/,
			/^\//,
			/localhost:3000/,
		])
	})

	it('handles `tracingOrigins: [string, string]` correctly', () => {
		expect(
			getCorsUrlsPattern([
				'example.com',
				'localhost:3000',
				'pub.highlight.io',
			]),
		).toEqual([/example.com/, /localhost:3000/, /pub.highlight.io/])
	})
})
