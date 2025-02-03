import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JSHonoReorganizedContent: QuickStartContent = {
	title: 'Hono',
	subtitle: 'Learn how to set up highlight.io in your Hono application.',
	logoKey: 'hono',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['hono']),
		{
			title: 'Add the Hono Highlight middleware',
			content:
				addIntegrationContent('Hono SDK', 'hono') +
				' ' +
				'The middleware automatically traces all requests, reports exceptions, and captures console logs to Highlight. ' +
				"It integrates seamlessly with Hono's middleware system for minimal configuration.",
			code: [
				{
					text: `import { Hono } from 'hono'
import { highlightMiddleware } from '@highlight-run/hono'

const app = new Hono()

// Initialize the Highlight middleware
app.use(highlightMiddleware({
    projectID: '<YOUR_PROJECT_ID>'
}))

// Your routes
app.get('/', (c) => c.text('Hello Hono!'))

// Errors will be automatically caught and reported
app.get('/error', (c) => {
    throw new Error('Example error!')
    return c.text('This will not be reached')
})

export default app`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'hono',
			`const app = new Hono()
app.use(highlightMiddleware({ projectID: '<YOUR_PROJECT_ID>' }))

app.get('/error', (c) => {
    throw new Error('example error!')
    return c.text('Error route')
})`,
		),
		verifyLogs,
		verifyTraces,
	],
}
