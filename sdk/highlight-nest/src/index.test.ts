import { of } from 'rxjs'
import { HighlightInterceptor } from './index'
import { H as NodeH } from '@highlight-run/node'

jest.mock('@highlight-run/node', () => ({
	H: {
		isInitialized: jest.fn().mockReturnValue(true),
		init: jest.fn(),
		flush: jest.fn().mockResolvedValue(undefined),
		startWithHeaders: jest.fn().mockReturnValue({
			span: { end: jest.fn() },
			ctx: {},
		}),
		consumeError: jest.fn(),
	},
}))

describe('HighlightInterceptor', () => {
	let interceptor: HighlightInterceptor

	beforeEach(() => {
		jest.clearAllMocks()
		interceptor = new HighlightInterceptor({ projectID: 'test-project' })
	})

	it('should handle standard HTTP execution context', (done) => {
		const mockRequest = {
			method: 'POST',
			url: '/api/test',
			headers: { 'x-highlight-request': '123' },
		}
		const mockExecutionContext: any = {
			getType: () => 'http',
			switchToHttp: () => ({
				getRequest: () => mockRequest,
			}),
			getArgs: () => [],
		}
		const mockCallHandler: any = {
			handle: () => of({ data: 'success' }),
		}

		interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
			next: (val) => {
				expect(val).toEqual({ data: 'success' })
				expect(NodeH.startWithHeaders).toHaveBeenCalledWith(
					'POST /api/test',
					mockRequest.headers,
					expect.objectContaining({
						attributes: {
							'http.method': 'POST',
							'http.url': '/api/test',
						},
					}),
				)
				done()
			},
		})
	})

	it('should handle GraphQL execution context without throwing undefined headers', (done) => {
		const mockGqlRequest = {
			method: 'POST',
			url: '/graphql',
			headers: { authorization: 'Bearer test' },
		}
		const mockExecutionContext: any = {
			getType: () => 'graphql',
			switchToHttp: () => ({
				getRequest: () => undefined,
			}),
			getArgs: () => [null, {}, { req: mockGqlRequest }, {}],
		}
		const mockCallHandler: any = {
			handle: () => of({ data: { user: { id: 1 } } }),
		}

		interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
			next: (val) => {
				expect(val).toEqual({ data: { user: { id: 1 } } })
				expect(NodeH.startWithHeaders).toHaveBeenCalledWith(
					'POST /graphql',
					mockGqlRequest.headers,
					expect.objectContaining({
						attributes: {
							'http.method': 'POST',
							'http.url': '/graphql',
						},
					}),
				)
				done()
			},
		})
	})

	it('should gracefully fallback when GraphQL context lacks request object', (done) => {
		const mockExecutionContext: any = {
			getType: () => 'graphql',
			switchToHttp: () => ({
				getRequest: () => undefined,
			}),
			getArgs: () => [null, {}, {}, {}],
		}
		const mockCallHandler: any = {
			handle: () => of({ data: 'ok' }),
		}

		interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
			next: () => {
				expect(NodeH.startWithHeaders).toHaveBeenCalledWith(
					'GRAPHQL',
					{},
					expect.objectContaining({
						attributes: {
							'http.method': 'GRAPHQL',
							'http.url': '',
						},
					}),
				)
				done()
			},
		})
	})
})
