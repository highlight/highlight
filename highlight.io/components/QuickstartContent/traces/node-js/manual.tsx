import { siteUrl } from '../../../../utils/urls'
import {
	initializeNodeSDK,
	jsGetSnippet,
} from '../../backend/js/shared-snippets'
import { previousInstallSnippet } from '../../logging/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const JSManualTracesContent: QuickStartContent = {
	title: 'Tracing from a Node.js App',
	subtitle:
		'Learn how to set up highlight.io tracing for your Node.js application.',
	logoUrl: siteUrl('/images/quickstart/javascript.svg'),
	entries: [
		previousInstallSnippet('js'),
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Wrap your code using the Node.js SDK.',
			content:
				'By wrapping your code with `startSpan` and `endSpan`, the `@highlight-run/node` SDK will record a span. You can create more child spans or add custom attributes to each span.',
			code: [
				{
					text: `
const functionToTrace = async (input int) => {
	const span = await H.startActiveSpan("functionToTrace", {custom_property: input})
	// ...
	anotherFunction()
	// ...
	span.end()
}

const anotherFunction = () => {
	const span = H.startActiveSpan("anotherFunction", {})

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
		const span = H.startActiveSpan("custom-span", {})
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
