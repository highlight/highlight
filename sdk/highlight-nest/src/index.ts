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
import type { IncomingHttpHeaders } from 'http'
import { finalize, Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

type RequestHeaders = Headers | IncomingHttpHeaders

type RequestLike = {
	headers?: RequestHeaders
	method?: string
	originalUrl?: string
	url?: string
}

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null

const getRequestFromContext = (context: ExecutionContext): RequestLike => {
	const httpRequest = context
		.switchToHttp()
		.getRequest<RequestLike | undefined>()
	if (isObject(httpRequest)) {
		return httpRequest
	}

	const gqlContext = context.getArgByIndex<unknown>(2)
	if (isObject(gqlContext)) {
		const request = gqlContext.req ?? gqlContext.request
		if (isObject(request)) {
			return request
		}
	}

	return {}
}

const getFallbackUrl = (context: ExecutionContext) => {
	const className = context.getClass()?.name
	const handlerName = context.getHandler()?.name

	return [className, handlerName].filter(Boolean).join('.') || 'unknown'
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
		if (!NodeH.isInitialized()) {
			NodeH.init(opts)
		}
	}

	log(message: string, context?: string, asBreadcrumb?: boolean) {
		try {
			super.log(message, context)
			NodeH.log(message, 'info')
		} catch (err) {
			NodeH._debug('failed to print log', err)
		}
	}

	error(message: string, trace?: string, context?: string) {
		try {
			super.error(message, trace, context)
			NodeH.log(message, 'error')
		} catch (err) {
			NodeH._debug('failed to print error', err)
		}
	}

	warn(message: string, context?: string, asBreadcrumb?: boolean) {
		try {
			super.warn(message, context)
			NodeH.log(message, 'warn')
		} catch (err) {
			NodeH._debug('failed to print warn', err)
		}
	}

	debug(message: string, context?: string, asBreadcrumb?: boolean) {
		try {
			super.debug(message, context)
			NodeH.log(message, 'debug')
		} catch (err) {
			NodeH._debug('failed to print debug', err)
		}
	}

	verbose(message: string, context?: string, asBreadcrumb?: boolean) {
		try {
			super.verbose(message, context)
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
		if (!NodeH.isInitialized()) {
			NodeH.init(opts)
		}
	}

	async onApplicationShutdown(signal?: string) {
		await NodeH.flush()
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = getRequestFromContext(context)
		const method =
			request.method ?? context.getType<string>()?.toUpperCase()
		const url =
			request.originalUrl ?? request.url ?? getFallbackUrl(context)

		const { span: requestSpan, ctx: spanCtx } = NodeH.startWithHeaders(
			[method, url].filter(Boolean).join(' '),
			request.headers ?? {},
			{
				attributes: {
					'http.method': method,
					'http.url': url,
				},
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
	public static forRoot(options: NodeOptions) {
		if (!NodeH.isInitialized()) {
			NodeH.init(options)
		}
		return {
			exports: [HighlightLogger, HighlightInterceptor],
			module: HighlightModule,
			providers: [HighlightLogger, HighlightInterceptor],
		}
	}
	public static async forRootAsync(options: NodeOptions) {
		if (!NodeH.isInitialized()) {
			NodeH.init(options)
		}
		return {
			exports: [HighlightLogger, HighlightInterceptor],
			module: HighlightModule,
			providers: [HighlightLogger, HighlightInterceptor],
		}
	}
}

export { NodeH as H }
