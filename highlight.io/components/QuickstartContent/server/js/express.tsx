import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JSExpressReorganizedContent: QuickStartContent = {
	title: 'Express.js',
	subtitle: 'Learn how to set up highlight.io in Express.js.',
	logoKey: 'express',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: `Add the Express.js Highlight integration.`,
			content: addIntegrationContent('Node Highlight SDK', 'nodejs'),
			code: [
				{
					text: `import { H, Handlers } from '@highlight-run/node'
// or like this with commonjs
// const { H, Highlight } = require('@highlight-run/node')

const highlightConfig = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-express-app',
	serviceVersion: 'git-sha',
	environment: 'production'
}
H.init(highlightConfig)

// import express after initializing highlight to automatically instrument express
import express from 'express'
const app = express()

// This should be before any controllers (route definitions)
app.use(Handlers.middleware(highlightConfig))

app.get('/', (req, res) => {
  res.send(\`Hello World! ${Math.random()}\`)
})

// This should be before any other error middleware and after all controllers (route definitions)
app.use(Handlers.errorHandler(highlightConfig))

app.listen(8080, () => {
  console.log(\`Example app listening on port 8080\`)
})`,
					language: `js`,
				},
			],
		},
		{
			title: `Try/catch an error manually (without middleware).`,
			content:
				'If you are using express.js async handlers, you will need your own try/catch block that directly calls the highlight SDK to report an error. ' +
				'This is because express.js async handlers do not invoke error middleware.',
			code: [
				{
					text: `app.get('/sync', (req: Request, res: Response) => {
	// do something dangerous...
	throw new Error('oh no! this is a synchronous error');
});

app.get('/async', async (req: Request, res: Response) => {
  try {
    // do something dangerous...
    throw new Error('oh no!');
  } catch (error) {
    const { secureSessionId, requestId } = H.parseHeaders(req.headers);
    H.consumeError(
      error as Error,
      secureSessionId,
      requestId
    );
  } finally {
    res.status(200).json({hello: 'world'});
  }
});`,
					language: `js`,
				},
			],
		},
		verifyError(
			'express.js',
			`app.get('/', (req, res) => {
  throw new Error('sample error!')
  res.send(\`Hello World! ${Math.random()}\`)
})`,
		),
		verifyLogs,
		verifyTraces,
	],
}
