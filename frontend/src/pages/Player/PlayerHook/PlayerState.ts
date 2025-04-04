import { MarkSessionAsViewedMutationFn } from '@graph/hooks'
import {
	GetSessionIntervalsQuery,
	GetSessionPayloadQuery,
	GetSessionQuery,
} from '@graph/operations'
import {
	ErrorObject,
	Session,
	SessionComment,
	SessionResults,
	TimelineIndicatorEvent,
} from '@graph/schemas'
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
	loadiFrameResources,
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
import {
	customEvent,
	IncrementalSource,
	metaEvent,
	playerMetaData,
	SessionInterval,
	viewportResizeDimension,
} from '@rrweb/types'
import analytics from '@util/analytics'
import log, { verboseLoggingEnabled } from '@util/log'
import { timedCall } from '@util/perf/instrument'
import { H } from 'highlight.run'
import { throttle } from 'lodash'
import moment from 'moment/moment'
import { MutableRefObject, RefObject, SetStateAction } from 'react'
import { EventType, Replayer } from 'rrweb'

const EMPTY_SESSION_METADATA = {
	startTime: 0,
	endTime: 0,
	totalTime: 0,
}
const PROJECTS_WITH_CSS_ANIMATIONS: string[] = ['1', '1020', '1021', '102751']

// assuming 120 fps
export const FRAME_MS = 1000 / 120
// update every N frames
export const THROTTLED_UPDATE_MS = FRAME_MS * 15

export const CHUNKING_DISABLED_PROJECTS: string[] = []
export const LOOKAHEAD_MS = 1000 * 30
export const BUFFER_MS = 1000 * 3
export const MAX_CHUNK_COUNT = 5

export enum SessionViewability {
	VIEWABLE,
	EMPTY_SESSION,
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
		timelineIndicatorEvents:
			| Pick<
					TimelineIndicatorEvent,
					'timestamp' | 'data' | 'type' | 'sid'
			  >[]
			| undefined
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
	setIsLiveMode,
	setScale,
	setSessionResults,
	setTime,
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
	| setIsLiveMode
	| setScale
	| setSessionResults
	| setTime
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
	time: number | undefined
	playerRef: RefObject<HTMLDivElement | null>
	action: ReplayerState
}

interface onFrame {
	type: PlayerActionType.onFrame
}

interface onSessionPayloadLoaded {
	type: PlayerActionType.onSessionPayloadLoaded
	sessionPayload?: GetSessionPayloadQuery
	sessionIntervals?: GetSessionIntervalsQuery
	timelineIndicatorEvents?: Pick<
		TimelineIndicatorEvent,
		'timestamp' | 'data' | 'type' | 'sid'
	>[]
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
	playerRef: RefObject<HTMLDivElement | null>
}

