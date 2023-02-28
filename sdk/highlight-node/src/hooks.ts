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

function getConsoleSymbol(name: string) {
	/*
	 * The symbols of functions in the console module are somehow not in the
	 * global registry.  So we need to use this hack to get the real symbols
	 * for monkey patching.
	 */
	const symString = Symbol.for(name).toString()
	return Object.getOwnPropertySymbols(console).filter(
		(x) => x.toString() === symString,
	)[0]
}

interface ConsolePayload {
	date: Date
	level: string
	message: string
	file: string | null
}

export function hookConsole(cb: (cb: ConsolePayload) => void) {
	/*
	 * This is highly Node specific but it maintains console logging,
	 * devtools logging with correct file:lineno references, and allows
	 * us to support file logging and logging windows.
	 */
	process.env.TERM = 'dumb' // Prevent color tty commands
	let curLogLevel: any
	const descriptors = Object.getOwnPropertyDescriptors(console)
	const levels = {
		debug: 'debug',
		info: 'info',
		log: 'info',
		count: 'info',
		dir: 'info',
		warn: 'warn',
		assert: 'warn',
		error: 'error',
		trace: 'error',
	}
	for (const [fn, level] of Object.entries(levels)) {
		Object.defineProperty(console, fn, {
			enumerable: descriptors[fn].enumerable,
			get: () => ((curLogLevel = level), descriptors[fn].value),
		})
	}
	const kWriteToConsoleSymbol = getConsoleSymbol('kWriteToConsole')
	// @ts-ignore
	const kWriteToConsoleFunction = console[kWriteToConsoleSymbol]
	// @ts-ignore
	console[kWriteToConsoleSymbol] = function (useStdErr, message) {
		try {
			return kWriteToConsoleFunction.call(this, useStdErr, message)
		} finally {
			const o: any = {}
			const saveTraceLimit = Error.stackTraceLimit
			Error.stackTraceLimit = 3
			Error.captureStackTrace(o)
			Error.stackTraceLimit = saveTraceLimit
			const stack = o.stack
			const fileMatch = stack.match(/([^/\\: (]+:[0-9]+):[0-9]+\)?$/)
			if (!fileMatch) {
				debugger
			}
			cb({
				date: new Date(),
				level: curLogLevel,
				message,
				file: fileMatch ? fileMatch[1] : null,
			})
		}
	}
}
