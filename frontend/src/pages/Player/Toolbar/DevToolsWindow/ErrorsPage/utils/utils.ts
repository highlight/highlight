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
		const timestamp = new Date(event.timestamp).getTime() - sessionStartTime
		if (timestamp === currentTimestamp) {
			return mid
		} else if (timestamp < currentTimestamp) {
			start = mid + 1
		} else {
			end = mid - 1
		}
	}
	const idx = Math.min(start, events.length - 1)
	const event = events[idx]
	const timestamp = new Date(event.timestamp).getTime() - sessionStartTime
	return timestamp <= currentTimestamp ? idx : -1
}
