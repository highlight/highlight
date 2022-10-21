import { ApolloQueryResult, LazyQueryExecFunction } from '@apollo/client'
import { MarkSessionAsViewedMutationFn } from '@graph/hooks'
import {
	GetEventChunksQuery,
	GetEventChunkUrlQuery,
	GetSessionIntervalsQuery,
	GetSessionPayloadQuery,
	GetSessionQuery,
	GetTimelineIndicatorEventsQuery,
} from '@graph/operations'
import {
	ErrorObject,
	Exact,
	Session,
	SessionComment,
	SessionResults,
} from '@graph/schemas'
import { Replayer } from '@highlight-run/rrweb'
import {
	customEvent,
	playerMetaData,
	SessionInterval,
	viewportResizeDimension,
} from '@highlight-run/rrweb/typings/types'
import { usefulEvent } from '@pages/Player/components/EventStream/EventStream'
import {
	HighlightEvent,
	HighlightJankPayload,
	HighlightPerformancePayload,
} from '@pages/Player/HighlightEvent'
import {
	addErrorsToSessionIntervals,
	addEventsToSessionIntervals,
	getCommentsInSessionIntervalsRelative,
	getEventsForTimelineIndicator,
	getSessionIntervals,
	toHighlightEvents,
} from '@pages/Player/PlayerHook/utils'
import {
	ParsedHighlightEvent,
	ParsedSessionInterval,
	RageClick,
	ReplayerState,
} from '@pages/Player/ReplayerContext'
import {
	findLatestUrl,
	getAllJankEvents,
	getAllPerformanceEvents,
	getAllUrlEvents,
	getBrowserExtensionScriptURLs,
} from '@pages/Player/SessionLevelBar/utils/utils'
import log from '@util/log'
import { H } from 'highlight.run'
import { SetStateAction } from 'react'

const EMPTY_SESSION_METADATA = {
	startTime: 0,
	endTime: 0,
	totalTime: 0,
}
const PROJECTS_WITH_CSS_ANIMATIONS: string[] = ['1', '1020', '1021']

export const CHUNKING_DISABLED_PROJECTS: string[] = []
export const LOOKAHEAD_MS = 30000
export const MAX_CHUNK_COUNT = 5
// Play sessions at a 7s delay to give time for events to be buffered in advance of playback.
export const LIVE_MODE_DELAY = 7000

export enum SessionViewability {
	VIEWABLE,
	EMPTY_SESSION,
	OVER_BILLING_QUOTA,
	ERROR,
}

type FetchEventChunkURLFn = (
	variables?:
		| Partial<Exact<{ secure_id: string; index: number }>>
		| undefined,
) => Promise<ApolloQueryResult<GetEventChunkUrlQuery>>

interface PlayerState {
	browserExtensionScriptURLs: string[]
	currentEvent: string
	currentUrl: string | undefined
	errors: ErrorObject[]
	eventChunksData: GetEventChunksQuery | undefined
	events: HighlightEvent[]
	eventsForTimelineIndicator: ParsedHighlightEvent[]
	eventsLoaded: boolean
	fetchEvents?: Promise<Response>
	fetchEventChunkURL: FetchEventChunkURLFn
	getSessionPayloadQuery: LazyQueryExecFunction<
		GetSessionPayloadQuery,
		Exact<{ session_secure_id: string; skip_events: boolean }>
	>
	isHighlightAdmin: boolean
	isLiveMode: boolean
	isLoadingEvents: boolean
	isLoggedIn: boolean
	jankPayloads: Array<HighlightJankPayload>
	lastActiveString: string | null
	lastActiveTimestamp: number
	// Incremented whenever events are received in live mode. This is subscribed
	// to for knowing when new live events are available to add to the player.
	liveEventCount: number
	markSessionAsViewed: MarkSessionAsViewedMutationFn
	performancePayloads: Array<HighlightPerformancePayload>
	project_id: string
	rageClicks: RageClick[]
	replayer: Replayer | undefined
	replayerState: ReplayerState
	scale: number
	session: Session | undefined
	sessionComments: SessionComment[]
	sessionEndTime: number
	sessionIntervals: Array<ParsedSessionInterval>
	// Tracks the start/end/total time for a session. Using replayer.getMetaData is
	// no longer accurate because the first or last event chunks might not be loaded.
	sessionMetadata: playerMetaData
	sessionResults: SessionResults
	sessionViewability: SessionViewability
	session_secure_id: string
	time: number
	viewingUnauthorizedSession: boolean
	viewport: viewportResizeDimension | undefined
}

