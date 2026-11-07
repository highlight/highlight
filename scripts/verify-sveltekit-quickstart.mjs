// Run with Node 24: node --test scripts/verify-sveltekit-quickstart.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'

const source = readFileSync(
	new URL(
		'../highlight.io/components/QuickstartContent/server/js/sveltekit.tsx',
		import.meta.url,
	),
	'utf8',
)
const snippets = [...source.matchAll(/text: `([\s\S]*?)`,/g)].map(
	(match) => match[1],
)

function loadSnippet(snippet, bindings) {
	const body = stripTypeScriptTypes(snippet)
		.replace(/^import .*\n/gm, '')
		.replace(/^export /gm, '')
	return new Function(
		...Object.keys(bindings),
		body +
			'\nreturn typeof handle !== "undefined" ? { handle, handleError } : { GET }',
	)(...Object.values(bindings))
}

function setup(building = false) {
	const calls = { init: [], runs: [], errors: [] }
	const H = {
		init(options) {
			calls.init.push(options)
		},
		runWithHeaders(name, headers, callback) {
			assert.equal(typeof name, 'string')
			assert.equal(typeof callback, 'function')
			calls.runs.push({ name, headers })
			return Promise.resolve().then(callback)
		},
		parseHeaders(headers) {
			const [secureSessionId, requestId] = (
				headers['x-highlight-request'] ?? ''
			).split('/')
			return { secureSessionId: secureSessionId || undefined, requestId }
		},
		consumeError(...args) {
			calls.errors.push(args)
		},
	}
	return { ...loadSnippet(snippets[0], { H, building, dev: true }), calls }
}

function event(headers = {}) {
	return {
		request: new Request(
			'http://localhost/users/private-id?token=private',
			{ headers },
		),
		route: { id: '/users/[id]' },
	}
}

test('guide has exactly two executable TypeScript snippets', () => {
	assert.equal(snippets.length, 2)
})

test('initialization uses server service and development environment', () => {
	assert.deepEqual(setup().calls.init, [
		{
			projectID: '<YOUR_PROJECT_ID>',
			serviceName: 'sveltekit-server',
			environment: 'development',
		},
	])
})

test('request hook supplies name, headers, callback, and preserves response', async () => {
	const { handle, calls } = setup()
	const requestEvent = event({ 'x-highlight-request': 'session/request' })
	const response = new Response('ok')
	assert.equal(
		await handle({
			event: requestEvent,
			resolve: async (received) => {
				assert.equal(received, requestEvent)
				return response
			},
		}),
		response,
	)
	assert.equal(calls.runs[0].name, 'GET /users/[id]')
	assert.equal(
		calls.runs[0].headers['x-highlight-request'],
		'session/request',
	)
})

test('unmatched route avoids recording raw URL or query strings', async () => {
	const { handle, calls } = setup()
	const requestEvent = event()
	requestEvent.route.id = null
	await handle({
		event: requestEvent,
		resolve: async () => new Response('missing', { status: 404 }),
	})
	assert.equal(calls.runs[0].name, 'GET unmatched')
})

test('build/prerender bypasses initialization and telemetry', async () => {
	const { handle, handleError, calls } = setup(true)
	await handle({ event: event(), resolve: async () => new Response('ok') })
	handleError({ error: new Error('build error'), event: event() })
	assert.deepEqual(calls, { init: [], runs: [], errors: [] })
})

test('unexpected error is correlated and returns a generic public message', () => {
	const { handleError, calls } = setup()
	const error = new Error('private details')
	assert.deepEqual(
		handleError({
			error,
			event: event({ 'x-highlight-request': 'session/request' }),
		}),
		{ message: 'Internal Error' },
	)
	assert.deepEqual(calls.errors[0], [error, 'session', 'request'])
})

test('non-Error throws and absent correlation headers remain supported', () => {
	const { handleError, calls } = setup()
	handleError({ error: 'failure', event: event() })
	assert.ok(calls.errors[0][0] instanceof Error)
	assert.equal(calls.errors[0][0].message, 'failure')
	assert.deepEqual(calls.errors[0].slice(1), [undefined, undefined])
})

test('request rejection remains visible to SvelteKit', async () => {
	const { handle } = setup()
	const failure = new Error('handler failure')
	await assert.rejects(
		handle({
			event: event(),
			resolve: async () => {
				throw failure
			},
		}),
		(error) => error === failure,
	)
})

test('verification endpoint returns ok and throws on its error path', async () => {
	const logs = []
	const { GET } = loadSnippet(snippets[1], {
		console: { info: (message) => logs.push(message) },
	})
	assert.equal(
		await GET({ url: new URL('http://localhost/health-highlight') }).text(),
		'ok',
	)
	assert.throws(
		() =>
			GET({ url: new URL('http://localhost/health-highlight?error=1') }),
		/Highlight SvelteKit server verification error/,
	)
	assert.equal(logs.length, 2)
})
