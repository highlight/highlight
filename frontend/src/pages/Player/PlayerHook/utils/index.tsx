import { useGetErrorObjectQuery } from '@graph/hooks'
import { ErrorObject, Session, SessionComment } from '@graph/schemas'
import { EventType, Replayer } from '@highlight-run/rrweb'
import { playerMetaData, SessionInterval } from '@highlight-run/rrweb-types'
import { mui4Synder } from '@pages/Player/PlayerHook/utils/mui'
import { clamp } from '@util/numbers'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import moment from 'moment'
import { useCallback, useState } from 'react'
import { NavigateFunction, useLocation } from 'react-router-dom'

import { HighlightEvent } from '../../HighlightEvent'
import {
	ParsedErrorObject,
	ParsedEvent,
	ParsedHighlightEvent,
	ParsedSessionComment,
	ParsedSessionInterval,
} from '../../ReplayerContext'
import usePlayerConfiguration from './usePlayerConfiguration'

// Minimum percentage of total session duration required for an inactive interval to be rendered
export const INACTIVE_THRESHOLD = 0.02

/**
 * Calculates the active and inactive parts of a session.
 * @param metadata The Replayer's metadata.
 * @param allIntervals The intervals from Replayer. This is a Highlight-specific property.
 * @returns A list of time durations with active/inactive annotations.
 */
export const getSessionIntervals = (
	metadata: playerMetaData,
	allIntervals: SessionInterval[],
): ParsedSessionInterval[] => {
	// The intervals we get from rrweb are sometimes bad. Without special handling, the sessions bar is unusable. We mitigate an unusable slider by providing a single interval. See HIG-211 for context.
	const isBadSession = allIntervals.some((interval) => interval.duration < 0)
	if (isBadSession) {
		return [
			{
				active: true,
				duration: metadata.totalTime,
				endPercent: 1,
				startPercent: 0,
				endTime: metadata.totalTime,
				startTime: 0,
				errors: [],
				sessionEvents: [],
				comments: [],
			},
		]
	}

	return getIntervalWithPercentages(metadata, allIntervals)
}

const getIntervalWithPercentages = (
	metadata: playerMetaData,
	allIntervals: SessionInterval[],
): ParsedSessionInterval[] => {
	if (allIntervals.length === 0) {
		return []
	}

	const intervals = allIntervals.map((e) => ({
		...e,
		startTime: e.startTime - metadata.startTime,
		endTime: e.endTime - metadata.startTime,
	}))

	const { activeDuration, numInactive } = intervals.reduce(
		(acc, interval) => ({
			activeDuration: interval.active
				? acc.activeDuration + interval.duration
				: acc.activeDuration,
			numInactive: interval.active ? acc.numInactive : ++acc.numInactive,
		}),
		{ activeDuration: 0, numInactive: 0 },
	)

	const activePercent = 1 - INACTIVE_THRESHOLD * numInactive

	// Calculate percentage of player bar to allocate to each interval
	const withPercent = intervals.map((i, idx) => ({
		...i,
		idx,
		percent: i.active
			? // Round each interval size to a multiple of INACTIVE_THRESHOLD
			  Math.round(
					Math.max(
						(i.duration * activePercent) /
							activeDuration /
							INACTIVE_THRESHOLD,
						1,
					),
			  ) * INACTIVE_THRESHOLD
			: INACTIVE_THRESHOLD,
	}))

	// Allocate rounding error to the largest intervals
	withPercent.sort((a, b) => b.percent - a.percent)

	let error = withPercent.reduce((acc, i) => acc + i.percent, 0) - 1
	for (
		let i = 0;
		error >= INACTIVE_THRESHOLD;
		i++, error -= INACTIVE_THRESHOLD
	) {
		withPercent[i % withPercent.length].percent -= INACTIVE_THRESHOLD
	}
	for (
		let i = 0;
		error <= -INACTIVE_THRESHOLD;
		i++, error += INACTIVE_THRESHOLD
	) {
		withPercent[i % withPercent.length].percent += INACTIVE_THRESHOLD
	}

	withPercent.sort((a, b) => a.idx - b.idx)

	let currPercent = 0
	return withPercent.map((e) => {
		const prevPercent = currPercent
		currPercent = currPercent + e.percent
		return {
			...e,
			startPercent: prevPercent,
			endPercent: currPercent,
			errors: [],
			sessionEvents: [],
			comments: [],
		}
	})
}

