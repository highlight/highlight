/**
 * Finds the event closest to the currentTimestamp in the previous time.
 * @param currentTimestamp Milliseconds.
 * @param events Assumed to be sorted based on time in ascending order.
 */
export const findLastActiveEventIndex = (
	currentTimestamp: number,
	sessionStartTime: number,
	events: any[],
): number => {
	let lastActiveEventIndex = -1

	for (const event of events) {
		if (
			new Date(event.timestamp).getTime() - sessionStartTime >
			currentTimestamp
		) {
			break
		}
		lastActiveEventIndex++
	}

	return lastActiveEventIndex
}
