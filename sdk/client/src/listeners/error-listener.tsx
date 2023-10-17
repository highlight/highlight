import { ErrorMessage } from '../types/shared-types'
import stringify from 'json-stringify-safe'
import ErrorStackParser from 'error-stack-parser'

interface HighlightPromise<T> extends Promise<T> {
	promiseCreationError: Error
	getStack(): Error | undefined
}

function handleError(
	callback: (e: ErrorMessage) => void,
	event: any,
	source: string | undefined,
	error: Error,
) {
	const res = ErrorStackParser.parse(error)
	if (event instanceof Error) {
		event = event.message
	}
	const framesToUse = removeHighlightFrameIfExists(res)
	callback({
		event: stringify(event),
		type: 'window.onerror',
		url: window.location.href,
		source: source ?? '',
		lineNumber: framesToUse[0]?.lineNumber ? framesToUse[0]?.lineNumber : 0,
		columnNumber: framesToUse[0]?.columnNumber
			? framesToUse[0]?.columnNumber
			: 0,
		stackTrace: framesToUse,
		timestamp: new Date().toISOString(),
	})
}

export const ErrorListener = (callback: (e: ErrorMessage) => void) => {
	if (typeof window === 'undefined') return () => {}

	const initialOnError = (window.onerror = (
		event: any,
		source: string | undefined,
		lineno: number | undefined,
		colno: number | undefined,
		error: Error | undefined,
	): void => {
		handleError(callback, event, source, error ?? Error())
	})

	const initialOnUnhandledRejection = (window.onunhandledrejection = (
		event: PromiseRejectionEvent,
	) => {
		if (event.reason) {
			const hPromise = event.promise as HighlightPromise<any>
			if (hPromise.getStack) {
				handleError(
					callback,
					event.reason,
					event.type,
					hPromise.getStack() ?? Error(),
				)
			} else {
				handleError(callback, event.reason, event.type, Error())
			}
		}
	})

	const initialPromise = window.Promise.constructor
	window.Promise.constructor = function (
		executor: (
			resolve: (value: any | PromiseLike<any>) => void,
			reject: (reason?: any) => void,
		) => void,
	) {
		// @ts-ignore
		this.promiseCreationError = new Error()
		initialPromise(executor)
	}

	// @ts-ignore
	window.Promise.prototype.getStack = function () {
		// @ts-ignore
		return this.promiseCreationError
	}

	return () => {
		window.Promise.constructor = initialPromise
		window.onunhandledrejection = initialOnUnhandledRejection
		window.onerror = initialOnError
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
		(firstFrame.functionName === 'console.error' &&
			firstFrame.fileName?.includes('highlight.run')) ||
		firstFrame.functionName === 'new HighlightPromise'
	) {
		return frames.slice(1)
	}
	return frames
}
