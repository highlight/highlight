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
		verifyTraces,
	],
}