export enum PlayerSearchParameters {
	/** The time in the player in seconds. */
	ts = 'ts',
	/** The absolute time in milliseconds. */
	tsAbs = 'tsAbs',
	/** The error ID for an error in the current session. The player's time will be set to the lookback period before the error's timestamp. */
	errorId = 'errorId',
	/** The Log Cursor where a link was coming from. **/
	log = 'log',
	/** The comment ID for a comment in the current session. The player's time will be set to the comments's timestamp. */
	commentId = 'commentId',
	/** Whether to mark the comment thread as muted.*/
	muted = 'muted',
}

export const useLinkErrorInstance = () => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const errorInstanceID = searchParams.get(PlayerSearchParameters.errorId)

	const { data: errorObject } = useGetErrorObjectQuery({
		variables: {
			id: errorInstanceID!,
		},
		skip: !errorInstanceID,
	})

	return {
		errorObject: errorObject?.error_object,
	}
}

export const useLinkLogCursor = () => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const logCursor = searchParams.get(PlayerSearchParameters.log)
	return {
		logCursor,
	}
}

/**
 *
 * @param setTime Sets the new time in milliseconds.
 */
export const useSetPlayerTimestampFromSearchParam = (
	setTime: (newTime: number) => void,
) => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const [hasSearchParam, setHasSearchParam] = useState(
		!!searchParams.get(PlayerSearchParameters.ts) ||
			!!searchParams.get(PlayerSearchParameters.tsAbs) ||
			!!searchParams.get(PlayerSearchParameters.errorId),
	)
	const {
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
	} = usePlayerConfiguration()

	const setPlayerTimestamp = useCallback(
		(
			sessionDurationMilliseconds: number,
			sessionStartTimeMilliseconds: number,
			errors: ErrorObject[],
		) => {
			const searchParamsObject = new URLSearchParams(location.search)

			if (searchParamsObject.get(PlayerSearchParameters.ts)) {
				const timestampSeconds = parseFloat(
					searchParamsObject.get(PlayerSearchParameters.ts) as string,
				)
				const timestampMilliseconds = timestampSeconds * 1000

				if (
					timestampMilliseconds > 0 ||
					timestampMilliseconds <= sessionDurationMilliseconds
				) {
					setTime(timestampMilliseconds)
				}
				setHasSearchParam(true)
			} else if (
				sessionStartTimeMilliseconds &&
				searchParamsObject.get(PlayerSearchParameters.tsAbs)
			) {
				const startTimestamp = moment(sessionStartTimeMilliseconds)
				const tsParam = searchParamsObject.get(
					PlayerSearchParameters.tsAbs,
				)

				// Sometimes we have a timestamp in milliseconds, other times it's a
				// formatted time string. This accounts for both cases. I believe
				// formatted time strings are built in the client, and millisecond
				// values are being sent in alerts.
				const absoluteTimestamp = isNaN(Number(tsParam))
					? tsParam
					: Number(tsParam)

				const relativeTimestampMilliseconds = moment(
					absoluteTimestamp,
				).diff(startTimestamp, 'milliseconds')

				setTime(relativeTimestampMilliseconds)
				setHasSearchParam(true)
			} else if (searchParamsObject.get(PlayerSearchParameters.errorId)) {
				const errorId = searchParamsObject.get(
					PlayerSearchParameters.errorId,
				)!
				const error = errors.find((e) => e.id === errorId)
				if (error && error.timestamp) {
					const sessionTime =
						new Date(error.timestamp).getTime() -
						sessionStartTimeMilliseconds
					if (
						sessionTime >= 0 ||
						sessionTime <= sessionDurationMilliseconds
					) {
						// If requestId is defined, time will be set based on the network request instead
						if (!error.request_id) {
							setTime(sessionTime)
							message.success(
								`Changed player time to where error was thrown at ${MillisToMinutesAndSeconds(
									sessionTime,
								)}.`,
							)
						}

						// Show errors on the timeline indicators if deep linked.
						if (
							!selectedTimelineAnnotationTypes.includes('Errors')
						) {
							setSelectedTimelineAnnotationTypes([
								...selectedTimelineAnnotationTypes,
								'Errors',
							])
						}
					}
				}
				setHasSearchParam(true)
			} else {
				setHasSearchParam(false)
			}
		},
		[
			location.search,
			selectedTimelineAnnotationTypes,
			setSelectedTimelineAnnotationTypes,
			setTime,
		],
	)

	return {
		/**
		 * Sets the player's time based on the search parameter "ts".
		 */
		setPlayerTimestamp,
		/** Whether the current page had a search param that needed to be handled. */
		hasSearchParam,
	}
}

