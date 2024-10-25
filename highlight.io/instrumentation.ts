// instrumentation.ts or src/instrumentation.ts

export async function register() {
	const { registerHighlight } = await import('@highlight-run/next/server')

	registerHighlight({
		projectID: '4d7k1xeo',
		serviceName: 'highlight.io-next-backend',
	})
}
