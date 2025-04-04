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

describe('shouldNetworkRequestBeTraced', () => {
	beforeEach(() => {
		vi.stubGlobal('location', {
			origin: 'https://pub.highlight.run',
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('records localhost when tracingOrigins is true', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://localhost/api/todo/create',
				true,
				[],
			),
		).toBe(true)
	})

	it('records relative urls when tracingOrigins is true', () => {
		expect(shouldNetworkRequestBeTraced('/api/todo/create', true, [])).toBe(
			true,
		)
	})

	it('records when tracingOrigins is true and the url matches the browser location', () => {
		window.location.host = 'example.com'

		expect(
			shouldNetworkRequestBeTraced(
				'https://example.com/api/todo/create',
				true,
				[],
			),
		).toBe(true)
	})

	it('does not record when tracingOrigins is true and the url does not match the browser location', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://example.com/api/todo/create',
				true,
				[],
			),
		).toBe(false)
	})

	it('records when tracingOrigins matches', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://example.com/api/todo/create',
				['example.com'],
				[],
			),
		).toBe(true)
	})

	it('does not record when domain is not in tracingOrigins', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://example.com/api/todo/create',
				['foo.example.com'],
				[],
			),
		).toBe(false)
	})

	it('records when tracingOrigins regex matches', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://example.com/api/todo/create',
				[/.*example\.com.*/],
				[],
			),
		).toBe(true)
	})

	it('records when tracingOrigins is true and urlBlocklist does not match', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://example.com/api/todo/create',
				['example.com'],
				['https://example.com/api/v2/todo/create'],
			),
		).toBe(true)
	})

	it('does not record when tracingOrigins is true and urlBlocklist matches', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://example.com/api/todo/create',
				true,
				['https://example.com/api'],
			),
		).toBe(false)
	})

	it('does not record highlight endpoints when tracingOrigins is empty', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://otel.highlight.io/v1/traces',
				[],
				[],
			),
		).toBe(false)
	})

	it('records highlight endpoints when domain matches tracingOrigins regex', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://otel.highlight.io/v1/traces',
				[/.*highlight\.io/],
				[],
			),
		).toBe(true)
	})

	it('records highlight endpoints when domain matches tracingOrigins', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://otel.highlight.io/v1/traces',
				['otel.highlight.io'],
				[],
			),
		).toBe(true)
	})

	it('does not record highlight endpoints when domain matches tracing origins and urlBlocklist', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://otel.highlight.io/v1/traces',
				['otel.highlight.io'],
				['otel.highlight.io'],
			),
		).toBe(false)
	})

	it('does not record the pub.highlight.io highlight endpoint by default', () => {
		expect(
			shouldNetworkRequestBeTraced(
				'https://pub.highlight.io/v1/traces',
				[],
				[],
			),
		).toBe(false)
	})
})

describe('shouldNetworkRequestBeRecorded', () => {
	vi.stubGlobal('location', {
		origin: 'https://pub.highlight.run',
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('records external URLs when tracingOrigins is true', () => {
		expect(
			shouldNetworkRequestBeRecorded(
				'https://example.com/api/todo/create',
				[],
				true,
			),
		).toBe(true)
	})

	it('records external URLs when tracingOrigins matches', () => {
		expect(
			shouldNetworkRequestBeRecorded(
				'https://example.com/api/todo/create',
				[],
				['example.com'],
			),
		).toBe(true)
	})

	it('records external URLs when tracingOrigins do not match', () => {
		expect(
			shouldNetworkRequestBeRecorded(
				'https://example.com/api/todo/create',
				[],
				['foo.example.com'],
			),
		).toBe(true)
	})

	it('records highlight endpoints when tracingOrigins is empty', () => {
		expect(
			shouldNetworkRequestBeRecorded(
				'https://otel.highlight.io/v1/traces',
				[],
				[],
			),
		).toBe(true)
	})

	it('records highlight endpoints when tracingOrigins regex matches', () => {
		expect(
			shouldNetworkRequestBeRecorded(
				'https://otel.highlight.io/v1/traces',
				[],
				[/.*highlight\.io/],
			),
		).toBe(true)
	})

	it('records highlight endpoints when tracingOrigins matches', () => {
		expect(
			shouldNetworkRequestBeRecorded(
				'https://otel.highlight.io/v1/traces',
				[],
				['otel.highlight.io'],
			),
		).toBe(true)
	})

	it('does not record highlight endpoints when passed in as an argument', () => {
		expect(
			shouldNetworkRequestBeRecorded(
				'https://otel.highlight.io/v1/traces',
				['otel.highlight.io'],
				[],
			),
		).toBe(false)
	})

	it('does not highlight endpoints even when they are passed in as an argument if in tracingOrigins', () => {
		expect(
			shouldNetworkRequestBeRecorded(
				'https://otel.highlight.io/v1/traces',
				['otel.highlight.io'],
				[/.*highlight\.io/],
			),
		).toBe(false)
	})
})