/** These are the type of custom events that will show up as annotations on the timeline. */
const CustomEventsForTimeline = [
	'Click',
	'Focus',
	'Reload',
	'Navigate',
	'Segment',
	'Track',
	'Comments',
	'Viewport',
	'Identify',
	'Web Vitals',
	'Referrer',
	'RageClicks',
	'TabHidden',
] as const
const CustomEventsForTimelineSet = new Set(CustomEventsForTimeline)

export const EventsForTimeline = [...CustomEventsForTimeline, 'Errors'] as const

export type EventsForTimelineKeys = typeof EventsForTimeline

/**
 * Gets events for the timeline indicator based on the type of event.
 */
export const getEventsForTimelineIndicator = (
	events: HighlightEvent[],
	sessionStartTime: number,
	sessionTotalTime: number,
): ParsedHighlightEvent[] => {
	const eventsToAddToTimeline = events.filter((event) => {
		if (event.type === EventType.Custom) {
			const data = event.data as any
			return CustomEventsForTimelineSet.has(data.tag)
		}
		return false
	})

	const groupedEvents = assignEventToSessionInterval(
		eventsToAddToTimeline,
		sessionStartTime,
		sessionTotalTime,
	)

	return groupedEvents as ParsedHighlightEvent[]
}

/**
 * Gets errors with timestamps for the timeline indicator.
 */
export const getErrorsForTimelineIndicator = (
	errors: ErrorObject[],
	sessionStartTime: number,
	sessionTotalTime: number,
): ParsedErrorObject[] => {
	const errorsWithTimestamps = errors.filter((error) => !!error.timestamp)

	const groupedEvents = assignEventToSessionInterval(
		errorsWithTimestamps,
		sessionStartTime,
		sessionTotalTime,
	)

	return groupedEvents as ParsedErrorObject[]
}

/**
 * Gets comments for the timeline indicator based on the type of event.
 */
export const getCommentsForTimelineIndicator = (
	comments: SessionComment[],
	sessionStartTime: number,
	sessionTotalTime: number,
): ParsedSessionComment[] => {
	const commentsWithTimestamps = comments
		.filter(
			(comment) => !!comment.timestamp || !!comment.metadata?.timestamp,
		)
		.map((comment) => {
			if (comment.type === 'FEEDBACK') {
				const timestamp =
					new Date(comment.metadata.timestamp).getTime() -
					sessionStartTime
				return {
					...comment,
					timestamp,
				}
			}

			return { ...comment }
		})

	const groupedEvents = assignEventToSessionInterval(
		commentsWithTimestamps,
		sessionStartTime,
		sessionTotalTime,
		true,
	)

	return groupedEvents as ParsedSessionComment[]
}

/**
 * Adds error events based on the interval that the error was thrown.
 */
export const addEventsToSessionIntervals = (
	sessionIntervals: ParsedSessionInterval[],
	events: HighlightEvent[],
	sessionStartTime: number,
): ParsedSessionInterval[] => {
	const eventsToAddToTimeline = events.filter((event) => {
		if (event.type === EventType.Custom) {
			const data = event.data as any
			return CustomEventsForTimelineSet.has(data.tag)
		}
		return false
	})
	const groupedEvents = assignEventToSessionIntervalRelative(
		sessionIntervals,
		eventsToAddToTimeline,
		sessionStartTime,
	)

	return sessionIntervals.map((sessionInterval, index) => ({
		...sessionInterval,
		sessionEvents: groupedEvents[index] as ParsedHighlightEvent[],
	}))
}

/**
 * Adds error events based on the interval that the error was thrown.
 */
export const addErrorsToSessionIntervals = (
	sessionIntervals: ParsedSessionInterval[],
	errors: ErrorObject[],
	sessionStartTime: number,
): ParsedSessionInterval[] => {
	const errorsWithTimestamps = errors
		.filter((error) => !!error.timestamp)
		.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

	const groupedErrors = assignEventToSessionIntervalRelative(
		sessionIntervals,
		errorsWithTimestamps,
		sessionStartTime,
	)

	return sessionIntervals.map((sessionInterval, index) => ({
		...sessionInterval,
		errors: groupedErrors[index] as ParsedErrorObject[],
	}))
}

/**
 * Adds events to the session interval that the event occurred in.
 */
