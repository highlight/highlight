import { createContext } from 'react';
import { Replayer } from '@highlight-run/rrweb';
import { SessionInterval } from '@highlight-run/rrweb/dist/types';
import { HighlightEvent } from '../HighlightEvent';
import { ErrorObject, SessionComment } from '../../../graph/generated/schemas';

export enum ReplayerState {
    Loading,
    /** Replayer is loaded but the user hasn't interacted with the player yet. */
    LoadedAndUntouched,
    /** The session page was loaded by a deep link to a comment or error. */
    LoadedWithDeepLink,
    Playing,
    Paused,
    /** Caused when the end-user calls H.stop() manually to stop recording. */
    SessionRecordingStopped,
}

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
    sessionCommentIntervals: SessionComment[][];
}

/* eslint-disable */
export const defaultValue: ReplayerContextInterface = {
    state: ReplayerState.Loading,
    replayer: undefined,
    scale: 1,
    setScale: (_) => {},
    time: 0,
    setTime: (_) => {},
    play: (_) => {},
    pause: (_) => {},
    events: [],
    errors: [],
    sessionIntervals: [],
    sessionCommentIntervals: [[]],
};
/* eslint-enable */

const ReplayerContext = createContext<ReplayerContextInterface>(defaultValue);

export default ReplayerContext;