export enum PlayerActionType {
	Pause,
	Play,
	Seek,
	addLiveEvents,
	loadSession,
	onChunkLoaded,
	startChunksLoad,
	onChunksLoad,
	onFrame,
	onSessionPayloadLoaded,
	onEvent,
	reset,
	setCurrentEvent,
	setIsLiveMode,
	setLastActiveString,
	setScale,
	setSessionResults,
	setViewingUnauthorizedSession,
	updateCurrentUrl,
	updateViewport,
}

type PlayerAction =
	| Play
	| Pause
	| Seek
	| addLiveEvents
	| loadSession
	| onChunkLoaded
	| startChunksLoad
	| onChunksLoad
	| onFrame
	| onSessionPayloadLoaded
	| onEvent
	| reset
	| setCurrentEvent
	| setLastActiveString
	| setScale
	| setSessionResults
	| setIsLiveMode
	| setViewingUnauthorizedSession
	| updateCurrentUrl
	| updateViewport

interface Play {
	type: PlayerActionType.Play
	time: number
}

interface Pause {
	type: PlayerActionType.Pause
	time: number
}

interface Seek {
	type: PlayerActionType.Seek
	time: number
	// if set, will not apply a replayer action (will only set the time)
	noAction?: boolean
}

interface addLiveEvents {
	type: PlayerActionType.addLiveEvents
}

interface loadSession {
	type: PlayerActionType.loadSession
	data: GetSessionQuery
	fetchEventChunkURL: FetchEventChunkURLFn
}

interface reset {
	type: PlayerActionType.reset
	projectId: string
	sessionSecureId: string
	nextState?: ReplayerState
}

interface onEvent {
	type: PlayerActionType.onEvent
	event: HighlightEvent
}

interface updateViewport {
	type: PlayerActionType.updateViewport
	viewport: viewportResizeDimension
}

interface updateCurrentUrl {
	type: PlayerActionType.updateCurrentUrl
	currentTime: number
}

interface onChunkLoaded {
	type: PlayerActionType.onChunkLoaded
	chunkEvents: Omit<Map<number, HighlightEvent[]>, 'set' | 'clear' | 'delete'>
	showPlayerMouseTail: boolean
}

interface startChunksLoad {
	type: PlayerActionType.startChunksLoad
}

interface onChunksLoad {
	type: PlayerActionType.onChunksLoad
}

interface onFrame {
	type: PlayerActionType.onFrame
	time: number
}

interface onSessionPayloadLoaded {
	type: PlayerActionType.onSessionPayloadLoaded
	sortedChunks: [number, HighlightEvent[]][]
	sessionPayload?: GetSessionPayloadQuery
	sessionIntervals?: GetSessionIntervalsQuery
	eventChunksData?: GetEventChunksQuery
	timelineIndicatorEvents?: GetTimelineIndicatorEventsQuery
}

interface setLastActiveString {
	type: PlayerActionType.setLastActiveString
	lastActiveString: SetStateAction<string | null>
}

interface setScale {
	type: PlayerActionType.setScale
	scale: SetStateAction<number>
}

interface setSessionResults {
	type: PlayerActionType.setSessionResults
	sessionResults: SetStateAction<SessionResults>
}

interface setIsLiveMode {
	type: PlayerActionType.setIsLiveMode
	isLiveMode: SetStateAction<boolean>
}