const assignEventToSessionIntervalRelative = (
	sessionIntervals: ParsedSessionInterval[],
	events: ParsableEvent[],
	sessionStartTime: number,
	/** Whether the timestamp in events global time or already relative to the session. */
	relativeTime = false,
) => {
	let eventIndex = 0
	let sessionIntervalIndex = 0
	let currentSessionInterval = sessionIntervals[sessionIntervalIndex]
	const response: ParsedEvent[][] = Array.from(
		Array(sessionIntervals.length),
	).map(() => [])
	while (
		eventIndex < events.length &&
		sessionIntervalIndex < sessionIntervals.length
	) {
		const event = events[eventIndex]
		const relativeTimestamp = relativeTime
			? Number(event.timestamp) || 0
			: new Date(event.timestamp!).getTime() - sessionStartTime
		if (relativeTimestamp < currentSessionInterval.startTime) {
			eventIndex++
		} else if (
			relativeTimestamp >= currentSessionInterval.startTime &&
			relativeTimestamp <= currentSessionInterval.endTime
		) {
			const relativeTime =
				relativeTimestamp - currentSessionInterval.startTime
			response[sessionIntervalIndex].push({
				...event,
				// Calculate at the percentage of time where the event occurred in the session.
				relativeIntervalPercentage: clamp(
					(relativeTime / currentSessionInterval.duration) * 100,
					0,
					100,
				),
			})
			eventIndex++
		} else {
			sessionIntervalIndex++
			currentSessionInterval = sessionIntervals[sessionIntervalIndex]
		}
	}
	return response
}

/**
 * Returns the comments that are in the respective interval bins. If a comment is in the ith index, then it shows up in the ith session interval.
 */
export const getCommentsInSessionIntervalsRelative = (
	sessionIntervals: ParsedSessionInterval[],
	comments: SessionComment[],
	sessionStartTime: number,
): ParsedSessionInterval[] => {
	const newComments = comments.map((comment) => {
		// Set `timestamp` which represents the relative time in the session of when the session feedback was created.
		if (comment.type === 'FEEDBACK') {
			const timestamp =
				new Date(comment.metadata.timestamp).getTime() -
				sessionStartTime
			return {
				...comment,
				timestamp,
			}
		}

		return { ...comment }
	})
	const groupedComments = assignEventToSessionIntervalRelative(
		sessionIntervals,
		newComments,
		sessionStartTime,
		true,
	)

	return sessionIntervals.map((sessionInterval, index) => ({
		...sessionInterval,
		comments: groupedComments[index] as ParsedSessionComment[],
	}))
}

/**
 * Returns the comments that are in the respective interval bins. If a comment is in the ith index, then it shows up in the ith session interval.
 */
export const getCommentsInSessionIntervals = (
	comments: SessionComment[],
	sessionStartTime: number,
	sessionTotalTime: number,
): ParsedSessionComment[] => {
	return assignEventToSessionInterval(
		comments,
		sessionStartTime,
		sessionTotalTime,
		true,
	) as ParsedSessionComment[]
}

type ParsableEvent = ErrorObject | HighlightEvent | SessionComment

/**
 * Adds events to the session interval that the event occurred in.
 */
const assignEventToSessionInterval = (
	events: ParsableEvent[],
	sessionStartTime: number,
	sessionTotalTime: number,
	/** Whether the timestamp in events global time or already relative to the session. */
	relativeTime = false,
) => {
	const response: ParsedEvent[] = []

	events.forEach((event) => {
		const relativeTimestamp = relativeTime
			? Number(event.timestamp) || 0
			: new Date(event.timestamp!).getTime() - sessionStartTime

		response.push({
			...event,
			relativeIntervalPercentage: clamp(
				(relativeTimestamp / sessionTotalTime) * 100,
				0,
				100,
			),
		})
	})

	return response
}

export const findNextSessionInList = (
	allSessions: Session[],
	currentSessionSecureId: string,
): Session | null => {
	let currentSessionIndex = allSessions.findIndex(
		(session) => session.secure_id === currentSessionSecureId,
	)

	// This happens if the current session was removed from the session feed.
	if (currentSessionIndex === -1) {
		currentSessionIndex = 0
	}

	const nextSessionIndex = currentSessionIndex + 1

	// Don't go beyond the last session.
	if (nextSessionIndex >= allSessions.length) {
		return null
	}

	return allSessions[nextSessionIndex]
}

export const findPreviousSessionInList = (
	allSessions: Session[],
	currentSessionSecureId: string,
): Session | null => {
	const currentSessionIndex = allSessions.findIndex(
		(session) => session.secure_id === currentSessionSecureId,
	)

	// This happens if the current session was removed from the session feed.
	if (currentSessionIndex < 0) {
		return allSessions[0]
	}

	const nextSessionIndex = currentSessionIndex - 1

	// Don't go beyond the first session.
	if (nextSessionIndex < 0) {
		return null
	}

	return allSessions[nextSessionIndex]
}

