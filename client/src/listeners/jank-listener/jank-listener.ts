// Browsers call back to `requestAnimationFrame` 60 times per second
// under smooth rendering conditions.
// TODO(vkorolik) what about macs that run on 120fps
import { getSimpleSelector } from '../../utils/dom'

const EXPECTED_RAF_DURATION = 1000.0 / 60.0
// if a frame is deplayed more than 16 ms and causes a skipped frame, track it
const JANK_THRESHOLD = 16

export interface JankPayload {
	relativeTimestamp: number
	jankAmount: number
	querySelector: string
	locationChanged: boolean
}

export const JankListener = (
	callback: (payload: JankPayload) => void,
	recordingStartTime: number,
) => {
	let jankState: { event?: UIEvent; location?: string; timerStart?: number } =
		{}

	const listener = (e: MouseEvent | KeyboardEvent) => {
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
		const jankAmount =
			window.performance.now() -
			jankState.timerStart -
			EXPECTED_RAF_DURATION

		if (jankAmount > JANK_THRESHOLD) {
			reportJank(jankAmount)
		}

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
			locationChanged: window.location.href != jankState.location,
		})
	}

	const generateQuerySelector = () => {
		if (!jankState?.event?.target) return ''
		return getSimpleSelector(jankState.event.target as HTMLElement)
	}

	window.addEventListener('click', listener, true)
	window.addEventListener('keydown', listener, true)

	return () => {
		window.removeEventListener('click', listener, true)
		window.removeEventListener('keydown', listener, true)
	}
}
