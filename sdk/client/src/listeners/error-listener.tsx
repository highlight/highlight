import { ErrorMessage } from '../types/shared-types'
import stringify from 'json-stringify-safe'
import ErrorStackParser from 'error-stack-parser'

const g = typeof window !== 'undefined' ? window : global

class HighlightPromise<T> extends g.Promise<T> {
	private readonly promiseCreationError: Error
	constructor(
		executor: (
			resolve: (value: T | PromiseLike<T>) => void,
			reject: (reason?: any) => void,
		) => void,
	) {
		super(executor)
		this.promiseCreationError = new Error()
	}

	getStack(): Error {
		return this.promiseCreationError
	}
}

function handleError(
	callback: (e: ErrorMessage) => void,
	event: any,
	source: string | undefined,
	error: Error,
) {
	let res: ErrorStackParser.StackFrame[] = []

	try {
		res = ErrorStackParser.parse(error)
	} catch {} // @eslint-ignore
	const framesToUse = removeHighlightFrameIfExists(res)
	callback({
		event: stringify(event),
		type: 'window.onerror',
		url: g.location.href,
		source: source ? source : '',
		lineNumber: framesToUse[0]?.lineNumber ? framesToUse[0]?.lineNumber : 0,
		columnNumber: framesToUse[0]?.columnNumber
			? framesToUse[0]?.columnNumber
			: 0,
		stackTrace: framesToUse,
		timestamp: new Date().toISOString(),
	})
}

export const ErrorListener = (callback: (e: ErrorMessage) => void) => {
	const initialOnError = g.onerror
	const initialOnUnhandledRejection = g.onunhandledrejection
	const initialPromise = g.Promise

	g.onerror = (
		event: any,
		source: string | undefined,
		lineno: number | undefined,
		colno: number | undefined,
		error: Error | undefined,
	): void => {
		if (error) {
			handleError(callback, event, source, error)
		}
	}
	g.onunhandledrejection = function (event: PromiseRejectionEvent): void {
		if (event.reason) {
			const hPromise = event.promise as
				| Promise<any>
				| HighlightPromise<any>
			if (hPromise instanceof HighlightPromise) {
				handleError(callback, event, event.type, hPromise.getStack())
			} else {
				handleError(callback, event, event.type, Error())
			}
		}
	}
	g.Promise = HighlightPromise
	return () => {
		g.Promise = initialPromise
		g.onunhandledrejection = initialOnUnhandledRejection
		g.onerror = initialOnError
	}
}

const removeHighlightFrameIfExists = (
	frames: ErrorStackParser.StackFrame[],
): ErrorStackParser.StackFrame[] => {
	if (frames.length === 0) {
		return frames
	}

	const firstFrame = frames[0]
	if (
		firstFrame.functionName === 'console.error' &&
		firstFrame.fileName?.includes('highlight.run')
	) {
		return frames.slice(1)
	}
	return frames
}
