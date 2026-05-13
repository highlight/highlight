import {
	getCanvasSamplingDefaults,
	isSafariCanvasSnapshotBrowser,
} from './canvas-sampling'

const DESKTOP_SAFARI_USER_AGENT =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15'
const DESKTOP_CHROME_USER_AGENT =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
const IOS_CHROME_USER_AGENT =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/117.0.0.0 Mobile/15E148 Safari/604.1'

describe('canvas sampling defaults', () => {
	it('uses lower canvas snapshot defaults for Safari', () => {
		expect(isSafariCanvasSnapshotBrowser(DESKTOP_SAFARI_USER_AGENT)).toBe(
			true,
		)
		expect(getCanvasSamplingDefaults(DESKTOP_SAFARI_USER_AGENT)).toEqual({
			canvasFactor: 0.25,
			canvasMaxSnapshotDimension: 180,
		})
	})

	it('keeps existing canvas snapshot defaults for non-Safari browsers', () => {
		expect(isSafariCanvasSnapshotBrowser(DESKTOP_CHROME_USER_AGENT)).toBe(
			false,
		)
		expect(getCanvasSamplingDefaults(DESKTOP_CHROME_USER_AGENT)).toEqual({
			canvasFactor: 0.5,
			canvasMaxSnapshotDimension: 360,
		})
	})

	it('treats iOS Safari-based browsers as affected', () => {
		expect(isSafariCanvasSnapshotBrowser(IOS_CHROME_USER_AGENT)).toBe(true)
	})
})
