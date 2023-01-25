import {
	BackendErrorObjectInput,
	getSdk,
	InputMaybe,
	MetricInput,
	PushBackendPayloadMutationVariables,
	PushMetricsMutationVariables,
	Sdk,
} from './graph/generated/operations'
import ErrorStackParser from 'error-stack-parser'
import { GraphQLClient } from 'graphql-request'
import { NodeOptions } from './types.js'
import { ErrorContext } from './errorContext.js'

// Represents a stack frame with added lines of source code
// before, after, and for the line of the current error
export interface StackFrameWithSource
	extends Pick<
		StackFrame,
		| 'args'
		| 'evalOrigin'
		| 'isConstructor'
		| 'isEval'
		| 'isNative'
		| 'isToplevel'
		| 'columnNumber'
		| 'lineNumber'
		| 'fileName'
		| 'functionName'
		| 'source'
	> {
	lineContent?: string
	linesBefore?: string
	linesAfter?: string
}

export class Highlight {
	readonly FLUSH_TIMEOUT = 10
	readonly BACKEND_SETUP_TIMEOUT = 15 * 60 * 1000
	_graphqlSdk: Sdk
	_backendUrl: string
	_intervalFunction: ReturnType<typeof setInterval>
	errors: Array<InputMaybe<BackendErrorObjectInput>> = []
	metrics: Array<InputMaybe<MetricInput>> = []
	lastBackendSetupEvent: number = 0
	_errorContext: ErrorContext | undefined
	_projectID: string

	constructor(options: NodeOptions) {
		this._backendUrl = options.backendUrl || 'https://pub.highlight.run'
		const client = new GraphQLClient(this._backendUrl, {
			headers: {},
		})
		this._graphqlSdk = getSdk(client)
		this._intervalFunction = setInterval(
			() => this.flush(),
			this.FLUSH_TIMEOUT * 1000,
		)
		if (!options.disableErrorSourceContext) {
			this._errorContext = new ErrorContext({
				sourceContextCacheSizeMB: options.errorSourceContextCacheSizeMB,
			})
		}
		this._projectID = options.projectID
	}

	recordMetric(
		secureSessionId: string,
		name: string,
		value: number,
		requestId?: string,
		tags?: { name: string; value: string }[],
	) {
		this.metrics.push({
			session_secure_id: secureSessionId,
			group: requestId,
			name: name,
			value: value,
			category: 'BACKEND',
			timestamp: new Date().toISOString(),
			tags: tags,
		})
	}

	consumeCustomError(
		error: Error,
		secureSessionId: string | undefined,
		requestId: string | undefined,
	) {
		let res: StackFrameWithSource[] = []
		try {
			res = ErrorStackParser.parse(error)
			res = res.map((frame) => {
				try {
					if (
						frame.fileName !== undefined &&
						frame.lineNumber !== undefined
					) {
						const context =
							this._errorContext?.getStackFrameContext(
								frame.fileName,
								frame.lineNumber,
							)
						return { ...frame, ...context }
					}
				} catch {}

				// If the frame doesn't have filename or line number defined, or
				// an error was thrown while getting the stack frame context, return
				// the original frame.
				return frame
			})
		} catch {}
		this.errors.push({
			event: error.message
				? `${error.name}: ${error.message}`
				: `${error.name}`,
			request_id: requestId,
			session_secure_id: secureSessionId,
			source: '',
			stackTrace: JSON.stringify(res),
			timestamp: new Date().toISOString(),
			type: 'BACKEND',
			url: '',
		})
	}

	consumeCustomEvent(secureSessionId: string) {
		const sendBackendSetup =
			Date.now() - this.lastBackendSetupEvent > this.BACKEND_SETUP_TIMEOUT
		if (sendBackendSetup) {
			this._graphqlSdk
				.MarkBackendSetup({
					session_secure_id: secureSessionId,
				})
				.then(() => {
					this.lastBackendSetupEvent = Date.now()
				})
				.catch((e) => {
					console.warn('highlight-node error: ', e)
				})
		}
	}

	async flushErrors() {
		if (this.errors.length === 0) {
			return
		}
		const variables: PushBackendPayloadMutationVariables = {
			errors: this.errors,
		}
		this.errors = []
		try {
			await this._graphqlSdk.PushBackendPayload(variables)
		} catch (e) {
			console.warn('highlight-node pushErrors error: ', e)
		}
	}

	async flushMetrics() {
		if (this.metrics.length === 0) {
			return
		}
		const variables: PushMetricsMutationVariables = {
			metrics: this.metrics,
		}
		this.metrics = []
		try {
			await this._graphqlSdk.PushMetrics(variables)
		} catch (e) {
			console.warn('highlight-node pushMetrics error: ', e)
		}
	}

	async flush() {
		await Promise.all([this.flushErrors(), this.flushMetrics()])
	}
}
