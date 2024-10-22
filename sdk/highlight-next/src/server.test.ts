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
import kill from 'tree-kill'
import { vi } from 'vitest'

vi.mock('pg', () => {
	const pgClient = {
		connect: jest.fn(),
		query: jest.fn(),
		end: jest.fn(),
	}

	pgClient.query.mockResolvedValue({
		rows: [{ message: 'Hello world!' }],
	})

	return {
		Client: jest.fn().mockImplementation(() => pgClient),
	}
})

const SESSION_ID = '123456'
const TRACE_ID = '78910'
const NEXT_PORT = 3010
const NEXT_URL = `http://localhost:${NEXT_PORT}`
const OTEL_PORT = 5553
const HIGHLIGHT_HEADER = { 'x-highlight-request': `${SESSION_ID}/${TRACE_ID}` }

describe('Next.js server instrumentation', () => {
	let stopOtel: () => void
	let stopNext: () => void

	beforeAll(async () => {
		stopOtel = await startMockOtelServer({ port: OTEL_PORT })
		stopNext = await startNext(OTEL_PORT).catch((stop) => stop())
	}, 10000)

	afterAll(async () => {
		await stopOtel()
		await stopNext()
	})

	beforeEach(() => {
		vi.clearAllMocks()
		clearResourceSpans(OTEL_PORT)
	})

	describe('Page Router', () => {
		it('Should report Page Router success', async () => {
			fetch(`${NEXT_URL}/api/page-router-test?success=true`, {
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
			fetch(`${NEXT_URL}/api/page-router-test?success=false`, {
				method: 'GET',
				headers: {
					...HIGHLIGHT_HEADER,
				},
			})

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
			fetch(`${NEXT_URL}/api/app-router-test?success=true&sql=false`, {
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
		}, 10000)

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

			expect(hasError.length).toEqual(1)
			expect(detailsWithSessionId.length > 0).toEqual(true)
		}, 10000)
	})
})

function startNext(port: number) {
	return new Promise<() => void>(async (resolve, reject) => {
		const child = spawn(
			'yarn',
			['workspace', 'nextjs', 'next', 'dev', '-p', String(NEXT_PORT)],
			{
				env: {
					NODE_ENV: 'test',
					NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT: getOtlpEndpoint(port),
				},
			},
		)

		child.stdout.on('data', (data) => {
			const isReady = data.toString().includes('Ready')

			console.info(`${data}`)

			isReady && resolve(killChild)
		})

		child.stderr.on('data', (data) => {
			console.error(`${data}`)
		})

		child.on('error', (error) => {
			killChild()

			reject(error)
		})

		function killChild() {
			return new Promise<void>((resolve, reject) => {
				if (!child.pid) return
				kill(child.pid, 'SIGTERM', (err) =>
					err ? reject(err) : resolve(),
				)
			})
		}
	})
}
