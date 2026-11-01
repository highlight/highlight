// Run with node --experimental-vm-modules --test sveltekit.test.mjs.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import vm from 'node:vm'

async function loadHooks() {
	const calls = []
	const context = vm.createContext({ Error, Headers, Response })
	const content = new vm.SourceTextModule(
		stripTypeScriptTypes(
			await readFile(new URL('./sveltekit.tsx', import.meta.url), 'utf8'),
		),
		{ context },
	)
	await content.link((specifier) => {
		const exports =
			specifier.endsWith('shared-snippets-monitoring') &&
			specifier.includes('../')
				? { frontendInstallSnippet: {} }
				: { jsGetSnippet: () => ({}) }
		return new vm.SyntheticModule(
			Object.keys(exports),
			function () {
				for (const [key, value] of Object.entries(exports))
					this.setExport(key, value)
			},
			{ context },
		)
	})
	await content.evaluate()
	const H = {
		init: (options) => calls.push(['init', options]),
		runWithHeaders: async (name, headers, callback) => {
			calls.push(['request', name, headers])
			return callback()
		},
		parseHeaders: (headers) => {
			const [secureSessionId, requestId] = (
				headers.get('x-highlight-request') ?? ''
			).split('/')
			return { secureSessionId, requestId }
		},
		consumeError: (...args) => calls.push(['error', ...args]),
	}
	const hooks = new vm.SourceTextModule(
		stripTypeScriptTypes(content.namespace.svelteKitServerHooks),
		{ context },
	)
	await hooks.link(
		() =>
			new vm.SyntheticModule(
				['H'],
				function () {
					this.setExport('H', H)
				},
				{ context },
			),
	)
	await hooks.evaluate()
	return { hooks: hooks.namespace, calls, content: content.namespace }
}

test('initializes the server SDK once and registers server documentation', async () => {
	const { calls, content } = await loadHooks()
	assert.equal(calls.length, 1)
	assert.equal(calls[0][1].serviceName, 'sveltekit-server')
	assert.equal(content.JSSvelteKitReorganizedContent.title, 'SvelteKit')
	const registry = await readFile(
		new URL('../../QuickstartContent.tsx', import.meta.url),
		'utf8',
	)
	assert.equal(
		registry.split(
			'[QuickStartType.JSSvelteKit]: JSSvelteKitReorganizedContent',
		).length - 1,
		2,
	)
})

test('passes the original event, request headers and streaming response unchanged', async () => {
	const { hooks, calls } = await loadHooks()
	const event = {
		request: {
			headers: new Headers({ 'x-highlight-request': 'session/request' }),
		},
	}
	const response = new Response('streamed response', { status: 201 })
	const result = await hooks.handle({
		event,
		resolve: async (received) => {
			assert.equal(received, event)
			return response
		},
	})
	assert.equal(result, response)
	assert.equal(result.bodyUsed, false)
	assert.equal(calls[1][2], event.request.headers)
})

test('preserves resolver rejection instead of turning it into a successful response', async () => {
	const { hooks } = await loadHooks()
	const failure = new Error('resolver failure')
	await assert.rejects(
		hooks.handle({
			event: { request: { headers: new Headers() } },
			resolve: async () => {
				throw failure
			},
		}),
		(error) => error === failure,
	)
})

test('correlates errors per request and never returns private exception details', async () => {
	const { hooks, calls } = await loadHooks()
	const error = new Error('private database details')
	for (const id of ['first/one', 'second/two']) {
		const result = hooks.handleError({
			error,
			event: {
				request: {
					headers: new Headers({ 'x-highlight-request': id }),
				},
			},
		})
		assert.equal(result.message, 'Internal server error')
	}
	const errors = calls.filter(([kind]) => kind === 'error')
	assert.equal(errors[0][1], error)
	assert.deepEqual(
		errors.map((call) => call.slice(2)),
		[
			['first', 'one'],
			['second', 'two'],
		],
	)
})

test('normalizes non-Error throws without serializing arbitrary sensitive objects', async () => {
	const { hooks, calls } = await loadHooks()
	hooks.handleError({
		error: { password: 'must not be logged' },
		event: { request: { headers: new Headers() } },
	})
	assert.equal(calls[1][1].message, 'Unexpected SvelteKit server error')
})
