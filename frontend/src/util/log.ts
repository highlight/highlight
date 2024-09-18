const verboseLoggingKey = `highlight-verbose-logging-enabled`
const verboseLogging = window.localStorage.getItem(verboseLoggingKey)
if (!verboseLogging) {
	window.localStorage.setItem(verboseLoggingKey, 'false')
}
export const verboseLoggingEnabled = verboseLogging === 'true'
const start = Date.now()
// Prints the statement to console log when running a development environment.
export default function log(from: string, ...data: any[]) {
	if (verboseLoggingEnabled) {
		const prefix = `[${(Date.now() - start) / 1000}s] - {${from}}`
		console.log.apply(console, [prefix, ...data])
	}
}
