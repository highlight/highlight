import { H } from '.'
import { HighlightPublicInterface } from '../../client/src/types/types'

describe('should work outside of the browser in unit test', () => {
	let highlight: HighlightPublicInterface

	beforeEach(() => {
		vi.useFakeTimers()
		highlight = H
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

	it('should handle getSessionURL', () => {
		highlight.getSessionURL()
	})

	it('should handle getSessionDetails', () => {
		highlight.getSessionDetails()
	})
})
