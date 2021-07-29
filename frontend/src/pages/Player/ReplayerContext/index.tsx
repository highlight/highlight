import { Replayer } from '@highlight-run/rrweb';
import { SessionInterval } from '@highlight-run/rrweb/dist/types';

import {
    ErrorObject,
    Session,
    SessionComment,
    SessionResults,
} from '../../../graph/generated/schemas';
import { createContext } from '../../../util/context/context';
import { HighlightEvent } from '../HighlightEvent';

export enum ReplayerState {
    /** There is no active session. */
    Empty,
    Loading,
    /** Replayer is loaded but the user hasn't interacted with the player yet. */
    LoadedAndUntouched,
    /** The session page was loaded by a deep link to a comment or error. */
    LoadedWithDeepLink,
    Playing,
    Paused,
    /** Caused when the end-user calls H.stop() manually to stop recording. */
    SessionRecordingStopped,
    /** Playback of the session has reached the end. */
    SessionEnded,
}

export const ReplayerPausedStates = [
    ReplayerState.Paused,
    ReplayerState.LoadedWithDeepLink,
    ReplayerState.LoadedAndUntouched,
    ReplayerState.SessionRecordingStopped,
    ReplayerState.SessionEnded,
];

interface BaseParsedEvent {
    /**
     * The percentage of where this error is thrown in the interval.
     * @example An interval from t=0 to t=5. An error thrown at t=1. The relativeIntervalPercentage would be 20%.
     */
    relativeIntervalPercentage?: number;
}
export type ParsedErrorObject = ErrorObject & BaseParsedEvent;
export type ParsedHighlightEvent = HighlightEvent & BaseParsedEvent;
export type ParsedSessionComment = SessionComment & BaseParsedEvent;

export type ParsedEvent =
    | ParsedErrorObject
    | ParsedHighlightEvent
    | ParsedSessionComment;
export interface ParsedSessionInterval extends SessionInterval {
    startPercent: number;
    endPercent: number;
    errors: ParsedErrorObject[];
    sessionEvents: ParsedHighlightEvent[];
}

export interface ReplayerContextInterface {
    state: ReplayerState;
    replayer: Replayer | undefined;
    /** The current time the player is at. */
    time: number;
    setTime: (newTime: number) => void;
    /** The current size of the replayer (in percent). */
    scale: number;
    play: (time?: number) => void;
    pause: (time?: number) => void;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    events: Array<HighlightEvent>;
    errors: ErrorObject[];
    sessionIntervals: Array<ParsedSessionInterval>;
    sessionComments: SessionComment[];
    eventsForTimelineIndicator: Array<ParsedHighlightEvent>;
    /** Whether this session can be viewed. A session is not viewable if it is locked behind billing. */
    canViewSession: boolean;
    /** The sessions that are relevant to the current search filters. */
    sessionResults: SessionResults;
    /** The active session if any. */
    session: Session | undefined;
    setSessionResults: React.Dispatch<React.SetStateAction<SessionResults>>;
    isPlayerReady: boolean;
}

export const [
    useReplayerContext,
    ReplayerContextProvider,
] = createContext<ReplayerContextInterface>('ReplayerContext');
