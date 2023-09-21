import axios from 'axios'
import { H } from '@highlight-run/node'

H.init({ projectID: '1', serviceName: 'axios', enableFsInstrumentation: true })
console.log('hello')

async function main() {
	await fetch(
		'https://pub.highlight.io/v1/logs/raw?project=1&service=axios-post',
		{ method: 'POST', body: 'yo fetch' },
	)

	// Make a request for a user with a given ID
	await axios
		.post(
			'https://pub.highlight.io/v1/logs/raw?project=1&service=axios-post',
			'yo',
		)
		.then(function (response) {
			// handle success
			console.log(response)
		})
		.catch(function (error) {
			// handle error
			console.log(error)
		})

	// Optionally the request above could also be done as
	await axios
		.post(
			'https://pub.highlight.io/v1/logs/raw?project=1&service=axios-post',
			{
				params: {
					ID: 12345,
				},
			},
		)
		.then(function (response) {
			console.log(response)
		})
		.catch(function (error) {
			console.log(error)
		})

	// Want to use async/await? Add the `async` keyword to your outer function/method.
	async function getUser() {
		try {
			const response = await axios.post(
				'https://pub.highlight.io/v1/logs/raw?project=1&service=axios-post',
				'yo',
			)
			console.log(response)
		} catch (error) {
			console.error(error)
		}
	}

	await getUser()
}

const span = H.startSpan('main')
await main()
span.end()

await H.flush()
process.exit(0)
