const start = Date.now()
export default function log(from: string, ...data: any[]) {
	const prefix = `[Highlight Node.js ${
		(Date.now() - start) / 1000
	}s] - {${from}}`
	console.log.apply(console, [prefix, ...data])
}
