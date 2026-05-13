import type { SamplingStrategy } from '../types/types'

export const isSafariCanvasSnapshotBrowser = (userAgent: string) => {
	if (!/safari/i.test(userAgent) || /android/i.test(userAgent)) {
		return false
	}

	if (/ipad|iphone|ipod/i.test(userAgent)) {
		return true
	}

	return !/chrome|chromium|crios|edg|opr|opera|firefox|fxios/i.test(userAgent)
}

export const getCanvasSamplingDefaults = (
	userAgent: string,
): Pick<SamplingStrategy, 'canvasFactor' | 'canvasMaxSnapshotDimension'> => {
	if (isSafariCanvasSnapshotBrowser(userAgent)) {
		return {
			canvasFactor: 0.25,
			canvasMaxSnapshotDimension: 180,
		}
	}

	return {
		canvasFactor: 0.5,
		canvasMaxSnapshotDimension: 360,
	}
}
