import { H as NodeH, NodeOptions } from '@highlight-run/node'
import {
	ConsoleLogger,
	Catch,
	Inject,
	Injectable,
	HttpException,
	HttpStatus,
} from '@nestjs/common'
import type {
	ArgumentsHost,
	ExceptionFilter,
	HttpAdapterHost,
	OnApplicationShutdown,
} from '@nestjs/common'

@Catch()
export class HighlightErrorFilter
	implements ExceptionFilter, OnApplicationShutdown
{
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		@Inject(Symbol('HighlightModuleOptions'))
		readonly opts: NodeOptions,
	) {
		if (!NodeH.isInitialized()) {
			NodeH.init(opts)
		}
	}

	catch(exception: Error, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost

		const ctx = host.switchToHttp()
		const hCtx = NodeH.parseHeaders(ctx.getRequest().headers)

		NodeH.consumeError(exception, hCtx?.secureSessionId, hCtx?.requestId)

		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR

		const responseBody = {
			statusCode: httpStatus,
			timestamp: new Date().toISOString(),
			path: httpAdapter.getRequestUrl(ctx.getRequest()),
		}

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
	}

	async onApplicationShutdown(signal?: string) {
		await NodeH.flush()
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

export class HighlightModule {
	public static forRoot(options: NodeOptions) {
		if (!NodeH.isInitialized()) {
			NodeH.init(options)
		}
		return {
			exports: [HighlightLogger, HighlightErrorFilter],
			module: HighlightModule,
			providers: [HighlightLogger, HighlightErrorFilter],
		}
	}
	public static async forRootAsync(options: NodeOptions) {
		if (!NodeH.isInitialized()) {
			NodeH.init(options)
		}
		return {
			exports: [HighlightLogger, HighlightErrorFilter],
			module: HighlightModule,
			providers: [HighlightLogger, HighlightErrorFilter],
		}
	}
}

export { NodeH as H }
