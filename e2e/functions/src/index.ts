import * as functions from 'firebase-functions'
import { Handlers } from '@highlight-run/node'

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
		{ projectID: '1' },
	),
)
