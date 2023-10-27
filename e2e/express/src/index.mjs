import express from 'express'
import { H } from '@highlight-run/node'

H.init({ projectID: '1' })

const app = express()
const port = 3003

app.get('/', (req, res) => {
	const err = new Error('this is a test error')
	const highlightHeader = req.headers?.['x-highlight-request']
	if (highlightHeader) {
		const [secureSessionId, requestId] = highlightHeader.split('/')
		if (secureSessionId && requestId) {
			console.info(
				'Sending error to highlight',
				secureSessionId,
				requestId,
			)
			H.consumeError(err, secureSessionId, requestId)
		}
	}
	res.send('Hello World!')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

process.on('SIGINT', function () {
	process.exit()
})
