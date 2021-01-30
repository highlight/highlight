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
}

export const defaultValue: ReplayerContextInterface = {
    state: ReplayerState.Loaded,
    replayer: undefined,
    time: 0,
    setTime: (_) => {},
};

const ReplayerContext = createContext<ReplayerContextInterface>(defaultValue);

export default ReplayerContext;
