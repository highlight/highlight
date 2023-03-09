import { MarkSessionAsViewedMutationFn } from '@graph/hooks'
import {
	GetSessionIntervalsQuery,
	GetSessionPayloadQuery,
	GetSessionQuery,
	GetTimelineIndicatorEventsQuery,
} from '@graph/operations'
import {
	ErrorObject,
	Session,
	SessionComment,
	SessionResults,
} from '@graph/schemas'
import { EventType, Replayer } from '@highlight-run/rrweb'
import {
	customEvent,
	metaEvent,
	playerMetaData,
	SessionInterval,
	viewportResizeDimension,
} from '@highlight-run/rrweb-types'
import { usefulEvent } from '@pages/Player/components/EventStreamV2/utils'
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
import analytics from '@util/analytics'
import log from '@util/log'
import { timedCall } from '@util/perf/instrument'
import { H } from 'highlight.run'
import moment from 'moment/moment'
import { MutableRefObject, SetStateAction } from 'react'

const EMPTY_SESSION_METADATA = {
	startTime: 0,
	endTime: 0,
	totalTime: 0,
}
const PROJECTS_WITH_CSS_ANIMATIONS: string[] = ['1', '1020', '1021']

// assuming 120 fps
export const FRAME_MS = 1000 / 120

export const CHUNKING_DISABLED_PROJECTS: string[] = []
export const LOOKAHEAD_MS = 1000 * 60
export const MAX_CHUNK_COUNT = 8

export enum SessionViewability {
	VIEWABLE,
	EMPTY_SESSION,
	OVER_BILLING_QUOTA,
	ERROR,
}

type FetchEventChunkURLFn = ({}: {
	secure_id: string
	index: number
}) => Promise<string>

interface PlayerState {
	browserExtensionScriptURLs: string[]
	chunkEventsRef: MutableRefObject<
		Omit<Map<number, HighlightEvent[]>, 'clear' | 'set' | 'delete'>
	>
	currentEvent: string
	currentUrl: string | undefined
	errors: ErrorObject[]
	eventsForTimelineIndicator: ParsedHighlightEvent[]
	eventsLoaded: boolean
	fetchEventChunkURL: FetchEventChunkURLFn
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
	onSessionPayloadLoadedPayload?: {
		sessionIntervals: GetSessionIntervalsQuery | undefined
		sessionPayload: GetSessionPayloadQuery | undefined
		timelineIndicatorEvents: GetTimelineIndicatorEventsQuery | undefined
	}
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
	addLiveEvents,
	loadSession,
	onChunksLoad,
	onEvent,
	onFrame,
	onSessionPayloadLoaded,
	pause,
	play,
	reset,
	seek,
	setCurrentEvent,
	setIsLiveMode,
	setLastActiveString,
	setScale,
	setSessionResults,
	setTime,
	setViewingUnauthorizedSession,
	startChunksLoad,
	updateCurrentUrl,
	updateEvents,
	updateViewport,
}

type PlayerAction =
	| addLiveEvents
	| loadSession
	| onChunksLoad
	| onEvent
	| onFrame
	| onSessionPayloadLoaded
	| pause
	| play
	| reset
	| seek
	| setCurrentEvent
	| setIsLiveMode
	| setLastActiveString
	| setScale
	| setSessionResults
	| setTime
	| setViewingUnauthorizedSession
	| startChunksLoad
	| updateEvents
	| updateCurrentUrl
	| updateViewport

interface play {
	type: PlayerActionType.play
	time: number
}

interface pause {
	type: PlayerActionType.pause
	time?: number
}

interface seek {
	type: PlayerActionType.seek
	time: number
}

interface setTime {
	type: PlayerActionType.setTime
	time: number
}

