import StackTrace from 'stacktrace-js'

export type ConsoleMessage = {
	value?: Array<string>
	attributes?: string
	time: number
	type: string
	trace?: StackTrace.StackFrame[]
}

export type ErrorMessageType =
	| 'console.error'
	| 'window.onerror'
	| 'window.onunhandledrejection'
	| 'custom'
	| 'React.ErrorBoundary'

export type ErrorMessage = {
	event: string
	type: ErrorMessageType
	url: string
	source: string
	lineNumber: number
	columnNumber: number
	stackTrace: StackTrace.StackFrame[]
	/** The Unix Time of when the error was thrown. */
	timestamp: string
	payload?: string
}
