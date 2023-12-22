import { siteUrl } from '../../../../utils/urls'
import {
	initializeNodeSDK,
	jsGetSnippet,
} from '../../backend/js/shared-snippets'
import { previousInstallSnippet } from '../../logging/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const JSManualTracesContent: QuickStartContent = {
	title: 'Tracing from an Node.js App',
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
		verifyTraces,
	],
}
