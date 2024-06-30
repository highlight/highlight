import {
	ErrorObject,
	Session,
	SessionComment,
	SessionResults,
} from '@graph/schemas'
import {
	playerMetaData,
	SessionInterval,
	viewportResizeDimension,
} from '@rrweb/types'
import { createContext } from '@util/context/context'
import { Replayer } from 'rrweb'

import {
	HighlightEvent,
	HighlightJankPayload,
	HighlightPerformancePayload,
} from '../HighlightEvent'
import { SessionViewability } from '../PlayerHook/PlayerState'

export enum ReplayerState {
	/** There is no active session. */
	Empty = 'Empty',
	Loading = 'Loading',
	/** Replayer is loaded but the user hasn't interacted with the player yet. */
	LoadedAndUntouched = 'LoadedAndUntouched',
	/** The session page was loaded by a deep link to a comment or error. */
	LoadedWithDeepLink = 'LoadedWithDeepLink',
	Playing = 'Playing',
	Paused = 'Paused',
	/** Caused when the end-user calls H.stop() manually to stop recording. */
	SessionRecordingStopped = 'SessionRecordingStopped',
	/** Playback of the session has reached the end. */
	SessionEnded = 'SessionEnded',
}

export const ReplayerPausedStates = [
	ReplayerState.Paused,
	ReplayerState.LoadedWithDeepLink,
	ReplayerState.LoadedAndUntouched,
	ReplayerState.SessionRecordingStopped,
	ReplayerState.SessionEnded,
]

interface BaseParsedEvent {
	/**
	 * The percentage of where this error is thrown in the interval.
	 * @example An interval from t=0 to t=5. An error thrown at t=1. The relativeIntervalPercentage would be 20%.
	 */
	relativeIntervalPercentage?: number
}
export type ParsedErrorObject = ErrorObject & BaseParsedEvent
export type ParsedHighlightEvent = HighlightEvent & BaseParsedEvent
export type ParsedSessionComment = SessionComment & BaseParsedEvent

export type ParsedEvent =
	| ParsedErrorObject
	| ParsedHighlightEvent
	| ParsedSessionComment
export interface ParsedSessionInterval extends SessionInterval {
	startPercent: number
	endPercent: number
	errors: ParsedErrorObject[]
	sessionEvents: ParsedHighlightEvent[]
	comments: ParsedSessionComment[]
}

export interface ReplayerContextInterface {
	state: ReplayerState
	replayer: Replayer | undefined
	/** The current time the player is at. */
	time: number
	setTime: (newTime: number) => void
	/** The current size of the replayer (in percent). */
	scale: number
	play: (time?: number) => void
	pause: (time?: number) => void
	setScale: React.Dispatch<React.SetStateAction<number>>
	performancePayloads: HighlightPerformancePayload[]
	jankPayloads: HighlightJankPayload[]
	errors: ErrorObject[]
	sessionIntervals: Array<ParsedSessionInterval>
	sessionComments: SessionComment[]
	eventsForTimelineIndicator: Array<ParsedHighlightEvent>
	/** Session viewability state, for example if it is over the billing quota or if it is empty. */
	sessionViewability: SessionViewability
	/** Whether this session can be viewed. */
	canViewSession: boolean
	/** The sessions that are relevant to the current search filters. */
	sessionResults: SessionResults
	/** The active session if any. */
	session: Session | undefined
	setSessionResults: React.Dispatch<React.SetStateAction<SessionResults>>
	isPlayerReady: boolean
	isLiveMode: boolean
	setIsLiveMode: React.Dispatch<React.SetStateAction<boolean>>
	lastActiveString: string | null
	/**
	 * The percentage value of the current player time relative to the total duration.
	 * `playerProgress` is `null` if there is no active session.
	 * @example The session is 100 seconds long. The current time is 10 seconds. `playerProgress` is 0.1.
	 * @example The session is 100 seconds long. The current time is 50 seconds. `playerProgress` is 0.5.
	 */
	playerProgress: number | null
	rageClicks: RageClick[]
	viewport: viewportResizeDimension | undefined
	currentUrl: string | undefined
	/** The timestamp for the first rrweb event. */
	sessionStartDateTime: number
	browserExtensionScriptURLs: string[]
	isLoadingEvents: boolean
	sessionMetadata: playerMetaData
}

export const [useReplayerContext, ReplayerContextProvider] =
	createContext<ReplayerContextInterface>('ReplayerContext')

export interface RageClick {
	startTimestamp: string
	startPercentage: number
	endTimestamp: string
	endPercentage: number
	totalClicks: number
	sessionIntervalIndex: number
}
