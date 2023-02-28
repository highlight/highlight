import { NodeOptions } from './types.js'
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

export function hookConsole(
	methodsToRecord: string[] | undefined,
	cb: (cb: ConsolePayload) => void,
) {
	if (consoleHooked) return
	consoleHooked = true
	const levels = {
		debug: 'debug',
		info: 'info',
		log: 'info',
		count: 'info',
		dir: 'info',
		warn: 'warn',
		assert: 'warn',
		error: 'error',
		trace: 'trace',
	} as { [k in keyof Console]: string }
	for (const [level, highlightLevel] of Object.entries(levels)) {
		if (methodsToRecord?.length && methodsToRecord.indexOf(level) === -1) {
			continue
		}
		const origWrite = console[level as keyof Console] as ConsoleFn
		;(console[level as keyof Console] as ConsoleFn) = function (
			...data: any[]
		) {
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
					level: highlightLevel,
					message: data.join('\n'),
					stack: o.stack,
				})
			}
		}
	}
}
