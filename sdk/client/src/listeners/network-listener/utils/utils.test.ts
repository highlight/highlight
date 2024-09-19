import {
	normalizeUrl,
	shouldNetworkRequestBeRecorded,
	shouldNetworkRequestBeTraced,
} from './utils'

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

describe('shouldNetworkRequestBeTraced/shouldNetworkRequestBeRecorded', () => {
	vi.stubGlobal('location', {
		origin: 'https://pub.highlight.run',
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	test.each([
		['https://example.com/api/todo/create', true, [], true],
		['https://pub.example.com/api/todo/create', ['example.com'], [], true],
		[
			'https://pub.example.com/api/todo/create',
			['foo.example.com'],
			[],
			false,
		],
		[
			'https://pub.example.com/api/todo/create',
			[/.*example\.com.*/],
			[],
			true,
		],
		[
			'https://pub.example.com/api/todo/create',
			[/.*example\.com.*/],
			['https://pub.example.com/my/api'],
			true,
		],
		[
			'https://pub.example.com/api/todo/create',
			[/.*example\.com.*/],
			['https://pub.example.com/api'],
			false,
		],
	])(
		'shouldNetworkRequestBeTraced(%s, %b, %s, %b) -> %s',
		(url, tracingOrigins, urlBlocklist, expected) => {
			window.location.host = 'example.com'
			expect(
				shouldNetworkRequestBeTraced(url, tracingOrigins, urlBlocklist),
			).toBe(expected)
			expect(
				shouldNetworkRequestBeRecorded(
					url,
					'https://pub.highlight.io',
					tracingOrigins,
				),
			).toBe(true)
		},
	)
})
