import { Handlers } from '@highlight-run/node'
import * as functions from 'firebase-functions'

export const helloWorld = functions.https.onRequest(
	Handlers.firebaseHttpFunctionHandler(
		(req, res) => {
			// ... your handler code here
			res.json({ result: 'useful https result!' })
		},
		{ projectID: '1' },
	),
)

export const hey = functions.https.onCall(
	Handlers.firebaseCallableFunctionHandler(
		(data, context) => {
			// ... your handler code here
			return { result: 'useful call result!' }
		},
		{
			projectID: '1',
			serviceName: 'my-firebase-app',
			serviceVersion: '1.0.0',
			environment: 'e2e-test',
		},
	),
)
