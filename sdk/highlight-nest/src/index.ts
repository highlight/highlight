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

// GraphQL requests run through a different execution context than REST.
// We resolve GqlExecutionContext lazily so consumers who don't use GraphQL
// don't need @nestjs/graphql installed (avoids a hard peer-dependency conflict
// on NestJS 10, where @nestjs/graphql@11+ requires NestJS 11).
function getGraphQLContext(context: ExecutionContext): {
	req: any
	info: any
} | null {
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { GqlExecutionContext } = require('@nestjs/graphql')
		const gqlCtx = GqlExecutionContext.create(context)
		const req = gqlCtx.getContext()?.req
		if (req) {
			return { req, info: gqlCtx.getInfo() }
		}
	} catch {
		// @nestjs/graphql not installed — not a GraphQL request
	}
	return null
}

function describeContext(context: ExecutionContext): {
	name: string
	headers: Record<string, any>
	attributes: Record<string, any>
} {
	const gql = getGraphQLContext(context)
	if (gql) {
		const op: any = gql.info
		const operationName =
			op?.operationName || op?.fieldName || 'graphql'
		const operationType = op?.operation?.operation || 'query'
		return {
			name: `graphql.${operationType} ${operationName}`,
			headers: gql.req.headers || {},
			attributes: {
				'graphql.operation.name': operationName,
				'graphql.operation.type': operationType,
				'http.method': (gql.req.method as string) || 'POST',
				'http.url': (gql.req.url as string) || '',
			},
		}
	}

	const ctx = context.switchToHttp()
	const request = ctx.getRequest()
	const method: string = request.method
	const url: string = request.url
	return {
		name: `${method} ${url}`,
		headers: request.headers || {},
		attributes: {
			'http.method': method,
			'http.url': url,
		},
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
		const { name, headers, attributes } = describeContext(context)

		const { span: requestSpan, ctx: spanCtx } = NodeH.startWithHeaders(
			name,
			headers,
			{
				attributes,
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
