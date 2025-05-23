import { EdgeHighlight } from '@highlight-run/next/server'

export const withEdgeRouterHighlight = EdgeHighlight({
	projectID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID!,
	serviceName: 'highlight.io',
	otlpEndpoint: 'https://otel.observability.app.launchdarkly.com',
})
