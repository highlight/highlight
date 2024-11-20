import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { H, NodeOptions } from '@highlight-run/node'
import { highlightMiddleware } from './index'
import { Hono } from 'hono'
import { testClient } from 'hono/testing'

// Mock @highlight-run/node
vi.mock('@highlight-run/node', () => ({
	H: {
		init: vi.fn(),
		isInitialized: vi.fn(),
		runWithHeaders: vi.fn(),
		consumeError: vi.fn(),
	},
}))

const mockOptions = { projectID: 'test-project' }

const getTestClient = (options: NodeOptions = mockOptions) => {
	return testClient(
		new Hono()
			.use(highlightMiddleware(options))
			.get('/search', (c) => c.text('Hello, World!'))
			.get('/error', (c) => {
				throw new Error('Test error')
				return c.text('ERROR!')
			}),
	)
}

let mockHighlightInstance: any
describe('highlightMiddleware', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		vi.mocked(H.isInitialized).mockReturnValue(false)
		vi.mocked(H.init).mockReturnValue({} as any)
		vi.mocked(H.runWithHeaders).mockImplementation(
			async (_, __, fn) => await fn({} as any),
		)
		vi.mocked(H.consumeError).mockImplementation((error, _, __) => {})
	})

	it('should initialize Highlight when not already initialized', async () => {
		const response = await getTestClient().search.$get()
		expect(H.init).toHaveBeenCalledWith(mockOptions)
		expect(response.status).toBe(200)
	})

	it('should not initialize Highlight when already initialized', async () => {
		vi.mocked(H.isInitialized).mockReturnValue(true)
		const response = await getTestClient().search.$get()
		expect(H.init).not.toHaveBeenCalled()
		expect(response.status).toBe(200)
	})

	it('should trace requests with correct attributes', async () => {
		const response = await getTestClient().search.$get()
		expect(H.runWithHeaders).toHaveBeenCalledWith(
			'GET /search',
			{},
			expect.any(Function),
			{
				attributes: {
					'http.method': 'GET',
					'http.route': '/search',
					'http.url': 'http://localhost/search',
				},
			},
		)
		expect(response.status).toBe(200)
	})

	it('handles errors and reports them', async () => {
		const response = await getTestClient().error.$get()
		expect(H.consumeError).toHaveBeenCalled()
		expect(response.status).toBe(500)
	})
})