export const changeSession = (
	projectId: string,
	navigate: NavigateFunction,
	session: Session | null,
	successMessageText?: string,
) => {
	if (!session) {
		message.success('No more sessions to play.')
		return
	}

	navigate(`/${projectId}/sessions/${session.secure_id}`)
	if (successMessageText?.length) {
		message.success(successMessageText)
	}
}

export const loadiFrameResources = (r: Replayer, project_id: string) => {
	// Inject the Material font icons into the player if it's a Boardgent session.
	// Context: https://linear.app/highlight/issue/HIG-1996/support-loadingsaving-resources-that-are-not-available-on-the-open-web
	if (project_id === '669' && r.iframe.contentDocument) {
		const cssLink = document.createElement('link')
		cssLink.href =
			'https://cdn.jsdelivr.net/npm/@mdi/font@6.5.95/css/materialdesignicons.min.css'
		cssLink.rel = 'stylesheet'
		cssLink.type = 'text/css'
		r.iframe.contentDocument.head.appendChild(cssLink)
	}
	// Inject FontAwesome for Gelt Finance sessions.
	// Context: https://linear.app/highlight/issue/HIG-2232/fontawesome-library
	if (project_id === '896' && r.iframe.contentDocument) {
		const scriptLink = document.createElement('script')
		scriptLink.src = 'https://kit.fontawesome.com/2fb433086f.js'
		scriptLink.crossOrigin = 'anonymous'
		r.iframe.contentDocument.head.appendChild(scriptLink)
	}
	// Add missing stylesheets for Mazumago
	// Context: https://linear.app/highlight/issue/HIG-2441/mazumago-styling-issue
	if (
		(project_id === '1026' ||
			project_id === '1028' ||
			project_id === '1017') &&
		r.iframe.contentDocument
	) {
		const cssRoboto = document.createElement('link')
		cssRoboto.href =
			'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&amp;display=swap'
		cssRoboto.rel = 'stylesheet'
		r.iframe.contentDocument.head.appendChild(cssRoboto)
		const cssIcons = document.createElement('link')
		cssIcons.href =
			'https://fonts.googleapis.com/icon?family=Material+Icons'
		cssIcons.rel = 'stylesheet'
		r.iframe.contentDocument.head.appendChild(cssIcons)
		const scriptLink = document.createElement('script')
		scriptLink.src =
			'https://unpkg.com/@mui/material@5.9.0/umd/material-ui.production.min.js'
		scriptLink.crossOrigin = 'anonymous'
		r.iframe.contentDocument.head.appendChild(scriptLink)
	}
	// Add missing stylesheets for Synder
	if (project_id === '1031' && r.iframe.contentDocument) {
		for (const [key, value] of Object.entries(mui4Synder)) {
			const style = document.createElement('style')
			style.dataset.meta = key
			style.innerHTML = value
			r.iframe.contentDocument.head.appendChild(style)
		}
	}
}

export const toHighlightEvents = (
	events: Array<any>,
): Array<HighlightEvent> => {
	return (
		events.map((e: HighlightEvent, i: number) => {
			return { ...e, identifier: i.toString() }
		}) ?? []
	)
}

type EventTypesKeys = {
	[key in EventsForTimelineKeys[number]]: string | React.ReactNode
}

export type EventTypeWithDescription = Omit<
	EventTypesKeys,
	'Web Vitals' | 'Referrer'
>

export const EventTypeDescriptions: EventTypeWithDescription = {
	Segment: (
		<span>
			The client-side segment installation fired a track or identify
			event.{' '}
			<a
				href="https://docs.highlight.run/docs/segment-integration"
				target="_blank"
				rel="noreferrer"
			>
				Learn more
			</a>
		</span>
	),
	Errors: "Any error that shows up in the Developer Tools' Console will be shown",
	Focus: 'An element received either with a mouse or keyboard',
	Navigate:
		"The user is moving around in your application where their transitions don't require a full page reload",
	Reload: 'The page was reloaded during the session by refreshing the page or opening the app again within the same tab',
	Click: 'A user clicked on an element on the page',
	Track: 'These are custom calls to Highlights track method for custom logging',
	Comments: 'These are comments created by you and other people on your team',
	Identify:
		'These are custom calls to Highlight identify method to add identity metadata for a session.',
	Viewport: 'The size of the browser changed.',
	TabHidden: 'The user switched away from the current tab.',
	RageClicks: 'The user clicked on the same element multiple times in a row.',
} as const
