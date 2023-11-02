import express from 'express'
import { H } from '@highlight-run/node'

H.init({ projectID: '1', debug: true, serviceName: 'e2e-express' })

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

app.get('/good', (req, res) => {
	console.warn('doing some heavy work!')
	let result = 0
	for (let i = 0; i < 1000; i++) {
		const value = Math.random() * 1000
		result += value
		console.info('some work happening', { result, value })
	}
	res.send('yay!')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

process.on('SIGINT', function () {
	process.exit()
})
