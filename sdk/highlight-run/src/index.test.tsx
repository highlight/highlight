import { expect, vi } from 'vitest'
import { ROOT_CONTEXT } from '@opentelemetry/api'
import {
	setSessionData,
	setSessionSecureID,
} from './client/utils/sessionStorage/highlightSession'
import * as Firstload from '.'
import { HighlightPublicInterface } from './client/types/types'
import * as otel from './client/otel'

const sessionData = {
	sessionSecureID: 'foo',
	projectID: 1,
	payloadID: 1,
	lastPushTime: new Date().getTime(),
	sessionStartTime: new Date().getTime(),
}

describe('should work outside of the browser in unit test', () => {
	let highlight: HighlightPublicInterface

	beforeEach(() => {
		vi.useFakeTimers()
		highlight = Firstload.H

		setSessionSecureID('foo')
		setSessionData(sessionData)
	})

	afterEach(() => {
		vi.useRealTimers()
		Firstload.__testing.reset()
	})

	it('should handle init', () => {
		highlight.init('1')
	})

	it('should handle consumeError', () => {
		const error = new Error('test error')
		highlight.consumeError(error)
	})

	it('should handle error', () => {
		highlight.error('test message')
	})

	it('should handle track', () => {
		highlight.track('test message', {})
	})

	it('should handle start', () => {
		highlight.init('test', { manualStart: true })

		highlight.start()
	})

	it('should handle stop', () => {
		highlight.stop()
	})

	it('should handle identify', () => {
		highlight.identify('123', {})
	})

	it('should handle getSessionURL', async () => {
		Firstload.__testing.setHighlightObj({
			ready: true,
			sessionData,
		})
		highlight.init('1')

		expect(await highlight.getSessionURL()).toBe(
			'https://app.highlight.io/1/sessions/foo',
		)
	})

	it('should handle getSessionDetails', async () => {
		Firstload.__testing.setHighlightObj({
			ready: true,
			sessionData,
		})
		highlight.init('1')

		const details = await highlight.getSessionDetails()
		expect(details.url).toBe('https://app.highlight.io/1/sessions/foo')
		expect(details.urlWithTimestamp).toContain(
			'https://app.highlight.io/1/sessions/foo?ts=0',
		)
		expect(details.sessionSecureID).toBe('foo')
	})

	describe('onHighlightReady', () => {
		it('should call the callback', async () => {
			const mockCallback = vi.fn(() => undefined)

			highlight.onHighlightReady(mockCallback)
			highlight.init('1')

			await vi.waitFor(
				() => {
					expect(mockCallback).toHaveBeenCalled()
				},
				{ timeout: 5000 },
			)
		})

		it('should call multiple registered callbacks', async () => {
			const mockCallback1 = vi.fn(() => undefined)
			const mockCallback2 = vi.fn(() => undefined)

			highlight.onHighlightReady(mockCallback1)
			highlight.onHighlightReady(mockCallback2)
			highlight.init('1')

			await vi.waitFor(
				() => {
					expect(mockCallback1).toHaveBeenCalled()
					expect(mockCallback2).toHaveBeenCalled()
				},
				{ timeout: 2000 },
			)
		})

		it('should call the callback immediately if already ready', () => {
			Firstload.__testing.setHighlightObj({ ready: true })

			const mockCallback = vi.fn(() => undefined)
			highlight.onHighlightReady(mockCallback)

			expect(mockCallback).toHaveBeenCalled()
		})
	})

	describe('startSpan', () => {
		it('it returns the value of the callback', () =>
			new Promise(async (done) => {
				highlight.init(1)

				let tracer: any
				await vi.waitFor(() => {
					tracer = otel.getTracer()
					expect(tracer).toBeDefined()
				})

				vi.spyOn(tracer, 'startActiveSpan')

				const value = highlight.startSpan('test', () => 'test')
				expect(value).toBe('test')

				expect(tracer.startActiveSpan).toHaveBeenCalledWith(
					'test',
					expect.any(Function),
				)

				done(true)
			}))
	})

	describe('startManualSpan', () => {
		it('returns a Span directly and allows manual span.end() lifecycle', () =>
			new Promise(async (done) => {
				highlight.init(1)

				let tracer: any
				await vi.waitFor(() => {
					tracer = otel.getTracer()
					expect(tracer).toBeDefined()
				})

				vi.spyOn(tracer, 'startSpan')

				const span = highlight.startManualSpan('test-direct')
				expect(tracer.startSpan).toHaveBeenCalledWith(
					'test-direct',
					undefined,
					undefined,
				)
				expect(span).toBeDefined()
				expect(typeof span.end).toBe('function')
				expect(typeof span.setAttribute).toBe('function')

				span.setAttribute('test.key', 'test.value')
				span.end()

				done(true)
			}))

		it('forwards options and context to tracer.startSpan', () =>
			new Promise(async (done) => {
				highlight.init(1)

				let tracer: any
				await vi.waitFor(() => {
					tracer = otel.getTracer()
					expect(tracer).toBeDefined()
				})

				vi.spyOn(tracer, 'startSpan')

				const options = { attributes: { 'app.operation': 'manual' } }
				const mockContext = ROOT_CONTEXT

				const span = highlight.startManualSpan(
					'test-options',
					options,
					mockContext,
				)
				expect(tracer.startSpan).toHaveBeenCalledWith(
					'test-options',
					options,
					mockContext,
				)
				expect(span).toBeDefined()
				span.end()

				done(true)
			}))

		it('returns a no-op span before SDK initialization without throwing', () => {
			const span = highlight.startManualSpan('pre-init-direct')
			expect(span).toBeDefined()
			expect(typeof span.end).toBe('function')
			expect(() => {
				span.setAttribute('test.key', 'test.value')
				span.addEvent('test.event')
				span.end()
			}).not.toThrow()
		})
	})
})

const sleep = (ms: number) => {
	const promise = new Promise((resolve) => setTimeout(resolve, ms))
	vi.advanceTimersByTime(ms)
	return promise
}
