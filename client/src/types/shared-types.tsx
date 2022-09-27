import StackTrace from 'stacktrace-js'

export type ConsoleMessage = {
	value?: Array<any> | string
	time: number
	type: string
	trace?: StackTrace.StackFrame[]
}

export type ErrorMessage = {
	event: string
	type: 'console.error' | 'window.onerror' | 'custom'
	url: string
	source: string
	lineNumber: number
	columnNumber: number
	stackTrace: StackTrace.StackFrame[]
	/** The Unix Time of when the error was thrown. */
	timestamp: string
	payload?: string
}