interface setViewingUnauthorizedSession {
	type: PlayerActionType.setViewingUnauthorizedSession
	viewingUnauthorizedSession: SetStateAction<boolean>
}

interface setCurrentEvent {
	type: PlayerActionType.setCurrentEvent
	currentEvent: SetStateAction<string>
}

export const PlayerInitialState = {
	browserExtensionScriptURLs: [],
	currentEvent: '',
	currentUrl: undefined,
	errors: [],
	eventChunksData: undefined,
	events: [],
	eventsDataLoaded: false,
	eventsForTimelineIndicator: [],
	eventsLoaded: false,
	fetchEventChunkURL: undefined,
	isLiveMode: false,
	isLoadingEvents: false,
	jankPayloads: [],
	lastActiveString: null,
	lastActiveTimestamp: 0,
	liveEventCount: 0,
	performancePayloads: [],
	project_id: '',
	rageClicks: [],
	replayer: undefined,
	replayerState: ReplayerState.Empty,
	scale: 1,
	session: undefined,
	sessionComments: [],
	sessionEndTime: 0,
	sessionIntervals: [],
	sessionMetadata: EMPTY_SESSION_METADATA,
	sessionResults: { sessions: [], totalCount: -1 },
	sessionViewability: SessionViewability.VIEWABLE,
	session_secure_id: '',
	time: 0,
	viewingUnauthorizedSession: false,
	viewport: undefined,
}