interface addLiveEvents {
	type: PlayerActionType.addLiveEvents
	firstNewTimestamp: number
	lastActiveTimestamp: number
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

interface updateEvents {
	type: PlayerActionType.updateEvents
}

interface updateViewport {
	type: PlayerActionType.updateViewport
	viewport: viewportResizeDimension
}

interface updateCurrentUrl {
	type: PlayerActionType.updateCurrentUrl
	currentTime: number
}

interface startChunksLoad {
	type: PlayerActionType.startChunksLoad
}

interface onChunksLoad {
	type: PlayerActionType.onChunksLoad
	showPlayerMouseTail: boolean
	time: number
	action: ReplayerState
}

interface onFrame {
	type: PlayerActionType.onFrame
}

interface onSessionPayloadLoaded {
	type: PlayerActionType.onSessionPayloadLoaded
	sessionPayload?: GetSessionPayloadQuery
	sessionIntervals?: GetSessionIntervalsQuery
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
	const events = getEvents(state.chunkEventsRef.current)
	let s = { ...state }
	switch (action.type) {
		case PlayerActionType.play:
			s = replayerAction(
				PlayerActionType.play,
				s,
				ReplayerState.Playing,
				action.time,
			)
			break
		case PlayerActionType.pause:
			s.isLiveMode = false
			s = replayerAction(
				PlayerActionType.pause,
				s,
				ReplayerState.Paused,
				action.time,
			)
			break
		case PlayerActionType.seek:
			s = replayerAction(
				PlayerActionType.seek,
				s,
				s.replayerState,
				action.time,
			)
			break
		case PlayerActionType.setTime:
			s.time = action.time
			if (
				s.replayerState === ReplayerState.SessionEnded &&
				s.time < state.sessionEndTime
			) {
				s.replayerState = ReplayerState.Paused
			}
			break
		case PlayerActionType.addLiveEvents:
			s.liveEventCount += 1
			s.lastActiveTimestamp = action.lastActiveTimestamp
			s.replayer?.replaceEvents(events)
			s.replayer?.play(events[events.length - 1].timestamp)
			s.replayerState = ReplayerState.Playing
			break
		case PlayerActionType.loadSession:
			s.session_secure_id = action.data!.session?.secure_id ?? ''
			s.fetchEventChunkURL = action.fetchEventChunkURL
			if (action.data.session) {
				s.session = action.data?.session as Session
				s.isLiveMode = false
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
					analytics.track('Viewed session', {
						project_id: s.project_id,
						is_guest: !s.isLoggedIn,
						is_live: s.isLiveMode,
						secure_id: s.session_secure_id,
					})
				}
				s.sessionViewability = SessionViewability.VIEWABLE
			} else {
				s.sessionViewability = SessionViewability.OVER_BILLING_QUOTA
			}
			break
		case PlayerActionType.reset:
			s = {
				...s,
				currentEvent: '',
				currentUrl: undefined,
				errors: [],
				eventsLoaded: false,
				isLiveMode: false,
				lastActiveString: null,
				lastActiveTimestamp: 0,
				project_id: action.projectId,
				replayer: undefined,
				replayerState: action.nextState || ReplayerState.Empty,
				scale: 1,
				session: action.sessionSecureId ? s.session : undefined,
				sessionComments: [],
				sessionEndTime: 0,
				sessionIntervals: [],
				sessionMetadata: EMPTY_SESSION_METADATA,
				sessionViewability: SessionViewability.VIEWABLE,
				session_secure_id: action.sessionSecureId,
				time: 0,
			}
			break
		case PlayerActionType.updateEvents:
			if (s.replayer) {
				s.replayer.replaceEvents(events)
			}
			break
		case PlayerActionType.updateViewport:
			s.viewport = action.viewport
			break
		case PlayerActionType.updateCurrentUrl:
			if (!s.replayer) break
			s.currentUrl = findLatestUrl(
				getAllUrlEvents(events),
				action.currentTime,
			)
			break
		case PlayerActionType.startChunksLoad:
			if (s.isLoadingEvents) break
			s.isLoadingEvents = true
			// important to pause at the actual current time,
			// rather than the future time for which chunks are loaded.
			// because we are setting time temporarily for the purpose of pausing while loading,
			// we do not want to set the state time value.
			s = replayerAction(
				PlayerActionType.startChunksLoad,
				s,
				ReplayerState.Paused,
				getTimeFromReplayer(s.replayer, s.sessionMetadata),
				true,
			)
			break
		case PlayerActionType.onChunksLoad:
			if (
				s.sessionViewability !== SessionViewability.OVER_BILLING_QUOTA
			) {
				s.sessionViewability = SessionViewability.VIEWABLE
			}

