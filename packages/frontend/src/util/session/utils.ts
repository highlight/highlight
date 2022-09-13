import moment from 'moment'

/**
 * Returns the absolute time.
 * @example A session started at 01/06/2022 at 1:00PM
 * We want to get the absolute time 5 minutes into the session.
 * This will return 01/06/2022 at 1:05PM.
 */
export const playerTimeToSessionAbsoluteTime = ({
	sessionStartTime,
	relativeTime,
}: {
	/** The timestamp for when the session started. */
	sessionStartTime: number
	/**
	 * The relative time in the session.
	 * @example 2500 (represents 2.5 seconds into the session.)
	 * */
	relativeTime: number
}) => {
	// This means the session doesn't have any events yet so we don't have a start timestamp.
	if (sessionStartTime === 0) {
		return relativeTime
	}

	return moment(new Date(sessionStartTime + relativeTime)).format('h:mm:ss A')
}