export const PlayerReducer = (
	state: PlayerState,
	action: PlayerAction,
): PlayerState => {
	let s = { ...state }
	switch (action.type) {
		case PlayerActionType.Play:
			s.time = action.time
			s.replayerState = ReplayerState.Playing
			s.replayer?.play(s.time)
			break
		case PlayerActionType.Pause:
			s.isLiveMode = false
			s.replayerState = ReplayerState.Paused
			if (action.time !== undefined) {
				s.time = action.time
			}
			s.replayer?.pause(s.time)
			break
		case PlayerActionType.Seek:
			s.time = action.time
			if (action?.noAction) break
			if (s.replayerState === ReplayerState.Playing) {
				s.replayer?.play(s.time)
			} else if (s.replayerState === ReplayerState.Paused) {
				s.replayer?.pause(s.time)
			}
			break
		case PlayerActionType.addLiveEvents:
			s.liveEventCount += 1
			s.lastActiveTimestamp = new Date(
				// @ts-ignore The typedef for subscriptionData is incorrect
				subscriptionData.data!.session_payload_appended.last_user_interaction_time,
			).getTime()
			break
		case PlayerActionType.loadSession:
			s.fetchEventChunkURL = action.fetchEventChunkURL
			if (action.data.session) {
				s.session = action.data?.session as Session
			}
			if (action.data.session === null) {
				s.sessionViewability = SessionViewability.ERROR
			} else if (
				action.data.session?.within_billing_quota ||
				s.isHighlightAdmin
			) {
				if (
					!action.data.session?.within_billing_quota &&
					s.isHighlightAdmin
				) {
					alert(
						"btw this session is outside of the project's billing quota.",
					)
				}
				// Show the authorization form for Highlight staff if they're trying to access a customer session.
				if (s.isHighlightAdmin && s.project_id !== '1') {
					s.viewingUnauthorizedSession = true
				}
				if (action.data.session?.last_user_interaction_time) {
					s.lastActiveTimestamp = new Date(
						action.data.session?.last_user_interaction_time,
					).getTime()
				}
				if (s.isLoggedIn && s.session_secure_id !== 'repro') {
					s.markSessionAsViewed({
						variables: {
							secure_id: s.session_secure_id,
							viewed: true,
						},
					}).catch(console.error)
				}

				const directDownloadUrl =
					action.data.session?.direct_download_url
				if (directDownloadUrl) {
					s.getSessionPayloadQuery({
						variables: {
							session_secure_id: s.session_secure_id,
							skip_events: true,
						},
					}).catch(console.error)

					if (
						action.data.session?.chunked &&
						!CHUNKING_DISABLED_PROJECTS.includes(s.project_id)
					) {
						s.fetchEvents = s
							.fetchEventChunkURL({
								secure_id: s.session_secure_id,
								index: 0,
							})
							.then((response) =>
								fetch(response.data.event_chunk_url),
							)
					} else {
						s.fetchEvents = fetch(directDownloadUrl)
					}
				} else {
					s.getSessionPayloadQuery({
						variables: {
							session_secure_id: s.session_secure_id,
							skip_events: false,
						},
					}).catch(console.error)
				}
				s.sessionViewability = SessionViewability.VIEWABLE
				H.track('Viewed session', { is_guest: !s.isLoggedIn })
			} else {
				s.sessionViewability = SessionViewability.OVER_BILLING_QUOTA
			}
			break
		case PlayerActionType.reset:
			return {
				...s,
				project_id: action.projectId,
				session_secure_id: action.sessionSecureId,
				replayerState: action.nextState || ReplayerState.Empty,
				session: undefined,
				errors: [],
				scale: 1,
				sessionComments: [],
				replayer: undefined,
				time: 0,
				sessionEndTime: 0,
				sessionIntervals: [],
				sessionViewability: SessionViewability.VIEWABLE,
				isLiveMode: false,
				lastActiveTimestamp: 0,
				lastActiveString: null,
				sessionMetadata: EMPTY_SESSION_METADATA,
			}
		case PlayerActionType.updateViewport:
			s.viewport = action.viewport
			break
		case PlayerActionType.updateCurrentUrl:
			if (!s.replayer) break
			s.currentUrl = findLatestUrl(
				getAllUrlEvents(s.events),
				action.currentTime,
			)
			break
		// Handle data in playback mode.
		case PlayerActionType.onChunkLoaded:
			const nextEvents: HighlightEvent[] = []
			for (const v of action.chunkEvents.values()) {
				for (const val of v) {
					nextEvents.push(val)
				}
			}

			if (!nextEvents || nextEvents.length === 0) break

			s.isLiveMode = s.session?.processed === false
			if (nextEvents.length < 2) {
				if (!(s.session?.processed === false)) {
					s.sessionViewability = SessionViewability.EMPTY_SESSION
				}
				break
			}

			s.sessionViewability = SessionViewability.VIEWABLE
			// Add an id field to each event so it can be referenced.

			if (s.replayer === undefined) {
				s = initReplayer(s, action, nextEvents)
			}

			s.events = nextEvents
			break
		case PlayerActionType.startChunksLoad:
			s.isLoadingEvents = true
			s.replayer?.pause()
			break
		case PlayerActionType.onChunksLoad:
			s.isLoadingEvents = false
			break
		case PlayerActionType.onFrame:
			s.time = action.time
			if (s.time >= s.sessionMetadata.totalTime) {
				s.replayerState = s.isLiveMode
					? ReplayerState.Paused // Waiting for more data
					: ReplayerState.SessionEnded
			}
			break
		case PlayerActionType.onEvent:
			if (usefulEvent(action.event)) {
				s.currentEvent = action.event.identifier
			}
			if ((action.event as customEvent)?.data?.tag === 'Stop') {
				s.replayerState = ReplayerState.SessionRecordingStopped
			}
			if (action.event.type === 5) {
				switch (action.event.data.tag) {
					case 'Navigate':
					case 'Reload':
						s.currentUrl = action.event.data.payload as string
						break
				}
			}
			break
		case PlayerActionType.onSessionPayloadLoaded:
			if (action.sessionPayload?.errors) {
				s.errors = action.sessionPayload.errors as ErrorObject[]
			}
			if (action.sessionPayload?.session_comments) {
				s.sessionComments = action.sessionPayload
					.session_comments as SessionComment[]
			}
			s.eventChunksData = action.eventChunksData!
			if (!s.replayer) break
			const allEvents: HighlightEvent[] = []
			for (const [, v] of action.sortedChunks) {
				for (const val of v) {
					allEvents.push(val)
				}
			}
			if (allEvents.length) {
				s.replayer.replaceEvents(allEvents)
			}

			// Preprocess session interval data from backend
			const parsedSessionIntervalsData: SessionInterval[] =
				action.sessionIntervals &&
				action.sessionIntervals.session_intervals.length > 0
					? action.sessionIntervals.session_intervals.map(
							(interval) => {
								return {
									startTime: new Date(
										interval.start_time,
									).getTime(),
									endTime: new Date(
										interval.end_time,
									).getTime(),
									duration: interval.duration,
									active: interval.active,
								}
							},
					  )
					: s.replayer.getActivityIntervals()
			const sm: playerMetaData = parsedSessionIntervalsData
				? {
						startTime: new Date(
							parsedSessionIntervalsData[0].startTime,
						).getTime(),
						endTime: new Date(
							parsedSessionIntervalsData[
								parsedSessionIntervalsData.length - 1
							].endTime,
						).getTime(),
						totalTime:
							new Date(
								parsedSessionIntervalsData[
									parsedSessionIntervalsData.length - 1
								].endTime,
							).getTime() -
							new Date(
								parsedSessionIntervalsData[0].startTime,
							).getTime(),
				  }
				: s.replayer.getMetaData()

			const sessionIntervals = getSessionIntervals(
				sm,
				parsedSessionIntervalsData,
			)

			const parsedTimelineIndicatorEvents =
				action.timelineIndicatorEvents &&
				action.timelineIndicatorEvents.timeline_indicator_events
					.length > 0
					? toHighlightEvents(
							action.timelineIndicatorEvents
								.timeline_indicator_events,
					  )
					: allEvents
			const si = getCommentsInSessionIntervalsRelative(
				addEventsToSessionIntervals(
					addErrorsToSessionIntervals(
						sessionIntervals,
						s.errors,
						sm.startTime,
					),
					parsedTimelineIndicatorEvents,
					sm.startTime,
				),
				s.sessionComments,
				sm.startTime,
			)
			s.sessionIntervals = si
			s.eventsForTimelineIndicator = getEventsForTimelineIndicator(
				parsedTimelineIndicatorEvents,
				sm.startTime,
				sm.totalTime,
			)
			s.sessionEndTime = sm.endTime

			if (action.sessionPayload?.rage_clicks) {
				const allClickEvents: (ParsedHighlightEvent & {
					sessionIndex: number
				})[] = []

				sessionIntervals.forEach((interval, sessionIndex) => {
					interval.sessionEvents.forEach((event) => {
						if (event.type === 5 && event.data.tag === 'Click') {
							allClickEvents.push({
								...event,
								sessionIndex,
							})
						}
					})
				})

				const rageClicksWithRelativePositions: RageClick[] = []

				action.sessionPayload.rage_clicks.forEach((rageClick) => {
					const rageClickStartUnixTimestamp = new Date(
						rageClick.start_timestamp,
					).getTime()
					const rageClickEndUnixTimestamp = new Date(
						rageClick.end_timestamp,
					).getTime()
					/**
					 * We have this tolerance because time reporting for milliseconds precision is slightly off.
					 */
					const DIFFERENCE_TOLERANCE = 100

					const matchingStartClickEvent = allClickEvents.find(
						(clickEvent) => {
							if (
								Math.abs(
									clickEvent.timestamp -
										rageClickStartUnixTimestamp,
								) < DIFFERENCE_TOLERANCE
							) {
								return true
							}
						},
					)
					const matchingEndClickEvent = allClickEvents.find(
						(clickEvent) => {
							if (
								Math.abs(
									clickEvent.timestamp -
										rageClickEndUnixTimestamp,
								) < DIFFERENCE_TOLERANCE
							) {
								return true
							}
						},
					)

					if (matchingStartClickEvent && matchingEndClickEvent) {
						rageClicksWithRelativePositions.push({
							endTimestamp: rageClick.end_timestamp,
							startTimestamp: rageClick.start_timestamp,
							totalClicks: rageClick.total_clicks,
							startPercentage:
								matchingStartClickEvent.relativeIntervalPercentage,
							endPercentage:
								matchingEndClickEvent.relativeIntervalPercentage,
							sessionIntervalIndex:
								matchingStartClickEvent.sessionIndex,
						} as RageClick)
					}
				})

				s.rageClicks = rageClicksWithRelativePositions
				s.sessionIntervals = sessionIntervals
			}
			s.sessionMetadata = sm
			s.eventsLoaded = true
			break
		case PlayerActionType.setScale:
			s.scale = handleSetStateAction(s.scale, action.scale)
			break
		case PlayerActionType.setLastActiveString:
			s.lastActiveString = handleSetStateAction(
				s.lastActiveString,
				action.lastActiveString,
			)
			break
		case PlayerActionType.setIsLiveMode:
			s.isLiveMode = handleSetStateAction(s.isLiveMode, action.isLiveMode)
			break
		case PlayerActionType.setViewingUnauthorizedSession:
			s.viewingUnauthorizedSession = handleSetStateAction(
				s.viewingUnauthorizedSession,
				action.viewingUnauthorizedSession,
			)
			break
		case PlayerActionType.setCurrentEvent:
			s.currentEvent = handleSetStateAction(
				s.currentEvent,
				action.currentEvent,
			)
			break
		case PlayerActionType.setSessionResults:
			s.sessionResults = handleSetStateAction(
				s.sessionResults,
				action.sessionResults,
			)
			break
	}
	if (
		new Set<PlayerActionType>([
			PlayerActionType.onFrame,
			PlayerActionType.updateViewport,
			PlayerActionType.updateCurrentUrl,
		]).has(action.type)
	) {
		log('PlayerStateUpdate', PlayerActionType[action.type], {
			initialState: state,
			finalState: s,
			action,
		})
	} else {
		log('PlayerStateTransition', PlayerActionType[action.type], {
			initialState: state,
			finalState: s,
			action,
		})
	}
	return s
}

