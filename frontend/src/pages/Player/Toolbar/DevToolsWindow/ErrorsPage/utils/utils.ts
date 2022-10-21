/**
 * Finds the event closest to the currentTimestamp in the previous time.
 * @param currentTimestamp Milliseconds.
 * @param events Assumed to be sorted based on time in ascending order.
 */
interface Event {
	timestamp: number | string
}
export const findLastActiveEventIndex = (
	currentTimestamp: number,
	sessionStartTime: number,
	events: Event[],
): number => {
	if (!events.length) {
		return -1
	}

	let start = 0
	let end = events.length - 1

	while (start <= end) {
		const mid = Math.floor(start + (end - start) / 2)
		const event = events[mid]
		const eventTimestamp =
			new Date(event.timestamp).getTime() - sessionStartTime
		if (eventTimestamp === currentTimestamp) {
			return mid
		} else if (eventTimestamp < currentTimestamp) {
			start = mid + 1
		} else {
			end = mid - 1
		}
	}
	return Math.min(end, events.length - 1)
}
