import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { lastValueFrom, of, throwError } from 'rxjs'
import {
	buildRequestMetadata,
	HighlightInterceptor,
	resolveRequestFromContext,
} from './index'

function createHttpMockContext(request?: Record<string, any>): ExecutionContext {
	return {
		getType: () => 'http',
		switchToHttp: () => ({
			getRequest: () => request,
		}),
	} as unknown as ExecutionContext
}

function createGraphQLMockContext(
	gqlCtx?: Record<string, any>,
	info?: Record<string, any>,
): ExecutionContext {
	const args = [{}, {}, gqlCtx, info]
	return {
		getType: () => 'graphql',
		getArgByIndex: (index: number) => args[index],
		switchToHttp: () => ({
			getRequest: () => undefined,
		}),
	} as unknown as ExecutionContext
}

describe('HighlightInterceptor HTTP and GraphQL execution contexts', () => {
	it('extracts request headers and URL from standard HTTP ExecutionContext', () => {
		const req = {
			method: 'GET',
			url: '/api/users',
			headers: { 'x-highlight-request': 'session-1/request-1' },
		}
		const context = createHttpMockContext(req)
		expect(resolveRequestFromContext(context)).toBe(req)

		const metadata = buildRequestMetadata(context)
		expect(metadata.spanName).toBe('GET /api/users')
		expect(metadata.headers['x-highlight-request']).toBe(
			'session-1/request-1',
		)
		expect(metadata.attributes['http.method']).toBe('GET')
		expect(metadata.attributes['http.url']).toBe('/api/users')
	})

	it('extracts req and operation metadata from GraphQL ExecutionContext without throwing', () => {
		const req = {
			method: 'POST',
			url: '/graphql',
			headers: { 'x-highlight-request': 'gql-session/gql-req' },
		}
		const context = createGraphQLMockContext(
			{ req },
			{
				fieldName: 'currentUser',
				operation: {
					operation: 'query',
					name: { value: 'GetCurrentUser' },
				},
			},
		)

		expect(resolveRequestFromContext(context)).toBe(req)
		const metadata = buildRequestMetadata(context)
		expect(metadata.spanName).toBe('POST /graphql (query GetCurrentUser)')
		expect(metadata.headers['x-highlight-request']).toBe(
			'gql-session/gql-req',
		)
		expect(metadata.attributes['graphql.operation']).toBe(
			'query GetCurrentUser',
		)
	})

	it('defaults safely when GraphQL context omits req or headers', async () => {
		const context = createGraphQLMockContext({}, { fieldName: 'health' })
		const metadata = buildRequestMetadata(context)
		expect(metadata.spanName).toBe('POST /graphql (graphql health)')
		expect(metadata.headers).toEqual({})

		const interceptor = new HighlightInterceptor({ projectID: 'test-proj' })
		const next: CallHandler = {
			handle: () => of({ ok: true }),
		}
		const result = await lastValueFrom(interceptor.intercept(context, next))
		expect(result).toEqual({ ok: true })
	})

	it('propagates resolver errors in GraphQL execution contexts', async () => {
		const context = createGraphQLMockContext(
			{
				request: {
					method: 'POST',
					originalUrl: '/graphql',
					headers: {},
				},
			},
			{ fieldName: 'updateProfile' },
		)
		const interceptor = new HighlightInterceptor({ projectID: 'test-proj' })
		const boom = new Error('GraphQL resolver failure')
		const next: CallHandler = {
			handle: () => throwError(() => boom),
		}
		await expect(
			lastValueFrom(interceptor.intercept(context, next)),
		).rejects.toThrow('GraphQL resolver failure')
	})
})
