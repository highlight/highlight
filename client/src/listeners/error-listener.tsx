import { ErrorMessage } from '../types/shared-types'
import stringify from 'json-stringify-safe'
import ErrorStackParser from 'error-stack-parser'

export const ErrorListener = (callback: (e: ErrorMessage) => void) => {
	const initialOnError = window.onerror
	window.onerror = (
		event: any,
		source: string | undefined,
		lineno: number | undefined,
		colno: number | undefined,
		error: Error | undefined,
	): void => {
		if (error) {
			let res: ErrorStackParser.StackFrame[] = []

			try {
				res = ErrorStackParser.parse(error)
			} catch {} // @eslint-ignore
			const framesToUse = removeHighlightFrameIfExists(res)
			callback({
				event: stringify(event),
				type: 'window.onerror',
				url: window.location.href,
				source: source ? source : '',
				lineNumber: framesToUse[0]?.lineNumber
					? framesToUse[0]?.lineNumber
					: 0,
				columnNumber: framesToUse[0]?.columnNumber
					? framesToUse[0]?.columnNumber
					: 0,
				stackTrace: framesToUse,
				timestamp: new Date().toISOString(),
			})
		}
	}
	return () => {
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
		firstFrame.functionName === 'console.error' &&
		firstFrame.fileName?.includes('highlight.run')
	) {
		return frames.slice(1)
	}
	return frames
}
