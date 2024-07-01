import { ErrorMessage } from '../types/shared-types'
import stringify from 'json-stringify-safe'
import ErrorStackParser from 'error-stack-parser'
import { HighlightOptions } from '../types/types'
import { HighlightClassOptions } from '../index'

interface HighlightPromise<T> extends Promise<T> {
	promiseCreationError: Error
	getStack(): Error | undefined
}

function handleError(
	callback: (e: ErrorMessage) => void,
	event: any,
	source: string | undefined,
	error?: Error,
) {
	let res: ErrorStackParser.StackFrame[] = []
	try {
		res = ErrorStackParser.parse(error ?? event)
	} catch (e) {
		res = ErrorStackParser.parse(new Error())
	}
	let payload: Object = {}
	if (event instanceof Error) {
		event = event.message
		if (event.cause) {
			payload = { 'exception.cause': event.cause }
		}
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
		payload: payload ? stringify(payload) : undefined,
	})
}

export const ErrorListener = (
	callback: (e: ErrorMessage) => void,
	{ enablePromisePatch }: { enablePromisePatch: boolean },
) => {
	if (typeof window === 'undefined') return () => {}

	const initialOnError = (window.onerror = (
		event: any,
		source: string | undefined,
		lineno: number | undefined,
		colno: number | undefined,
		error: Error | undefined,
	): void => {
		handleError(callback, event, source, error)
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
					hPromise.getStack(),
				)
			} else {
				handleError(callback, event.reason, event.type)
			}
		}
	})

	const initialPromise = window.Promise
	const highlightPromise = class Promise<T> extends initialPromise<T> {
		private readonly promiseCreationError: Error

		constructor(
			executor: (
				resolve: (value: T | PromiseLike<T>) => void,
				reject: (reason?: Error) => void,
			) => void,
		) {
			super(executor)
			this.promiseCreationError = new Error()
		}

		getStack() {
			return this.promiseCreationError
		}

		static shouldPatch() {
			// @ts-ignore
			const zoneUndefined = typeof window.Zone === 'undefined'
			return enablePromisePatch && zoneUndefined
		}
	}
	if (highlightPromise.shouldPatch()) {
		window.Promise = highlightPromise
	}
	return () => {
		window.Promise = initialPromise
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
		firstFrame.fileName?.includes('highlight.run') ||
		firstFrame.fileName?.includes('highlight.io') ||
		firstFrame.functionName === 'new highlightPromise'
	) {
		return frames.slice(1)
	}
	return frames
}
