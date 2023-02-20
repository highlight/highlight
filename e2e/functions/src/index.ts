import * as functions from 'firebase-functions'
import { Handlers } from '@highlight-run/node'

export const helloWorld = functions.https.onRequest(
	Handlers.firebaseHttpFunctionHandler(
		(req, res) => {
			// ... your handler code here
			res.json({ result: 'useful result!' })
		},
		{ projectID: '1' },
	),
)
