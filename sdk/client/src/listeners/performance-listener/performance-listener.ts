const IN_BROWSER = !(typeof window === 'undefined')

type Perf = {
	memory: PerformancePayload
}

export interface PerformancePayload {
	totalJSHeapSize?: number
	usedJSHeapSize?: number
	jsHeapSizeLimit?: number
	fps?: number
	/** Timestamp relative to the current session. If a measurement was taking 5 seconds into the session, then the timestamp will be 5. */
	relativeTimestamp: number
}

const perf: Perf =
	IN_BROWSER && 'performance' in window && 'memory' in performance // works in Chrome only
		? (performance as any)
		: { memory: {} }

export const PerformanceListener = (
	callback: (payload: PerformancePayload) => void,
	recordingStartTime: number,
) => {
	let latestFPSValue = 0
	let requestAnimationFrameId = 0

	const memoryWorker = () => {
		const now = new Date().getTime()
		const relativeTimestamp = (now - recordingStartTime) / 1000
		const jsHeapSizeLimit = perf.memory.jsHeapSizeLimit || 0
		const usedJSHeapSize = perf.memory.usedJSHeapSize || 0
		callback({
			jsHeapSizeLimit,
			usedJSHeapSize,
			relativeTimestamp,
			fps: latestFPSValue,
		})
	}

	memoryWorker()

	let intervalId: number | undefined = undefined
	intervalId = setInterval(() => {
		memoryWorker()
	}, 1000) as unknown as number

	let frameCount = 0
	let lastTime = Date.now()

	const frameRateWorker = function () {
		var now = Date.now()
		frameCount++

		if (now > 1000 + lastTime) {
			const FPS = Math.round((frameCount * 1000) / (now - lastTime))
			latestFPSValue = FPS
			frameCount = 0
			lastTime = now
		}

		requestAnimationFrameId = requestAnimationFrame(frameRateWorker)
	}

	frameRateWorker()

	return () => {
		clearInterval(intervalId)
		cancelAnimationFrame(requestAnimationFrameId)
	}
}
