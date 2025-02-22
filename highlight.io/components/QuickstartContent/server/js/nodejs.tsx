import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

export const JSNodeReorganizedContent: QuickStartContent = {
	title: 'Node.js',
	subtitle: 'Learn how to set up highlight.io in Node.js.',
	logoKey: 'node',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		manualError,
		verifyError(
			'Node.js',
			`const onError = (request, error) => {
  const parsed = H.parseHeaders(request.headers)
  H.consumeError(error, parsed.secureSessionId, parsed.requestId)
}

const main = () => {
  try {
    throw new Error('example error!')
  } catch (e) {
    onError(e)
  }
}

`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the highlight SDK. Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `module.exports = function() {
				console.log('hey there!');
				console.warn('whoa there', {'key': 'value'});
		}`,
					language: 'js',
				},
			],
		},
		verifyLogs,
		{
			title: 'Wrap your code using the Node.js SDK.',
			content:
				'By calling `H.startWithHeaders()` and `span.end()`, the `@highlight-run/node` SDK will record a span. You can create more child spans or add custom attributes to each span.',
			code: [
				{
					text: `
const functionToTrace = async (input int) => {
	const { span, ctx } = H.startWithHeaders("functionToTrace", {}, {custom_property: input})
	// ...
	// use the current span context with the function call to ensure child spans are tied to the current span
	// import api from '@opentelemetry/api'
	api.context.with(ctx, () => {
        anotherFunction()
    })
	// ...
	span.end()
}

const anotherFunction = () => {
	const { span } = H.startWithHeaders("anotherFunction", {})

	// ...
	span.end()
}

module.exports = function() {
    console.log('hey there!');
    functionToTrace()
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Pass HTTP headers to the SDK',
			content:
				'`H.runWithHeaders` takes request headers and spreads them across all related spans, automatically relating spans to your session and request headers.',
			code: [
				{
					text: `
app.get('/', async (req, res) => {
	await H.runWithHeaders(req.headers, () => {
		const { span } = H.startWithHeaders("custom-span", {})
		const err = new Error('this is a test error')

		console.info('Sending error to highlight')
		H.consumeError(err)

		res.send('Hello World!')
		span.end()
	})
})
					`,
					language: 'js',
				},
			],
		},
		verifyTraces,
	],
}
