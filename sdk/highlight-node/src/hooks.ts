// inspired by https://github.com/getsentry/sentry-javascript/issues/5639

export function hookOutput(
	writer: 'stdout' | 'stderr',
	callback: (buffer: string) => void,
) {
	let old_write = process[writer].write

	process[writer].write = (str: string, enc: any, cb?: any) => {
		callback(str)
		return old_write.apply(old_write, [str, enc, cb])
	}

	return () => {
		process[writer].write = old_write
	}
}

interface ConsolePayload {
	date: Date
	level: string
	message: string
	stack: object
}

type ConsoleFn = (...data: any) => void

let consoleHooked = false

export function hookConsole(cb: (cb: ConsolePayload) => void) {
	if (consoleHooked) return
	consoleHooked = true
	const levels = [
		'debug',
		'info',
		'log',
		'count',
		'dir',
		'warn',
		'assert',
		'error',
		'trace',
	] as (keyof Console)[]
	for (const level of levels) {
		const origWrite = console[level] as ConsoleFn
		;(console[level] as ConsoleFn) = function (...data: any[]) {
			const date = new Date()
			try {
				return origWrite(...data)
			} finally {
				const o: { stack: any } = { stack: {} }
				const saveTraceLimit = Error.stackTraceLimit
				Error.stackTraceLimit = 3
				Error.captureStackTrace(o)
				Error.stackTraceLimit = saveTraceLimit
				cb({
					date,
					level,
					message: data.join('\n'),
					stack: o.stack,
				})
			}
		}
	}
}