const handleSetStateAction = <T>(s: T, a: SetStateAction<T>) => {
	if (a instanceof Function) {
		return a(s)
	} else {
		return a
	}
}

const initReplayer = (
	s: PlayerState,
	action: onChunkLoaded,
	events: HighlightEvent[],
) => {
	// Load the first chunk of events. The rest of the events will be loaded in requestAnimationFrame.
	const playerMountingRoot = document.getElementById('player') as HTMLElement
	if (!playerMountingRoot) {
		s.replayerState = ReplayerState.Empty
		return s
	} else {
		s.replayerState = ReplayerState.Loading
	}
	// There are existing children on an already initialized player page. We want to unmount the previously mounted player to mount the new one.
	// Example: User is viewing Session A, they navigate to Session B. The player for Session A needs to be unmounted. If we don't unmount it then there will be 2 players on the page.
	if (playerMountingRoot?.childNodes?.length > 0) {
		while (playerMountingRoot.firstChild) {
			playerMountingRoot.removeChild(playerMountingRoot.firstChild)
		}
	}

	s.replayer = new Replayer(events, {
		root: playerMountingRoot,
		triggerFocus: false,
		mouseTail: action.showPlayerMouseTail,
		UNSAFE_replayCanvas: true,
		liveMode: s.isLiveMode,
		useVirtualDom: false,
		pauseAnimation: !PROJECTS_WITH_CSS_ANIMATIONS.includes(s.project_id),
	})

	s.browserExtensionScriptURLs = getBrowserExtensionScriptURLs(events)

	const onlyUrlEvents = getAllUrlEvents(events)
	if (onlyUrlEvents.length >= 1) {
		s.currentUrl = onlyUrlEvents[0].data.payload
	}
	s.performancePayloads = getAllPerformanceEvents(events)
	s.jankPayloads = getAllJankEvents(events)
	if (s.isLiveMode) {
		s.replayer.startLive(events[0].timestamp)
	}
	return s
}
