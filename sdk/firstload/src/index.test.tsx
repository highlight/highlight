import { H } from '.'
import { HighlightPublicInterface } from '../../client/src/types/types'
import {
	setSessionData,
	setSessionSecureID,
} from '@highlight-run/client/src/utils/sessionStorage/highlightSession'

describe('should work outside of the browser in unit test', () => {
	let highlight: HighlightPublicInterface

	beforeEach(() => {
		vi.useFakeTimers()
		highlight = H

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
	})

	it('should handle init', () => {
		highlight.init('1', {
			debug: { clientInteractions: true, domRecording: true },
		})
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
		expect(await highlight.getSessionDetails()).toEqual({
			url: 'https://app.highlight.io/1/sessions/foo',
			urlWithTimestamp: 'https://app.highlight.io/1/sessions/foo?ts=0',
		})
	})
})
