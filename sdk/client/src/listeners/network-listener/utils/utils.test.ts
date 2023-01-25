import { normalizeUrl } from './utils'

describe('normalizeUrl', () => {
	vi.stubGlobal('location', {
		origin: 'https://pub.highlight.run',
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	test.each([
		['/api/todo/create', 'https://pub.highlight.run/api/todo/create'],
		[
			'https://example.com/trailing/slash/',
			'https://example.com/trailing/slash',
		],
		['https://example.com/no/change', 'https://example.com/no/change'],
	])('normalizeUrl(%s, %s) -> %s', (url, expected) => {
		expect(normalizeUrl(url)).toBe(expected)
	})
})