			// if session has no events, abort
			if (events.length < 2) {
				break
			}
			if (s.replayer === undefined) {
				s = initReplayer(s, events, action.showPlayerMouseTail)
				if (s.onSessionPayloadLoadedPayload) {
					s = processSessionMetadata(s, events)
				}
			} else {
				s.replayer.replaceEvents(events)
			}
			s = replayerAction(
				PlayerActionType.onChunksLoad,
				s,
				action.action,
				action.time,
			)
			s.isLoadingEvents = false
			break
		case PlayerActionType.onFrame:
			if (!s.replayer) break
			const time = getTimeFromReplayer(s.replayer, s.sessionMetadata)
			// Compute the string rather than number here, so that dependencies don't
			// have to re-render on every tick
			if (
				s.isLiveMode &&
				s.lastActiveTimestamp != 0 &&
				s.lastActiveTimestamp < time - 5000
			) {
				if (s.lastActiveTimestamp > time - 1000 * 60) {
					s.lastActiveString = 'less than a minute ago'
				} else {
					s.lastActiveString = moment(s.lastActiveTimestamp).from(
						time,
					)
				}
			} else if (s.lastActiveString !== null) {
				s.lastActiveString = null
			}

			if (!s.isLiveMode && s.replayerState !== ReplayerState.Playing) {
				break
			}
			s.time = time
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
			if (action.event.type === EventType.Custom) {
				switch (action.event.data.tag) {
					case 'Navigate':
					case 'Reload':
						s.currentUrl = action.event.data.payload as string
						break
				}
			}
			break
		case PlayerActionType.onSessionPayloadLoaded:
			s.onSessionPayloadLoadedPayload = {
				sessionIntervals: action.sessionIntervals,
				sessionPayload: action.sessionPayload,
				timelineIndicatorEvents: action.timelineIndicatorEvents,
			}
			// onChunksLoad has fired and the replayer is created
			if (s.replayer) {
				s = processSessionMetadata(s, events)
			}
			// otherwise, onChunksLoad will process session metadata if this happens first
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
			s = initReplayer(s, events, !!s.replayer?.config.mouseTail)
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
	log(
		'PlayerState.ts',
		new Set<PlayerActionType>([
			PlayerActionType.onFrame,
			PlayerActionType.onEvent,
			PlayerActionType.updateCurrentUrl,
		]).has(action.type)
			? 'PlayerStateUpdate'
			: 'PlayerStateTransition',
		PlayerActionType[action.type],
		s.time,
		{
			numEvents: events.length,
			initialState: state,
			finalState: s,
			action,
		},
	)
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
	events: HighlightEvent[],
	showPlayerMouseTail: boolean,
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
		mouseTail: showPlayerMouseTail,
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

	// Initializes the simulated viewport size and currentUrl with values from the first meta event
	// until the rrweb .on('resize', ...) listener below changes it. Otherwise the URL bar
	// can be empty, which is a poor UX.
	const metas = events.filter((event) => event.type === EventType.Meta)
	if (metas.length > 0) {
		const meta = metas[0] as metaEvent
		s.viewport = {
			width: meta.data.width,
			height: meta.data.height,
		}
	}

	if (s.isLiveMode) {
		log('PlayerState.ts', 'starting live with offset', events[0].timestamp)
		s.replayer.play(Date.now() - events[0].timestamp)
	}

