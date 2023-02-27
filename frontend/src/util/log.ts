const start = Date.now()
// Prints the statement to console log when running a development environment.
export default function log(from: string, ...data: any[]) {
	if (import.meta.env.DEV || window.location.href.includes('onrender')) {
		const prefix = `[${(Date.now() - start) / 1000}s] - {${from}}`
		console.log.apply(console, [prefix, ...data])
	}
}
