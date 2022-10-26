const start = Date.now()
// Prints the statement to console log when running a development environment.
export default function log(from: string, ...data: any[]) {
	if (import.meta.env.DEV) {
		const prefix = `[${(Date.now() - start) / 100}] - {${from}}`
		console.log.apply(console, [prefix, ...data])
	}
}
