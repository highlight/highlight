interface MyGlobal extends Window {
	EdgeRuntime?: string
}

declare var globalThis: MyGlobal

export function isNodeJsRuntime() {
	return (
		typeof globalThis.EdgeRuntime !== 'string' &&
		(typeof process.env.NEXT_RUNTIME === 'undefined' ||
			process.env.NEXT_RUNTIME === 'nodejs')
	)
}