	return s
}

const replayerAction = (
	source: PlayerActionType,
	s: PlayerState,
	desiredState: ReplayerState,
	time?: number,
	skipSetTime?: boolean,
) => {
	if (s.isLiveMode) return s
	log(
		'PlayerState.ts',
		'playerState/replayerAction',
		PlayerActionType[source],
		'to',
		ReplayerState[desiredState],
		time,
	)
	timedCall(
		'playerState/replayerAction',
		() => {
			if (!s.replayer) return s
			try {
				const desiredTime =
					time !== undefined
						? toReplayerTime(s.replayer, s.sessionMetadata, time)
						: undefined
				if (desiredState === ReplayerState.Paused) {
					s.replayer.pause(desiredTime)
				} else if (desiredState === ReplayerState.Playing) {
					s.replayer.play(desiredTime)
				} else {
					return s
				}
			} catch (e: any) {
				console.error(
					'PlayerState.ts replayerAction exception',
					PlayerActionType[source],
					e,
				)
				H.consumeError(
					e as Error,
					`PlayerState.ts replayerAction exception occurred`,
					{
						source: PlayerActionType[source],
					},
				)
			}
			s.replayerState = desiredState
			if (!skipSetTime && time !== undefined) {
				s.time = time
			}
		},
		[
			{ name: 'source', value: PlayerActionType[source] },
			{ name: 'replayerState', value: ReplayerState[desiredState] },
		],
	)
	return s
}

const processSessionMetadata = (
	s: PlayerState,
	events: HighlightEvent[],
): PlayerState => {
	if (!s.onSessionPayloadLoadedPayload) {
		console.error(
			'PlayerState.ts',
			'processSessionMetadata called without onSessionPayloadLoaded payload set',
		)
		return s
	}
	if (!s.replayer) {
		console.error(
			'PlayerState.ts',
			'processSessionMetadata called without replayer initialized',
		)
		return s
	}

	if (s.replayerState < ReplayerState.Playing) {
		s.replayerState = ReplayerState.Paused
	}
	if (s.onSessionPayloadLoadedPayload.sessionPayload?.errors) {
		s.errors = s.onSessionPayloadLoadedPayload.sessionPayload
			.errors as ErrorObject[]
	}
	if (s.onSessionPayloadLoadedPayload.sessionPayload?.session_comments) {
		s.sessionComments = s.onSessionPayloadLoadedPayload.sessionPayload
			.session_comments as SessionComment[]
	}

	// Preprocess session interval data from backend
	const parsedSessionIntervalsData: SessionInterval[] =
		s.onSessionPayloadLoadedPayload.sessionIntervals &&
		s.onSessionPayloadLoadedPayload.sessionIntervals.session_intervals
			.length > 0
			? s.onSessionPayloadLoadedPayload.sessionIntervals.session_intervals.map(
					(interval) => {
						return {
							startTime: new Date(interval.start_time).getTime(),
							endTime: new Date(interval.end_time).getTime(),
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
					new Date(parsedSessionIntervalsData[0].startTime).getTime(),
		  }
		: s.replayer.getMetaData()

	const sessionIntervals = getSessionIntervals(sm, parsedSessionIntervalsData)

	const parsedTimelineIndicatorEvents =
		s.onSessionPayloadLoadedPayload.timelineIndicatorEvents &&
		s.onSessionPayloadLoadedPayload.timelineIndicatorEvents
			.timeline_indicator_events.length > 0
			? toHighlightEvents(
					s.onSessionPayloadLoadedPayload.timelineIndicatorEvents
						.timeline_indicator_events,
			  )
			: events
	s.sessionIntervals = getCommentsInSessionIntervalsRelative(
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
	s.eventsForTimelineIndicator = getEventsForTimelineIndicator(
		parsedTimelineIndicatorEvents,
		sm.startTime,
		sm.totalTime,
	)
	s.sessionEndTime = sm.endTime

	if (s.onSessionPayloadLoadedPayload.sessionPayload?.rage_clicks) {
		const allClickEvents: (ParsedHighlightEvent & {
			sessionIndex: number
		})[] = []

		sessionIntervals.forEach((interval, sessionIndex) => {
			interval.sessionEvents.forEach((event) => {
				if (
					event.type === EventType.Custom &&
					event.data.tag === 'Click'
				) {
					allClickEvents.push({
						...event,
						sessionIndex,
					})
				}
			})
		})

		const rageClicksWithRelativePositions: RageClick[] = []

		s.onSessionPayloadLoadedPayload.sessionPayload.rage_clicks.forEach(
			(rageClick) => {
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
			},
		)

		s.rageClicks = rageClicksWithRelativePositions
	}
	s.sessionMetadata = sm
	s.eventsLoaded = true
	return s
}

const toReplayerTime = function (
	replayer: Replayer | undefined,
	sessionMetadata: playerMetaData | undefined,
	time: number,
): number {
	return time - getReplayerOffset(replayer, sessionMetadata)
}

const getReplayerOffset = function (
	replayer: Replayer | undefined,
	sessionMetadata: playerMetaData | undefined,
): number {
	if (!replayer || !sessionMetadata) return 0
	return replayer.getMetaData().startTime - sessionMetadata.startTime
}

export const getTimeFromReplayer = function (
	replayer: Replayer | undefined,
	sessionMetadata: playerMetaData | undefined,
): number {
	return (
		(replayer?.getCurrentTime() ?? 0) +
		getReplayerOffset(replayer, sessionMetadata)
	)
}

export const getEvents = (
	chunkEvents: Omit<
		Map<number, HighlightEvent[]>,
		'clear' | 'set' | 'delete'
	>,
) => {
	const events = []
	for (const [, v] of [...chunkEvents.entries()].sort(
		(a, b) => a[0] - b[0],
	)) {
		for (const val of v) {
			events.push(val)
		}
	}
	return events
}
