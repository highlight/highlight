import { createContext } from 'react';
import { Replayer } from '@highlight-run/rrweb';

export enum ReplayerState {
    NotLoaded,
    Loading,
    Loaded,
}

interface ReplayerContextInterface {
    state: ReplayerState;
    replayer: Replayer | undefined;
    /** The current time the player is at. */
    time: number;
    setTime: (newTime: number) => void;
    /** The current size of the replayer (in percent). */
    scale: number;
    setScale: (newScale: number) => void;
    /** Whether the replayer is in "live mode" */
    liveMode: boolean;
}

export const defaultValue: ReplayerContextInterface = {
    liveMode: false,
    state: ReplayerState.Loaded,
    replayer: undefined,
    scale: 1,
    setScale: (_) => {},
    time: 0,
    setTime: (_) => {},
};

const ReplayerContext = createContext<ReplayerContextInterface>(defaultValue);

export default ReplayerContext;
