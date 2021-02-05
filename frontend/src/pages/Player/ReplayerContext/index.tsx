import { createContext } from 'react';
import { Replayer } from '@highlight-run/rrweb';
import { HighlightEvent } from '../HighlightEvent';

export enum ReplayerState {
    NotLoaded,
    Loading,
    Loaded,
}

export interface ReplayerContextInterface {
    state: ReplayerState;
    replayer: Replayer | undefined;
    /** The current time the player is at. */
    time: number;
    setTime: (newTime: number) => void;
    /** The current size of the replayer (in percent). */
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    /** Whether the replayer is in "live mode" */
    liveMode: boolean;
    /** Whether the replayer is in "live mode" */
    events: Array<HighlightEvent>;
}

export const defaultValue: ReplayerContextInterface = {
    liveMode: false,
    state: ReplayerState.Loaded,
    replayer: undefined,
    scale: 1,
    setScale: (_) => {},
    time: 0,
    setTime: (_) => {},
    events: [],
};

const ReplayerContext = createContext<ReplayerContextInterface>(defaultValue);

export default ReplayerContext;
