import { H as NodeH, NodeOptions } from '@highlight-run/node'
import type { OnApplicationShutdown } from '@nestjs/common'
import {
	CallHandler,
	ConsoleLogger,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
} from '@nestjs/common'
import api from '@opentelemetry/api'
import { finalize, Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

type ExecutionContextType = 'http' | 'graphql' | 'rpc' | 'ws' | string

interface ExtractedRequestMetadata {
	spanName: string
	headers: Record<string, string | string[] | undefined>
	attributes: Record<string, string>
}

interface HttpLikeRequest {
	method?: string
	url?: string
	originalUrl?: string
	headers?: Record<string, string | string[] | undefined>
}

interface GraphQLExecutionInfo {
	fieldName?: string
	operation?: {
		operation?: string
		name?: {
			value?: string
		}
	}
}

function extractGraphQLContextRequest(
	context: ExecutionContext,
): HttpLikeRequest | undefined {
	if (typeof context.getArgByIndex !== 'function') {
		return undefined
	}
	const gqlContext = context.getArgByIndex(2) as
		| { req?: HttpLikeRequest; request?: HttpLikeRequest }
		| undefined
	if (!gqlContext) {
		return undefined
	}
	return gqlContext.req ?? gqlContext.request
}

function extractHttpContextRequest(
	context: ExecutionContext,
): HttpLikeRequest | undefined {
	const httpHost = context.switchToHttp()
	if (!httpHost || typeof httpHost.getRequest !== 'function') {
		return undefined
	}
	return httpHost.getRequest<HttpLikeRequest>()
}

/**
 * Resolves the underlying HTTP request object from either a standard NestJS
 * HTTP context or a GraphQL execution context (`context.getArgByIndex(2)`),
 * avoiding a mandatory peer dependency on `@nestjs/graphql`.
 */
export function resolveRequestFromContext(
	context: ExecutionContext,
): HttpLikeRequest | undefined {
	const contextType = context.getType<ExecutionContextType>()
	if (contextType === 'graphql') {
		return (
			extractGraphQLContextRequest(context) ??
			extractHttpContextRequest(context)
		)
	}
	return extractHttpContextRequest(context)
}

function extractOperationName(info: GraphQLExecutionInfo): string | undefined {
	const explicitName = info.operation?.name?.value
	if (explicitName) {
		return explicitName
	}
	return info.fieldName
}

function resolveGraphQLOperationLabel(context: ExecutionContext): string {
	if (typeof context.getArgByIndex !== 'function') {
		return 'graphql'
	}
	const info = context.getArgByIndex(3) as GraphQLExecutionInfo | undefined
	if (!info) {
		return 'graphql'
	}
	const opType = info.operation?.operation ?? 'graphql'
	const opName = extractOperationName(info)
	return opName ? `${opType} ${opName}` : opType
}

function resolveMethodAndUrl(
	request: HttpLikeRequest | undefined,
	isGraphQL: boolean,
): { method: string; url: string } {
	const defaultMethod = isGraphQL ? 'POST' : 'UNKNOWN'
	const defaultUrl = isGraphQL ? '/graphql' : '/'
	if (!request) {
		return { method: defaultMethod, url: defaultUrl }
	}
	return {
		method: request.method ?? defaultMethod,
		url: request.url ?? request.originalUrl ?? defaultUrl,
	}
}

/**
 * Builds OpenTelemetry span metadata and incoming trace headers across HTTP
 * and GraphQL execution contexts while guarding against undefined request objects.
 */
export function buildRequestMetadata(
	context: ExecutionContext,
): ExtractedRequestMetadata {
	const isGraphQL = context.getType<ExecutionContextType>() === 'graphql'
	const request = resolveRequestFromContext(context)
	const { method, url } = resolveMethodAndUrl(request, isGraphQL)
	const headers = request && request.headers ? request.headers : {}
	const attributes: Record<string, string> = {
		'http.method': method,
		'http.url': url,
	}

	if (isGraphQL) {
		const gqlLabel = resolveGraphQLOperationLabel(context)
		attributes['graphql.operation'] = gqlLabel
		return {
			spanName: `${method} ${url} (${gqlLabel})`,
			headers,
			attributes,
		}
	}

	return {
		spanName: `${method} ${url}`,
		headers,
		attributes,
	}
}

function ensureHighlightInitialized(options: NodeOptions): void {
	if (!NodeH.isInitialized()) {
		NodeH.init(options)
	}
}

@Injectable()
export class HighlightLogger
	extends ConsoleLogger
	implements OnApplicationShutdown
{
	constructor(
		@Inject(Symbol('HighlightModuleOptions'))
		readonly opts: NodeOptions,
	) {
		super()
		ensureHighlightInitialized(opts)
	}

	log(message: string, ...optionalParams: any[]) {
		try {
			super.log(message, ...optionalParams)
			NodeH.log(message, 'info')
		} catch (err) {
			NodeH._debug('failed to print log', err)
		}
	}

	error(message: string, ...optionalParams: any[]) {
		try {
			super.error(message, ...optionalParams)
			NodeH.log(message, 'error')
		} catch (err) {
			NodeH._debug('failed to print error', err)
		}
	}

	warn(message: string, ...optionalParams: any[]) {
		try {
			super.warn(message, ...optionalParams)
			NodeH.log(message, 'warn')
		} catch (err) {
			NodeH._debug('failed to print warn', err)
		}
	}

	debug(message: string, ...optionalParams: any[]) {
		try {
			super.debug(message, ...optionalParams)
			NodeH.log(message, 'debug')
		} catch (err) {
			NodeH._debug('failed to print debug', err)
		}
	}

	verbose(message: string, ...optionalParams: any[]) {
		try {
			super.verbose(message, ...optionalParams)
			NodeH.log(message, 'trace')
		} catch (err) {
			NodeH._debug('failed to print verbose', err)
		}
	}

	async onApplicationShutdown(signal?: string) {
		await NodeH.flush()
	}
}

@Injectable()
export class HighlightInterceptor
	implements NestInterceptor, OnApplicationShutdown
{
	constructor(
		@Inject(Symbol('HighlightModuleOptions'))
		readonly opts: NodeOptions,
	) {
		ensureHighlightInitialized(opts)
	}

	async onApplicationShutdown(signal?: string) {
		await NodeH.flush()
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const metadata = buildRequestMetadata(context)
		const { span: requestSpan, ctx: spanCtx } = NodeH.startWithHeaders(
			metadata.spanName,
			metadata.headers,
			{
				attributes: metadata.attributes,
			},
		)
		const fn = api.context.bind(spanCtx, () =>
			next.handle().pipe(
				catchError((err) => {
					NodeH.consumeError(
						err,
						undefined,
						undefined,
						{},
						{ span: requestSpan },
					)
					return throwError(() => err)
				}),
				finalize(() => {
					requestSpan.end()
				}),
			),
		)
		return fn()
	}
}

export class HighlightModule {
	private static buildModuleDefinition(options: NodeOptions) {
		ensureHighlightInitialized(options)
		return {
			exports: [HighlightLogger, HighlightInterceptor],
			module: HighlightModule,
			providers: [HighlightLogger, HighlightInterceptor],
		}
	}

	public static forRoot(options: NodeOptions) {
		return HighlightModule.buildModuleDefinition(options)
	}

	public static async forRootAsync(options: NodeOptions) {
		return HighlightModule.buildModuleDefinition(options)
	}
}

export { NodeH as H }
