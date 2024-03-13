export function isNodeJsRuntime() {
	return (
		typeof process.env.NEXT_RUNTIME === 'undefined' ||
		process.env.NEXT_RUNTIME === 'nodejs'
	)
}
