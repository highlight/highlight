import { spawn } from 'child_process'
import {
	clearResourceSpans,
	filterDetailsBySessionId,
	filterEventsByName,
	getOtlpEndpoint,
	getResourceSpans,
	logDetails,
	startMockOtelServer,
} from 'mock-otel-server'
import { join } from 'node:path'
import kill from 'tree-kill'
import {
	vi,
	describe,
	beforeAll,
	afterAll,
	beforeEach,
	it,
	expect,
} from 'vitest'
import { homedir } from 'node:os'
import { readdir, readdirSync } from 'node:fs'
import { maxSatisfying, parse } from 'semver'

const SESSION_ID = '123456'
const TRACE_ID = '78910'
const NEXT_PORT = 3010
const NEXT_URL = `http://localhost:${NEXT_PORT}`
const OTEL_PORT = 5553
const HIGHLIGHT_HEADER = { 'x-highlight-request': `${SESSION_ID}/${TRACE_ID}` }

describe('Next.js server instrumentation', () => {
	let stopOtel: () => void
	let stopNext: (() => Promise<void>) | undefined

	beforeAll(async () => {
		stopOtel = startMockOtelServer({ port: OTEL_PORT })
		stopNext = await startNext(OTEL_PORT)
	}, 60_000)

	afterAll(async () => {
		try {
			stopOtel()
		} finally {
			if (stopNext) {
				await stopNext()
			}
		}
	}, 60_000)

	beforeEach(() => {
		vi.clearAllMocks()
		clearResourceSpans(OTEL_PORT)
	})

	describe('Page Router', () => {
		it('Should report Page Router success', async () => {
			await fetch(`${NEXT_URL}/api/page-router-test?success=true`, {
				method: 'GET',
				headers: {
					...HIGHLIGHT_HEADER,
				},
			})

			const { details } = await getResourceSpans(OTEL_PORT)
			const detailsWithSessionId = filterDetailsBySessionId(
				details,
				SESSION_ID,
			)

			detailsWithSessionId.length === 0 && logDetails(details)

			expect(detailsWithSessionId.length > 0).toEqual(true)
		})

		it('Should report Page Router error', async () => {
			try {
				await fetch(`${NEXT_URL}/api/page-router-test?success=false`, {
					method: 'GET',
					headers: {
						...HIGHLIGHT_HEADER,
					},
				})
			} catch (err) {
				console.log('expected error', { err })
			}

			const { details } = await getResourceSpans(OTEL_PORT, ['exception'])

			const hasError = filterEventsByName(details, 'exception')
			const detailsWithSessionId = filterDetailsBySessionId(
				details,
				SESSION_ID,
			)

			detailsWithSessionId.length === 0 && logDetails(details)

			expect(hasError.length).toEqual(1)
			expect(detailsWithSessionId.length > 0).toEqual(true)
		})
	})

	describe('App Router', () => {
		it('Should report App Router success', async () => {
			await fetch(
				`${NEXT_URL}/api/app-router-test?success=true&sql=false`,
				{
					method: 'GET',
					headers: {
						...HIGHLIGHT_HEADER,
					},
				},
			)

			const { details } = await getResourceSpans(OTEL_PORT)
			const detailsWithSessionId = filterDetailsBySessionId(
				details,
				SESSION_ID,
			)

			detailsWithSessionId.length === 0 && logDetails(details)

			expect(detailsWithSessionId.length > 0).toEqual(true)
		}, 60_000)

		it('Should report App Router error', async () => {
			await fetch(
				`${NEXT_URL}/api/app-router-test?success=false&sql=false`,
				{
					method: 'GET',
					headers: {
						...HIGHLIGHT_HEADER,
					},
				},
			)

			const { details } = await getResourceSpans(OTEL_PORT, ['exception'])

			const hasError = filterEventsByName(details, 'exception')
			const detailsWithSessionId = filterDetailsBySessionId(
				details,
				SESSION_ID,
			)

			detailsWithSessionId.length === 0 && logDetails(details)

			expect(hasError.length).toBeGreaterThanOrEqual(1)
			expect(detailsWithSessionId.length > 0).toEqual(true)
		}, 60_000)
	})
}, 60_000)

async function startNext(port: number) {
	return new Promise<() => Promise<void>>(async (resolve) => {
		let path = `/usr/local/bin:${process.env.PATH}`
		try {
			const nodeDir = join(homedir(), '.nvm/versions/node')
			const versions = readdirSync(nodeDir).map((v) => v.substring(1))
			const latest = maxSatisfying(versions, '>=0')
			const p = join(homedir(), '.nvm/versions/node', `v${latest}`, 'bin')
			path = `${p}:${path}`
		} catch (e) {}
		console.log('starting next with path', { path })
		const child = spawn(
			'yarn',
			['workspace', 'nextjs', 'next', 'dev', '-p', String(NEXT_PORT)],
			{
				env: {
					...process.env,
					PATH: path,
					NODE_ENV: 'test',
					NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT: getOtlpEndpoint(port),
				},
			},
		)

		child.stderr.on('data', (data) => {
			console.error(`${data}`)
		})
		child.stdout.on('data', (data) => {
			const isReady = data.toString().includes('Ready')

			console.info(`${data}`)

			isReady &&
				resolve(async function () {
					if (!child.pid) return
					console.error('stopping next', { pid: child.pid })
					await new Promise<void>((r) => {
						kill(child.pid!, 'SIGKILL', () => r())
					})
				})
		})
	})
}
