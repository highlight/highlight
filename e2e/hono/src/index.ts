import { highlightMiddleware } from '@highlight-run/hono'
import { serve } from '@hono/node-server'
import { trace } from '@opentelemetry/api'
import { Hono } from 'hono'
import { html } from 'hono/html'
import { logger } from 'hono/logger'

const app = new Hono()

app.use(
	'*',
	highlightMiddleware({
		projectID: '1jdkoe52',
		serviceName: 'hono-e2e-example',
		otlpEndpoint: 'http://localhost:4318',
	}),
)

// Add logging middleware to test log collection.
app.use(logger())

const layout = (
	content: ReturnType<typeof html>,
	traceId: string,
	spanId: string,
) => html`
	<!doctype html>
	<html>
		<head>
			<title>Hono API Tester</title>
			<meta name="traceparent" content="00-${traceId}-${spanId}-01" />

			<script src="https://unpkg.com/highlight.run"></script>
			<script>
				H.init('1jdkoe52', {
					serviceName: 'hono-e2e-example',
					backendUrl: 'https://localhost:8082/public',
					networkRecording: {
						record: true,
						recordHeadersAndBody: true,
					},
					tracingOrigins: true,
					otlpEndpoint: 'http://localhost:4318',
				})

				async function makeRequest(endpoint) {
					const resultDiv = document.getElementById('result')
					try {
						const response = await fetch(endpoint)
						const data = await response.json()
						resultDiv.innerHTML =
							'<pre>' + JSON.stringify(data, null, 2) + '</pre>'
					} catch (error) {
						resultDiv.innerHTML =
							'<pre style="color: red">Error: ' +
							error.message +
							'</pre>'
					}
				}
			</script>
			<style>
				body {
					font-family: Arial, sans-serif;
					max-width: 800px;
					margin: 2rem auto;
					padding: 0 1rem;
				}
				button {
					margin-right: 0.5rem;
					padding: 0.5rem 1rem;
					cursor: pointer;
				}
				#result {
					margin-top: 1rem;
					padding: 1rem;
					border: 1px solid #ccc;
					border-radius: 4px;
					min-height: 100px;
				}
			</style>
		</head>
		<body>
			<div>${content}</div>
		</body>
	</html>
`

app.get('/', (c) => {
	const activeSpan = trace.getActiveSpan()
	const traceId = activeSpan?.spanContext().traceId ?? ''
	const spanId = activeSpan?.spanContext().spanId ?? ''

	const content = html`
		<h1>Hono API Tester</h1>
		<div>
			<button onclick="makeRequest('/api/hello')">
				Test Hello Endpoint
			</button>
			<button onclick="makeRequest('/api/error')">
				Test Error Endpoint
			</button>
		</div>
		<div id="result"></div>
	`

	return c.html(layout(content, traceId, spanId))
})

// Example route that might throw an error
app.get('/api/error', (c) => {
	throw new Error('This is a test error')
})

// Example route with successful response
app.get('/api/hello', (c) => {
	return c.json({
		message: 'Hello from Hono!',
	})
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3011
console.log(`Server is running on http://localhost:${port}`)

serve({
	fetch: app.fetch,
	port,
})
