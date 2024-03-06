import { ConsoleMessage } from '../types/shared-types'
import { ConsoleMethods } from '../types/client'
import { patch, stringify } from '../utils/utils'
import ErrorStackParser from 'error-stack-parser'

export type StringifyOptions = {
	// limit of string length
	stringLengthLimit?: number
	/**
	 * limit of number of keys in an object
	 * if an object contains more keys than this limit, we would call its toString function directly
	 */
	numOfKeysLimit: number
	/**
	 * limit number of depth in an object
	 * if an object is too deep, toString process may cause browser OOM
	 */
	depthOfLimit: number
}

export type LogRecordOptions = {
	level: ConsoleMethods[]
	stringifyOptions: StringifyOptions
	/**
	 * Set to try to serialize console object arguments into the message body.
	 */
	serializeConsoleAttributes?: boolean
	logger: Logger | 'console'
}

export type Logger = {
	assert?: typeof console.assert
	clear?: typeof console.clear
	count?: typeof console.count
	countReset?: typeof console.countReset
	debug?: typeof console.debug
	dir?: typeof console.dir
	dirxml?: typeof console.dirxml
	error?: typeof console.error
	group?: typeof console.group
	groupCollapsed?: typeof console.groupCollapsed
	groupEnd?: () => void
	info?: typeof console.info
	log?: typeof console.log
	table?: typeof console.table
	time?: typeof console.time
	timeEnd?: typeof console.timeEnd
	timeLog?: typeof console.timeLog
	trace?: typeof console.trace
	warn?: typeof console.warn
}

export function ConsoleListener(
	callback: (c: ConsoleMessage) => void,
	logOptions: LogRecordOptions,
) {
	const loggerType = logOptions.logger
	if (!loggerType) {
		return () => {}
	}
	let logger: Logger
	if (typeof loggerType === 'string') {
		logger = window[loggerType]
	} else {
		logger = loggerType
	}
	const cancelHandlers: (() => void)[] = []

	// add listener to thrown errors
	if (logOptions.level.includes('error')) {
		if (window) {
			const errorHandler = (event: ErrorEvent) => {
				const { message, error } = event
				let trace: any[] = []
				if (error) {
					trace = ErrorStackParser.parse(error)
				}
				const payload = [
					stringify(message, logOptions.stringifyOptions),
				]
				callback({
					type: 'Error',
					trace,
					time: Date.now(),
					value: payload,
				})
			}
			window.addEventListener('error', errorHandler)
			cancelHandlers.push(() => {
				if (window) window.removeEventListener('error', errorHandler)
			})
		}
	}

	for (const levelType of logOptions.level) {
		cancelHandlers.push(replace(logger, levelType))
	}
	return () => {
		cancelHandlers.forEach((h) => h())
	}

	/**
	 * replace the original console function and record logs
	 * @param logger the logger object such as Console
	 * @param level the name of log function to be replaced
	 */
	function replace(_logger: Logger, level: ConsoleMethods) {
		if (!_logger[level]) {
			return () => {}
		}
		// replace the logger.{level}. return a restore function
		return patch(_logger, level, (original) => {
			return (...data: Array<any>) => {
				// @ts-expect-error
				original.apply(this, data)
				try {
					const trace = ErrorStackParser.parse(new Error())
					const message = logOptions.serializeConsoleAttributes
						? data.map((o) =>
								typeof o === 'object'
									? stringify(o, logOptions.stringifyOptions)
									: o,
						  )
						: data
								.filter((d) => typeof d !== 'object')
								.map((o) => `${o}`)
					callback({
						type: level,
						trace: trace.slice(1),
						value: message,
						attributes: data
							.filter((d) => typeof d === 'object')
							.reduce((a, b) => ({ ...a, ...b }), {}),
						time: Date.now(),
					})
				} catch (error) {
					original('highlight logger error:', error, ...data)
				}
			}
		})
	}
}
