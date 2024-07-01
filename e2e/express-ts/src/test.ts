import fetch from 'node-fetch'
import { startExpress } from './express'
import { startApollo } from './apollo'

const HIGHLIGHT_HEADER = { 'x-highlight-request': '123456/78910' }

;(async () => {
	// const stopExpress = startExpress()

	// await testRoot()
	// await testGood()

	// stopExpress()

	const stopApollo = await startApollo()

	await testApolloSuccess()
	await testApolloError()

	stopApollo()
})()

async function testRoot() {
	const response = await fetch('http://localhost:3003', {
		headers: { ...HIGHLIGHT_HEADER },
	})
	const text = await response.text()

	console.log('/ response', text)

	return response
}

async function testGood() {
	const response = await fetch('http://localhost:3003/good', {
		headers: { ...HIGHLIGHT_HEADER },
	})
	const text = await response.text()

	console.log('/good response', text)

	return response
}

async function testApolloSuccess() {
	const response = await fetch('http://localhost:3004', {
		method: 'POST',
		body: JSON.stringify({
			operationName: 'ExampleQuery',
			query: 'query ExampleQuery {\n  books {\n    title\n  }\n}\n',
			variables: {},
		}),
		headers: {
			'Content-Type': 'application/json',
			...HIGHLIGHT_HEADER,
		},
	})
	const text = await response.text()

	console.log('/graphql response', text)

	return response
}

async function testApolloError() {
	const response = await fetch('http://localhost:3004', {
		method: 'POST',
		body: JSON.stringify({
			operationName: 'ExampleQuery',
			query: 'query ExampleQuery {\n  error {\n    isError\n  }\n}\n',
			variables: {},
		}),
		headers: {
			'Content-Type': 'application/json',
			...HIGHLIGHT_HEADER,
		},
	})
	const text = await response.text()

	console.log('/graphql response', text)

	return response
}
