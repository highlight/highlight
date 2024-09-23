import { expect, vi } from 'vitest'
import {
	setSessionData,
	setSessionSecureID,
} from '@highlight-run/client/src/utils/sessionStorage/highlightSession'
import * as Firstload from '.'
import { Highlight } from '../../client/src'
import { HighlightPublicInterface } from '../../client/src/types/types'
import * as otel from '../../client/src/otel'
import { waitFor } from '@testing-library/react'

describe('should work outside of the browser in unit test', () => {
	let highlight: HighlightPublicInterface

	beforeEach(() => {
		vi.useFakeTimers()
		highlight = Firstload.H

		setSessionSecureID('foo')
		setSessionData({
			sessionSecureID: 'foo',
			projectID: 1,
			payloadID: 1,
			lastPushTime: new Date().getTime(),
			sessionStartTime: new Date().getTime(),
		})
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
		expect(await highlight.getSessionURL()).toBe(
			'https://app.highlight.io/1/sessions/foo',
		)
	})

	it('should handle getSessionDetails', async () => {
		highlight.init(1)

		expect(await highlight.getSessionDetails()).toEqual({
			url: 'https://app.highlight.io/1/sessions/foo',
			urlWithTimestamp: 'https://app.highlight.io/1/sessions/foo?ts=0',
			sessionSecureID: 'foo',
		})
	})

	describe('startSpan', () => {
		describe('when otel is disabled', () => {
			it('it returns the value of the callback', () => {
				const value = highlight.startSpan('test', () => 'test')
				expect(value).toBe('test')
			})

			it('handles async callbacks', () => {
				return new Promise(async (resolve) => {
					const value = await highlight.startSpan(
						'test',
						async () => {
							await sleep(10)
							return 'testing'
						},
					)

					expect(value).toBe('testing')
					resolve(true)
				})
			})
		})

		describe('when otel is enabled', () => {
			it('it returns the value of the callback', () =>
				new Promise(async (done) => {
					highlight.init(1, {
						enableOtelTracing: true,
					})

					let tracer: any
					await waitFor(() => {
						tracer = otel.getTracer()
						expect(!!tracer).toBe(true)
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
	})

	describe('startManualSpan', () => {
		describe('when otel is disabled', () => {
			it('it returns the value of the callback', () => {
				const value = highlight.startManualSpan('test', (span) => {
					span.end()
					return 'test'
				})
				expect(value).toBe('test')
			})
		})

		describe('when otel is enabled', () => {
			it('it returns the value of the callback', () =>
				new Promise(async (done) => {
					highlight.init(1, {
						enableOtelTracing: true,
					})

					let tracer: any
					await waitFor(() => {
						tracer = otel.getTracer()
						expect(!!tracer).toBe(true)
					})

					vi.spyOn(tracer, 'startActiveSpan')

					const value = highlight.startManualSpan('test', (span) => {
						span.end()
						return 'test'
					})
					expect(value).toBe('test')

					expect(tracer.startActiveSpan).toHaveBeenCalledWith(
						'test',
						expect.any(Function),
					)

					done(true)
				}))
		})
	})
})

const sleep = (ms: number) => {
	const promise = new Promise((resolve) => setTimeout(resolve, ms))
	vi.advanceTimersByTime(ms)
	return promise
}
