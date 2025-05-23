// instrumentation.ts or src/instrumentation.ts

export async function register() {
	const { registerHighlight } = await import('@highlight-run/next/server')

	registerHighlight({
		projectID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID!,
		serviceName: 'highlightio-nextjs-backend',
		otlpEndpoint: 'https://otel.observability.app.launchdarkly.com',
	})
}
