import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSNodeContent: QuickStartContent = {
	title: 'Node.js',
	subtitle: 'Learn how to set up highlight.io in Node.js.',
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
		setupLogging('nodejs'),
	],
}
