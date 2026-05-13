import api from '@opentelemetry/api'
import { H as NodeH } from '@highlight-run/node'
import { lastValueFrom, of } from 'rxjs'
import { HighlightInterceptor } from './index'

jest.mock(
	'@highlight-run/node',
	() => ({
		H: {
			_debug: jest.fn(),
			consumeError: jest.fn(),
			flush: jest.fn(),
			init: jest.fn(),
			isInitialized: jest.fn(() => true),
			log: jest.fn(),
			startWithHeaders: jest.fn(),
		},
	}),
	{ virtual: true },
)

const mockNodeH = NodeH as jest.Mocked<typeof NodeH>

describe('HighlightInterceptor', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		mockNodeH.isInitialized.mockReturnValue(true)
		mockNodeH.startWithHeaders.mockReturnValue({
			ctx: api.context.active(),
			span: {
				end: jest.fn(),
			} as any,
		})
	})

	it('uses the GraphQL request when the HTTP request is not available', async () => {
		const interceptor = new HighlightInterceptor({ projectID: '1' } as any)
		const request = {
			headers: { 'x-test-header': 'test' },
			method: 'POST',
			url: '/graphql',
		}
		const context = {
			getArgByIndex: jest.fn((index: number) =>
				index === 2 ? { req: request } : undefined,
			),
			getClass: () => function AppResolver() {},
			getHandler: () => function getUser() {},
			getType: () => 'graphql',
			switchToHttp: () => ({
				getRequest: () => undefined,
			}),
		}

		await lastValueFrom(
			interceptor.intercept(context as any, { handle: () => of('ok') }),
		)

		expect(mockNodeH.startWithHeaders).toHaveBeenCalledWith(
			'POST /graphql',
			request.headers,
			{
				attributes: {
					'http.method': 'POST',
					'http.url': '/graphql',
				},
			},
		)
	})

	it('falls back to resolver metadata when no request object is available', async () => {
		const interceptor = new HighlightInterceptor({ projectID: '1' } as any)
		const context = {
			getArgByIndex: jest.fn(() => undefined),
			getClass: () => function AppResolver() {},
			getHandler: () => function getUser() {},
			getType: () => 'graphql',
			switchToHttp: () => ({
				getRequest: () => undefined,
			}),
		}

		await lastValueFrom(
			interceptor.intercept(context as any, { handle: () => of('ok') }),
		)

		expect(mockNodeH.startWithHeaders).toHaveBeenCalledWith(
			'GRAPHQL AppResolver.getUser',
			{},
			{
				attributes: {
					'http.method': 'GRAPHQL',
					'http.url': 'AppResolver.getUser',
				},
			},
		)
	})
})