export const PlayerInitialState = {
	browserExtensionScriptURLs: [],
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
	replayerState: ReplayerState.Loading,
	scale: 1,
	session: undefined,
	sessionComments: [],
	sessionEndTime: 0,
	sessionIntervals: [],
	sessionMetadata: EMPTY_SESSION_METADATA,
	sessionResults: {
		sessions: [],
		totalCount: 0,
		totalLength: 0,
		totalActiveLength: 0,
	},
	sessionViewability: SessionViewability.VIEWABLE,
	session_secure_id: '',
	time: 0,
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
			s.currentUrl = findLatestUrl(
				getAllUrlEvents(events),
				action.time + s.sessionMetadata.startTime,
			)
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
			if (action.data.session) {
				s.session = action.data.session as Session
				s.isLiveMode = false
			}
			if (!action.data.session || action.data.session.excluded) {
				s.sessionViewability = SessionViewability.ERROR
			} else if (
				action.data.session?.within_billing_quota ||
				s.isHighlightAdmin
			) {
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
						is_session_processed: !!s.session?.processed,
						secure_id: s.session_secure_id,
					})
				}
				s.sessionViewability = SessionViewability.VIEWABLE
			} else {
				s.sessionViewability = SessionViewability.ERROR
			}
			break
		case PlayerActionType.reset:
			s = {
				...s,
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
				log('updateEvents', { events })
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
				undefined,
				true,
			)
			break
		case PlayerActionType.onChunksLoad:
			if (s.sessionViewability !== SessionViewability.ERROR) {
				s.sessionViewability = SessionViewability.VIEWABLE
			}

			// if session has no events, abort
			if (events.length < 2) {
				break
			}
			if (s.replayer === undefined) {
				s = initReplayer(
					s,
					events,
					action.showPlayerMouseTail,
					action.playerRef,
				)
				if (s.onSessionPayloadLoadedPayload) {
					s = processSessionMetadata(s, events)
				}
			} else {
				log('onChunksLoad', { events })
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
			s = updatePlayerTime(s)
			break
		case PlayerActionType.onEvent:
			if (!s.replayer) break
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
		case PlayerActionType.setIsLiveMode:
			s.isLiveMode = handleSetStateAction(s.isLiveMode, action.isLiveMode)
			s = initReplayer(
				s,
				events,
				!!s.replayer?.config.mouseTail,
				action.playerRef,
			)
			analytics.track('Session live mode toggled', {
				isLiveMode: s.isLiveMode,
			})
			break
		case PlayerActionType.setSessionResults:
			s.sessionResults = handleSetStateAction(
				s.sessionResults,
				action.sessionResults,
			)
			break
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
	events: HighlightEvent[],
	showPlayerMouseTail: boolean,
	playerRef: RefObject<HTMLDivElement | null>,
) => {
	const playerMountingRoot = playerRef.current
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
		useVirtualDom: true,
		showWarning: verboseLoggingEnabled,
		showDebug: verboseLoggingEnabled,
		pauseAnimation: !PROJECTS_WITH_CSS_ANIMATIONS.includes(s.project_id),
		logger: {
			log: throttle(console.log, 100),
			warn: throttle(console.warn, 100),
		},
	})

	// Hide the mouse cursor until we get a movement event and know where to place it.
	playerMountingRoot.classList.add('hide-mouse-cursor')
	const mouseMoveEvents = [
		IncrementalSource.MouseMove,
		IncrementalSource.TouchMove,
		IncrementalSource.Drag,
	]
	const castEventHandler = (event: any) => {
		const source = event.data.source
		const isMouseMove = mouseMoveEvents.includes(source)

		if (isMouseMove) {
			playerMountingRoot.classList.remove('hide-mouse-cursor')
			s.replayer?.off('event-cast', castEventHandler)
		}
	}
	s.replayer.on('event-cast', castEventHandler)

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
				if (s.replayer) {
					loadiFrameResources(s.replayer, s.project_id)
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

const updatePlayerTime = (s: PlayerState): PlayerState => {
	const time = getTimeFromReplayer(s.replayer, s.sessionMetadata)
	// Compute the string rather than number here, so that dependencies don't
	// have to re-render on every tick
	if (s.isLiveMode && s.lastActiveTimestamp != 0) {
		if (s.lastActiveTimestamp > time - 1000 * 60) {
			s.lastActiveString = 'less than 1 minute ago'
		} else {
			s.lastActiveString = moment(s.lastActiveTimestamp).from(time)
		}
	} else if (s.lastActiveString !== null) {
		s.lastActiveString = null
	}

	if (!s.isLiveMode && s.replayerState !== ReplayerState.Playing) {
		return s
	}
	s.time = time
	if (s.time >= s.sessionMetadata.totalTime) {
		s.replayerState = s.isLiveMode
			? ReplayerState.Paused // Waiting for more data
			: ReplayerState.SessionEnded
	}
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
		s.onSessionPayloadLoadedPayload.timelineIndicatorEvents.length > 0
			? toHighlightEvents(
					s.onSessionPayloadLoadedPayload.timelineIndicatorEvents,
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

		s.sessionIntervals.forEach((interval, sessionIndex) => {
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

const MAX_SHORT_INT_SIZE = 65536

// events are passed into an functions which does an array.splice or Math.max
// When the number of events is greater than MAX_SHORT_INT_SIZE, the browser can crash.
// Hence, we instead take a sample of events to ensure we stay under MAX_SHORT_INT_SIZE.
export const truncate = function* <T>(data: IterableIterator<T> | T[]) {
	let idx = 0
	for (const obj of data) {
		if (idx++ >= MAX_SHORT_INT_SIZE) {
			break
		}
		yield obj
	}
}

export const getEvents = (
	chunkEvents: Omit<
		Map<number, HighlightEvent[]>,
		'clear' | 'set' | 'delete'
	>,
) => {
	const events = []
	for (const [, v] of [...chunkEvents.entries()]) {
		for (const val of v) {
			if (val) {
				events.push(val)
			}
		}
	}

	return events
}
