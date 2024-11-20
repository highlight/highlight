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
