import { Highlight } from '@highlight-run/next'

export const withHighlight = Highlight({
	projectID: '1jdkoe52',
	debug: true,
	backendUrl: 'http://localhost:8082/public',
	otlpEndpoint: 'http://localhost:4318',
})
