import { getSimpleSelector } from '../../utils/dom'

// samples taken to calculate expected RAF
const RAF_SAMPLES = 30

export interface JankPayload {
	relativeTimestamp: number
	jankAmount: number
	querySelector: string
	newLocation?: string
}

const getRAFDuration = () => {
	return new Promise<number>((resolve) =>
		requestAnimationFrame((t1) =>
			requestAnimationFrame((t2) => resolve(t2 - t1)),
		),
	)
}

const getExpectedRAFDuration = async () => {
	const rafs: number[] = []
	for (let i = 0; i < RAF_SAMPLES; i++) {
		rafs.push(await getRAFDuration())
	}
	return rafs.reduce((a, b) => a + b, 0) / rafs.length
}

export const JankListener = (
	callback: (payload: JankPayload) => void,
	recordingStartTime: number,
) => {
	let jankState: { event?: UIEvent; location?: string; timerStart?: number } =
		{}
	// use 60 fps refresh rate as a default until we measure expected
	let expectedRAFDuration = 1000 / 60
	getExpectedRAFDuration().then((raf) => (expectedRAFDuration = raf))

	const listener = (e: MouseEvent | KeyboardEvent) => {
		// only one event listener at a time
		if (jankState?.event) return
		jankState = {
			event: e,
			location: window.location.href,
			timerStart: window.performance?.now(),
		}
		window.requestAnimationFrame(onAnimationFrame)
	}

	const onAnimationFrame = () => {
		if (!jankState?.timerStart) return
		// the amount of time (ms) that a frame is delayed due to JS execution.
		const jankAmount =
			window.performance.now() -
			jankState.timerStart -
			expectedRAFDuration

		reportJank(jankAmount)

		// Reset jankState so we capture the next event
		jankState = {}
	}

	const reportJank = (jank: number) => {
		const relativeTimestamp =
			(new Date().getTime() - recordingStartTime) / 1000
		callback({
			relativeTimestamp,
			jankAmount: jank,
			querySelector: generateQuerySelector(),
			newLocation:
				window.location.href != jankState.location
					? window.location.href
					: undefined,
		})
	}

	const generateQuerySelector = () => {
		if (!jankState?.event?.target) return ''
		return getSimpleSelector(jankState.event.target as HTMLElement)
	}

	window.addEventListener('click', listener, true)
	window.addEventListener('keydown', listener, true)

	return () => {
		window.removeEventListener('keydown', listener, true)
		window.removeEventListener('click', listener, true)
	}
}
