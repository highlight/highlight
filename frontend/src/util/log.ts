// Prints the statement to console log when running a development environment.
export default function log(from: string, ...data: any[]) {
	if (import.meta.env.DEV) {
		const prefix = `[${Date.now()}] - {${from}}`
		console.log.apply(console, [prefix, ...data])
	}
}
