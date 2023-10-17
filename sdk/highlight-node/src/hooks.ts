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

const ConsoleLevels = {
	debug: 'debug',
	info: 'info',
	log: 'info',
	count: 'info',
	dir: 'info',
	warn: 'warn',
	assert: 'warn',
	error: 'error',
	trace: 'trace',
} as const

interface ConsolePayload {
	date: Date
	level: keyof typeof ConsoleLevels
	message: string
	stack: object
}

type ConsoleFn = (...data: any) => void

let consoleHooked = false

export function safeStringify(obj: any): string {
	function replacer(input: any): any {
		if (input && typeof input === 'object') {
			for (let k in input) {
				if (typeof input[k] === 'object') {
					replacer(input[k])
				} else if (!canStringify(input[k])) {
					input[k] = input[k].toString()
				}
			}
		}
		return input
	}

	function canStringify(value: any): boolean {
		try {
			JSON.stringify(value)
			return true
		} catch (e) {
			return false
		}
	}

	return JSON.stringify(replacer(obj))
}

export function hookConsole(
	methodsToRecord: string[] | undefined,
	cb: (cb: ConsolePayload) => void,
) {
	if (consoleHooked) return
	consoleHooked = true
	for (const [level, highlightLevel] of Object.entries(ConsoleLevels)) {
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
				Error.captureStackTrace(o)
				cb({
					date,
					level: highlightLevel,
					message: data
						.map((o) =>
							typeof o === 'object' ? safeStringify(o) : o,
						)
						.join(' '),
					stack: o.stack,
				})
			}
		}
	}
}
